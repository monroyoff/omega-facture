'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Afficher le bouton dès que l'utilisateur défile à plus de 350px
      setVisible(window.scrollY > 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-40 p-3 sm:px-4 sm:py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-xl shadow-brand-600/35 border border-brand-400/40 backdrop-blur-md transition-all duration-300 flex items-center gap-2 group cursor-pointer touch-manipulation ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
      title="Remonter en haut de la page"
      aria-label="Remonter en haut de la page"
    >
      <div className="w-5 h-5 flex items-center justify-center">
        <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:-translate-y-1" />
      </div>
      <span className="text-xs font-black tracking-wide hidden sm:inline">
        Haut de page
      </span>
    </button>
  );
};
