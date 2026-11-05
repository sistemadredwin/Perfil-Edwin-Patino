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
    const counters = document.querySelectorAll<HTMLElement>("[data-count]");

    root.classList.add("motion-ready");
    for (const element of revealItems) {
      if (!element.hasAttribute("data-reveal")) {
        element.dataset.reveal = "up";
      }
    }

    const revealObserver =
      !prefersReducedMotion && "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries, observer) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
              }
            },
            { threshold: 0.16, rootMargin: "0px 0px -36px 0px" },
          )
        : null;

    for (const element of revealItems) {
      if (revealObserver) revealObserver.observe(element);
      else element.classList.add("is-visible");
    }

    const animateCount = (element: HTMLElement) => {
      const target = Number(element.dataset.count);
      if (!Number.isFinite(target) || target <= 0) return;
      if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        element.textContent = String(target);
        return;
      }

      const duration = 900;
      const start = performance.now();
      const update = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        element.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    };

    const countObserver =
      !prefersReducedMotion && "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries, observer) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                animateCount(entry.target as HTMLElement);
                observer.unobserve(entry.target);
              }
            },
            { threshold: 0.7 },
          )
        : null;

    for (const element of counters) {
      if (countObserver) countObserver.observe(element);
      else animateCount(element);
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
      root.classList.remove("motion-ready");
      window.removeEventListener("scroll", onScroll);
      revealObserver?.disconnect();
      countObserver?.disconnect();
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
