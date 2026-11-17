"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function ScrollExperience() {
  const [showTop, setShowTop] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const revealItems = document.querySelectorAll<HTMLElement>(
      "[data-reveal], .intro, .edu-row, .featured, .cards > .card, .achievements > .achievement, .plan-step, .contact > *",
    );
    const revealAnimations = new Map<HTMLElement, Animation>();
    const appearedItems = new WeakSet<HTMLElement>();

    const revealObserver =
      !prefersReducedMotion && "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                const element = entry.target as HTMLElement;
                const previousAnimation = revealAnimations.get(element);
                const hasAppeared = appearedItems.has(element);

                if (!entry.isIntersecting && !hasAppeared) continue;

                previousAnimation?.cancel();
                if (entry.isIntersecting) appearedItems.add(element);

                const bounds = element.getBoundingClientRect();
                const offset = entry.isIntersecting
                  ? bounds.top >= window.innerHeight
                    ? 18
                    : -18
                  : bounds.bottom <= 0
                    ? -18
                    : 18;
                const hiddenTranslate = `0 ${offset}px`;
                const animation = element.animate(
                  entry.isIntersecting
                    ? [
                        { opacity: 0, translate: hiddenTranslate },
                        { opacity: 1, translate: "0 0" },
                      ]
                    : [
                        { opacity: 1, translate: "0 0" },
                        { opacity: 0, translate: hiddenTranslate },
                      ],
                  {
                    duration: 380,
                    easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
                    fill: "both",
                  },
                );
                revealAnimations.set(element, animation);

                if (entry.isIntersecting) {
                  animation.onfinish = () => {
                    if (revealAnimations.get(element) !== animation) return;
                    animation.cancel();
                    revealAnimations.delete(element);
                  };
                }
              }
            },
            { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
          )
        : null;

    for (const element of revealItems) {
      if (revealObserver) revealObserver.observe(element);
    }

    const progress = document.querySelector<HTMLElement>(".reading-progress");
    let ticking = false;
    const onScroll = () => {
      const shouldShowTop = window.scrollY > window.innerHeight * 0.7;
      setShowTop((current) =>
        current === shouldShowTop ? current : shouldShowTop,
      );
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollable = root.scrollHeight - window.innerHeight;
        const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
        progress?.style.setProperty("--scroll-progress", String(amount));
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      revealObserver?.disconnect();
      for (const animation of revealAnimations.values()) animation.cancel();
      revealAnimations.clear();
    };
  }, [pathname]);

  return (
    <>
      <div className="reading-progress" aria-hidden="true" />
      {showTop && (
        <button
          className="back-to-top"
          type="button"
          aria-label="Volver al inicio"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span aria-hidden="true">↑</span>
        </button>
      )}
    </>
  );
}
