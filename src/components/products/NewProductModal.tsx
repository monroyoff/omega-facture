'use client';

import React, { useState } from 'react';
import { X, Package, Tag, Percent, Check, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';
import { Product } from '@/lib/store/invoice-context';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated?: (newProduct: Product) => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  onProductCreated,
}) => {
  const { addProduct } = useInvoices();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Services IT');
  const [unit, setUnit] = useState('Prestation');
  const [vat, setVat] = useState(18);
  const [price, setPrice] = useState(150000);
  const [image, setImage] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Veuillez renseigner le nom de l’article.');
      return;
    }

    const created = addProduct({
      name: name.trim(),
      cat: category,
      unit,
      vat,
      price: Math.max(0, Math.round(price)),
      image: image.trim() || undefined,
    });

    onProductCreated?.(created);
    onClose();
  };

  const presets = [
    { label: '💻 Web / IT', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=160&auto=format&fit=crop&q=80' },
    { label: '📱 Mobile Money', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=160&auto=format&fit=crop&q=80' },
    { label: '🎨 Design UI', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=160&auto=format&fit=crop&q=80' },
    { label: '☁️ Cloud & Serveurs', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=160&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-[#111622] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Ajouter un Article / Service
              </h3>
              <p className="text-xs text-slate-400">
                Tarification et taux de TVA pour le catalogue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Désignation de la prestation / produit *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Refonte site e-commerce"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer"
              >
                <option value="Services IT">Services IT</option>
                <option value="Fintech">Fintech</option>
                <option value="Infogérance">Infogérance</option>
                <option value="Design">Design</option>
                <option value="Formation">Formation</option>
                <option value="Commerce">Commerce</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Unité
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer"
              >
                <option value="Prestation">Prestation</option>
                <option value="Heure">Heure</option>
                <option value="Journée">Journée</option>
                <option value="Mois">Mois</option>
                <option value="An">An</option>
                <option value="Mission">Mission</option>
                <option value="Forfait">Forfait</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Taux de TVA
              </label>
              <select
                value={vat}
                onChange={(e) => setVat(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer"
              >
                <option value={18}>18% (UEMOA)</option>
                <option value={0}>0% (Exonéré)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Prix unitaire (FCFA) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-right font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Image / Visuel de l'article */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block">
              Image / Visuel de l’article
            </label>
            <div className="flex items-center gap-3">
              {image ? (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex-shrink-0 group">
                  <img src={image} alt="Aperçu article" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Supprimer l'image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-brand-600" />
                  <span>Importer une image...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-400">
                  JPG, PNG ou WebP. Ou choisissez un preset :
                </p>
              </div>
            </div>

            {/* Presets rapides */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImage(preset.url)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all ${
                    image === preset.url
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

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
              <span>Ajouter au Catalogue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
