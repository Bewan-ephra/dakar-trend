<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $portal = env('MANUS_OAUTH_PORTAL_URL');
        $appId = env('MANUS_PROJECT_ID');
        if (! $portal || ! $appId) return response()->view('auth.login');
        $redirectUri = env('MANUS_OAUTH_REDIRECT_URI', url('/auth/callback'));
        $nonce = Str::random(40);
        $request->session()->put('oauth_nonce', $nonce);
        $state = base64_encode(json_encode(['redirectUri' => $redirectUri, 'nonce' => $nonce], JSON_THROW_ON_ERROR));
        $url = rtrim($portal, '/').'/app-auth?'.http_build_query(['appId' => $appId, 'redirectUri' => $redirectUri, 'state' => $state, 'responseType' => 'code']);
        return redirect()->away($url)->withCookie(cookie('oauth_nonce', $nonce, 5, null, null, (bool) config('session.secure'), true, false, config('session.same_site')));
    }

    public function localLogin(Request $request)
    {
        $credentials = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        if (! Auth::attempt([...$credentials, 'is_admin' => true], true)) {
            if ($request->expectsJson()) return response()->json(['message' => 'Identifiants administrateur incorrects.'], 422);
            return back()->withErrors(['email' => 'Identifiants administrateur incorrects.'])->withInput();
        }
        $request->session()->regenerate();
        if ($request->expectsJson()) return response()->json(['ok' => true, 'user' => $request->user()]);
        return redirect()->to(rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/').'/admin');
    }

    public function callback(Request $request)
    {
        $payload = json_decode(base64_decode((string) $request->string('state')), true);
        $nonce = $request->cookie('oauth_nonce');
        abort_unless($request->filled('code') && is_array($payload) && hash_equals((string) $request->session()->pull('oauth_nonce'), (string) ($payload['nonce'] ?? '')) && hash_equals((string) $nonce, (string) ($payload['nonce'] ?? '')), 403, 'État OAuth invalide.');
        $redirectUri = env('MANUS_OAUTH_REDIRECT_URI', url('/auth/callback'));
        $api = rtrim((string) env('MANUS_OAUTH_API_URL'), '/');
        abort_unless($api && env('MANUS_PROJECT_ID'), 503, 'OAuth Manus non configuré.');
        $exchange = Http::asJson()->post($api.'/webdev.v1.WebDevAuthPublicService/ExchangeToken', ['clientId' => env('MANUS_PROJECT_ID'), 'grantType' => 'authorization_code', 'code' => $request->string('code'), 'redirectUri' => $redirectUri])->throw()->json();
        $identity = Http::asJson()->post($api.'/webdev.v1.WebDevAuthPublicService/GetUserInfo', ['accessToken' => $exchange['accessToken'] ?? ''])->throw()->json();
        $user = \App\Models\User::where('open_id', $identity['openId'] ?? '')->orWhere('email', $identity['email'] ?? '')->first();
        abort_unless($user && $user->is_admin, 403, 'Ce compte n’est pas autorisé à accéder à Dakar Trend.');
        $user->update(['open_id' => $identity['openId'] ?? $user->open_id, 'name' => $identity['name'] ?? $user->name]);
        Auth::login($user, true);
        $request->session()->regenerate();
        return redirect()->to(rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/').'/admin');
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    public function logout(Request $request)
    {
        Auth::logout(); $request->session()->invalidate(); $request->session()->regenerateToken();
        return response()->json(['message' => 'Déconnexion réussie.']);
    }
}
