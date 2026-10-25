---
description: Règle du design système et standards métier OMEGA FACTURE
always_on: true
---

# RÈGLE DU DESIGN SYSTÈME OMEGA FACTURE (SaaS UEMOA)

Cette règle s'applique obligatoirement à **TOUS** les fichiers, composants, pages et modales créés ou modifiés dans le projet OMEGA FACTURE. Elle garantit une cohérence visuelle, ergonomique et technique absolue inspirée du Dashboard de référence.

---

## 1. Principes Directeurs & Règles Métier Strictes

1. **Monnaie & Règle des Entiers FCFA (UEMOA)** :
   - Le Franc CFA n'a pas de centimes. **Tous les montants sont stockés en entiers (`bigint` ou `number` entier)**, jamais en float.
   - Tout affichage monétaire passe impérativement par `formatFCFA(montant)` (`@/lib/money/format`). Exemple : `1 770 000 FCFA`.
   - Tout affichage de date passe par `formatDateFR(isoDate)` (`@/lib/money/format`). Exemple : `18 Octobre 2026` ou `18 Oct 2026`.
2. **Composants Client Next.js 14** :
   - Tout fichier utilisant des hooks React (`useState`, `useEffect`, `useRef`, `useMemo`, `useContext`) ou des écouteurs d'événements (`onClick`, `onChange`) **DOIT commencer par `'use client';` à la toute première ligne**.
3. **Source Unique de Vérité (State Management)** :
   - Toujours consommer les données via `useInvoices()` (`@/lib/store/invoice-context`).
   - Ne jamais déconnecter les pages du filtre temporel `selectedPeriod` / `periodInvoices` / `periodPayments` / `periodKPIs`.

---

## 2. Structure & Agencement Standard d'une Page

Chaque page de l'application doit adopter la structure exacte suivante :

```tsx
'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useInvoices } from '@/lib/store/invoice-context';

export default function MaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { periodLabel } = useInvoices();

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col">
      {/* Sidebar latérale */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePath="/mon-chemin" />

      {/* Contenu principal décalé à gauche sur Desktop */}
      <div className="lg:pl-72 flex flex-col flex-1">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* 1. En-tête d'action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Titre de la Page
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Description claire et professionnelle.
              </p>
            </div>
            {/* Actions principales */}
          </div>

          {/* 2. Cartes d'indicateurs KPIs ou Métriques */}

          {/* 3. Barres de filtres, recherche et onglets */}

          {/* 4. Tableaux de données ou grilles de cartes */}
        </main>
      </div>
    </div>
  );
}
```

---

## 3. Palette de Couleurs & Tokens Dark Mode

Ne jamais inventer de couleurs arbitraires. Utiliser exclusivement les classes Tailwind définies :

| Rôle | Mode Clair (Light) | Mode Sombre (Dark) | Usage |
| :--- | :--- | :--- | :--- |
| **Fond de page** | `bg-[#F8F9FA]` | `dark:bg-[#070a0f]` | Fond de l'application entière |
| **Cartes & Surfaces** | `bg-white` | `dark:bg-[#111622]` | Conteneurs, cartes, modales, tables |
| **Fond secondaire** | `bg-slate-50` | `dark:bg-[#0c1017]` | En-têtes de table, inputs, barres d'onglets |
| **Bordures principales** | `border-slate-200/80` | `dark:border-slate-800/80` | Cartes, séparateurs, bordures de tableau |
| **Bordures subtiles** | `border-slate-100` | `dark:border-slate-800` | Lignes de table, dividers internes |
| **Texte principal** | `text-slate-900` | `dark:text-white` | Titres, montants en gras, valeurs clés |
| **Texte secondaire** | `text-slate-500` | `dark:text-slate-400` | Sous-titres, libellés, explications |
| **Texte tertiaire** | `text-slate-400` | `dark:text-slate-500` | Overlines, badges neutres, dates discrètes |

### Couleurs Thématiques Spécifiques :
- **Brand / Bleu Primaire** : `bg-brand-600 hover:bg-brand-700 text-white`, `text-brand-600 dark:text-brand-400`, `bg-brand-50 dark:bg-brand-950/40`.
- **Succès / Encaissé / Vert Émeraude** : `bg-emerald-600 hover:bg-emerald-700 text-white`, `text-emerald-600 dark:text-emerald-400`, `bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200`.
- **En attente / Mobile Money / Ambre** : `bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200`.
- **En retard / Danger / Relance / Rose** : `bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200`, boutons `bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20`.
- **Format Visuel / Chèque / Violet** : `bg-purple-600 hover:bg-purple-700 text-white`, `bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200`.

---

## 4. Typographie & Hiérarchie Visuelle

- **Titre de page (`h1`)** : `text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight`
- **Sous-titre de page** : `text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1`
- **Titre de section (`h2`/`h3`)** : `text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight`
- **Libellé de métrique (Overline)** : `text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1`
- **Grand montant KPI** : `text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight`
- **En-têtes de tableau (`th`)** : `text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-3.5`
- **Identifiants & Réf.** : `font-mono text-[11px] text-slate-500 dark:text-slate-400`

---

## 5. Rayons de Courbure (Border Radius) & Ombres

Toujours respecter les arrondis standardisés du projet :
- **Grand conteneur / Page card / Modale** : `rounded-3xl`
- **Carte KPI / Bloc statistique / Carte Client** : `rounded-2xl`
- **Bouton d'action / Input / Onglet** : `rounded-xl`
- **Badge / Pastille d'état** : `rounded-full`

### Ombres (Shadows) :
- Cartes standards : `shadow-card` (douce, ultra-légère).
- Dropdowns / Popovers : `shadow-xl` ou `shadow-dropdown`.
- Boutons primaires avec couleur : ombrage coloré doux (ex: `shadow-md shadow-brand-500/20` ou `shadow-emerald-500/20`).
- Documents imprimables / Prévisualisation A4 : `shadow-paper`.

---

## 6. Micro-Animations & Interactions Utilisateur

Pour offrir une sensation SaaS premium et vivante :
1. **Feedback de clic sur bouton** :
   Toujours associer `active:scale-95 transition-all cursor-pointer` (ou `active:scale-98`).
2. **Survol des cartes KPI (`StatCards`)** :
   `group relative bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card hover:shadow-dropdown transition-all duration-200`
   Et sur l'icône dans la carte : `transition-transform group-hover:scale-110`.
3. **Survol des lignes de tableau** :
   `hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors`.
4. **Ouverture de modale / Dropdown** :
   - Fond de modale : `fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200`.
   - Boîte modale : `animate-in zoom-in-95 duration-200`.
   - Menu déroulant : `animate-in fade-in zoom-in-95 duration-150`.
5. **Notification Toast Centrée** :
   Toujours afficher les confirmations d'action (sauvegarde, relance, export, téléchargement) dans une modale centrée avec icône verte en cerclage (`ring-8 ring-emerald-500/10`), titre en gras et bouton de fermeture `D'accord`.

---

## 7. Composants de Référence du Design Système

### A. Cartes KPI (StatCards)
```tsx
<div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
  <div className="flex items-center justify-between mb-3">
    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      Titre KPI
    </span>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
      <FileText className="w-5 h-5" />
    </div>
  </div>
  <div className="text-2xl font-bold text-slate-900 dark:text-white">
    {formatFCFA(valeur)}
  </div>
  <span className="text-xs text-slate-400 mt-1 block">Sous-titre descriptif</span>
</div>
```

### B. Onglets de Filtrage (Tabs)
```tsx
<div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
  {tabs.map((tab) => {
    const isActive = activeTab === tab.key;
    return (
      <button
        key={tab.key}
        type="button"
        onClick={() => setActiveTab(tab.key)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
          isActive
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
            : 'bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
        }`}
      >
        <span>{tab.label}</span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
          {tab.count}
        </span>
      </button>
    );
  })}
</div>
```

### C. Tableau de Données Élégant (Data Table)
```tsx
<div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-left text-xs">
      <thead>
        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 uppercase text-[11px] font-semibold">
          <th className="py-3.5 pl-6 pr-3">Colonne 1</th>
          <th className="py-3.5 px-3">Colonne 2</th>
          <th className="py-3.5 pr-6 pl-3 text-right">Montant</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <td className="py-3.5 pl-6 pr-3 font-semibold text-slate-900 dark:text-white">{item.titre}</td>
            <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">{item.desc}</td>
            <td className="py-3.5 pr-6 pl-3 text-right font-extrabold text-emerald-600">{formatFCFA(item.montant)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

### D. États Vides (Empty States)
Quand une liste ou recherche ne retourne aucun élément :
```tsx
<div className="py-14 text-center">
  <div className="max-w-sm mx-auto flex flex-col items-center">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
      <Search className="w-6 h-6" />
    </div>
    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Aucun résultat trouvé</h4>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
      Aucun élément ne correspond aux filtres appliqués.
    </p>
    <button type="button" onClick={handleReset} className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all">
      Réinitialiser les filtres
    </button>
  </div>
</div>
```

---

## 8. Responsivité & Grilles Adaptatives

- Toujours prévoir le comportement mobile et desktop :
  - `lg:pl-72` sur le conteneur principal pour compenser la Sidebar desktop (`w-72`).
  - Barres d'action : `flex flex-col sm:flex-row sm:items-center justify-between gap-4`.
  - Grille 4 colonnes : `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.
  - Grille 3 colonnes : `grid grid-cols-1 sm:grid-cols-3 gap-5`.
  - Conteneurs défilables sur petit écran : `overflow-x-auto` et classes `no-scrollbar`.

---

## 9. Sécurité, Rendu & Compilation

- **Zéro Régression TypeScript** : Le code doit toujours compiler sans aucune erreur (`npx tsc --noEmit`).
- **Accessibilité** : Boutons toujours dotés de `type="button"` explicite, `title` ou `aria-label`.
