// src/scripts/splitTextAnimation.js

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initSplitTextAnimation() {
  const headings = document.querySelectorAll("h1, h2, h3");

  headings.forEach((heading) => {
    if (heading.dataset.animated) return;
    heading.dataset.animated = "true";

    const split = new SplitText(heading, {
      type: "lines",
      linesClass: "split-line"
    });

    split.lines.forEach((line) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("line-wrapper");
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    gsap.set(split.lines, {
      yPercent: 120,
      opacity: 0
    });

    gsap.to(split.lines, {
      yPercent: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power4.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: heading,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  });
}