"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCount({ value }: { value: number }) {
  const elementRef = useRef<HTMLElement>(null);
  const [count, setCount] = useState(value);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!("IntersectionObserver" in window)) return;

    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (started || !entries.some((entry) => entry.isIntersecting)) return;
        started = true;
        observer.disconnect();

        const start = performance.now();
        const update = (now: number) => {
          const progress = Math.min((now - start) / 900, 1);
          const eased = 1 - (1 - progress) ** 3;
          setCount(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(update);
        };

        setCount(0);
        frame = requestAnimationFrame(update);
      },
      { threshold: 0.7 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <strong ref={elementRef}>{count}</strong>;
}
