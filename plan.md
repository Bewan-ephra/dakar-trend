# Plan d’implémentation — Dakar Trend

## Périmètre
Dakar Trend est une boutique e-commerce mobile-first pour Dakar, destinée à une clientèle jeune et sensible aux promotions. Cette première livraison construit une vitrine complète navigable avec catalogue, fiches produit, favoris, panier, checkout et dashboard admin alimentés par des données de démonstration. Les appels backend Laravel/MySQL, les paiements Wave/Orange Money et les notifications sont documentés comme points de branchement.

## Architecture
- `src/App.jsx` : shell de l’application, navigation client, état panier/favoris, vues catalogue/produit/checkout/compte/admin.
- `src/data/products.js` : 40 produits fictifs dans les catégories vêtements, chaussures, bijoux, montres et audio/accessoires, avec prix, promotions, stocks, variantes et avis.
- `src/styles.css` : design system responsive sans dépendance visuelle externe, grille dense, badges et animations.
- `public/manus-routes.json` : manifeste des routes déclarées pour Preview et publication.
- `README.md` : installation, variables, API cible, identifiants de démonstration et points restant à brancher.

## Design
### Mouvement
**Street-commerce éditorial** : l’énergie d’une marketplace mode dense, rendue plus premium par une direction artistique noire, crème et rouge corail.

### Principes
1. Abondance lisible : grilles serrées, prix immédiatement visibles et filtres accessibles.
2. Conversion rapide : ajout panier en un geste, CTA persistants et microcopies orientées bénéfice.
3. Confiance locale : FCFA, retrait showroom, Wave / Orange Money et WhatsApp visibles à chaque étape.
4. Mobile d’abord : navigation basse, tiroirs et contrôles tactiles généreux.

### Couleur
Le rouge corail `#ff3b5c` est la signature de l’offre et des actions. Le noir d’encre porte les titres et les bandes de campagne. Le fond ivoire chaud évite l’effet catalogue froid et valorise les photos produit.

### Typographie
Inter pour l’interface et Space Grotesk pour les grands titres, avec une hiérarchie courte, dense et très contrastée.

### Signature
Le wordmark « Dakar Trend » utilise un monogramme DT en capsule rouge, accompagné d’un motif de trois points inspiré des pastilles de statut et de livraison.

### Voix
Directe, locale et complice : « Les looks qui partent vite » et « Ton panier, ton rythme. Livraison ou showroom, c’est toi qui choisis. »

## Données et intégration
La démo utilise un adaptateur local en mémoire afin de garder le parcours entièrement testable sans secrets ni paiement réel. Les contrats REST cibles et les variables d’environnement sont décrits dans le README. Le futur backend pourra remplacer cet adaptateur par Laravel + MySQL + Sanctum sans modifier les composants de présentation.

## Flux principaux
- Accueil → filtre catégorie → fiche produit → panier tiroir → checkout.
- Recherche / tri / filtres → ajout rapide et favoris.
- Compte démo → historique et frise de suivi.
- Admin démo → KPI, graphique CSS, produits, commandes, clients et sections éditoriales.
