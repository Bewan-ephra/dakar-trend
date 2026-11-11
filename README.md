## Backend Laravel local

Le backend Laravel est maintenant situé dans `backend/` et utilise MySQL en local. PHP 8.3, Composer et MySQL Server doivent être installés sur la machine.

```bash
cd backend
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Configurez dans `backend/.env` les variables `DB_DATABASE`, `DB_USERNAME` et `DB_PASSWORD` avec les identifiants de votre installation MySQL. Le fichier `.env` reste ignoré par Git et ne doit jamais être publié. Le frontend Vite reste démarrable depuis la racine avec `npm run dev`.

## Connexion administrateur locale

Quand les variables Manus OAuth ne sont pas renseignées, Laravel affiche automatiquement la connexion locale sur `http://127.0.0.1:8000/auth/login`.

Compte de développement créé par le seeder :

```text
Email : admin@dakartend.sn
Mot de passe : ChangeMe_2026!
```

Après connexion, ouvrez `http://localhost:3000/admin` puis la section **Commandes**. Les routes `/api/admin/*` exigent une session administrateur. Changez ce mot de passe avant toute mise en ligne.

## Gestion du catalogue

Dans **Admin → Produits**, le catalogue est connecté à MySQL. Le bouton **Ajouter un produit** permet de renseigner le nom, la référence SKU, la catégorie, les prix, le stock, l’image, la description et le statut. Chaque ligne peut être modifiée ou supprimée. Un produit déjà présent dans une commande est automatiquement archivé au lieu d’être effacé, afin de préserver l’historique des ventes. Les produits actifs sont immédiatement utilisés par la boutique.
Les images se sélectionnent maintenant directement depuis l’ordinateur (JPG, PNG ou WebP, 5 Mo maximum) et sont stockées par Laravel.

## Politique de paiement

Le checkout propose par défaut le **paiement à la livraison** (`cod`) : aucune avance n’est demandée et `deposit_amount` vaut zéro. Wave et Orange Money restent disponibles pour les clients qui préfèrent régler un acompte de 50 % par lien WhatsApp.

Depuis **Admin → Commandes**, l’action **Acompte obligatoire** enregistre le numéro du client dans `customer_payment_rules`. Une prochaine commande utilisant ce numéro ne pourra plus sélectionner le paiement à la livraison : l’API demandera un acompte de 50 % via Wave ou Orange Money. Cette règle est destinée aux commandes non honorées à la livraison et doit être appliquée avec discernement.
