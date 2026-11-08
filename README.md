

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
