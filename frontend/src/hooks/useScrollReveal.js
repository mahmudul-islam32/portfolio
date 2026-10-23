import { useEffect } from 'react';

/**
 * Fades sections in as they enter the viewport.
 * Elements opt in by matching `selector`; users who prefer reduced motion get no animation.
 */
export function useScrollReveal(selector = '.site-section') {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(selector));
    if (!els.length) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return undefined;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );

    els.forEach((el) => {
      el.classList.add('reveal');
      obs.observe(el);
    });

    return () => obs.disconnect();
  }, [selector]);
}

export default useScrollReveal;
