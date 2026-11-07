<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = ['reference', 'first_name', 'last_name', 'phone', 'email', 'delivery_mode', 'address', 'city', 'payment_method', 'subtotal', 'shipping_fee', 'total', 'deposit_amount', 'payment_status', 'order_status', 'notes'];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
