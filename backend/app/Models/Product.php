<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = ['category_id', 'sku', 'name', 'slug', 'kind', 'description', 'specifications', 'price', 'old_price', 'badge', 'rating', 'reviews', 'colors', 'sizes', 'gallery', 'stock', 'is_flash', 'is_active'];

    protected function casts(): array
    {
        return ['specifications' => 'array', 'colors' => 'array', 'sizes' => 'array', 'gallery' => 'array', 'rating' => 'float', 'is_flash' => 'boolean', 'is_active' => 'boolean'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
