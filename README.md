# 🧾 OMEGA FACTURE — Suite de Facturation & Devis Professionnelle

> Solution moderne, réactive et conforme pour la création, l'émission et l'impression de Factures, Devis, Proformas et Reçus commerciaux.

---

## 📌 Présentation

**OMEGA FACTURE** est une application web de gestion commerciale conçue pour les entrepreneurs, commerçants, agences et prestataires de services (notamment au Bénin et dans la zone UEMOA / Afrique de l'Ouest).

Elle permet de générer en temps réel des documents comptables au format standard A4, prêts à être imprimés en PDF ou partagés directement avec vos clients via WhatsApp.

---

## ✨ Fonctionnalités Clés

- 📄 **Multi-Documents en 1 Clic** : Basculez instantanément entre **Facture**, **Devis**, **Facture Proforma** et **Reçu**.
- ⚡ **Éditeur Réactif en Temps Réel** : Modifiez l'émetteur, le client ou les lignes de prestations et observez le rendu A4 s'actualiser sous vos yeux.
- 🧮 **Calculs Financiers Automatisés** :
  - Sous-total brut
  - Remise commerciale (montant ou pourcentage)
  - TVA configurable (0%, 18% UEMOA ou taux personnalisé)
  - Acompte déjà perçu et calcul du **Net à Payer**
- ✍️ **Montant en toutes lettres automatique** : Algorithme certifié de conversion des montants en lettres françaises (ex: *« Arrêtée la présente facture à la somme de : Quarante-deux mille cinq cents Francs CFA »*).
- 📱 **Multi-Devises** : Support direct de **FCFA**, **EUR (€)** et **USD ($)**.
- 🖨️ **Impression A4 Pixel-Perfect (⌘+P)** : Calibrage précis pour l'exportation en PDF haute définition sans fioritures d'écran.
- 💬 **Partage WhatsApp Instantané** : Génération d'un message pré-rempli avec le résumé de la commande et le lien direct vers le numéro du client.
- 💾 **Historique Local & Dashboard KPI** : Sauvegardez vos factures dans le navigateur, consultez vos statistiques de chiffre d'affaires (Total Facturé, Total Encaissé, En attente) et exportez vos sauvegardes JSON.
- 🌓 **Mode Sombre / Mode Clair** : Confort visuel optimal de jour comme de nuit.

---

## 🚀 Structure du Projet

```text
OMEGA FACTURE/
├── index.html        # Interface applicative complète (Split-view & Feuille A4)
├── styles.css        # Système de design moderne, Dark/Light mode & styles d'impression A4
├── app.js            # Moteur réactif, conversion en lettres, historique & export
├── .gitignore        # Exclusions standards de sécurité et système
└── README.md         # Documentation officielle
```

---

## 💻 Comment lancer le projet dans Antigravity IDE

1. Dans **Antigravity IDE**, ouvrez le dossier :
   `Fichier` > `Ouvrir le dossier...` (`⌘ + O`) > Sélectionnez `OMEGA FACTURE` sur votre Bureau.
2. Pour tester dans votre navigateur :
   - Ouvrez simplement `index.html` dans Chrome, Safari ou Edge.
   - Ou lancez un mini serveur local :
     ```bash
     npx serve .
     ```

---

## 📞 Conçu par & pour
- **Société** : OMEGA LivrExpress & Business Suite
- **Auteur** : MONROY (<jobovog@gmail.com>)
- **Localisation** : Allada, Bénin
