<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'], 'last_name' => ['required', 'string', 'max:80'],
            'phone' => ['required', 'string', 'max:30'], 'email' => ['nullable', 'email'],
            'delivery_mode' => ['required', Rule::in(['delivery', 'pickup'])], 'address' => ['required_if:delivery_mode,delivery', 'nullable', 'string'],
            'city' => ['required_if:delivery_mode,delivery', 'nullable', 'string', 'max:100'],
            'payment_method' => ['required', Rule::in(['wave', 'orange'])],
            'items' => ['required', 'array', 'min:1'], 'items.*.product_id' => ['required'], 'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.size' => ['nullable', 'string', 'max:30'], 'items.*.color' => ['nullable', 'string', 'max:50'],
        ]);

        $order = DB::transaction(function () use ($data) {
            $lines = [];
            $subtotal = 0;
            foreach ($data['items'] as $item) {
                $product = Product::where(fn ($query) => $query->whereKey($item['product_id'])->orWhere('sku', $item['product_id']))->where('is_active', true)->lockForUpdate()->firstOrFail();
                if ($product->stock < $item['quantity']) abort(422, "Stock insuffisant pour {$product->name}.");
                $lineTotal = $product->price * $item['quantity']; $subtotal += $lineTotal;
                $lines[] = [$product, $item, $lineTotal];
                $product->decrement('stock', $item['quantity']);
            }
            $shipping = $data['delivery_mode'] === 'pickup' || $subtotal >= 50000 ? 0 : 2000;
            $total = $subtotal + $shipping; $deposit = (int) ceil($total / 2);
            $order = Order::create([...$data, 'reference' => 'DT-'.now()->format('Ymd').'-'.strtoupper(str()->random(5)), 'subtotal' => $subtotal, 'shipping_fee' => $shipping, 'total' => $total, 'deposit_amount' => $deposit, 'payment_status' => 'pending', 'order_status' => 'pending_confirmation']);
            foreach ($lines as [$product, $item, $lineTotal]) $order->items()->create(['product_id' => $product->id, 'product_name' => $product->name, 'sku' => $product->sku, 'unit_price' => $product->price, 'quantity' => $item['quantity'], 'size' => $item['size'] ?? null, 'color' => $item['color'] ?? null, 'line_total' => $lineTotal]);
            $order->payments()->create(['method' => $data['payment_method'], 'amount' => $deposit, 'status' => 'pending', 'notes' => 'Lien de paiement à envoyer par WhatsApp.']);
            return $order->load('items', 'payments');
        });
        return response()->json(['message' => 'Commande enregistrée. Le lien de paiement de l’acompte sera envoyé par WhatsApp.', 'order' => $order], 201);
    }

    public function show(string $reference)
    {
        return response()->json(Order::where('reference', $reference)->with('items', 'payments')->firstOrFail());
    }
}
