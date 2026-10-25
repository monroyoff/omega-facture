'use client';

import React, { useState } from 'react';
import { X, User, Building, Mail, Phone, MapPin, ShieldCheck, Check, Camera, Upload, Trash2 } from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';
import { Client } from '@/lib/types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated?: (newClient: Client) => void;
  clientToEdit?: Client | null;
  onSuccess?: (message: string) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onClientCreated,
  clientToEdit,
  onSuccess,
}) => {
  const { addClient, updateClient, showToast } = useInvoices();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Cotonou');
  const [country, setCountry] = useState('Bénin');
  const [taxId, setTaxId] = useState('');
  const [avatar, setAvatar] = useState('');

  // Sync state when clientToEdit changes or modal opens
  React.useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name || '');
      setCompany(clientToEdit.company || '');
      setEmail(clientToEdit.email || '');
      setPhone(clientToEdit.phone || '');
      setCity(clientToEdit.city || 'Cotonou');
      setCountry(clientToEdit.country || 'Bénin');
      setTaxId(clientToEdit.taxId ? clientToEdit.taxId.replace(/^IFU\s*/, '') : '');
      setAvatar(clientToEdit.avatar || '');
    } else {
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setCity('Cotonou');
      setCountry('Bénin');
      setTaxId('');
      setAvatar('');
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const avatarPresets = [
    { label: '👔 Dirigeant', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80' },
    { label: '👩‍💼 Directrice', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80' },
    { label: '👨‍💼 Manager', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80' },
    { label: '👩‍💻 Consultante', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80' },
    { label: '🏢 Entreprise', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=160&auto=format&fit=crop&q=80' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) {
      showToast({
        title: 'Champs requis',
        message: 'Veuillez renseigner le nom du contact et la société.',
        kind: 'warning',
        duration: 4000,
      });
      return;
    }

    if (clientToEdit) {
      updateClient(clientToEdit.id, {
        name: name.trim(),
        company: company.trim(),
        email: email.trim() || 'contact@client.bj',
        phone: phone.trim() || '+229 01 00 00 00',
        city: city.trim() || 'Cotonou',
        country: country.trim() || 'Bénin',
        taxId: taxId.trim() ? `IFU ${taxId.trim()}` : undefined,
        avatar: avatar.trim() || undefined,
      });
      showToast({
        title: 'Client modifié avec succès',
        message: `Fiche de ${company.trim()} (${name.trim()}) mise à jour.`,
        kind: 'update',
        duration: 4000,
      });
      onSuccess?.('Modification enregistrée');
      onClose();
      return;
    }

    const created = addClient({
      name: name.trim(),
      company: company.trim(),
      email: email.trim() || 'contact@client.bj',
      phone: phone.trim() || '+229 01 00 00 00',
      city: city.trim() || 'Cotonou',
      country: country.trim() || 'Bénin',
      taxId: taxId.trim() ? `IFU ${taxId.trim()}` : undefined,
      avatar: avatar.trim() || undefined,
    });

    showToast({
      title: 'Nouveau client enregistré avec succès',
      message: `${company.trim()} (${name.trim()}) ajouté au carnet d’adresses.`,
      kind: 'success',
      duration: 4000,
    });
    onClientCreated?.(created);
    onSuccess?.('Nouveau client enregistré avec succès !');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111622] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {clientToEdit ? 'Modifier la Fiche Client' : 'Ajouter un Nouveau Client'}
              </h3>
              <p className="text-xs text-slate-400">
                {clientToEdit
                  ? 'Mettre à jour les coordonnées et identifiants fiscaux'
                  : 'Coordonnées et identification fiscale pour la facturation'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 active:text-slate-900 hover:bg-slate-100 active:bg-slate-200 dark:hover:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 transition-all active:scale-95 cursor-pointer touch-manipulation shrink-0"
            aria-label="Fermer la fiche client"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Photo de profil / Avatar du Client */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-3.5">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-brand-50 dark:bg-brand-950/40 border border-slate-200 dark:border-slate-700 shrink-0 group">
                {avatar ? (
                  <>
                    <img src={avatar} alt="Photo profil" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer la photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-brand-600" />
                    <span>{avatar ? 'Changer la photo...' : 'Ajouter une photo...'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">
                  JPG, PNG ou WebP. Ou choisissez un avatar prédéfini :
                </p>
              </div>
            </div>

            {/* Presets rapides d'avatars */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
              {avatarPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(preset.url)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all ${
                    avatar === preset.url
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Société */}
            <div className="relative">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Société / Entreprise *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Sahel Tech SARL"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Nom du contact */}
            <div className="relative">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Nom du Contact *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Marceline Houenou"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="relative">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Email Professionnel
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="contact@societe.bj"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Téléphone */}
            <div className="relative">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Téléphone (WhatsApp)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+229 01 97 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ville */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Ville
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Pays */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Pays (Zone UEMOA)
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Bénin">Bénin</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Sénégal">Sénégal</option>
                <option value="Togo">Togo</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Mali">Mali</option>
                <option value="Niger">Niger</option>
              </select>
            </div>
          </div>

          {/* Identifiant Fiscal */}
          <div className="relative">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Identifiant Fiscal (IFU / NIF / NCC)
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ex: 3202100492811"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{clientToEdit ? 'Enregistrer les modifications' : 'Enregistrer le Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
