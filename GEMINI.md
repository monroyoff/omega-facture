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
| **Conteneur Android** | **Capacitor 6 (@capacitor/android)** + **PWA** | Architecture native Android (`/android`), Google Play Store (`site.omegafacture.app`), Service Worker et Digital Asset Links. |

---

## 3. FONCTIONNALITÉS IMPLÉMENTÉES

### A. Dashboard Principal (`/` et `/dashboard`)
- **Salutation Nominative Personnalisée par le Prénom** : Bannière d'accueil dynamique sur le Dashboard s'adressant directement à l'utilisateur par son **prénom** (`Bonjour, {userFirstName} 👋`, ex: *Bonjour, Mari-ella 👋*).
- **Session Utilisateur & Profil Interactif (`UserSessionModal`)** : Accès direct à la session de connexion depuis le **Header (en haut à droite)** et depuis le bas de la **Sidebar**. Au clic, ouverture d'un volet d'informations complet affichant la photo en grand format (avec possibilité d'importer une photo ou de choisir parmi 6 avatars professionnels), le prénom, le nom de famille, le rôle, l'email certifié, l'organisation, le numéro IFU, et le bouton de déconnexion.
- **Cartes KPI en temps réel & Prise en Compte Intégrale des Acomptes** :
  - **Montant Facturé (CA)** : Chiffre d'affaires facturé strict (factures réelles validées, devis exclus).
  - **Montant Encaissé** : Cumule rigoureusement toutes les **factures soldées** ET l'ensemble des **acomptes perçus** (y compris acomptes sur devis/commandes et acomptes de factures échelonnées).
  - **En attente de règlement** : Montant restant dû sur factures non échues (`solde = total - montant encaissé`).
  - **Créances en retard** : Factures réelles échues non soldées avec badges de variation en pourcentage.
- **Bouton CTA « Retour au site vitrine » Épuré** : Accès direct positionné au sommet du corps du dashboard `dashboard/page.tsx` au-dessus de la bannière de bienvenue et dans la `Sidebar.tsx` permettant de retourner instantanément vers la Landing Page publique (`/`) à tout moment. Le bouton redondant dans le fil d'Ariane de l'en-tête `Header.tsx` a été retiré pour garantir un bandeau supérieur propre et aéré.
- **Barre d'Action Responsive & Mobile Native** : Bouton d'action direct `+ Créer une Facture` accessible et optimisé pour le tactile mobile (< 640px) ainsi que sur desktop, complété du raccourci direct `+ Nouveau Devis`. (Bouton d'en-tête supprimé au profit de l'action bar principale pour épurer la barre de navigation sur web et mobile).
- **Cartes Tactiles & Tableau Multi-Documents Récent (`RecentInvoicesTable`)** : Onglets de filtrage par type de document (*Tous, 📄 Factures, 📝 Devis*) et par statut (*Toutes, Payées, Envoyées, Brouillons, En retard*) avec disposition fluide `flex-wrap` sans débordement horizontal sur smartphone. Cartes mobiles restructurées avec affichage clair de l'échéance et barre d'actions compacte anti-débordement. Badges visuels distinctifs (Violet pour Devis, Indigo pour Facture), recherche textuelle, tri et pagination dynamique.
- **Téléchargement Direct de PDF Officiel & Impression A4 Épurée (`generateInvoicePDF`)** :
  - Chaque facture et devis dispose d'un bouton de téléchargement direct (`Download`) sur chaque ligne/carte du tableau et dans la modale d'aperçu (`InvoicePreviewModal`).
  - Génère et télécharge instantanément un véritable fichier PDF haute définition (`FAC-YYYY-XXXX.pdf` ou `DEV-YYYY-XXXX.pdf`) avec logo Ω, mentions fiscales UEMOA, tableau détaillé des articles, totaux TTC en FCFA, acomptes, solde restant dû, RIB/Mobile Money et signature de direction.
  - Remplacement de l'ancien simple appel `window.print()` par une génération de fichier PDF physique native (`jsPDF`).
  - Prise en charge des styles `@media print` nettoyés masquant l'interface pour l'impression papier directe.
- **Aperçu Instantané (`InvoicePreviewModal`)** : Modale d'aperçu d'un document complet adaptée selon sa nature (Facture, Devis) avec actions de téléchargement PDF direct, d'impression A4, de relance et de partage multi-canal (WhatsApp / Email).
- **Moteur d'Export CSV Universel & Incorruptible (`downloadCSV` via `@/lib/export/csv-export`)** :
  - Téléchargement des registres et bilans en fichier CSV / Excel certifié avec BOM UTF-8 (`\uFEFF`), délimiteur point-virgule (`;`) conforme à Microsoft Excel et Apple Numbers, et échappement strict RFC 4180.
  - Élimination des téléchargements corrompus provoqués par les data URIs encodées via `encodeURI` au profit d'un téléchargement via `Blob` natif et `URL.createObjectURL`.

### B. Création & Édition Multi-Documents — Factures & Devis (`/invoices/new` et `/invoices/[id]/edit`)
- **Prise en charge Native des Devis Estimatifs** :
  - **Sélecteur Segmenté Responsive** : Bascule en 1 clic entre `📄 Facture` et `📝 Devis` en haut du formulaire avec synchronisation d'URL (`?kind=invoice|quote`).
  - **Numérotation Séquentielle Déterminée par la Nature** : `FAC-YYYY-XXXX` pour les factures, `DEV-YYYY-XXXX` pour les devis estimatifs.
  - **Vocabulaire & Mentions Fiscales / Juridiques UEMOA Adaptés** :
    - *Devis* : « Devis N° », « Devis établi pour : », « Validité de l'offre (30 jours) », mention de signature « Bon pour accord et commande avec mention manuscrite 'Lu et approuvé' ».
    - *Facture* : « Facture N° », « Facturé à : », « Date d'échéance », mentions légales et pénalités de retard.
  - **Partage Multi-Canal Interactif (WhatsApp & Email) — `ShareDocumentModal`** :
    - Au clic sur le bouton `Partager` (depuis le tableau `RecentInvoicesTable` en mode desktop ou cartes mobiles, et depuis l'en-tête de `InvoicePreviewModal`), ouverture d'une modale intuitive offrant le choix explicite à l'utilisateur entre **WhatsApp** et **Email**.
    - **Deux grandes cartes interactives** avec indicateurs d'état (vert pour WhatsApp, bleu pour Email).
    - **Messages & Objets contextuels dynamiques** :
      - *Factures* : Récapitule le total TTC, le solde restant dû (ou statut soldé), l'échéance, les moyens de paiement acceptés (Mobile Money MTN/Moov/Wave, Virement), et objet d'email standardisé `[FACTURE] FAC-YYYY-XXXX — Client`.
      - *Devis* : Récapitule le montant estimatif, la durée de validité de l'offre (30 jours), les consignes pour valider la commande (« Bon pour accord »), et objet d'email `[DEVIS] DEV-YYYY-XXXX — Client`.
    - Pré-remplissage automatique des coordonnées (téléphone WhatsApp ou email professionnel du client), zone de texte intégralement éditable, bouton `Copier le texte` avec notification, et ouverture directe en un clic (`wa.me` ou messagerie par défaut via `mailto:`).
- **Système Universel de Notifications Toast & Disparition Automatique (`ToastNotification`)** :
  - **Éradication totale des boîtes d'alerte natives bloquantes (`window.alert`)** au profit d'un système de notifications toast haut de gamme flottant en haut à droite (`z-[9999]`), actif sur 100% des opérations applicatives :
    1. *Émission de Facture* : Badge vert émeraude, total en FCFA, nom du client et référence `FAC-...`.
    2. *Émission de Devis* : Badge violet royal, montant estimatif, validité 30 jours et référence `DEV-...`.
    3. *Sauvegarde de Brouillons* : Badge ambre indiquant l'enregistrement et la possibilité de finaliser ultérieurement.
    4. *Mise à jour & Validation en Édition* : Badge bleu informant de l'enregistrement des modifications.
    5. *Suppression de Documents* : Badge rose/rouge confirmant la suppression définitive du document.
    6. *Conversion Devis en Facture* : Confirmation instantanée du transfert vers l'onglet Factures avec attribution du numéro de facture.
    7. *Encaissements & Règlements* : Badge cyan/teal avec montant encaissé en FCFA et référence facture soldée.
    8. *Création & Modification Clients* : Confirmation de l'ajout ou de la mise à jour dans le répertoire.
    9. *Ajout d'Articles au Catalogue* : Confirmation du produit avec son tarif HT en FCFA.
    10. *Téléchargements PDF & Relances* : Confirmation de la génération du fichier officiel ou de la relance.
    11. *Partages WhatsApp & Messagerie* : Confirmation de l'ouverture ou de la copie du message.
    12. *Alertes de Contrôle & Validation* : Toast d'avertissement ambre guidant l'utilisateur (ex: client ou montant requis) sans bloquer l'interface.
  - Comprend une barre de progression animée décomptant les 4 secondes, la mise en pause au survol de la souris et un bouton de fermeture instantanée (✕).
- **Indépendance Absolue & Réinitialisation Systématique à l'Ouverture** :
  - **Réinitialisation Automatique (`resetFormToBlank`)** : Chaque clic sur `+ Créer une Facture`, `+ Facture` ou `+ Nouveau Devis` réinitialise intégralement tous les champs (articles, client, remise, échéancier, dates du jour) pour garantir qu'aucune donnée d'un document précédent ne subsiste.
  - **Clé de Remontage Déterministe (`key={createModalKey}`)** : Ré-instancie le composant à chaque ouverture pour éliminer toute rémanence d'état dans React.
  - **Bouton d'Action Direct `Vider` (`RotateCcw`)** : Permet à l'utilisateur de purger et remettre à zéro le formulaire en 1 clic sans fermer la modale.
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
- **Conversion Définitive & Incorruptible Devis -> Facture (`convertQuoteToInvoice`)** :
  - Au clic sur « Convertir en facture » (depuis `RecentInvoicesTable`, `InvoicePreviewModal` ou `/invoices/[id]/edit`), le devis reçoit son numéro de facture séquentiel officiel `FAC-YYYY-XXXX`, son statut cible (`sent`), et son type standard.
  - **Synchronisation Supabase Immédiate** : La conversion déclenche immédiatement `supabaseUpdateInvoice` avec mise à jour du numéro, du type et du statut dans la base de données distante. Cela garantit qu'aucun rechargement ni synchronisation en arrière-plan (`loadUserData`) ne puisse réimporter l'ancien devis ou faire repasser la facture en devis.
- **Architecture Modale Live & Fermeture par Clic Extérieur (`CreateInvoiceModal`)** :
  - L'ouverture de création depuis le Dashboard (`+ Créer une Facture`, `+ Nouveau Devis`) ou depuis le Header (`+ Créer`) ne bloque plus l'utilisateur sur une page isolée.
  - La création s'ouvre sous la forme d'une modale fluide avec canevas semi-transparent (`bg-slate-950/70 backdrop-blur-sm`).
  - **Sortie instantanée sans bouton obligatoire** : L'utilisateur peut quitter à tout moment en cliquant simplement n'importe où sur le fond du Dashboard en dehors de la boîte de dialogue, ou en appuyant sur la touche `Échap` (`Escape`). Le bouton `[Fermer]` reste également accessible en en-tête.
  - La route `/invoices/new` redirige de manière déterministe vers le tableau de bord avec le paramètre de création correspondant pour garantir une expérience identique en accès direct par URL.
- **Fiabilité SSR** : Numérotation séquentielle déterministe avec calcul client-side pour éliminer toute erreur d'hydratation Next.js.

### C. Rapports financiers & KPI & Drilldown Interactif (`/reports`)
- **Titre officiel** : « Rapports financiers & KPI » (intégré dans la barre latérale, le header et les modales).
- **Règle Comptable Stricte d'Exclusion des Devis (`isRealInvoice`)** :
  - **Les devis estimatifs (`DEV-*` ou `documentKind === 'quote'`) ne constituent en aucun cas du chiffre d'affaires et sont formellement et rigoureusement exclus de l'ensemble des états financiers.**
  - **Chiffre d’Affaires Cumulé** : Calculé strictement sur la somme des factures réelles validées (`status !== 'draft'`), excluant tout devis.
  - **Taux de Recouvrement** : Rapport entre les montants réellement encaissés sur factures et le total facturé réel.
  - **Balance Âgée des Créances (0-30j, 31-60j, +60j)** : Ne ventile que les factures réelles en attente de règlement (solde > 0 FCFA), aucun devis n'est comptabilisé en créance.
  - **Détail des Opérations (`SectionOperationsDetail`)** : Tous les onglets (CA, encaissements, créances en attente) ne présentent que les factures réelles et règlements associés.
  - **Exports Bilan & KPI (`PrintReportModal`)** : Les documents générés (PDF officiel, PNG, tableur CSV/Excel, impression directe) ne contiennent que les factures réelles et les métriques financières certifiées sans aucun devis.
- **Architecture Modale Responsif & Universel** : Modales d'aperçu de documents (`PrintReportModal` et `InvoicePreviewModal`) conçues en `z-[100]` avec canevas de défilement `items-start`, tables scrollables horizontalement en mode mobile (`overflow-x-auto min-w-[500px]`), dimensions adaptatives A4 sans troncature ni débordement, et menu de navigation déroulant direct `Menu Principal` en en-tête.
- **6 Sections Interactives Cliquables** :
  1. **Chiffre d’Affaires Cumulé 2026** : Toutes les factures validées de l'exercice (hors devis et hors brouillons).
  2. **Taux de Recouvrement Global** : Analyse des flux perçus vs solde restant des factures.
  3. **Délai Moyen de Règlement** : Délais réels constatés entre émission et encaissement (*Règlement rapide ≤ 7j*, *Conforme UEMOA 8-20j*, *Différé > 20j*).
  4. **Balance Âgée : 0 à 30 jours (Créances saines)** : Factures réelles récentes à échéance normale.
  5. **Balance Âgée : 31 à 60 jours (À surveiller)** : Factures réelles avec retard modéré et relance recommandée.
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
- **Passerelle de Paiement Mobile Money & Webhooks IPN (`/api/payments/paydunya/ipn`)** :
  - **Endpoint IPN Officiel PayDunya** : `https://www.omegafacture.site/api/payments/paydunya/ipn` (ou `https://omegafacture.site/api/payments/paydunya/ipn`).
  - **Endpoint IPN Universel** : `https://www.omegafacture.site/api/payments/ipn` pour l'intégration de toute passerelle de paiement (PayDunya, Wave, FedaPay, CinetPay).
  - **Endpoint d'Initialisation de Paiement (`/api/payments/paydunya/create-checkout`)** : Génère en direct une session de paiement officielle PayDunya (Sandbox / Live) et renvoie le lien de redirection vers le guichet multi-opérateurs (MTN, Orange, Moov, Wave, Carte).
  - **Endpoint de Vérification Instantanée (`/api/payments/paydunya/verify`)** : Interroge en temps réel `checkout-invoice/confirm/{token}` sur l'API PayDunya, confirme le statut de la transaction, met à jour la colonne `subscription_plan` dans la table `companies` de Supabase et consigne l'opération dans la table `payments`.
  - **Traitement Automatique en Temps Réel** : Réception des notifications asynchrones instantanées (`completed`), vérification de la signature cryptographique SHA-512 PayDunya avec la Clé Principale (`PAYDUNYA_MASTER_KEY`), rapprochement de la facture (`invoices.amount_paid`, bascule automatique à `paid`), activation immédiate des abonnements SaaS (`companies.subscription_plan = 'pro' | 'business'`), et enregistrement dans la table `payments`.
  - **URLs de Redirection Associées & Synchronisation Automatique** :
    - *Callback / Retour après paiement* : `https://www.omegafacture.site/payments/callback?plan=pro&amount=5000&...` — active immédiatement le nouveau plan dans le profil utilisateur local et distant, lève la limite de facturation et affiche l'écran de bienvenue sur le plan actif avec accès direct au Dashboard.
    - *Annulation* : `https://www.omegafacture.site/payments/cancel`
- **Calendrier Unique et Universel** : Un seul calendrier fonctionnel dédié sur la page (suppression du calendrier dupliqué du header avec `hidePeriodPicker={true}`), proposant tous les modes temporels : *Mois*, *Jour précis*, *Plage libre (Du ... Au ...)*, *Trimestre (T1-T4)*, *Semestre (S1-S2)*, et *Année complète*. Ce calendrier unique pilote instantanément l'ensemble des 4 cartes KPI (*Total Encaissé, Mobile Money, Virements Bancaires, Espèces / Caisse*) ainsi que l'intégralité du tableau des transactions.
- **Formulaire d'Encaissement Vierge & Filtrage Strict des Factures Éligibles (`NewPaymentModal`)** :
  - **Exclusion stricte des soldées et des devis** : Seules les factures avec un solde restant strictement positif (`inv.total - (inv.amountPaid || 0) > 0`) et en attente de règlement (`status !== 'paid'`) apparaissent dans le menu déroulant « Facture à payer ».
  - Les factures déjà soldées (solde = 0 FCFA ou statut `paid`), les devis estimatifs (`DEV-*` ou `documentKind === 'quote'`) et les brouillons purs sont rigoureusement exclus de la liste.
  - Si toutes les factures sont soldées, l'option affiche explicitement `-- Aucune facture en attente de paiement (Toutes soldées) --`.
  - **Fiche récapitulative & Contrôle de saisie** : À la sélection d'une facture, une carte récapitule en direct le client, le montant total TTC, le montant déjà réglé et le solde restant dû. Le champ montant s'initialise automatiquement au montant restant dû et interdit tout dépassement supérieur au solde restant.
  - Détection dynamique de la date du jour (format standardisé `YYYY-MM-DD`).
- Enregistrement d'un encaissement pour tous les canaux UEMOA : **Mobile Money (MTN, Moov, Wave)**, **Virement bancaire**, **Chèque**, **Espèces (Caisse)**.
- Rapprochement automatique : mise à jour en direct du solde restant dû et bascule automatique au statut `paid` à solde nul.
- **Affichage Réactif & Modale des Opérations de Paiement (`PaymentOperationsModal`)** :
  - **Empilement & z-index Universel (`z-[100]`)** : Élimination définitive du chevauchement de la barre latérale (`Sidebar` en `z-[70]`). La modale d'opérations et de règlements se superpose désormais rigoureusement au-dessus de tous les éléments de l'interface, que la fenêtre du navigateur soit réduite, redimensionnée ou agrandie en plein écran.
  - **Menu Déroulant Permanent en Haut à Gauche** : Présence d'un bouton d'accès rapide déroulant (`Menu`) dans l'en-tête de la modale donnant un accès instantané à toutes les fonctionnalités (*Dashboard, Factures, Clients, Produits, Flux, Rapports, Paramètres, + Nouveau Paiement, + Nouvelle Facture*).
  - **Fermeture Universelle** : Clic sur le fond extérieur semi-transparent (`bg-slate-950/75`), touche `Échap` (`Escape`) ou bouton de fermeture [✕].
  - **Cartes Tactiles Mobiles des Flux** : Sur les appareils mobiles (< 640px), la liste des encaissements s'adapte automatiquement sous forme de cartes tactiles individuelles fluides, évitant les barres de défilement horizontal encombrantes.
  - **Disponibilité Universelle du Menu Hamburger sur Mobile** : Le menu déroulant latéral est accessible en permanence en haut à gauche sur l'intégralité des vues du SaaS (y compris la page d'édition `/invoices/[id]/edit`).

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


### J. Déconnexion Déterministe & Gestion de Session Sécurisée (`UserSessionModal`, `AuthGuard`, `/api/auth/logout`)
- **Déconnexion Déterministe sans Boucle de Reconnexion** :
  1. **Purge Synchrone Locale & Serveur** : Dès le clic sur « Se déconnecter de la session », l'état React est vidé immédiatement, le flag `facturo:v1:is_logged_out` est posé, toutes les clés Supabase (`sb-*`) et les cookies résiduels sont purgés, et la route serveur `/api/auth/logout` invalide les cookies HTTP de session.
  2. **Respect Strict des Règles des Hooks React** : Élimination du crash Minified React Error #310 dans `UserSessionModal.tsx` en plaçant tous les hooks d'état au niveau supérieur avant toute sortie conditionnelle (`return null`).
  3. **Protection & Redirection Stables (`AuthGuard`)** : L'accès aux pages publiques (`/login`, `/register`) ne déclenche plus de reconnexion automatique en boucle : un utilisateur déconnecté reste sur `/login` jusqu'à ce qu'il soumette à nouveau ses identifiants.

### K. Paramètres de l'Organisation & Notification de Sauvegarde Centrée (`/settings`)
- **Notification Modale Centrée au Milieu de l'Écran** :
  - Au clic sur « Enregistrer les Modifications », affichage instantané d'une modale de confirmation positionnée **au centre exact de l'écran** (`fixed inset-0 flex items-center justify-center`) avec fond semi-transparent flouté (`backdrop-blur-sm`).
  - **Design Haut de Gamme** : Badge circulaire émeraude animé avec icône de validation, halo lumineux, message explicite *« Paramètres enregistrés avec succès ! »*, sous-titre de confirmation, bouton de fermeture manuelle, et **barre de progression dégressive automatique**.
  - **Disparition Automatique** : La notification s'efface automatiquement au bout de ~3 secondes (ou immédiatement par clic sur le bouton d'action, la croix de fermeture ou l'arrière-plan).
  - **Persistance Complète** : Sauvegarde synchrone dans le profil utilisateur et persistance locale des coordonnées (`facturo:v1:settings` : raison sociale, IFU, RCCM, email, téléphone, adresse, TVA par défaut, préfixe, délai de paiement, numéro Mobile Money).

### L. Résilience & Protection Anti-Blocage Permanente (Zero-Freeze & Chunk Auto-Recovery)
- **Suppression Définitive de l'Écran de Blocage au Chargement** :
  1. **Initialisation Synchrone Locale** : L'état `currentUser`, `isAuthenticated` et l'ensemble des données (factures, clients, paiements) s'initialisent directement et de manière synchrone depuis le `localStorage` dès le premier rendu. L'état `authLoading` démarre à `false`. Résultat : les pages s'affichent instantanément en 0 ms sans aucun écran de chargement intermédiaire.
  2. **Coupe-Circuit Automatique de Sécurité** : `AuthGuard` ne rend plus de conteneur bloquant persistant sur le SSR ou le client ; toute session non validée est redirigée immédiatement vers `/login`.
  3. **Auto-Récupération des Assets & Chunks Corrompus** : Script d'écoute globale dans le `<head>` de `layout.tsx` détectant tout échec de chargement de chunk (`Loading chunk ... failed`) ou 404 sur les fichiers CSS/JS pour déclencher automatiquement un rechargement propre et transparent de la page avec protection anti-boucle (8s).
  4. **Purge Préventive du Cache au Lancement** : Les scripts de démarrage (`Lancer OMEGA FACTURE.command` et `npm run build`) purgent systématiquement `.next/cache` pour prévenir tout conflit webpack entre builds.

### M. Système Universel de Skeleton Loaders & Rendu Direct sans Actualisation (Zero-Empty-Screen)
- **Chargement Visuel Prédictif Haute Définition (`Skeleton.tsx`)** :
  - **Élimination intégrale des écrans vides et du clignotement « 0 FCFA »** pendant l'interrogation de la base de données Supabase.
  - Chaque composant de chaque page dispose d'un Skeleton Loader sur-mesure reproduisant fidèlement la géométrie exacte des éléments :
    1. **Dashboard principal (`/` et `/dashboard`)** : `DashboardHeaderSkeleton`, `KPICardsSkeleton` (4 cartes KPI avec badges et variations), `RevenueChartSkeleton` (12 barres de graphique animées), et `TableSkeleton` (lignes de documents récents).
    2. **Factures & Devis (`/invoices`)** : `TableSkeleton` (6 lignes complètes avec barre d'onglets de filtrage et recherche).
    3. **Répertoire Clients (`/clients`)** : `ClientsGridSkeleton` (grille de 6 fiches clients avec placeholders d'avatar, de coordonnées et d'IFU).
    4. **Catalogue Produits & Services (`/products`)** : `ProductsTableSkeleton` (tableau détaillé avec placeholders d'articles, badges TVA, unités et tarifs HT).
    5. **Paiements & Encaissements (`/payments`)** : `KPICardsSkeleton` (4 cartes de ventilation Mobile Money, Virements, Espèces) et `TableSkeleton` (transactions de flux de trésorerie).
    6. **Rapports financiers & KPI (`/reports`)** : `ReportsSkeleton` (top 3 indicateurs de CA/recouvrement, carte de balance âgée à 3 tranches et tableau d'opérations drilldown).
  - **Animation Shimmer Moderne** : Balayage lumineux fluide `.skeleton-shimmer` avec dégradé linéaire (`@keyframes skeletonWave`) optimisé pour les modes clair et sombre.
### N. Authentification Exclusive par Identifiant & Mot de Passe (`/login`)
- **Règle d'Or d'Accès au Système** :
  1. **Méthode Unique & Inviolable** : La seule et unique manière d'accéder à la plateforme est la saisie rigoureuse de son **identifiant (adresse email professionnelle valide)** et de son **mot de passe personnel**.
  2. **Interdiction Formelle des Connexions Alternatives** : Aucun bouton de connexion tierce (Google, réseaux sociaux), aucun mode invité, ni aucun compte démo ou raccourci de contournement n'est toléré sur l'application.
  3. **Vérification Stricte du Compte** : Seuls les comptes réels dûment confirmés par email et dont le mot de passe correspond exactement aux données enregistrées (Supabase Auth / Registre sécurisé) peuvent ouvrir une session.
  4. **Protection Globale (`AuthGuard`)** : Toute tentative d'accès à une page protégée sans être authentifié par son identifiant et mot de passe est immédiatement redirigée vers `/login`.

### O. Modèle d'Abonnement Échelonné & Système de Quotas UEMOA (`UpgradePlanModal`, `invoice-context.tsx`)
- **Structure des 3 Formules Tarifaires** :
  1. **Plan Gratuit (0 FCFA/mois)** :
     - Quota strict de **5 factures par mois calendaire** (les devis estimatifs restent illimités).
     - Accès mono-utilisateur (1 utilisateur).
     - Modèle de facture et devis standard OHADA.
     - Calcul automatique de la TVA (18% ou exonéré).
     - Export PDF et partages WhatsApp / Email.
  2. **Plan Pro (5 000 FCFA/mois)** :
     - **Factures et devis 100% illimités**.
     - **1 utilisateur inclus**.
     - Relances automatiques personnalisées (WhatsApp & Email).
     - Rapports financiers avancés, Balance Âgée et exports comptables certifiés (CSV avec BOM UTF-8, PDF officiel, PNG).
     - Logo d'entreprise personnalisé et mentions fiscales sur-mesure.
  3. **Plan Business (15 000 FCFA/mois)** :
     - Tout ce qui est inclus dans le Plan Pro.
     - Équipe jusqu'à **10 membres**.
     - Rôles comptables et permissions d'accès multi-agences.
     - **Support prioritaire 24/7 dédié sur WhatsApp**.
     - Accès API et intégrations logicielles sur-mesure.
- **Mécanisme de Gating & Déclenchement Automatique de la Modale d'Upgrade** :
  - **Comptage Mensuel Dynamique (`invoicesThisMonthCount`)** : Dénombrement en temps réel des factures réelles émises au cours du mois en cours (`inv.date` dans le mois courant).
  - **Blocage Préventif à la 6ème Facture** : Dès qu'un utilisateur sur le Plan Gratuit tente de créer une 6ème facture (`!canCreateInvoice`), la modale `UpgradePlanModal` s'ouvre automatiquement avec message d'avertissement toast et mise en avant des avantages du Plan Pro.
  - **Paiements Mobiles UEMOA Intégrés** : Sélection directe du moyen de règlement régional (**Wave, Orange Money, MTN MoMo, Moov Money, Carte bancaire**) avec simulation d'activation instantanée.
  - **Indicateurs Visuels Omniprésents** :
    - *Bannière Dashboard* : Badge de quota (`Plan Gratuit • 0/5 factures ce mois`) avec barre de progression et bouton direct `Passer à Pro (5 000 F)`.
    - *Sidebar & Session Utilisateur* : Badge d'état du plan (`Gratuit`, `Pro`, `Business`) et bouton d'upgrade.
    - *Paramètres (`/settings`)* : Volet dédié « Formule d’Abonnement » avec jauge de quota en temps réel, récapitulatif des avantages et gestion de formule.
    - *Landing Page (`/#tarifs`)* : Grille tarifaire publique harmonisée avec les spécifications régionales UEMOA.

### P. Système Fiscal Multi-Régions & Taux de TVA par Pays (`@/lib/tax/uemoa-tax.ts`)
- **Taux de TVA Officiels par Pays Membre UEMOA & Pays Ciblés (France & Belgique)** :
  1. **Bénin** : Taux normal de **18%** (Identifiant fiscal : *Numéro IFU*).
  2. **Burkina Faso** : Taux normal de **18%** (Identifiant fiscal : *Numéro IFU*).
  3. **Côte d'Ivoire** : Taux normal de **18%**, taux réduit de **9%** (lait, pâtes alimentaires et produits de 1ère nécessité) (Identifiant fiscal : *Numéro NCC*).
  4. **Guinée-Bissau** : Taux normal de **18%** (Identifiant fiscal : *Numéro NIF*).
  5. **Mali** : Taux normal de **18%**, taux particulier de **5%** (équipements et énergie solaire) (Identifiant fiscal : *Numéro NIF*).
  6. **Niger** : **Taux normal spécifique de 19%**, taux particulier de **5%** (énergie solaire) (Identifiant fiscal : *Numéro NIF*).
  7. **Sénégal** : Taux normal de **18%**, taux réduit de **10%** (secteur de l'hôtellerie et du tourisme) (Identifiant fiscal : *Numéro NINEA*).
  8. **Togo** : Taux normal de **18%** (Identifiant fiscal : *Numéro NIF*).
  9. **France métropolitaine** :
     - **Taux normal (20%)** : par défaut pour les biens et prestations de services.
     - **Taux intermédiaire (10%)** : restauration sur place, transports de voyageurs, travaux de rénovation de logement, hébergements.
     - **Taux réduit (5,5%)** : produits alimentaires de base, livres, abonnements gaz et électricité, équipements handicap.
     - **Taux super réduit (2,1%)** : médicaments remboursables par la Sécurité sociale, presse, spectacles.
     - **Taux de 0%** : franchise en base de TVA (art. 293 B du CGI) et exportations.
     - Identifiant fiscal : *Numéro SIREN / SIRET ou TVA Intracommunautaire*.
  10. **Belgique** :
      - **Taux normal (21%)** : taux standard en vigueur.
      - **Taux intermédiaire (12%)** : restauration, fournitures de logements sociaux, margarine, hôtels et campings (depuis le 1er mars 2026).
      - **Taux réduit (6%)** : produits alimentaires de base, eau, médicaments, livres, transport de personnes, travaux de rénovation sous conditions.
      - **Taux de 0%** : publications périodiques (≥ 48/an), matériaux de récupération, régime de franchise petites entreprises (< 25 000 €), professions médicales exemptées.
      - Identifiant fiscal : *Numéro d'entreprise (BCE / TVA Intracommunautaire)*.
- **Détection Automatique dès l'Inscription (`/register`) & Profil** :
  - Sélecteur de l'ensemble des 10 pays ciblés avec drapeaux nationaux.
  - Dès qu'un utilisateur sélectionne son pays (ex: **France métropolitaine** ou **Belgique**), le système affiche un encadré d'information fiscale contextuelle et configure automatiquement son espace avec le taux de TVA légal standard correspondant (**20% en France**, **21% en Belgique**, **19% au Niger**, **18% en zone UEMOA**).
  - Les métadonnées fiscales sont sauvegardées dans le profil utilisateur, transmises à Supabase (`country`, `default_vat`) et stockées dans les préférences locales (`facturo:v1:settings`).
- **Sélecteur Dynamique de Pays & TVA en Direct lors de la Création / Édition (`CreateInvoiceModal.tsx`, `/invoices/[id]/edit`)** :
  - **Basé par défaut sur le pays d'inscription** : À l'ouverture de création ou d'édition d'une facture ou devis, le pays fiscal et le taux de TVA s'initialisent automatiquement sur le pays renseigné lors de l'inscription.
  - **Menu Déroulant de Pays au Même Endroit** : Dans la section « Options fiscales & Déductions », un menu déroulant complet liste l'ensemble des pays ciblés (Bénin, Côte d'Ivoire, Sénégal, Togo, Burkina Faso, Mali, Niger, Guinée-Bissau, France métropolitaine, Belgique).
  - **Changement Instantané & Répercussion Immédiate** : Dès qu'un utilisateur sélectionne un autre pays :
    1. Le taux de TVA appliqué bascule immédiatement sur le taux normal légal du pays sélectionné.
    2. Toutes les lignes d'articles de la facture voient leur taux de TVA mis à jour instantanément.
    3. Le menu déroulant des taux de TVA s'actualise pour afficher l'ensemble des taux applicables dans ce pays (taux normal, taux intermédiaires, réduits, super réduits et exonération/franchise).
    4. Les sous-totaux HT, montants de TVA (avec support complet des décimales `5.5%` et `2.1%` via `parseFloat`), totaux TTC et acomptes se recalculent en temps réel.
- **Génération PDF Officielle Conforme (`invoice-pdf.ts`)** :
  - Détection dynamique du taux de TVA appliqué à partir des articles de la facture (`appliedVatRate`), garantissant que les factures françaises affichent `TVA (20%) :` (ou 10%, 5.5%, 2.1%), les factures belges `TVA (21%) :` (ou 12%, 6%), les factures nigériennes `TVA (19%) :` et les factures UEMOA `TVA (18%) :` sur le document PDF officiel certifié.
- **Paramétrage & Changement de Pays (`/settings`)** :
  - Sélecteur de pays dans les informations d'entreprise recalculant en direct le taux de TVA standard par défaut et mettant à jour l'intitulé du numéro fiscal (IFU au Bénin, NCC en Côte d'Ivoire, NINEA au Sénégal, NIF au Niger, SIRET/TVA en France, BCE/TVA en Belgique).

### Q. Application Mobile Android & Publication Google Play Store Ready
- **Architecture Hybride Native Capacitor (`com.omegafacture.billing`)** :
  - Dossier natif Android Studio complet `/android` avec Gradle, AndroidManifest et activités natives.
  - Configuration `capacitor.config.json` et `capacitor.config.ts` harmonisée sur `com.omegafacture.billing`, connectée en direct à l'URL de production `https://www.omegafacture.site`, garantissant que toute évolution de fonctionnalités ou mise à jour déployée sur le cloud est immédiatement active sur l'application mobile des utilisateurs sans nécessiter de nouvelle validation Play Store.
  - Cible Android moderne : **SDK 36** (`compileSdkVersion 36`, `targetSdkVersion 36`) et `minSdkVersion 24`.
  - Signature de production officielle : `release.keystore` (RSA 2048-bit) configuré dans `android/app/build.gradle` (`versionCode 2`, `versionName "1.0.1"`).
- **PWA & Service Worker Intégré (`public/sw.js`, `public/manifest.json`, `src/app/manifest.ts`)** :
  - Support hors-ligne, mise en cache prédictive des assets, conformité stricte aux critères d'installabilité Google Play.
- **Digital Asset Links & Validation de Domaine Google Certifiés** :
  - `public/.well-known/assetlinks.json` configuré pour `com.omegafacture.billing` avec empreintes SHA-256 de signature release et debug (App Links et Trusted Web Activity).
  - Validation de propriété Google Search Console et Google Play par balises meta HTML et fichiers dédiés sécurisés (`google5a187ae36d30dd48.html` et `google3cD17ybVzPuK91mNz6HBh7NQBv1UelD7HFhikEMBOFc.html`) avec en-têtes de sécurité (`X-Robots-Tag: noindex, nofollow`, `X-Content-Type-Options: nosniff`).
- **Politique de Confidentialité & Suppression de Données Conformes Play Store** :
  - Politique de confidentialité : `/politique-de-confidentialite` et `/privacy`.
  - Page dédiée de demande de suppression de compte et de données : `/suppression-donnees` et `/delete-account` (conforme aux exigences strictes de la Google Play Console sur le droit à l'effacement et conservation légale UEMOA).
- **Iconographie & Assets Graphiques Play Store** :
  - Pack d'icônes généré pour Android (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi) et icônes PWA 192px / 512px avec le logo Ω officiel.
  - Graphisme des fonctionnalités officiel (1024x500 px) et pack de captures d'écran de l'application.
- **Pipeline CI/CD GitHub Actions (`.github/workflows/android-build.yml`)** :
  - Compilation automatique à chaque commit dans le cloud (Ubuntu + Java 17 + Android SDK 36) pour générer :
    1. **APK de Test** pour installation directe sur smartphone (`omega-facture-debug-apk`).
    2. **AAB de Production (Android App Bundle)** prêt pour l'importation sur la Google Play Console (`omega-facture-playstore-aab`).
  - Statut : **Version 1.0.1 (versionCode 2) soumise avec succès pour examen Google Play Console**.

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
- **Sécurité RLS & Multi-Tenant Hermétique** : 
  - **Isolation Stricte par Propriétaire** : Politiques RLS hermétiques limitant l'accès aux seuls utilisateurs authentifiés (`TO authenticated`) pour leurs propres ressources via `user_id = (SELECT auth.uid())` sur `companies`, et `company_id IN (SELECT id FROM public.companies WHERE user_id = (SELECT auth.uid()))` sur `clients`, `products`, `invoices`, `payments`, `invoice_items` et `invoice_installments`.
  - **Blocage Total du Rôle Public/Anon** : Aucune donnée de facturation ni aucun règlement n'est lisible ni modifiable par le rôle anonyme (`anon`). Toute tentative de lecture directe sans session authentifiée renvoie une liste vide `[]` et les écritures sont bloquées par erreur `42501` (violation de sécurité RLS).
  - **Verrouillage des Fonctions SECURITY DEFINER** : Les fonctions d'administration et triggers (`auto_confirm_user`, `rls_auto_enable`, `fn_sync_invoice_payments`) ont leur `search_path` explicitement figé et les privilèges d'exécution RPC sont révoqués pour empêcher toute invocation via l'API REST.
  - **Indexation des Clés Étrangères** : Index B-tree sur toutes les colonnes de jointure RLS (`user_id`, `company_id`, `invoice_id`) garantissant une latence minimale sur l'évaluation des politiques de sécurité.
- **Typage Strict** : `src/lib/supabase/database.types.ts` généré directement depuis la base PostgreSQL.
- **Couche d'Accès aux Données (`src/lib/supabase/services.ts`)** :
  - `fetchSupabaseData()` : Récupération des données distantes.
  - `supabaseAddInvoice()`, `supabaseAddClient()`, `supabaseAddProduct()`, `supabaseAddPayment()`.
- **Synchronisation Hybride Résiliente (`invoice-context.tsx`)** :
  - Mise à jour optimiste instantanée de l'interface (zéro latence perçue).
  - Persistance asynchrone dans Supabase.
  - Cache local (`facturo:v1:*`) garantissant un fonctionnement continu même en cas de coupure temporaire de connexion internet.

---

## 5. RÈGLE D'OR : GARANTIE ANTI-ERREUR D'HYDRATATION SSR & STABILITÉ RUNTIME

Afin d'éviter tout retour du badge d'erreur Next.js (`(!) 1 error` / `Hydration failed because the initial UI does not match what was rendered on the server`), les règles d'architecture suivantes sont obligatoires :

1. **Interdiction de `localStorage` dans les initialiseurs synchrones `useState`** :
   - Tout état de contexte (`invoices`, `clients`, `products`, `payments`, `currentUser`) doit débuter avec un état neutre identique sur le serveur SSR et le client (`[]`, `null`, `false`, `isDataLoading: true`).
   - Le remplissage via le cache local et Supabase doit se faire exclusivement au montage dans `useEffect`.
2. **Garde de Montage (`mounted`) sur les Éléments Dynamiques dans des Balises Interactives** :
   - Tout badge ou balise conditionnelle inséré dans un lien `<Link>` (balise `<a>`) ou un `<button>` (ex: pastille de notification clignotante dans `Header.tsx`, badge de décompte des factures en attente dans `Sidebar.tsx`) doit être strictement conditionné par l'état `mounted` (`mounted && pendingCount > 0`).
   - La carte de profil utilisateur en bas de la barre latérale affiche un squelette de chargement neutre tant que `mounted` est faux pour garantir une parité 100% conforme avec le HTML SSR.
3. **Protection `suppressHydrationWarning`** :
   - Actif sur les balises racine `<html>` et `<body>` dans `layout.tsx` pour neutraliser les injections d'extensions de navigateurs ou de thèmes.
   - Actif sur le titre de bienvenue personnalisé (`<h1 suppressHydrationWarning>Bonjour, {userFirstName} 👋</h1>`) dans `page.tsx`.
4. **Composants Skeleton Universels** :
   - Tous les modules principaux disposent d'un loader Shimmering Skeleton (`Skeleton.tsx`) affiché tant que `isDataLoading` est actif, évitant tout décalage d'affichage ou flash visuel.

---

## 6. SÉPARATION STRICTE DES COMPTES & ZÉRO PRÉ-REMPLISSAGE (ANTI-AUTOFILL & PURGE DE SESSION)

Afin de garantir la confidentialité absolue et l'indépendance de chaque utilisateur et entreprise :
1. **Éradication Totale du Pré-remplissage sur Inscription (`/register`) et Connexion (`/login`)** :
   - Tous les champs de saisie (*Nom*, *Prénom*, *Entreprise*, *Email*, *Mot de passe*, *Confirmation*) doivent obligatoirement démarrer à vide (`""`).
   - Interdiction formelle de conserver ou de réinjecter un email de session précédente (`last_email` / `last_registered_email`).
2. **Purge Rigoureuse à la Déconnexion (`logout`)** :
   - La fonction `logout()` purge instantanément toutes les traces de session, tokens Supabase, drapeaux d'authentification et clés d'email en `localStorage`.
3. **Protection Anti-Autofill des Navigateurs** :
   - Les formulaires d'inscription et de connexion intègrent obligatoirement `autoComplete="off"`, `autoComplete="new-password"` pour les mots de passe de création, ainsi que les drapeaux de neutralisation des gestionnaires de mots de passe (`data-lpignore="true"`, `data-1p-ignore="true"`, `data-form-type="other"`).

---

## 7. VITRINE PUBLIQUE & LANDING PAGE OFFICIELLE (`/`)

Pour accueillir les visiteurs, convertir les prospects et présenter les atouts d'**OMEGA FACTURE** :
1. **Point d'Entrée Public (`/`)** :
   - La racine `/` constitue la Landing Page officielle accessible à tout visiteur sans obligation d'authentification préalable.
   - Les utilisateurs déjà authentifiés disposent d'un accès direct `Mon Espace` menant à `/dashboard`.
   - Le tableau de bord financier de facturation est accessible sur `/dashboard`.
2. **Architecture Modulaire Réutilisable (`src/components/landing/`)** :
   - `LandingNavbar` : Barre de navigation sticky épurée sur Desktop avec liens directs et actions d'accès rapide, et menu déroulant interactif sur Mobile/Tablette avec bouton « Menu », volet responsive, fond flouté (backdrop), verrouillage du scroll et défilement fluide vers les ancres.
   - `BackToTopButton` : Bouton flottant « Remonter en haut de page » avec flèche `ArrowUp`, détection automatique de scroll (> 350px), micro-animation fluide d'apparition et défilement instantané vers le sommet du site (`scrollTo({ top: 0, behavior: 'smooth' })`).
   - `HeroSection` : Section d'accueil avec badges de réassurance, bouton CTA principal micro-animé (`hero-cta-button` avec halo lumineux, balayage shimmer et rebond au clic), et bouton de démo rapide.
   - `HeroInvoiceSimulator` : Simulateur interactif de factures et devis en temps réel en monnaie FCFA avec bascule Devis/Facture, calcul de TVA 18% automatique, retenue BRS, badges flottants animés (`animate-float-top`, `animate-float-bottom`), et rétroactions de téléchargement PDF et partage WhatsApp.
   - `ProblemSection` : Cartes explicatives des freins de la facturation manuelle sur Word/Excel.
   - `FeaturesSection` & `TaxSimulator` : Fonctionnalités clés UEMOA avec simulateur de TVA 18% en direct.
   - `HowItWorksSection` : Les 3 étapes d'adhésion en 3 minutes chrono.
   - `TestimonialsSection` : Avis vérifiés d'entrepreneurs africains (Sénégal, Côte d'Ivoire, Cameroun).
   - `PricingSection` : Grille tarifaire claire en FCFA (*Plan Gratuit 0 F, Plan Pro 5 000 F, Plan Business 15 000 F*).
   - `FinalCTASection` : Appel à l'action immersif à fond sombre avec halo rouge et CTA pulsant.
   - `LandingFooter` : Pied de page complet avec colonnes, mentions régionales et contact.
3. **Styles Séparés & Mobile-First (`src/styles/landing.css`)** :
   - Éradication des styles inline au profit de règles CSS déclaratives, de variables de couleurs et de micro-animations GPU-accélérées.





