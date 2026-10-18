# DIRECTIVES & RÈGLE DE DÉVELOPPEMENT OMEGA FACTURE

Ce document est la règle d'or pour Antigravity dans ce projet. Toute modification, composant existant ou nouvelle fonctionnalité doit obligatoirement respecter l'ensemble des règles suivantes issues du design et de l'architecture du Dashboard.

---

## 1. RÈGLES STRICTES DU DOMAINE (ZONE UEMOA / AFRIQUE FRANCOPHONE)
- **Monnaie FCFA = Entiers stricts** : Les centimes n'existent pas en FCFA. Ne jamais manipuler de nombres décimaux pour l'argent (`bigint` ou `number` entier).
- **Formatage monétaire** : Toujours utiliser `formatFCFA(montant)` (`@/lib/money/format`).
- **Formatage des dates** : Toujours utiliser `formatDateFR(isoDate)` (`@/lib/money/format`).
- **Composants Client Next.js 14** : Toujours ajouter `'use client';` en ligne 1 de tout fichier utilisant des hooks React (`useState`, `useEffect`, `useRef`, etc.) ou des interactions utilisateur.
- **Source unique de données** : Toujours passer par `useInvoices()` (`@/lib/store/invoice-context`). Les données doivent être synchronisées avec le filtre temporel (`selectedPeriod`, `periodInvoices`, `periodPayments`, `periodKPIs`).

---

## 2. DESIGN SYSTÈME & COHÉRENCE VISUELLE

### A. Structure des Pages
- Fond de page global : `min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col`
- Décalage Desktop : `lg:pl-72 flex flex-col flex-1`
- Largeur maximale : `max-w-7xl w-full mx-auto`
- Espacement et padding : `p-4 sm:p-8 space-y-6`

### B. Couleurs & Mode Sombre (Dark Mode)
- **Fond des Cartes / Conteneurs** : `bg-white dark:bg-[#111622]`
- **Bordures Standards** : `border border-slate-200/80 dark:border-slate-800/80`
- **Bordures Subtiles / Séparateurs** : `border-slate-100 dark:border-slate-800`
- **Texte Principal** : `text-slate-900 dark:text-white`
- **Texte Secondaire** : `text-slate-500 dark:text-slate-400`
- **Texte Tertiaire** : `text-slate-400 dark:text-slate-500`

### C. Palette Thématique
- **Bleu Primaire (Brand)** : `bg-brand-600 hover:bg-brand-700 text-white`, `text-brand-600 dark:text-brand-400`, `focus:ring-brand-500/20`
- **Émeraude (Paiements, Succès, Encaissé)** : `bg-emerald-600 hover:bg-emerald-700 text-white`, `text-emerald-600 dark:text-emerald-400`, `bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200`
- **Ambre (En attente, Mobile Money, Brouillons)** : `bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200`
- **Rose (En retard, Contentieux, Relance)** : `bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200`, bouton `bg-rose-600 hover:bg-rose-700 text-white`
- **Violet (Format Visuel, Chèque)** : `bg-purple-600 hover:bg-purple-700 text-white`

### D. Rayons de Courbure (Border Radius) & Ombres
- **Grand conteneur / Tableau / Modale** : `rounded-3xl`
- **Carte KPI / Bloc Statistique / Fiche** : `rounded-2xl`
- **Bouton / Champ de saisie / Onglet** : `rounded-xl`
- **Badge / Pastille d'état** : `rounded-full`
- **Ombres** : `shadow-card`, `shadow-2xs`, `shadow-xl`, `shadow-paper`

### E. Micro-Animations & Réactivité
- Clics boutons : `active:scale-95 transition-all cursor-pointer`
- Survol icônes : `transition-transform group-hover:scale-110`
- Survol lignes de tableau : `hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors`
- Modales et Dropdowns : animation `animate-in fade-in zoom-in-95 duration-200` avec backdrop `backdrop-blur-sm` ou `backdrop-blur-md`
- Toasts de succès : confirmation centrée avec icône de coche verte en anneau (`ring-8 ring-emerald-500/10`)

---

## 3. COMPOSANTS MODÈLES OBLIGATOIRES

1. **Carte KPI (`StatCards`)** :
   Structure avec titre en majuscule discrète (`text-xs font-semibold text-slate-500 uppercase tracking-wider`), boîte d'icône colorée arrondie (`w-9 h-9 rounded-xl`), montant géant en gras (`text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white`), et badge d'évolution positive/négative en pied de carte.

2. **Onglets de filtre (`Tabs`)** :
   Barre défilante horizontale avec pillules actives (`bg-slate-900 dark:bg-white text-white dark:text-slate-900`) et inactives (`bg-white dark:bg-[#111622] text-slate-600 border border-slate-200`), incluant un compteur numérique dans chaque onglet.

3. **Tableau de données (`RecentInvoicesTable`)** :
   Enveloppé dans un conteneur `rounded-3xl shadow-card overflow-hidden`, avec en-têtes majuscules légères, colonnes alignées (dates et libellés à gauche, montants à droite en gras émeraude ou ardoise), et ligne d'état vide (`EmptyState`) ergonomique si 0 résultat.

4. **Sélecteur de période (`PeriodPickerDropdown`)** :
   Intégration du calendrier par onglets (Mois, Jour précis, Trimestre, Semestre, Année) synchronisé avec le contexte global.

5. **Responsivité** :
   Grilles adaptatives `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`, boutons empilables en colonne sur mobile (`flex-col sm:flex-row`), table défilable avec wrapper `overflow-x-auto`.
