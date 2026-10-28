# 🧾 OMEGA FACTURE — Suite SaaS de Facturation & Pilotage Financier UEMOA

<p align="center">
  <a href="https://www.omegafacture.site">
    <img src="public/icons/icon-512.png" alt="OMEGA FACTURE Logo" width="120" height="120" style="border-radius: 24px;" />
  </a>
</p>

<p align="center">
  <strong>Solution SaaS B2B moderne, ultra-rapide et tout-en-un pour les entreprises, PME, commerçants, agences et consultants de la zone UEMOA / Afrique Francophone.</strong>
</p>

<p align="center">
  <a href="https://www.omegafacture.site"><img src="https://img.shields.io/badge/Site%20Officiel-omegafacture.site-6366F1?style=for-the-badge&logo=vercel&logoColor=white" alt="Site Officiel" /></a>
  <a href="https://github.com/monroyoff/omega-facture/actions/workflows/android-build.yml"><img src="https://img.shields.io/github/actions/workflow/status/monroyoff/omega-facture/android-build.yml?branch=main&style=for-the-badge&label=Android%20CI%2FCD&logo=githubactions&logoColor=white" alt="CI/CD Status" /></a>
  <img src="https://img.shields.io/badge/Zone-UEMOA%20%2F%20Afrique-10B981?style=for-the-badge&logo=globe&logoColor=white" alt="UEMOA" />
  <img src="https://img.shields.io/badge/Devise-FCFA%20(XOF%2FXAF)-0EA5E9?style=for-the-badge" alt="Devise FCFA" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Capacitor-6.2%20Android-119EFF?style=flat-square&logo=capacitor" alt="Capacitor" />
  <img src="https://img.shields.io/badge/Mobile%20Money-MTN%20%7C%20Moov%20%7C%20Wave%20%7C%20Orange-F59E0B?style=flat-square" alt="Mobile Money" />
  <img src="https://img.shields.io/badge/Licence-Propriétaire%20%2F%20MONROY-indigo?style=flat-square" alt="Licence" />
</p>

---

## 📌 Présentation & Vision

**OMEGA FACTURE** a été conçu pour combler le manque de solutions de facturation adaptées aux réalités économiques et réglementaires de la zone **UEMOA** (*Bénin, Côte d'Ivoire, Sénégal, Togo, Burkina Faso, Mali, Niger, Guinée-Bissau*).

Contrairement aux outils occidentaux inadaptés (qui imposent des centimes ou ignorent le Mobile Money), **OMEGA FACTURE** intègre nativement :
- 💰 **Le FCFA en entiers stricts** : Les centimes n'existent pas en FCFA. Tous les calculs, arrondis et affichages respectent scrupuleusement cette règle monétaire.
- 📱 **Les Paiements Mobiles UEMOA** : Intégration prioritaire de **MTN Mobile Money, Moov Money, Wave et Orange Money** aux côtés des virements bancaires, chèques et espèces, avec passerelle PayDunya IPN automatisée.
- 🏛️ **La Fiscalité Régionale** : Prise en charge native de la **TVA standard UEMOA à 18%** ou exonération (**0%**), avec mentions légales requises (**IFU au Bénin, NCC en Côte d'Ivoire, NINEA au Sénégal**).
- 💬 **La Relance WhatsApp & Email** : WhatsApp est le canal n°1 des affaires en Afrique de l'Ouest. Le système permet la relance directe en 1 clic via WhatsApp et l'envoi d'emails professionnels certifiés.
- ⏳ **Les Acomptes & Paiements Échelonnés** : Indispensables sur les marchés africains pour sécuriser le démarrage des prestations.

---

## ✨ Fonctionnalités Majeures

### 1. 📊 Tableau de Bord & Indicateurs Financiers en Temps Réel
- **Bannière d'accueil personnalisée** avec salutation nominative.
- **KPIs Financiers Réels** :
  - **Chiffre d'Affaires Facturé** (factures réelles validées, devis formellement exclus).
  - **Montant Encaissé** (cumul rigoureux des factures soldées ET de l'ensemble des acomptes perçus).
  - **En attente de règlement** (solde restant dû sur factures non échues).
  - **Créances en retard** (factures réelles échues non soldées avec alertes).
- **Tableau Multi-Documents dynamique** : Filtrage instantané (*Tous, Factures, Devis*), statuts (*Payées, Envoyées, Brouillons, En retard*), recherche, tri et pagination.
- **Cartes tactiles fluides sur mobile** adaptées à tous les formats d'écran.

### 2. 📝 Éditeur Multi-Documents & Facturation Avancée
- **Factures & Devis Estimatifs** : Bascule en 1 clic avec numérotation séquentielle dédiée (`FAC-YYYY-XXXX` ou `DEV-YYYY-XXXX`).
- **Types de facturation** :
  - *Standard* (échéance unique).
  - *Facture d'Acompte / Échelonnée* (presets *30%-70%*, *40%-30%-30%*, *50%-50%*, *4x25%* ou sur-mesure).
  - *Facture Récurrente / Abonnement* (mensuelle, trimestrielle, annuelle).
- **Conversion Définitive Devis ➔ Facture** : Transfert instantané en un clic avec synchronisation immédiate sur la base de données distante.
- **Partage Multi-Canal (WhatsApp & Email)** : Modale dédiée pré-remplissant le message de synthèse adapté (FCFA, acomptes, solde dû, coordonnées Mobile Money).
- **Système Toast Universel** : Remplacement complet des alertes bloquantes par des notifications visuelles élégantes et animées.

### 3. 📈 Rapports Financiers, KPI & Balance Âgée
- **Règle comptable stricte** : Exclusion totale et certifiée des devis estimatifs du chiffre d'affaires.
- **6 Sections Interactives avec Volet Drilldown** :
  - Chiffre d'Affaires Cumulé de l'exercice.
  - Taux de Recouvrement Global.
  - Délai Moyen de Règlement (*≤ 7j, 8-20j, > 20j*).
  - Balance Âgée 0 à 30 jours (Créances saines).
  - Balance Âgée 31 à 60 jours (À surveiller).
  - Balance Âgée + de 60 jours (Contentieux).
- **Module de Relance Commerciale** : 3 niveaux de procédure (*Rappel courtois, Relance ferme, Mise en demeure formelle*).

### 4. 🖨️ Moteur d'Export Universel & Incorruptible
- **PDF Haute Définition A4** : Généré via `jsPDF` avec logo Ω, mentions fiscales UEMOA, RIB/Mobile Money et signatures.
- **Tableurs Excel & CSV** : Encodage certifié avec BOM UTF-8 (`\uFEFF`), délimiteur point-virgule (`;`) conforme Excel / Numbers et échappement RFC 4180.
- **Synthèse Visuelle PNG** : Rendu haute résolution pour partage rapide WhatsApp.
- **Impression A4 directe** : Feuilles de style `@media print` nettoyées.

### 5. 💳 Passerelle Mobile Money & Webhooks IPN
- **Intégration PayDunya & Multi-Opérateurs** : MTN MoMo, Moov Money, Wave, Orange Money et Cartes Bancaires.
- **Vérification cryptographique SHA-512** sur les webhooks IPN pour la sécurisation des encaissements et l'activation automatique des abonnements SaaS.
- **Rapprochement bancaire et lettrage automatique** des factures soldées.

### 6. 📱 Application Android Native & PWA
- **Conteneur Android Capacitor 6.2** sous le package officiel `com.omegafacture.billing`.
- **Pipeline CI/CD GitHub Actions** générant automatiquement à chaque push :
  - `omega-facture-debug-apk` pour tests smartphone immédiats.
  - `omega-facture-playstore-aab` prêt pour la Google Play Console.
- **PWA & Digital Asset Links** certifiés pour le domaine `www.omegafacture.site`.

---

## 🛠️ Stack Technique

| Composant | Technologie | Rôle |
| :--- | :--- | :--- |
| **Framework Web** | [Next.js 14.2.15](https://nextjs.org/) (App Router) | Architecture SSR / CSR, routes dynamiques et API |
| **Langage** | [TypeScript 5.6.3](https://www.typescriptlang.org/) | Typage strict de bout en bout |
| **Styling** | [Tailwind CSS 3.4.14](https://tailwindcss.com/) + PostCSS | Système de design utility-first, Dark/Light mode |
| **Base de Données & Auth** | [Supabase](https://supabase.com/) | PostgreSQL managé, Row Level Security, Auth |
| **Génération PDF** | [jsPDF 4.2](https://github.com/parallax/jsPDF) | Rendu vectoriel A4 officiel haute fidélité |
| **Icônes** | [Lucide React 0.453](https://lucide.dev/) | Iconographie vectorielle cohérente et responsive |
| **Mobile & PWA** | [Capacitor 6.2](https://capacitorjs.com/) | Application native Android (SDK 34) et Service Worker |
| **Passerelle de Paiement** | PayDunya API / IPN | Guichet Mobile Money UEMOA & Cartes |
| **Emails Transactionnels** | Resend / Nodemailer | Factures et confirmations par messagerie sécurisée |
| **CI/CD** | GitHub Actions | Compilation automatique des binaires Android (APK & AAB) |

---

## 📁 Architecture du Projet

```text
OMEGA FACTURE/
├── .github/
│   └── workflows/
│       └── android-build.yml       # Pipeline CI/CD GitHub Actions (APK / AAB)
├── android/                        # Projet natif Android Studio (Capacitor 6.2)
│   ├── app/
│   │   ├── build.gradle            # Package com.omegafacture.billing (SDK 34)
│   │   └── src/main/AndroidManifest.xml
│   └── build.gradle
├── public/
│   ├── .well-known/assetlinks.json # Digital Asset Links Google Play / TWA
│   ├── icons/                      # Icônes PWA et Android (192px, 512px, SVG)
│   ├── manifest.json               # Manifeste PWA
│   └── sw.js                       # Service Worker PWA
├── src/
│   ├── app/                        # Next.js 14 App Router
│   │   ├── api/                    # API Endpoints (Auth, PayDunya IPN, Checkout)
│   │   ├── dashboard/              # Tableau de bord principal
│   │   ├── invoices/               # Gestion des factures & devis
│   │   ├── payments/               # Règlements, encaissements et retours IPN
│   │   ├── products/               # Catalogue articles & prestations
│   │   ├── clients/                # Répertoire clients & fiches
│   │   ├── reports/                # Rapports financiers & Balance âgée
│   │   ├── settings/               # Paramètres entreprise & fiscalité
│   │   └── layout.tsx              # Shell applicatif avec providers
│   ├── components/                 # Composants d'interface réutilisables
│   │   ├── landing/                # Composants de la Landing Page vitrine
│   │   ├── invoices/               # Modales de création, aperçu, partage, relance
│   │   ├── layout/                 # Sidebar, Header, Breadcrumbs, UserSession
│   │   └── ui/                     # Boutons, cartes, tableaux, toasts
│   ├── lib/
│   │   ├── money/format.ts         # Formatage monétaire FCFA & dates UEMOA
│   │   ├── pdf/generate-invoice-pdf.ts # Moteur de rendu PDF certifié
│   │   ├── export/csv-export.ts    # Moteur d'exportation CSV RFC 4180 UTF-8
│   │   ├── supabase/               # Clients Supabase (browser & server)
│   │   └── store/invoice-context.tsx # Store React d'état global
│   └── styles/                     # Feuilles de style Tailwind et globals
├── GEMINI.md                       # DIRECTIVES D'ARCHITECTURE & GUIDE MAÎTRE DU PROJET
├── capacitor.config.ts             # Configuration Capacitor
├── next.config.mjs                 # Configuration Next.js (sécurité, headers)
├── tailwind.config.ts              # Configuration Tailwind CSS (thème brand)
├── tsconfig.json                   # Configuration TypeScript
└── package.json                    # Dépendances et scripts
```

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) (v18.17 ou supérieure recommandée)
- `npm` ou `yarn` / `pnpm`
- [Android Studio](https://developer.android.com/studio) *(uniquement pour compiler l'application mobile localement)*

### 1. Cloner le dépôt
```bash
git clone https://github.com/monroyoff/omega-facture.git
cd omega-facture
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement
Créez un fichier `.env.local` à la racine :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role

# Passerelle Mobile Money (PayDunya)
PAYDUNYA_MASTER_KEY=votre-cle-master
PAYDUNYA_PRIVATE_KEY=votre-cle-privee
PAYDUNYA_TOKEN=votre-token
PAYDUNYA_MODE=live # ou test

# Base URL
NEXT_PUBLIC_APP_URL=https://www.omegafacture.site
```

### 4. Lancer le serveur de développement
```bash
npm run dev
```
Rendez-vous sur [http://localhost:3000](http://localhost:3000).

### 5. Compiler pour la production
```bash
npm run build
npm start
```

---

## 📱 Développement & Compilation Mobile (Android)

L'application Android est gérée avec **Capacitor 6** et configurée pour la publication sur le Google Play Store :
- **Package Name** : `com.omegafacture.billing`
- **Application ID** : `site.omegafacture.app`
- **Target SDK** : `34` (Android 14) / Min SDK : `22`

### Commandes utiles :
```bash
# Synchroniser les fichiers web vers le projet Android
npx cap sync android

# Ouvrir le projet dans Android Studio
npx cap open android
```

### Pipeline GitHub Actions :
À chaque commit sur la branche `main`, le workflow `.github/workflows/android-build.yml` :
1. Prépare l'environnement Java 17 et Android SDK 34.
2. Compile automatiquement les binaires.
3. Publie en artifacts téléchargeables :
   - `omega-facture-debug-apk` (APK installable directement).
   - `omega-facture-playstore-aab` (Bundle optimisé pour le Play Store).

---

## 🌐 Déploiement

- **Plateforme Web** : Déployé sur **Vercel** avec nom de domaine officiel [https://www.omegafacture.site](https://www.omegafacture.site).
- **Validation Google & SEO** : Balises et fichiers de validation Google Search Console / Google Play intégrés (`google5a187ae36d30dd48.html`, `assetlinks.json`).
- **Politique de Confidentialité** : Accessible en ligne sur [https://www.omegafacture.site/politique-de-confidentialite](https://www.omegafacture.site/politique-de-confidentialite).

---

## 👥 Auteur & Support

- **Société** : OMEGA FACTURE — MONROY Solutions B2B
- **Contact & Support** : <jobovog@gmail.com>
- **Localisation** : Cotonou & Allada, Bénin (Zone UEMOA)
- **Site Officiel** : [www.omegafacture.site](https://www.omegafacture.site)

---

<p align="center">
  <em>Propriété intellectuelle © 2026 OMEGA FACTURE — MONROY Solutions B2B. Tous droits réservés.</em>
</p>
