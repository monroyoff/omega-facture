import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, ShieldCheck, Lock, Database, UserCheck, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — OMEGA FACTURE',
  description: 'Politique de confidentialité et protection des données personnelles de la plateforme et application mobile OMEGA FACTURE.',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30">
              Ω
            </div>
            <span className="font-bold text-white tracking-tight">OMEGA FACTURE</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Conformité Règlementaire & Protection des Données</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Politique de Confidentialité
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Dernière mise à jour : 28 Octobre 2026. Cette politique régit l&apos;utilisation du site web et de l&apos;application mobile Android OMEGA FACTURE (<code className="text-indigo-400">site.omegafacture.app</code>).
          </p>
        </div>

        <div className="space-y-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-10 text-sm leading-relaxed text-slate-300 shadow-xl">
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-indigo-600/20 text-indigo-400 inline-flex items-center justify-center text-xs font-black">1</span>
              Responsable du Traitement
            </h2>
            <p>
              La plateforme et l&apos;application mobile <strong>OMEGA FACTURE</strong> sont éditées par OMEGA FACTURE Technologies. Nous nous engageons fermement à garantir la confidentialité et la sécurité des données personnelles et professionnelles de nos utilisateurs, conformément aux législations en vigueur dans l&apos;espace UEMOA/OHADA et aux standards internationaux de protection des données.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-indigo-600/20 text-indigo-400 inline-flex items-center justify-center text-xs font-black">2</span>
              Données Collectées
            </h2>
            <p className="mb-3">
              Dans le cadre de l&apos;utilisation de notre service de facturation et de devis, nous sommes amenés à collecter les données strictement nécessaires au bon fonctionnement de l&apos;application :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>Données de compte :</strong> Nom, prénom, adresse e-mail professionnelle, mot de passe chiffré.</li>
              <li><strong>Données de l&apos;entreprise :</strong> Dénomination sociale, adresse géographique, téléphone professionnel, identifiant fiscal unique (IFU au Bénin, NCC en Côte d&apos;Ivoire, NINEA au Sénégal), logo d&apos;entreprise.</li>
              <li><strong>Données de facturation et de clientèle :</strong> Coordonnées des clients de l&apos;utilisateur (nom, email, téléphone, IFU), libellés des prestations/produits, montants des devis et factures, dates d&apos;échéance, statuts de paiement.</li>
              <li><strong>Informations techniques :</strong> Données relatives à l&apos;appareil, version du système Android, jetons de session d&apos;authentification et logs de sécurité.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-indigo-600/20 text-indigo-400 inline-flex items-center justify-center text-xs font-black">3</span>
              Finalité du Traitement des Données
            </h2>
            <p className="mb-2">Les informations collectées ont pour finalités exclusives :</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>La création, l&apos;édition, l&apos;export PDF et le suivi des factures et devis commerciaux.</li>
              <li>La synchronisation multi-appareils sécurisée en temps réel de votre espace de facturation.</li>
              <li>L&apos;émission de reçus de paiement et la vérification des abonnements via nos partenaires de paiement agréés (PayDunya, Mobile Money).</li>
              <li>L&apos;envoi de relances de facturation par e-mail ou WhatsApp à l&apos;initiative expresse de l&apos;utilisateur.</li>
              <li>Le support client et la maintenance technique du service.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              Sécurité et Confidentialité des Données
            </h2>
            <p>
              Nous mettons en œuvre des protocoles de sécurité de niveau bancaire :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="font-semibold text-white mb-1">Chiffrement de bout en bout</div>
                <div className="text-xs text-slate-400">Toutes les communications transitent via des protocoles chiffrés HTTPS / TLS 1.3.</div>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="font-semibold text-white mb-1">Isolation stricte (RLS)</div>
                <div className="text-xs text-slate-400">Les données de chaque entreprise sont strictement isolées par des politiques de Row-Level Security au niveau de la base de données.</div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              Partage et Tiers
            </h2>
            <p>
              <strong>OMEGA FACTURE ne vend, ne loue, ni ne cède aucune donnée personnelle ou financière à des tiers à des fins publicitaires.</strong>
            </p>
            <p className="mt-2">
              Les données ne sont partagées qu&apos;avec nos sous-traitants techniques hautement certifiés et indispensables au service : hébergeurs d&apos;infrastructure sécurisée (Supabase/PostgreSQL) et passerelles de paiement bancaires et Mobile Money agréées (PayDunya) pour la validation des règlements.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              Vos Droits et Suppression de Compte
            </h2>
            <p>
              Conformément à la réglementation sur la protection des données, vous disposez d&apos;un droit d&apos;accès, de rectification, de portabilité et de suppression définitive de l&apos;intégralité de vos données personnelles et professionnelles.
            </p>
            <p className="mt-2">
              Vous pouvez demander la suppression immédiate et définitive de votre compte et de toutes les factures associées en consultant notre page dédiée :{' '}
              <Link href="/suppression-donnees" className="text-indigo-400 font-semibold underline hover:text-indigo-300">
                Procédure de suppression de compte et données
              </Link>{' '}
              ou en nous adressant un e-mail à :{' '}
              <a href="mailto:contact@omegafacture.site" className="text-indigo-400 font-semibold underline hover:text-indigo-300">
                contact@omegafacture.site
              </a>. Le traitement est effectif sous un délai maximal de 48 heures ouvrées.
            </p>
          </section>

          {/* Section 7 */}
          <section className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-white font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                Contact & Délégué à la Protection des Données
              </div>
              <p className="text-xs text-slate-400 mt-1">
                E-mail : <a href="mailto:contact@omegafacture.site" className="text-indigo-400">contact@omegafacture.site</a> | Site web : <a href="https://www.omegafacture.site" className="text-indigo-400">www.omegafacture.site</a>
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Retour à OMEGA FACTURE
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
