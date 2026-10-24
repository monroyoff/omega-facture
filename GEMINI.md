# DIRECTIVES D'ARCHITECTURE & GUIDE MAÎTRE DU PROJET — OMEGA FACTURE

> **Document de Référence & Règle d'Or du Projet**  
> Ce document est la source unique de vérité technique, fonctionnelle et ergonomique d'**OMEGA FACTURE**. Tout modèle d'Intelligence Artificielle ou développeur intervenant sur cette base de code doit obligatoirement consulter et appliquer les directives ci-dessous.

---

## 1. VISION & PRÉSENTATION DU PRODUIT

**OMEGA FACTURE** est un SaaS B2B moderne et haut de gamme de **facturation, devis et pilotage financier** conçu spécialement pour les entreprises, PME, startups et consultants de la **zone UEMOA / Afrique Francophone** (Bénin, Côte d'Ivoire, Sénégal, Togo, Burkina Faso, Mali, Niger, Guinée-Bissau).

### Spécificités régionales intégrées nativement :
1. **Monnaie FCFA (XOF / XAF)** : Traitée en **entiers stricts** (les centimes n'existent pas en FCFA).
2. **Paiements Mobiles UEMOA** : Intégration prioritaire de **Mobile Money** (MTN, Moov, Wave, Orange Money) aux côtés des virements bancaires, chèques et espèces.
3. **Fiscalité locale** : TVA normale UEMOA à **18%** ou exonération (**0%**), mentions fiscales légales (**Numéro IFU au Bénin, NCC en Côte d'Ivoire, NINEA au Sénégal**).
4. **Relances multicanales** : Relances directes via **WhatsApp** (canal n°1 des affaires en Afrique de l'Ouest) et Email professionnel.
5. **Acomptes & Modalités de paiement échelonné** : Indispensables sur les marchés africains pour sécuriser le démarrage des prestations.

---

## 2. STACK TECHNIQUE & DÉPENDANCES

| Domaine | Technologie / Bibliothèque | Rôle & Justification |
| :--- | :--- | :--- |
| **Framework Web** | **Next.js 14.2.15** (App Router) | Rendu hybride SSR/Client, routage par dossiers, performances maximales. |
| **Langage** | **TypeScript 5.6.3** | Typage strict de bout en bout, prévention des régressions financières. |
| **Styling & CSS** | **Tailwind CSS 3.4.14** + PostCSS | Système de design fluide, classes utilitaires standardisées, dark mode natif. |
| **Icônes** | **Lucide React 0.453.0** | Iconographie vectorielle cohérente, légère et hautement expressive. |
| **Gestion d'État** | **React Context** (`useInvoices`) | Source unique de vérité partagée, synchronisation instantanée inter-composants. |
| **Persistance locale** | **LocalStorage (versionné `facturo:v1:*`)** | Fonctionnement autonome hors-ligne et persistance immédiate des données démo. |
| **Formatage financier** | Utilitaires dédiés (`@/lib/money/format`) | Formatage monétaire `formatFCFA` avec espaces insécables et dates `formatDateFR`. |

---

## 3. FONCTIONNALITÉS IMPLÉMENTÉES

### A. Dashboard Principal (`/` et `/dashboard`)
- **Salutation Nominative Personnalisée par le Prénom** : Bannière d'accueil dynamique sur le Dashboard s'adressant directement à l'utilisateur par son **prénom** (`Bonjour, {userFirstName} 👋`, ex: *Bonjour, Mari-ella 👋*).
- **Session Utilisateur & Profil Interactif (`UserSessionModal`)** : Accès direct à la session de connexion depuis le **Header (en haut à droite)** et depuis le bas de la **Sidebar**. Au clic, ouverture d'un volet d'informations complet affichant la photo en grand format (avec possibilité d'importer une photo ou de choisir parmi 6 avatars professionnels), le prénom, le nom de famille, le rôle, l'email certifié, l'organisation, le numéro IFU, et le bouton de déconnexion.
- **Cartes KPI en temps réel** : Chiffre d'affaires facturé, Total encaissé, Montant en attente de règlement, Créances en retard, avec badges de variation en pourcentage.
- **Barre d'Action Responsive & Mobile Native** : Bouton d'action direct `+ Créer une Facture` accessible et optimisé pour le tactile mobile (< 640px) ainsi que sur desktop, complété du raccourci direct `+ Nouveau Devis`. (Bouton d'en-tête supprimé au profit de l'action bar principale pour épurer la barre de navigation sur web et mobile).
- **Cartes Tactiles & Tableau Multi-Documents Récent (`RecentInvoicesTable`)** : Onglets de filtrage par type de document (*Tous, 📄 Factures, 📝 Devis*) et par statut (*Toutes, Payées, Envoyées, Brouillons, En retard*) avec disposition fluide `flex-wrap` sans débordement horizontal sur smartphone. Cartes mobiles restructurées avec affichage clair de l'échéance et barre d'actions compacte anti-débordement. Badges visuels distinctifs (Violet pour Devis, Indigo pour Facture), recherche textuelle, tri et pagination dynamique.
- **Aperçu Instantané (`InvoicePreviewModal`)** : Modale d'aperçu d'un document complet adaptée selon sa nature (Facture, Devis) avec actions d'impression, relance WhatsApp personnalisée et partage.

### B. Création & Édition Multi-Documents — Factures & Devis (`/invoices/new` et `/invoices/[id]/edit`)
- **Prise en charge Native des Devis Estimatifs** :
  - **Sélecteur Segmenté Responsive** : Bascule en 1 clic entre `📄 Facture` et `📝 Devis` en haut du formulaire avec synchronisation d'URL (`?kind=invoice|quote`).
  - **Numérotation Séquentielle Déterminée par la Nature** : `FAC-YYYY-XXXX` pour les factures, `DEV-YYYY-XXXX` pour les devis estimatifs.
  - **Vocabulaire & Mentions Fiscales / Juridiques UEMOA Adaptés** :
    - *Devis* : « Devis N° », « Devis établi pour : », « Validité de l'offre (30 jours) », mention de signature « Bon pour accord et commande avec mention manuscrite 'Lu et approuvé' ».
    - *Facture* : « Facture N° », « Facturé à : », « Date d'échéance », mentions légales et pénalités de retard.
  - **Partage & Relance WhatsApp Contextuels** : Le message pré-formaté WhatsApp adapte automatiquement son objet et sa formule de politesse selon qu'il s'agisse d'un devis ou d'une facture.
- **Formulaire Vierge à l'Ouverture** :
  - **Articles / Lignes** : Démarre avec une seule ligne vide sans aucun montant pré-rempli (0 FCFA).
  - **Placeholders discrets** pour la description et les prix.
  - **Bouton `+ Ajouter une ligne vide`** : Insère une ligne propre sans texte ni montant imposé.
  - **Remise commerciale** : Décochée par défaut (0 FCFA).
  - **Totaux en temps réel** : Sous-total HT, TVA 18% et Total TTC démarrent à 0 FCFA.
- **Espace Client Vierge & Polyvalent** :
  - **Mode `Client existant`** : Menu déroulant débutant sur une option neutre `-- Sélectionner un client enregistré --` (aucun client pré-sélectionné).
  - **Mode `+ Nouveau client`** : Champs de saisie directe (*Nom du contact, Entreprise, Email, Téléphone*) tous vierges par défaut. Sauvegarde automatique du client dans le carnet d'adresses à l'émission.
  - **Modale d'ajout complet (`NewClientModal`)** : Disponible en raccourci pour renseigner l'IFU, la ville et l'avatar.
- **Types de facturation avancés (Réservés aux Factures)** :
  1. **Standard** : Facture ou Devis à échéance unique (mode unique imposé pour les devis estimatifs, les options d'acompte et récurrence étant désactivées pour les devis).
  2. **Facture d'Acompte / Échelonnée** : Échéancier paramétrable (presets *30%-70%*, *40%-30%-30%*, *50%-50%*, *4x25%* ou sur-mesure) avec dates d'exigibilité par tranche.
  3. **Facture Récurrente / Abonnement** : Périodicité mensuelle, trimestrielle ou annuelle avec calcul automatique de la date de renouvellement.
- **Modification des Devis Émis** :
  - Les devis estimatifs restent entièrement modifiables même après émission (`status: 'sent'`) pour permettre les négociations commerciales avec les clients.
  - Le bouton `Modifier` est directement accessible depuis le tableau principal (`RecentInvoicesTable`), les cartes tactiles mobiles et la modale d'aperçu (`InvoicePreviewModal`).
  - La page d'édition (`/invoices/[id]/edit`) conserve l'état émis du devis lors de la mise à jour des lignes, tarifs ou remises.
- **Architecture Modale Live & Fermeture par Clic Extérieur (`CreateInvoiceModal`)** :
  - L'ouverture de création depuis le Dashboard (`+ Créer une Facture`, `+ Nouveau Devis`) ou depuis le Header (`+ Créer`) ne bloque plus l'utilisateur sur une page isolée.
  - La création s'ouvre sous la forme d'une modale fluide avec canevas semi-transparent (`bg-slate-950/70 backdrop-blur-sm`).
  - **Sortie instantanée sans bouton obligatoire** : L'utilisateur peut quitter à tout moment en cliquant simplement n'importe où sur le fond du Dashboard en dehors de la boîte de dialogue, ou en appuyant sur la touche `Échap` (`Escape`). Le bouton `[Fermer]` reste également accessible en en-tête.
  - La route `/invoices/new` redirige de manière déterministe vers le tableau de bord avec le paramètre de création correspondant pour garantir une expérience identique en accès direct par URL.
- **Fiabilité SSR** : Numérotation séquentielle déterministe avec calcul client-side pour éliminer toute erreur d'hydratation Next.js.

### C. Rapports financiers & KPI & Drilldown Interactif (`/reports`)
- **Titre officiel** : « Rapports financiers & KPI » (intégré dans la barre latérale, le header et les modales).
- **Architecture Modale Responsif & Universel** : Modales d'aperçu de documents (`PrintReportModal` et `InvoicePreviewModal`) conçues en `z-[100]` avec canevas de défilement `items-start`, tables scrollables horizontalement en mode mobile (`overflow-x-auto min-w-[500px]`), dimensions adaptatives A4 sans troncature ni débordement, et menu de navigation déroulant direct `Menu Principal` en en-tête.
- **6 Sections Interactives Cliquables** :
  1. **Chiffre d’Affaires Cumulé 2026** : Toutes les factures validées de l'exercice.
  2. **Taux de Recouvrement Global** : Analyse des flux perçus vs solde restant.
  3. **Délai Moyen de Règlement** : Délais réels constatés entre émission et encaissement (*Règlement rapide ≤ 7j*, *Conforme UEMOA 8-20j*, *Différé > 20j*).
  4. **Balance Âgée : 0 à 30 jours (Créances saines)** : Factures récentes à échéance normale.
  5. **Balance Âgée : 31 à 60 jours (À surveiller)** : Factures avec retard modéré et relance recommandée.
  6. **Balance Âgée : + de 60 jours (Contentieux)** : Créances en souffrance critique nécessitant une mise en demeure.
- **Volet Drilldown des Opérations (`SectionOperationsDetail`)** :
  - S'ouvre sous les cartes d'un simple clic avec animation fluide et scroll automatique.
  - Tableau complet des opérations concernées (factures ou règlements).
  - Recherche instantanée, filtres par mode d'encaissement et badges d'état.
  - Boutons d'action directs : **Voir la facture** (Aperçu A4), **Relancer le client** (WhatsApp/Email), **Encaisser** (Nouveau paiement).
- **Exportation & Impression du Bilan Certifié (`PrintReportModal`)** :
  - **En-tête Institutionnel & Logo en Haut à Gauche** : Logo Ω et raison sociale (*MONROY Business Solutions — Cotonou & Allada, Bénin*) positionnés en haut à gauche du document, alignés avec le badge officiel de certification.
  - **Typographie & Spacing Optimisés pour la Responsivité** : Cartes d'indicateurs financiers et de balance âgée redimensionnées avec un espacement harmonisé et des tailles de texte compactes (`text-lg sm:text-xl font-black` pour les montants, `p-3.5 sm:p-4`) éliminant les débordements et optimisant l'affichage sur mobile et desktop.
  - **Sélecteur de Date & Période Dynamique** : Filtrage de l'export par présets (*Année 2026, Octobre, Septembre, Août, 3e Trimestre*) ou **plage personnalisée avec sélecteurs de dates `Du ... Au ...`**. Les métriques, la balance âgée et le tableau des opérations se recalculent en direct.
  - **Génération PDF 100% Conforme & Lisible** : Utilisation de la bibliothèque certifiée `jsPDF` éliminant toute corruption de fichier PDF.
  - **Formats d'Export Multiples** : Document PDF officiel, Image Haute Résolution (PNG via Blob), Tableur Excel / CSV (avec BOM UTF-8) et Impression directe.

### D. Module de Relance Commerciale & Contentieux (`RelanceModal`)
- **Canal WhatsApp** : Préparation de messages pré-formatés prêts à l'envoi direct via l'API Web WhatsApp (`https://wa.me/...`).
- **Canal Email** : Modèles d'emails personnalisés selon la sévérité du retard.
- **3 Niveaux de Procédure** :
  1. *Rappel courtois (Échéance proche)*
  2. *Relance ferme (Retard 15-30 jours)*
  3. *Mise en demeure formelle avec références juridiques UEMOA (+ de 60 jours)*.

### E. Gestion des Règlements, Encaissements & Flux de Trésorerie (`/payments`)
- **Export Multi-Formats des Paiements & Flux (`ExportPaymentsModal`)** : Bouton d'action dédié « Exporter les flux » dans l'en-tête de la page permettant d'exporter les encaissements sous tous les formats existants :
  1. **Document PDF Officiel (`.pdf`)** : Bordereau complet d'encaissement A4 généré en haute résolution avec en-tête d'entreprise, IFU, 4 cartes KPI, tableau détaillé et mentions de certification.
  2. **Tableur Excel / CSV (`.csv`)** : Export tableur complet encodé UTF-8 avec BOM `\uFEFF` (garantissant l'absence de caractères corrompus sous Excel), métadonnées globales et colonnes complètes (*Date, Réf, Client, Facture, Moyen de paiement, Montant FCFA*).
  3. **Image Haute Définition PNG (`.png`)** : Synthèse visuelle grand format (1200px) générée par Canvas pour transmission rapide via WhatsApp ou email.
  4. **Impression Directe (`Print`)** : Dialogue d'impression optimisé A4 avec mise en page dédiée.
  - **Sélecteur de Périmètre d'Export** : Bascule instantanée entre « Période active » (filtrée par le calendrier) et « Toutes les transactions » (Exercice complet).
- **Calendrier Unique et Universel** : Un seul calendrier fonctionnel dédié sur la page (suppression du calendrier dupliqué du header avec `hidePeriodPicker={true}`), proposant tous les modes temporels : *Mois*, *Jour précis*, *Plage libre (Du ... Au ...)*, *Trimestre (T1-T4)*, *Semestre (S1-S2)*, et *Année complète*. Ce calendrier unique pilote instantanément l'ensemble des 4 cartes KPI (*Total Encaissé, Mobile Money, Virements Bancaires, Espèces / Caisse*) ainsi que l'intégralité du tableau des transactions.
- **Formulaire d'Encaissement Vierge** : À l'ouverture de `NewPaymentModal` via le bouton principal « Enregistrer un Paiement », aucun pré-rempli n'est imposé : le menu déroulant démarre sur l'option neutre `-- Sélectionner une facture à encaisser --`, le montant est à 0 et la référence est vierge.
- Enregistrement d'un encaissement pour tous les canaux UEMOA : **Mobile Money (MTN, Moov, Wave)**, **Virement bancaire**, **Chèque**, **Espèces (Caisse)**.
- Rapprochement automatique : mise à jour en direct du solde restant dû et bascule automatique au statut `paid` à solde nul.

### F. Gestion des Clients (`/clients`)
- Annuaire complet avec contacts, raison sociale, ville, pays, téléphone et numéro IFU/fiscal.
- Modal de création/édition (`NewClientModal`) avec gestion d'avatars et presets professionnels.
- Prise en charge des paramètres de recherche d'URL pour navigation directe depuis la recherche globale.

### G. Catalogue Produits & Services (`/products`)
- Liste des prestations et fournitures avec prix HT, TVA applicable (18% ou exonéré 0%) et unité de facturation.
- Insertion directe dans les factures via le sélecteur rapide de catalogue.
- Prise en charge des paramètres de recherche d'URL.

### H. Recherche Globale Applicative (`GlobalSearchModal` & `⌘K`)
- **Barre de Recherche Active du Menu Principal** : Située en haut du menu latéral (`Sidebar.tsx`), totalement fonctionnelle avec déclenchement au clic et raccourci clavier universel `⌘K` / `Ctrl+K` (fermeture par `Échap`).
- **Moteur de Recherche Instantané Multi-Entités** : Recherche globale en temps réel dans :
  1. **Factures** : Par numéro (`FAC-...`), nom du client, société, statut (*Payée, Envoyée, En retard, Brouillon*) et montant en FCFA.
  2. **Clients** : Par raison sociale, nom du contact, email, téléphone et ville.
  3. **Produits & Services** : Par désignation, catégorie, unité et tarif unitaire.
  4. **Paiements** : Par référence de transaction (`MTN-...`, `VIR-...`), facture associée et montant.
  5. **Navigation & Raccourcis** : Accès direct à toutes les sections de l'application en un clic.
- **Expérience Utilisateur Moderne** : Filtres par onglets de catégorie, navigation au clavier (flèches `↑↓` et `Entrée`), mise en surbrillance, badges d'état colorés et synchronisation d'URL.

### I. Inscription & Confirmation d'Email Obligatoire (`/register`, `/verify-email`, `/confirm-email`, `/auth/confirm`)
- **Processus de Création de Compte Sécurisé** :
  1. **Saisie du formulaire (`/register`)** : L'utilisateur renseigne son nom, prénom, raison sociale, email et mot de passe.
  2. **Envoi du lien d'activation par email** : À la soumission, un lien de confirmation sécurisé est généré et transmis à l'adresse email renseignée (intégration Supabase Auth `signUp` avec `emailRedirectTo`).
  3. **Écran d'Attente & Instructions (`/verify-email`)** : L'utilisateur est immédiatement orienté vers une interface dédiée lui demandant d'ouvrir sa boîte mail et de cliquer sur le lien pour valider son compte. Raccourcis directs vers les messageries (*Ouvrir Gmail*, *Ouvrir Outlook*), bouton de renvoi du lien avec compteur anti-spam (30s) et lien de confirmation directe pour la prévisualisation.
  4. **Validation du Lien & Activation (`/confirm-email` et `/auth/confirm`)** : Lors du clic sur le lien dans l'email, la route de confirmation valide le jeton de sécurité, marque le profil comme vérifié (`emailVerified: true`), active la session utilisateur et affiche un écran de félicitations animé avec compte à rebours avant redirection automatique vers le tableau de bord.
  5. **Protection d'Accès au Dashboard** : Tant que l'adresse email n'a pas été confirmée, l'accès au tableau de bord (`/` et `/dashboard`) est strictement bloqué et redirigé vers l'écran de vérification d'email.
  6. **Passerelle d'Envoi Haute Délivrabilité (`/api/auth/send-verification`)** : Passerelle hybride **Gmail SMTP (`smtp.gmail.com` via Nodemailer)** avec fallback **Resend API**, template HTML institutionnel OMEGA FACTURE certifié, assurant la distribution directe des liens d'activation en boîte principale sans être intercepté par les filtres antispam de Gmail ou Outlook.


---

## 4. STRUCTURE DES DOSSIERS & FICHIERS

```
OMEGA FACTURE/
├── index.html                     # Application standalone live A4 (accès immédiat navigateur)
├── styles.css                     # Système de design standalone & styles d'impression A4
├── app.js                         # Moteur réactif standalone, calculs UEMOA & export WhatsApp
├── package.json                   # Dépendances (Next 14, React 18, Tailwind, Lucide)
├── tsconfig.json                  # Configuration TypeScript stricte (alias @/*)
├── tailwind.config.ts             # Configuration Tailwind (couleurs brand, ombres)
├── postcss.config.mjs             # Plugins PostCSS
├── next.config.mjs                # Configuration Next.js
├── GEMINI.md                      # GUIDE MAÎTRE DU PROJET (ce document)
├── README.md                      # Documentation et instructions de démarrage
│
├── src/
│   ├── app/                       # Routage Next.js 14 App Router
│   │   ├── layout.tsx             # Layout racine avec InvoiceProvider et métadonnées
│   │   ├── globals.css            # Styles globaux, tokens Tailwind, variables
│   │   ├── page.tsx               # Tableau de bord principal (Dashboard)
│   │   ├── dashboard/             # Alias du Dashboard
│   │   ├── invoices/              # Module Factures
│   │   │   ├── page.tsx           # Liste de toutes les factures + filtres + export CSV
│   │   │   ├── new/page.tsx       # Créateur de facture (vierge, A4 live, échelonné)
│   │   │   └── [id]/edit/page.tsx # Édition d'une facture existante
│   │   ├── clients/page.tsx       # Annuaire et gestion des fiches clients
│   │   ├── products/page.tsx      # Catalogue des produits et prestations de services
│   │   ├── payments/page.tsx      # Historique et saisie des encaissements
│   │   ├── reports/page.tsx       # Rapports financiers, KPI & Balance Âgée interactive
│   │   ├── settings/page.tsx      # Paramètres de l'entreprise (IFU, devise, profil)
│   │   └── support/page.tsx       # FAQ et assistance utilisateur
│   │
│   ├── components/                # Composants React modulaires
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx        # Navigation latérale responsive avec badges
│   │   │   └── Header.tsx         # Barre supérieure (recherche, notifications, profil)
│   │   ├── dashboard/
│   │   │   ├── StatCards.tsx      # Cartes de statistiques synthétiques
│   │   │   ├── RecentInvoicesTable.tsx # Tableau riche des factures récentes
│   │   │   ├── RevenueChart.tsx   # Graphique en barres de chiffre d'affaires
│   │   │   └── InvoicePreviewModal.tsx # Modale d'aperçu du document certifié A4
│   │   ├── common/
│   │   │   └── PeriodPickerDropdown.tsx # Sélecteur de période temporelle globale
│   │   ├── invoices/
│   │   │   └── RelanceModal.tsx   # Modale de relance client (WhatsApp, Email, Mise en demeure)
│   │   ├── clients/
│   │   │   └── NewClientModal.tsx # Modale d'ajout et d'édition client (avec IFU)
│   │   ├── products/
│   │   │   └── NewProductModal.tsx # Modale d'ajout au catalogue de produits
│   │   ├── payments/
│   │   │   └── NewPaymentModal.tsx # Modale d'enregistrement d'un règlement
│   │   ├── reports/
│   │   │   ├── PrintReportModal.tsx # Modale d'impression officielle du bilan financier
│   │   │   └── SectionOperationsDetail.tsx # Volet drilldown des opérations par section
│   │   └── ui/
│   │       └── Badge.tsx          # Badges de statut standardisés (StatusBadge)
│   │
│   └── lib/                       # Logique métier, types et état
│       ├── types.ts               # Définitions TypeScript (Invoice, Client, KPIs, etc.)
│       ├── mock-data.ts           # Données de démonstration cohérentes UEMOA
│       ├── invoice/
│       │   └── calc.ts            # Moteur de calcul financier (TTC, HT, TVA 18%, remises)
│       ├── money/
│       │   └── format.ts          # Formatage monétaire formatFCFA et dates formatDateFR
│       └── store/
│           └── invoice-context.tsx# Context React (InvoiceProvider, useInvoices, CRUD)
```

---

## 5. RÈGLES STRICTES DU DOMAINE (ZONE UEMOA)

1. **Monnaie FCFA = Entiers Stricts** :
   - Le Franc CFA n'a **pas de centimes**.
   - Tout calcul monétaire doit utiliser `Math.round()` et ne jamais produire de nombres à virgule flottante visibles.
   - Toujours formater avec `formatFCFA(montant)` (`@/lib/money/format`). Exemple : `1 770 000 FCFA`.
2. **Formatage des Dates en Français** :
   - Format standard : `JJ/MM/AAAA`.
   - Toujours utiliser `formatDateFR(isoDate)` (`@/lib/money/format`). Exemple : `"2026-10-18"` -> `"18/10/2026"`.
3. **Fiscalité UEMOA** :
   - Le taux standard de TVA est fixé à **18%**.
   - Le régime d'exonération est à **0%**.
4. **Identifiants Légaux** :
   - Les formulaires d'entreprises et clients supportent le **Numéro IFU** (Identifiant Fiscal Unique à 13 chiffres du Bénin) ou les équivalents UEMOA (**NCC** en Côte d'Ivoire, **NINEA** au Sénégal).

---

## 6. DESIGN SYSTEM & COHÉRENCE VISUELLE

### A. Palette de Couleurs Standardisée
- **Fond général** : `bg-[#F8F9FA] dark:bg-[#070a0f]`
- **Cartes & Conteneurs** : `bg-white dark:bg-[#111622]`
- **Bordures standard** : `border border-slate-200/80 dark:border-slate-800/80`
- **Texte Primaire** : `text-slate-900 dark:text-white`
- **Texte Secondaire** : `text-slate-500 dark:text-slate-400`
- **Bleu Primaire (Brand)** : `bg-brand-600 hover:bg-brand-700 text-white`, `text-brand-600 dark:text-brand-400`
- **Émeraude (Succès, Payé, Recouvrement)** : `text-emerald-600 dark:text-emerald-400`, `bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200`
- **Ambre (En attente, Mobile Money, À surveiller)** : `text-amber-700 dark:text-amber-300`, `bg-amber-50 dark:bg-amber-950/40 border-amber-200`
- **Rose / Rouge (Retard, Contentieux, Dettes)** : `text-rose-700 dark:text-rose-300`, `bg-rose-50 dark:bg-rose-950/40 border-rose-200`
- **Violet (Délais, Virements, Chèques)** : `text-purple-700 dark:text-purple-300`, `bg-purple-50 dark:bg-purple-950/40 border-purple-200`

### B. Rayons de Courbure (Border Radius) & Ombres
- **Grands conteneurs, tableaux, panneaux de détails** : `rounded-3xl shadow-card`
- **Cartes KPI, fiches statistiques** : `rounded-2xl`
- **Boutons, champs d'input, sélecteurs** : `rounded-xl`
- **Pastilles d'état, badges** : `rounded-full`

### C. Micro-Animations & Réactivité
- Tous les boutons interactifs doivent comporter : `active:scale-95 transition-all cursor-pointer`.
- Les modales et panneaux s'animent avec : `animate-in fade-in duration-200 backdrop-blur-sm`.
- Les cartes cliquables s'illuminent avec un anneau actif (ex: `ring-2 ring-brand-500`).

---

## 7. INSTRUCTIONS OBLIGATOIRES POUR LES FUTURS MODÈLES IA

Lors de toute intervention future sur ce dépôt, vous **DEVEZ IMPÉRATIVEMENT** suivre ces 7 règles d'or :

1. **Directive `'use client'`** : Tout composant utilisant des hooks React (`useState`, `useEffect`, `useMemo`, `useRef`), le routeur Next.js ou des événements DOM doit obligatoirement avoir `'use client';` en ligne 1.
2. **Source Unique de Données (`useInvoices`)** : Ne jamais recréer d'état local isolé pour les factures ou les clients. Toujours consommer et mettre à jour les données via le hook `useInvoices()` issu de `@/lib/store/invoice-context`.
3. **Formulaires de Création Toujours Vierges** : Lors de la création d'une nouvelle entité (facture, devis, client, produit), les formulaires **ne doivent jamais contenir de données ou montants fictifs pré-remplis**. Ils doivent démarrer vides, avec des totaux à zéro et des placeholders indicatifs.
4. **Hydratation SSR & Éléments Aléatoires** : Ne **JAMAIS** utiliser `Math.random()`, `Date.now()` ou `new Date()` directement dans l'état initial d'un composant (`useState(...)`). Utilisez des valeurs initiales déterministes et mettez-les à jour dans un `useEffect` côté client, ou ajoutez `suppressHydrationWarning`.
5. **Intégrité Monétaire** : Ne jamais réintroduire de décimales pour les montants en FCFA. Toujours envelopper l'affichage des sommes dans `formatFCFA(...)`.
6. **Pas d'Écrasement Destructeur** : Respectez l'architecture existante. Si vous ajoutez un champ ou un filtre, assurez-vous qu'il s'intègre harmonieusement dans les composants existants (`RecentInvoicesTable`, `SectionOperationsDetail`, etc.).
7. **Validation TypeScript Stricte** : Avant de terminer une tâche, assurez-vous que la commande `npx tsc --noEmit` s'exécute avec zéro erreur TypeScript.

---

## 8. INTÉGRATION BACKEND SUPABASE & ARCHITECTURE FULL-STACK

Le projet est entièrement connecté et synchronisé avec le backend **Supabase** via MCP et le SDK `@supabase/ssr` :

- **Projet Supabase** : `Monroy Omega Facture` (`nqazzedahsebuyvxjbvw`)
- **URL API & Région** : `https://nqazzedahsebuyvxjbvw.supabase.co` (Londres, `eu-west-2`)
- **Tables PostgreSQL en production** :
  1. `public.companies` : Données de l'organisation émettrice, identifiants IFU/RCCM, coordonnées et devise XOF.
  2. `public.clients` : Annuaire des clients avec IFU/NCC/NINEA et contacts.
  3. `public.products` : Catalogue des articles et prestations avec tarifs HT et TVA 18% / 0%.
  4. `public.invoices` : Factures et devis avec numérotation séquentielle et montants entiers `BIGINT`.
  5. `public.invoice_items` : Lignes d'articles détaillées avec prix unitaire, remise et TVA.
  6. `public.invoice_installments` : Échéanciers d'acomptes (modalités 30%-70%, 50%-50%, etc.).
  7. `public.payments` : Historique des règlements (Mobile Money MTN/Moov/Wave, virements, espèces, chèques).
- **Triggers PostgreSQL** : `trg_sync_invoice_payments` recalcule automatiquement `amount_paid` et bascule la facture en `paid` dès l'atteinte du solde.
- **Sécurité RLS** : Active sur toutes les tables (`ROW LEVEL SECURITY`).
- **Typage Strict** : `src/lib/supabase/database.types.ts` généré directement depuis la base PostgreSQL.
- **Couche d'Accès aux Données (`src/lib/supabase/services.ts`)** :
  - `fetchSupabaseData()` : Récupération des données distantes.
  - `supabaseAddInvoice()`, `supabaseAddClient()`, `supabaseAddProduct()`, `supabaseAddPayment()`.
- **Synchronisation Hybride Résiliente (`invoice-context.tsx`)** :
  - Mise à jour optimiste instantanée de l'interface (zéro latence perçue).
  - Persistance asynchrone dans Supabase.
  - Cache local (`facturo:v1:*`) garantissant un fonctionnement continu même en cas de coupure temporaire de connexion internet.


