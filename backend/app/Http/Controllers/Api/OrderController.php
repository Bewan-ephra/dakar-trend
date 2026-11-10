<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\CustomerPaymentRule;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('payments')->latest();
        if ($request->filled('status')) $query->where('order_status', $request->string('status'));
        return response()->json($query->paginate(min((int) $request->input('per_page', 20), 50)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'], 'last_name' => ['required', 'string', 'max:80'],
            'phone' => ['required', 'string', 'max:30'], 'email' => ['nullable', 'email'],
            'delivery_mode' => ['required', Rule::in(['delivery', 'pickup'])], 'address' => ['required_if:delivery_mode,delivery', 'nullable', 'string'],
            'city' => ['required_if:delivery_mode,delivery', 'nullable', 'string', 'max:100'],
            'payment_method' => ['required', Rule::in(['cod', 'wave', 'orange'])],
            'items' => ['required', 'array', 'min:1'], 'items.*.product_id' => ['required'], 'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.size' => ['nullable', 'string', 'max:30'], 'items.*.color' => ['nullable', 'string', 'max:50'],
        ]);

        $phoneKey = preg_replace('/\D+/', '', $data['phone']);
        if ($data['payment_method'] === 'cod' && CustomerPaymentRule::where('phone_key', $phoneKey)->where('requires_deposit', true)->exists()) {
            abort(422, 'Ce numéro doit régler un acompte de 50 % avant la livraison. Choisissez Wave ou Orange Money.');
        }
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
            $total = $subtotal + $shipping; $deposit = $data['payment_method'] === 'cod' ? 0 : (int) ceil($total / 2);
            $order = Order::create([...$data, 'reference' => 'DT-'.now()->format('Ymd').'-'.strtoupper(str()->random(5)), 'subtotal' => $subtotal, 'shipping_fee' => $shipping, 'total' => $total, 'deposit_amount' => $deposit, 'payment_status' => $data['payment_method'] === 'cod' ? 'cod_pending' : 'pending', 'order_status' => 'pending_confirmation']);
            foreach ($lines as [$product, $item, $lineTotal]) $order->items()->create(['product_id' => $product->id, 'product_name' => $product->name, 'sku' => $product->sku, 'unit_price' => $product->price, 'quantity' => $item['quantity'], 'size' => $item['size'] ?? null, 'color' => $item['color'] ?? null, 'line_total' => $lineTotal]);
            $order->payments()->create(['method' => $data['payment_method'], 'amount' => $deposit, 'status' => $data['payment_method'] === 'cod' ? 'cod' : 'pending', 'notes' => $data['payment_method'] === 'cod' ? 'Paiement à la livraison.' : 'Acompte de 50 % à régler par lien WhatsApp.']);
            return $order->load('items', 'payments');
        });
        return response()->json(['message' => $data['payment_method'] === 'cod' ? 'Commande enregistrée. Paiement à la livraison.' : 'Commande enregistrée. Le lien de paiement de l’acompte sera envoyé par WhatsApp.', 'order' => $order], 201);
    }

    public function show(string $reference)
    {
        return response()->json(Order::where('reference', $reference)->with('items', 'payments')->firstOrFail());
    }

    public function update(Request $request, Order $order)
    {
        $data = $request->validate([
            'order_status' => ['sometimes', Rule::in(['pending_confirmation', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])],
            'payment_status' => ['sometimes', Rule::in(['pending', 'link_sent', 'paid', 'failed'])],
            'payment_reference' => ['nullable', 'string', 'max:120'],
            'payment_link' => ['nullable', 'url', 'max:2000'],
        ]);
        $order->update(collect($data)->only(['order_status', 'payment_status'])->all());
        if (!empty($data['payment_reference']) || !empty($data['payment_link'])) {
            $payment = $order->payments()->latest()->first();
            $payment?->update([
                'external_reference' => $data['payment_reference'] ?? $payment->external_reference,
                'payment_link' => $data['payment_link'] ?? $payment->payment_link,
                'status' => $data['payment_status'] ?? (!empty($data['payment_link']) ? 'link_sent' : 'paid'),
                'paid_at' => ($data['payment_status'] ?? '') === 'paid' ? now() : $payment->paid_at,
            ]);
        }
        return response()->json($order->fresh()->load('payments'));
    }
}
