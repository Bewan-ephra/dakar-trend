

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
