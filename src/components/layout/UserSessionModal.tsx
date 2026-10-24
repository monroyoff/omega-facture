'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Building2,
  ShieldCheck,
  Camera,
  LogOut,
  Settings,
  X,
  Check,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Hash,
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';

interface UserSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  anchor?: 'header' | 'sidebar' | 'center';
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160&auto=format&fit=crop&q=80',
];

export const UserSessionModal: React.FC<UserSessionModalProps> = ({ isOpen, onClose, anchor = 'center' }) => {
  const { currentUser, logout, updateUserProfile } = useInvoices();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [photoUpdated, setPhotoUpdated] = useState(false);

  if (!isOpen || !currentUser) return null;

  const firstName = currentUser.firstName || currentUser.name.split(' ')[0] || 'Mari-ella';
  const lastName = currentUser.lastName || currentUser.name.split(' ').slice(1).join(' ') || 'Manille';
  const organization = currentUser.organization || 'MONROY AGENCY';
  const email = currentUser.email || 'monmonnroyteam@gmail.com';
  const role = currentUser.role || 'Administrateur / Gérant';
  const avatar = currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=2563eb&color=fff&size=160&bold=true`;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateUserProfile({ avatar: reader.result });
          setPhotoUpdated(true);
          setTimeout(() => setPhotoUpdated(false), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url: string) => {
    updateUserProfile({ avatar: url });
    setShowPresets(false);
    setPhotoUpdated(true);
    setTimeout(() => setPhotoUpdated(false), 2500);
  };

  const handleLogout = () => {
    onClose();
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#111622] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-700 px-6 pt-6 pb-12 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-bold text-white mb-1">
            <ShieldCheck className="w-3 h-3 text-emerald-300" />
            <span>Session Utilisateur Active</span>
          </div>
          <h2 className="text-lg font-black tracking-tight">Mon Espace Professionnel</h2>
        </div>

        {/* User Card Content (Overlapping the banner) */}
        <div className="px-6 pb-6 pt-0 -mt-8 space-y-5">
          {/* Avatar and Main Identifiers */}
          <div className="flex items-end gap-3.5">
            <div className="relative group shrink-0">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-[#111622] shadow-xl bg-slate-100 dark:bg-slate-800">
                <img
                  src={avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Online pulse badge */}
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111622] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>

              {/* Camera change button overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-2xl bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                title="Changer de photo"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-bold">Changer</span>
              </button>
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                <span>{firstName}</span>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">{lastName}</span>
              </div>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-bold truncate">
                {role}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{organization}</span>
              </div>
            </div>
          </div>

          {/* Toast photo mise à jour */}
          {photoUpdated && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-center gap-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Photo de profil mise à jour avec succès !</span>
            </div>
          )}

          {/* Quick Avatar Actions (Upload or Preset) */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-brand-600" />
              <span>Importer une photo</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              {showPresets ? 'Masquer avatars' : 'Choisir un avatar'}
            </button>
          </div>

          {/* Preset Avatars Grid */}
          {showPresets && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Sélectionnez un avatar prédéfini :
              </span>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPreset(url)}
                    className="w-10 h-10 rounded-xl overflow-hidden border-2 hover:border-brand-600 focus:outline-hidden transition-all hover:scale-105 cursor-pointer shrink-0"
                  >
                    <img src={url} alt={`Avatar preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Detailed User Information Grid */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] flex items-center justify-between">
              <span>Coordonnées de l'utilisateur</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <Check className="w-2.5 h-2.5" />
                Vérifié
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Prénom</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">{firstName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Nom</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">{lastName}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Email professionnel</span>
                <div className="font-bold text-slate-900 dark:text-white text-xs truncate flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Organisation / Société</span>
                <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span className="truncate">{organization}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Identifiant légal / IFU</span>
                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>IFU 1201837492811 • République du Bénin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="space-y-1.5">
            <Link
              href="/settings"
              onClick={onClose}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Modifier mes informations & entreprise</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-60" />
            </Link>

            <Link
              href="/support"
              onClick={onClose}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Assistance technique & Support</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-60" />
            </Link>
          </div>

          {/* Logout Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter de la session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
