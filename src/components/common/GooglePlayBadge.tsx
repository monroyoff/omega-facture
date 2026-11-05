'use client';

import React from 'react';

interface GooglePlayBadgeProps {
  className?: string;
  variant?: 'hero' | 'footer' | 'compact' | 'light';
}

export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.omegafacture.billing';

export const GooglePlayBadge: React.FC<GooglePlayBadgeProps> = ({
  className = '',
  variant = 'hero',
}) => {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Télécharger OMEGA FACTURE sur Google Play"
      className={`group inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
        variant === 'light'
          ? 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-sm hover:shadow-md'
          : variant === 'footer'
          ? 'bg-[#18181b] hover:bg-[#27272a] text-white border border-white/10 hover:border-emerald-500/40 shadow-md'
          : 'bg-slate-950 hover:bg-black text-white border border-slate-800 hover:border-slate-700 shadow-lg shadow-black/20 hover:shadow-xl'
      } ${className}`}
    >
      {/* Icône Google Play authentique 4 couleurs */}
      <svg
        className="w-6 h-6 shrink-0 transition-transform duration-200 group-hover:scale-110"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.609 1.813A1.94 1.94 0 0 0 3 3.268v17.464c0 .565.228 1.08.609 1.455l.078.077 9.775-9.775v-.23L3.687 1.735l-.078.078Z"
          fill="url(#gp_grad1)"
        />
        <path
          d="m16.713 15.485-3.251-3.252v-.23l3.251-3.252.074.043 3.856 2.19c1.1.625 1.1 1.645 0 2.27l-3.856 2.188-.074.043Z"
          fill="url(#gp_grad2)"
        />
        <path
          d="m13.462 12.233-9.853 9.853c.361.383.948.435 1.603.063l11.577-6.577-3.327-3.339Z"
          fill="url(#gp_grad3)"
        />
        <path
          d="M13.462 12.003 16.79 8.664 5.212 2.087c-.655-.372-1.242-.32-1.603.063l9.853 9.853Z"
          fill="url(#gp_grad4)"
        />
        <defs>
          <linearGradient
            id="gp_grad1"
            x1="12.083"
            y1="2.721"
            x2="-2.012"
            y2="16.816"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00A0FF" />
            <stop offset=".007" stopColor="#00A1FF" />
            <stop offset=".26" stopColor="#00BEFF" />
            <stop offset=".512" stopColor="#00D2FF" />
            <stop offset=".76" stopColor="#00DFFF" />
            <stop offset="1" stopColor="#00E3FF" />
          </linearGradient>
          <linearGradient
            id="gp_grad2"
            x1="20.893"
            y1="12.115"
            x2="2.775"
            y2="12.115"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFE000" />
            <stop offset=".409" stopColor="#FFBD00" />
            <stop offset=".775" stopColor="#FFA500" />
            <stop offset="1" stopColor="#FF9C00" />
          </linearGradient>
          <linearGradient
            id="gp_grad3"
            x1="14.945"
            y1="13.717"
            x2="-5.378"
            y2="34.039"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF3A44" />
            <stop offset="1" stopColor="#C31162" />
          </linearGradient>
          <linearGradient
            id="gp_grad4"
            x1="-1.684"
            y1="-5.632"
            x2="8.64"
            y2="4.693"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#32A071" />
            <stop offset=".069" stopColor="#2DA771" />
            <stop offset=".476" stopColor="#15CF74" />
            <stop offset=".801" stopColor="#06E775" />
            <stop offset="1" stopColor="#00F076" />
          </linearGradient>
        </defs>
      </svg>

      <div className="text-left leading-tight">
        <span
          className={`text-[10px] uppercase font-bold tracking-wider block ${
            variant === 'light' ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          Disponible sur
        </span>
        <span className="text-xs sm:text-sm font-black block tracking-tight">
          Google Play
        </span>
      </div>
    </a>
  );
};

