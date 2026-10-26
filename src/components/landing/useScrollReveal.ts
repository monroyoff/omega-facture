'use client';

import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkElements = () => {
      const elements = document.querySelectorAll('.reveal-on-scroll:not(.revealed)');
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= windowHeight * 1.25) {
          el.classList.add('revealed');
        }
      });
    };

    // Run check on mount and after render cycles
    checkElements();
    const timer1 = setTimeout(checkElements, 100);
    const timer2 = setTimeout(checkElements, 400);

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              if (observer) observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.01,
          rootMargin: '150px 0px 250px 0px',
        }
      );

      const elements = document.querySelectorAll('.reveal-on-scroll');
      elements.forEach((el) => observer!.observe(el));
    }

    window.addEventListener('scroll', checkElements, { passive: true });
    window.addEventListener('resize', checkElements, { passive: true });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', checkElements);
      window.removeEventListener('resize', checkElements);
    };
  }, []);
}
