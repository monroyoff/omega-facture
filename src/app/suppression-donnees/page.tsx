import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Trash2, ShieldCheck, Mail, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Demande de Suppression de Compte et de Données — OMEGA FACTURE',
  description:
    'Procédure officielle pour demander la suppression de votre compte et des données personnelles et professionnelles associées sur OMEGA FACTURE.',
};

export default function SuppressionDonneesPage() {
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-4">
            <Trash2 className="w-4 h-4" />
            <span>Conformité Google Play Store & Protection des Données</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Suppression de Compte & Données Associées
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Procédure officielle de suppression de compte pour l&apos;application mobile{' '}
            <strong className="text-white">OMEGA FACTURE</strong> (Package :{' '}
            <code className="text-indigo-400 font-mono text-xs">com.omegafacture.billing</code>), éditée par{' '}
            <strong className="text-white">MONROY Business Solutions</strong>.
          </p>
        </div>

        <div className="space-y-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-10 text-sm leading-relaxed text-slate-300 shadow-xl">
          {/* Section 1 : Introduction */}
          <section>
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Engagement de transparence et droit à l&apos;effacement
            </h2>
            <p>
              Conformément au règlement pour les développeurs de Google Play et aux lois sur la protection des données personnelles, 
              les utilisateurs de l&apos;application <strong>OMEGA FACTURE</strong> ont le droit d&apos;obtenir la suppression complète 
              et définitive de leur compte utilisateur ainsi que de l&apos;ensemble des données personnelles et professionnelles associées.
            </p>
          </section>

          {/* Section 2 : Comment demander la suppression */}
          <section className="bg-slate-950/70 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-400" />
              Comment demander la suppression de votre compte ?
            </h2>
            <p>
              Vous pouvez demander la suppression de votre compte par l&apos;une des deux méthodes suivantes :
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="font-semibold text-white mb-1">Option 1 : Par e-mail direct (Recommandé)</div>
                <p className="text-xs text-slate-400 mb-2">
                  Envoyez simplement un e-mail à notre équipe de support technique :
                </p>
                <div className="text-xs font-mono bg-slate-950 p-2.5 rounded border border-slate-800 text-indigo-300 space-y-1">
                  <div><strong>Destinataire :</strong> contact@omegafacture.site</div>
                  <div><strong>Objet :</strong> [SUPPRESSION DE COMPTE] OMEGA FACTURE</div>
                  <div><strong>Message :</strong> Veuillez supprimer définitivement mon compte OMEGA FACTURE associé à l&apos;adresse email [Votre Email].</div>
                </div>
                <div className="mt-3">
                  <a
                    href="mailto:contact@omegafacture.site?subject=%5BSUPPRESSION%20DE%20COMPTE%5D%20OMEGA%20FACTURE&body=Bonjour%2C%0A%0AJe%20demande%20la%20suppression%20d%C3%A9finitive%20de%20mon%20compte%20OMEGA%20FACTURE%20et%20des%20donn%C3%A9es%20associ%C3%A9es.%0A%0AAdresse%20email%20du%20compte%20%3A%20%0ANom%20de%20l'entreprise%20%3A%20%0A%0ACordialement."
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-rose-600/20"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Envoyer la demande de suppression par email</span>
                  </a>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="font-semibold text-white mb-1">Option 2 : Depuis l&apos;application mobile</div>
                <p className="text-xs text-slate-400">
                  Rendez-vous dans <strong>Paramètres</strong> ➔ <strong>Mon Compte</strong> ➔ cliquez sur le bouton <strong>« Supprimer mon compte »</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 : Données supprimées */}
          <section>
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-rose-400" />
              Types de données définitivement supprimées
            </h2>
            <p className="mb-2">Dès validation de votre demande, les données suivantes sont effacées de manière irréversible :</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs sm:text-sm">
              <li><strong>Données d&apos;identité et de compte :</strong> Nom, prénom, adresse e-mail, identifiants d&apos;authentification et mot de passe chiffré.</li>
              <li><strong>Profil d&apos;entreprise :</strong> Dénomination sociale, adresse physique, coordonnées téléphoniques, logos et identifiants fiscaux (IFU, NCC, NINEA, NIF).</li>
              <li><strong>Carnet d&apos;adresses clients :</strong> Noms, téléphones, adresses email et fiches complètes de vos clients.</li>
              <li><strong>Catalogue produits :</strong> Articles, prestations, descriptions et grilles tarifaires.</li>
              <li><strong>Devis et brouillons :</strong> Tous les devis estimatifs et factures au statut brouillon.</li>
              <li><strong>Tokens et sessions :</strong> Révocation immédiate de tous les jetons de connexion et sessions actives.</li>
            </ul>
          </section>

          {/* Section 4 : Données conservées et obligations légales */}
          <section>
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Données soumises à conservation légale (Obligations fiscales UEMOA)
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 mb-2">
              Conformément aux réglementations comptables et fiscales applicables dans la zone UEMOA / OHADA, 
              certaines données relatives à des transactions financières effectives ne peuvent pas être effacées instantanément :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs sm:text-sm">
              <li>
                <strong>Factures officielles validées et émises :</strong> Les factures définitives ayant fait l&apos;objet d&apos;un règlement ou d&apos;une déclaration fiscale sont archivées de façon sécurisée et isolée pendant la durée légale obligatoire de conservation des pièces comptables (jusqu&apos;à 10 ans selon le code général des impôts local), sans accès commercial.
              </li>
              <li>
                <strong>Preuves de transactions de paiement :</strong> Les reçus et identifiants de transactions Mobile Money / bancaires nécessaires aux exigences de lutte contre la fraude et le blanchiment de capitaux.
              </li>
            </ul>
            <p className="text-xs text-slate-400 mt-2">
              À l&apos;issue du délai légal de conservation obligatoire, ces archives sont définitivement et automatiquement détruites.
            </p>
          </section>

          {/* Section 5 : Délai de traitement */}
          <section className="pt-4 border-t border-slate-800 flex items-center gap-3 text-xs sm:text-sm text-slate-400">
            <Clock className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div>
              <strong className="text-white">Délai de traitement :</strong> Toutes les demandes sont traitées dans un délai maximal de <strong>48 heures ouvrées</strong>. Une confirmation écrite par e-mail vous est adressée dès la finalisation de la suppression.
            </div>
          </section>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>© 2026 OMEGA FACTURE — MONROY Business Solutions. Tous droits réservés.</p>
          <p className="mt-1">
            <Link href="/politique-de-confidentialite" className="text-indigo-400 hover:underline">
              Consulter la Politique de Confidentialité Complète
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

