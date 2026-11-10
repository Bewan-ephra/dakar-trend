<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerPaymentRule;
use Illuminate\Http\Request;

class CustomerPaymentRuleController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:30'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);
        $key = preg_replace('/\D+/', '', $data['phone']);
        abort_if(strlen($key) < 8, 422, 'Numéro de téléphone invalide.');
        $rule = CustomerPaymentRule::updateOrCreate(
            ['phone_key' => $key],
            ['phone' => $data['phone'], 'requires_deposit' => true, 'reason' => $data['reason'] ?? 'Commande non honorée à la livraison.']
        );
        return response()->json(['message' => 'Acompte obligatoire activé pour ce numéro.', 'rule' => $rule], 201);
    }

    public function index()
    {
        return response()->json(CustomerPaymentRule::latest()->paginate(50));
    }

    public function check(Request $request)
    {
        $phoneKey = preg_replace('/\D+/', '', (string) $request->query('phone'));
        $rule = CustomerPaymentRule::where('phone_key', $phoneKey)->where('requires_deposit', true)->first();
        return response()->json(['requires_deposit' => (bool) $rule, 'reason' => $rule?->reason]);
    }

    public function update(Request $request, CustomerPaymentRule $paymentRule)
    {
        $data = $request->validate(['phone' => ['required', 'string', 'max:30'], 'reason' => ['nullable', 'string', 'max:500'], 'requires_deposit' => ['sometimes', 'boolean']]);
        $key = preg_replace('/\D+/', '', $data['phone']);
        abort_if(strlen($key) < 8, 422, 'Numéro de téléphone invalide.');
        $paymentRule->update(['phone' => $data['phone'], 'phone_key' => $key, 'reason' => $data['reason'] ?? $paymentRule->reason, 'requires_deposit' => $data['requires_deposit'] ?? true]);
        return response()->json($paymentRule->fresh());
    }

    public function destroy(CustomerPaymentRule $paymentRule)
    {
        $paymentRule->delete();
        return response()->json(['message' => 'Règle supprimée.']);
    }
}
