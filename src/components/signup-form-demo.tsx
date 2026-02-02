"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SignupFormDemo() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);
    
    // Ajouter votre clé API Web3Forms
    formData.append("access_key", "db492689-907c-44b0-9928-c6d1016f2f93");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        e.currentTarget.reset(); // Réinitialiser le formulaire
        console.log("Email envoyé avec succès !");
      } else {
        setSubmitStatus('error');
        console.error("Erreur:", data.message);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error("Erreur lors de l'envoi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shadow-input mx-auto w-full rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Nous contacter
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        Transmettez-nous vos questions ou demandes, nous vous répondrons dans
        les plus brefs délais.
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="firstname">Prénom</Label>
            <Input 
              id="firstname" 
              name="firstname"
              placeholder="Tyler" 
              type="text"
              required 
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Nom</Label>
            <Input 
              id="lastname" 
              name="lastname"
              placeholder="Durden" 
              type="text"
              required 
            />
          </LabelInputContainer>
        </div>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Adresse email</Label>
          <Input 
            id="email" 
            name="email"
            placeholder="projectmayhem@fc.com" 
            type="email"
            required 
          />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="message">Votre message</Label>
          <textarea
            id="message"
            name="message"
            placeholder="Votre message"
            className="flex h-40 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 shadow-input dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none"
            required
          />
        </LabelInputContainer>

        {/* Message de succès */}
        {submitStatus === 'success' && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">✅ Message envoyé avec succès ! Nous vous répondrons rapidement.</p>
          </div>
        )}

        {/* Message d'erreur */}
        {submitStatus === 'error' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">❌ Une erreur est survenue. Veuillez réessayer.</p>
          </div>
        )}

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Envoi en cours..." : "Envoyer →"}
          <BottomGradient />
        </button>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};