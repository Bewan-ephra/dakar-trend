# Dakar Trend

Dakar Trend est une vitrine e-commerce mobile-first pour une boutique de mode, bijoux et tech basée à Dakar. Cette version est une démonstration fonctionnelle navigable : les produits, le panier, les favoris, le checkout et le back-office utilisent un adaptateur local en mémoire afin de rendre le parcours testable immédiatement.

## Lancer le projet

```bash
npm install
npm run dev
```

Le serveur de développement écoute sur `http://localhost:3000`. Pour générer le build de production :

```bash
npm run build
npm run preview
```

## Parcours disponibles

La boutique expose les routes `/`, `/catalogue`, `/produit/:id`, `/favoris`, `/panier`, `/checkout` et `/compte`. Le back-office de démonstration est disponible sur `/admin`. Les pages éditoriales `/a-propos`, `/contact`, `/faq`, `/cgv` et `/retours` sont accessibles depuis le footer.

## Identifiants de démonstration

Le back-office est volontairement ouvert dans cette maquette pour faciliter la revue :

- URL : `/admin`
- Utilisateur : `admin@dakartend.sn`
- Mot de passe de démonstration : `DakarTrend2026!`

Ces identifiants ne doivent pas être utilisés en production. L’authentification et les rôles doivent être branchés à Laravel Sanctum avant mise en ligne.

## Variables d’environnement prévues

```env
VITE_API_URL=http://localhost:8000/api
VITE_WHATSAPP_NUMBER=221770000000
VITE_STORAGE_URL=https://cdn.example.com
```

Aucune clé de paiement réelle n’est incluse dans le dépôt. Les moyens Wave et Orange Money sont représentés par une confirmation de commande et un lien WhatsApp simulé.

## API REST cible

Le frontend est préparé pour remplacer `src/data/products.js` par un client REST Laravel :

| Méthode | Endpoint | Usage |
|---|---|---|
| `GET` | `/api/products` | Catalogue paginé, filtres et tri |
| `GET` | `/api/products/{id}` | Fiche produit, variantes et avis |
| `POST` | `/api/cart/items` | Ajout panier côté serveur |
| `POST` | `/api/orders` | Création de commande et acompte |
| `GET` | `/api/orders` | Historique du compte client |
| `POST` | `/api/auth/login` | Connexion Sanctum |
| `GET` | `/api/admin/dashboard` | KPI et série de ventes |
| `POST/PUT/DELETE` | `/api/admin/products` | CRUD produits protégé par rôle |
| `PATCH` | `/api/admin/orders/{id}` | Mise à jour du statut |

Le backend Laravel devra gérer la validation serveur, CSRF, hash des mots de passe, permissions client/admin, MySQL, stockage des images et journalisation des erreurs. En Preview cross-site, les cookies de session devront être émis avec `SameSite=None; Secure`.

## Ce qui reste à brancher

Les éléments suivants sont volontairement simulés dans cette livraison : persistance MySQL, authentification Sanctum, vrais liens Wave/Orange Money, notifications WhatsApp, emails transactionnels, recherche indexée, upload média et déploiement du backend Laravel. Les URLs d’images actuelles sont des placeholders distants Unsplash à remplacer par le stockage média de production.

## Structure

- `src/main.jsx` : shell React, pages client, panier, checkout, compte et admin.
- `src/data/products.js` : 40 produits fictifs, variantes, prix, stocks, notes et images.
- `src/styles.css` : design system responsive Dakar Trend.
- `public/manus-routes.json` : manifeste des routes de Preview.
- `plan.md` et `TODO.md` : choix de conception et suivi des livrables.
