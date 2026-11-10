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
}
