<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Connexion admin — Dakar Trend</title>
    <style>
        body{margin:0;background:#f7f5f2;color:#17171b;font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh}.card{background:#fff;width:min(420px,calc(100% - 40px));padding:36px;border:1px solid #e8e3df;box-shadow:0 16px 45px #17171b12}h1{margin:0 0 8px;font-size:28px}p{color:#6d6970;line-height:1.5}.kicker{font-size:11px;letter-spacing:.16em;color:#f43d5d;font-weight:700}label{display:block;margin:20px 0 6px;font-size:13px;font-weight:700}input{box-sizing:border-box;width:100%;padding:13px;border:1px solid #ddd8d4;font-size:15px}button{margin-top:24px;width:100%;padding:14px;border:0;background:#f43d5d;color:#fff;font-weight:700;font-size:14px;cursor:pointer}.error{background:#fff0f2;color:#bd2847;padding:12px;font-size:13px}
    </style>
</head>
<body>
    <main class="card">
        <span class="kicker">DAKAR TREND / BACK OFFICE</span>
        <h1>Connexion administrateur</h1>
        <p>Connectez-vous pour consulter les commandes et mettre à jour leur statut.</p>
        @if ($errors->any()) <div class="error">{{ $errors->first() }}</div> @endif
        <form method="post" action="{{ url('/auth/login') }}">
            @csrf
            <label for="email">Email</label>
            <input id="email" name="email" type="email" value="{{ old('email', 'admin@dakartend.sn') }}" required autofocus>
            <label for="password">Mot de passe</label>
            <input id="password" name="password" type="password" required>
            <button type="submit">Se connecter</button>
        </form>
    </main>
</body>
</html>
