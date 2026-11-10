<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerPaymentRule extends Model
{
    protected $fillable = ['phone', 'phone_key', 'requires_deposit', 'reason'];

    protected function casts(): array
    {
        return ['requires_deposit' => 'boolean'];
    }
}
