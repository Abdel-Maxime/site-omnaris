/**
 * astro-auto-images
 * Intégration Astro qui optimise automatiquement toutes les images au build
 * Aucune modification de code requise - ça tourne en arrière-plan
 * 
 * @example
 * // astro.config.mjs
 * import imageOptimizer from './src/integrations/image-optimizer.mjs';
 * 
 * export default defineConfig({
 *   integrations: [imageOptimizer()]
 * });
 */

import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';

const defaultOptions = {
  // Dossiers à scanner (relatifs à la racine du projet)
  dirs: ['public'],
  // Qualité AVIF (1-100)
  avifQuality: 75,
  // Qualité WebP (1-100)
  webpQuality: 80,
  // Format de sortie : 'avif', 'webp', ou 'both'
  format: 'avif',
  // Largeur max (redimensionne si dépassé)
  maxWidth: 1920,
  // Écraser les fichiers existants
  overwrite: false,
  // Logs détaillés
  verbose: false,
  // Dossier de cache
  cacheDir: 'node_modules/.astro-image-cache',
};

export default function imageOptimizer(userOptions = {}) {
  const options = { ...defaultOptions, ...userOptions };
  
  return {
    name: 'astro-auto-images',
    hooks: {
      'astro:build:start': async ({ logger }) => {
        const log = (msg) => {
          if (options.verbose) logger.info(msg);
        };
        
        logger.info('🖼️  Auto-optimisation des images...');
        
        // Créer le dossier cache
        await fs.mkdir(options.cacheDir, { recursive: true });
        
        // Charger le cache existant
        const cachePath = path.join(options.cacheDir, 'processed.json');
        let cache = {};
        
        if (existsSync(cachePath)) {
          try {
            cache = JSON.parse(await fs.readFile(cachePath, 'utf-8'));
          } catch {
            cache = {};
          }
        }
        
        // Trouver toutes les images
        const patterns = options.dirs.map(dir => `${dir}/**/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG,WEBP,GIF}`);
        const files = (await Promise.all(patterns.map(p => glob(p)))).flat();
        
        if (files.length === 0) {
          logger.info('Aucune image trouvée');
          return;
        }
        
        logger.info(`${files.length} images trouvées`);
        
        let totalOriginal = 0;
        let totalOptimized = 0;
        let skipped = 0;
        let processed = 0;
        
        for (const file of files) {
          try {
            const stats = await processImage(file, options, cache, log);
            
            if (stats) {
              totalOriginal += stats.original;
              totalOptimized += stats.optimized;
              processed++;
            } else {
              skipped++;
            }
          } catch (error) {
            logger.warn(`Erreur sur ${file}: ${error.message}`);
          }
        }
        
        // Sauvegarder le cache
        await fs.writeFile(cachePath, JSON.stringify(cache, null, 2));
        
        // Stats finales
        const savedKB = Math.round((totalOriginal - totalOptimized) / 1024);
        const savedPercent = totalOriginal > 0 
          ? Math.round((1 - totalOptimized / totalOriginal) * 100) 
          : 0;
        
        logger.info(`✅ ${processed} images optimisées, ${skipped} ignorées`);
        if (processed > 0) {
          logger.info(`   Économie: ${savedKB}KB (${savedPercent}%)`);
        }
      },
    },
  };
}

async function processImage(filePath, options, cache, log) {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath, ext);
  const dir = path.dirname(filePath);
  
  // Skip si c'est déjà un fichier optimisé
  if (ext === '.avif' || (ext === '.webp' && options.format === 'avif')) {
    return null;
  }
  
  const outputFormat = options.format === 'both' ? 'avif' : options.format;
  const outputExt = `.${outputFormat}`;
  const outputPath = path.join(dir, `${basename}${outputExt}`);
  
  // Skip si existe déjà
  if (!options.overwrite && existsSync(outputPath)) {
    log(`⏭️  Skip (existe): ${basename}`);
    return null;
  }
  
  // Lire le fichier
  const fileBuffer = await fs.readFile(filePath);
  const hash = createHash('md5').update(fileBuffer).digest('hex');
  
  // Skip si en cache
  if (cache[filePath]?.hash === hash && existsSync(cache[filePath].outputPath)) {
    log(`⏭️  Skip (cache): ${basename}`);
    return null;
  }
  
  const originalSize = fileBuffer.length;
  
  // Traitement Sharp
  let image = sharp(fileBuffer);
  const metadata = await image.metadata();
  
  // Redimensionner si trop grand
  if (metadata.width && metadata.width > options.maxWidth) {
    image = image.resize(options.maxWidth, null, {
      withoutEnlargement: true,
      fit: 'inside',
    });
  }
  
  // Convertir
  let outputBuffer;
  
  if (outputFormat === 'avif') {
    outputBuffer = await image
      .avif({
        quality: options.avifQuality,
        effort: 6,
      })
      .toBuffer();
  } else {
    outputBuffer = await image
      .webp({
        quality: options.webpQuality,
        effort: 6,
        smartSubsample: true,
      })
      .toBuffer();
  }
  
  // Sauvegarder seulement si gain
  if (outputBuffer.length < originalSize) {
    await fs.writeFile(outputPath, outputBuffer);
    cache[filePath] = { hash, outputPath };
    
    const savedPercent = Math.round((1 - outputBuffer.length / originalSize) * 100);
    log(`✅ ${basename}${ext} → ${outputFormat.toUpperCase()} (-${savedPercent}%)`);
    
    return {
      original: originalSize,
      optimized: outputBuffer.length,
      format: outputFormat,
    };
  }
  
  log(`⏭️  Skip (pas de gain): ${basename}`);
  return null;
}
