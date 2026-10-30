'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Share2,
  MessageCircle,
  Mail,
  Phone,
  Send,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Building,
  User,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Invoice } from '@/lib/types';
import { formatFCFA, formatDateFR } from '@/lib/money/format';
import { useInvoices } from '@/lib/store/invoice-context';

export interface ShareDocumentModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  defaultChannel?: 'whatsapp' | 'email';
}

export const ShareDocumentModal: React.FC<ShareDocumentModalProps> = ({
  invoice,
  isOpen,
  onClose,
  defaultChannel = 'whatsapp',
}) => {
  const { currentUser, showToast } = useInvoices();
  const [channel, setChannel] = useState<'whatsapp' | 'email'>(defaultChannel);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const isQuote = useMemo(() => {
    if (!invoice) return false;
    return invoice.documentKind === 'quote' || invoice.number.startsWith('DEV-');
  }, [invoice]);

  const docLabel = isQuote ? 'Devis' : 'Facture';

  // Synchronisation des données à l'ouverture de la modale
  useEffect(() => {
    if (!isOpen || !invoice) return;

    setChannel(defaultChannel);
    setCopied(false);
    setFeedback(null);

    const clientPhone = invoice.client?.phone || '';
    const clientEmail = invoice.client?.email || '';
    setRecipientPhone(clientPhone);
    setRecipientEmail(clientEmail);

    const orgName = invoice.sellerName || currentUser?.organization || currentUser?.name || 'Mon Entreprise';
    const clientDisplayName = invoice.client?.name || invoice.client?.company || 'Cher Client';
    const remaining = Math.max(0, invoice.total - (invoice.amountPaid || 0));

    if (isQuote) {
      // 1. Devis
      setEmailSubject(`[DEVIS] ${invoice.number} — ${invoice.client?.company || invoice.client?.name || orgName}`);
      
      if (defaultChannel === 'whatsapp') {
        setCustomMessage(
          `Bonjour ${clientDisplayName},\n\nVeuillez trouver ci-joint votre devis estimatif *${invoice.number}* d'un montant de *${formatFCFA(invoice.total)}* émis par *${orgName}*.\n\n📅 Validité de l'offre : 30 jours (jusqu'au ${formatDateFR(invoice.dueDate)}).\n\nPour valider votre commande, vous pouvez nous retourner ce devis avec la mention manuscrite « Bon pour accord » ou nous contacter directement.\n\nRestant à votre entière disposition,\nBien cordialement,\n*${orgName}*`
        );
      } else {
        setCustomMessage(
          `Bonjour ${clientDisplayName},\n\nNous vous prions de bien vouloir trouver ci-dessous les détails de votre devis estimatif N° ${invoice.number} :\n\n• Destinataire : ${invoice.client?.company || invoice.client?.name}\n• Date d'émission : ${formatDateFR(invoice.issueDate)}\n• Validité de l'offre : 30 jours (jusqu'au ${formatDateFR(invoice.dueDate)})\n• Montant Total TTC : ${formatFCFA(invoice.total)}\n\nPour confirmer ce devis et engager la prestation, merci de nous retourner votre accord daté et signé.\n\nNous restons à votre entière disposition pour tout renseignement complémentaire.\n\nBien cordialement,\n${orgName}`
        );
      }
    } else {
      // 2. Facture
      setEmailSubject(`[FACTURE] ${invoice.number} — ${invoice.client?.company || invoice.client?.name || orgName}`);
      const soldeTextWA =
        remaining > 0
          ? `\n💰 Solde restant à régler : *${formatFCFA(remaining)}*`
          : `\n✅ Facture intégralement soldée (${formatFCFA(invoice.amountPaid || invoice.total)})`;

      const soldeTextMail =
        remaining > 0
          ? `\n• Solde restant dû : ${formatFCFA(remaining)} (Échéance : ${formatDateFR(invoice.dueDate)})`
          : `\n• Statut : Facture soldée (Règlement reçu : ${formatFCFA(invoice.amountPaid || invoice.total)})`;

      if (defaultChannel === 'whatsapp') {
        setCustomMessage(
          `Bonjour ${clientDisplayName},\n\nVeuillez trouver ci-joint votre facture *${invoice.number}* d'un montant total de *${formatFCFA(invoice.total)}* émise par *${orgName}*.${soldeTextWA}\n📅 Date d'échéance : ${formatDateFR(invoice.dueDate)}\n\n💳 Règlement accepté par Mobile Money (MTN, Moov, Wave) ou Virement bancaire.\n\nMerci de votre confiance !\nBien cordialement,\n*${orgName}*`
        );
      } else {
        setCustomMessage(
          `Bonjour ${clientDisplayName},\n\nNous vous prions de bien vouloir trouver ci-dessous le récapitulatif de votre facture N° ${invoice.number} :\n\n• Client : ${invoice.client?.company || invoice.client?.name}\n• Date d'émission : ${formatDateFR(invoice.issueDate)}\n• Montant Total TTC : ${formatFCFA(invoice.total)}${soldeTextMail}\n\nModalités de règlement : Mobile Money (MTN, Moov, Wave), Virement bancaire ou Chèque.\n\nEn vous remerciant pour votre confiance.\n\nBien cordialement,\n${orgName}`
        );
      }
    }
  }, [isOpen, invoice, defaultChannel, isQuote, currentUser]);

  // Bascule dynamique de message lors du changement de canal
  const handleSelectChannel = (newChannel: 'whatsapp' | 'email') => {
    setChannel(newChannel);
    if (!invoice) return;

    const orgName = invoice.sellerName || currentUser?.organization || currentUser?.name || 'Mon Entreprise';
    const clientDisplayName = invoice.client?.name || invoice.client?.company || 'Cher Client';
    const remaining = Math.max(0, invoice.total - (invoice.amountPaid || 0));

    if (newChannel === 'whatsapp') {
      if (isQuote) {
        setCustomMessage(
          `Bonjour ${clientDisplayName},\n\nVeuillez trouver ci-joint votre devis estimatif *${invoice.number}* d'un montant de *${formatFCFA(invoice.total)}* émis par *${orgName}*.\n\n📅 Validité de l'offre : 30 jours (jusqu'au ${formatDateFR(invoice.dueDate)}).\n\nPour valider votre commande, vous pouvez nous retourner ce devis avec la mention manuscrite « Bon pour accord » ou nous contacter directement.\n\nRestant à votre entière disposition,\nBien cordialement,\n*${orgName}*`
        );
      } else {
        const soldeTextWA =
          remaining > 0
            ? `\n💰 Solde restant à régler : *${formatFCFA(remaining)}*`
            : `\n✅ Facture intégralement soldée (${formatFCFA(invoice.amountPaid || invoice.total)})`;
        setCustomMessage(
          `Bonjour ${clientDisplayName},\n\nVeuillez trouver ci-joint votre facture *${invoice.number}* d'un montant total de *${formatFCFA(invoice.total)}* émise par *${orgName}*.${soldeTextWA}\n📅 Date d'échéance : ${formatDateFR(invoice.dueDate)}\n\n💳 Règlement accepté par Mobile Money (MTN, Moov, Wave) ou Virement bancaire.\n\nMerci de votre confiance !\nBien cordialement,\n*${orgName}*`
        );
      }
    } else {
      if (isQuote) {
        setCustomMessage(
          `Bonjour ${clientDisplayName},\n\nNous vous prions de bien vouloir trouver ci-dessous les détails de votre devis estimatif N° ${invoice.number} :\n\n• Destinataire : ${invoice.client?.company || invoice.client?.name}\n• Date d'émission : ${formatDateFR(invoice.issueDate)}\n• Validité de l'offre : 30 jours (jusqu'au ${formatDateFR(invoice.dueDate)})\n• Montant Total TTC : ${formatFCFA(invoice.total)}\n\nPour confirmer ce devis et engager la prestation, merci de nous retourner votre accord daté et signé.\n\nNous restons à votre entière disposition pour tout renseignement complémentaire.\n\nBien cordialement,\n${orgName}`
        );
      } else {
        const soldeTextMail =
          remaining > 0
            ? `\n• Solde restant dû : ${formatFCFA(remaining)} (Échéance : ${formatDateFR(invoice.dueDate)})`
            : `\n• Statut : Facture soldée (Règlement reçu : ${formatFCFA(invoice.amountPaid || invoice.total)})`;
        setCustomMessage(
          `Bonjour ${clientDisplayName},\n\nNous vous prions de bien vouloir trouver ci-dessous le récapitulatif de votre facture N° ${invoice.number} :\n\n• Client : ${invoice.client?.company || invoice.client?.name}\n• Date d'émission : ${formatDateFR(invoice.issueDate)}\n• Montant Total TTC : ${formatFCFA(invoice.total)}${soldeTextMail}\n\nModalités de règlement : Mobile Money (MTN, Moov, Wave), Virement bancaire ou Chèque.\n\nEn vous remerciant pour votre confiance.\n\nBien cordialement,\n${orgName}`
        );
      }
    }
  };

  // Fermeture par touche Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;

  // Actions d'envoi
  const handleSendWhatsApp = () => {
    const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(customMessage)}`;
    window.open(url, '_blank');
    setFeedback('Ouverture de WhatsApp...');
    setTimeout(() => setFeedback(null), 3000);
    showToast({
      title: 'WhatsApp ouvert avec succès',
      message: `Message pré-rempli pour ${invoice.client?.company || invoice.client?.name}.`,
      kind: 'info',
      number: invoice.number,
      duration: 3500,
    });
  };

  const handleSendEmail = () => {
    const cleanEmail = recipientEmail.trim();
    const mailto = `mailto:${encodeURIComponent(cleanEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(customMessage)}`;
    window.open(mailto, '_blank');
    setFeedback('Ouverture de votre messagerie email...');
    setTimeout(() => setFeedback(null), 3000);
    showToast({
      title: 'Messagerie Email ouverte',
      message: `Courriel de ${docLabel} préparé pour ${recipientEmail || invoice.client?.name}.`,
      kind: 'info',
      number: invoice.number,
      duration: 3500,
    });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
    showToast({
      title: 'Message copié dans le presse-papiers !',
      message: `Texte du ${docLabel} ${invoice.number} prêt à être collé.`,
      kind: 'success',
      number: invoice.number,
      duration: 3000,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#111622] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modale */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-200/60 dark:border-brand-800/60">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Partager {isQuote ? 'le Devis' : 'la Facture'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isQuote
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      : 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                  }`}
                >
                  {invoice.number}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choisissez le canal d’envoi souhaité : <strong>WhatsApp</strong> ou <strong>Email</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 active:text-slate-900 hover:bg-slate-100 active:bg-slate-200 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer touch-manipulation"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fiche synthétique du document & client */}
        <div className="px-6 py-3.5 bg-slate-100/70 dark:bg-[#0c1017] border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Client : <strong className="text-slate-900 dark:text-white">{invoice.client?.company || invoice.client?.name}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Montant : <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatFCFA(invoice.total)}</strong>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">
              Échéance : <strong>{formatDateFR(invoice.dueDate)}</strong>
            </span>
          </div>
        </div>

        {/* Corps principal : Sélecteur de canal et formulaire */}
        <div className="p-6 space-y-5">
          {/* SÉLECTEUR DE CANAL : 2 GRANDES CARTES INTERACTIVES */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              1. Choisissez le moyen de partage :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option WhatsApp */}
              <button
                type="button"
                onClick={() => handleSelectChannel('whatsapp')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden ${
                  channel === 'whatsapp'
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/80 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    channel === 'whatsapp'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm block">
                      Partager par WhatsApp
                    </span>
                    {channel === 'whatsapp' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Message préformaté envoyé directement sur le WhatsApp du client.
                  </p>
                </div>
              </button>

              {/* Option Email */}
              <button
                type="button"
                onClick={() => handleSelectChannel('email')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden ${
                  channel === 'email'
                    ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 text-brand-950 dark:text-brand-100 ring-2 ring-brand-500/80 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    channel === 'email'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm block">
                      Envoyer par Email
                    </span>
                    {channel === 'email' && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Transmission officielle vers l'adresse email professionnelle du contact.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* DÉTAILS DU DESTINATAIRE SELON LE CANAL */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              2. Coordonnées & Contenu :
            </label>

            {channel === 'whatsapp' ? (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Numéro de téléphone / WhatsApp du destinataire :
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="Ex: +229 97 00 00 00"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Adresse email du destinataire :
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="Ex: contact@client.bj"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Objet de l'email :
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            )}

            {/* Zone de texte du message personnalisé */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Message préformaté (modifiable) :
                </label>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Message copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le texte</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={5}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3 text-xs leading-relaxed bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono"
              />
            </div>
          </div>

          {/* Toast de confirmation temporaire */}
          {feedback && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{feedback}</span>
            </div>
          )}
        </div>

        {/* Footer avec boutons d'action explicites */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Annuler
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>

            {channel === 'whatsapp' ? (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ouvrir WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendEmail}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Ouvrir ma boîte Email</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
