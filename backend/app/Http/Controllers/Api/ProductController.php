<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()->with('category')->where('is_active', true);
        if ($request->filled('q')) $query->where(fn ($q) => $q->where('name', 'like', '%'.$request->string('q').'%')->orWhere('sku', 'like', '%'.$request->string('q').'%'));
        if ($request->filled('category')) $query->whereHas('category', fn ($q) => $q->where('slug', $request->string('category')));
        if ($request->filled('min_price')) $query->where('price', '>=', (int) $request->input('min_price'));
        if ($request->filled('max_price')) $query->where('price', '<=', (int) $request->input('max_price'));
        if ($request->boolean('flash')) $query->where('is_flash', true);
        match ($request->input('sort')) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'newest' => $query->latest(),
            default => $query->orderByDesc('rating')->orderByDesc('reviews'),
        };
        return response()->json($query->paginate(min((int) $request->input('per_page', 12), 48)));
    }

    public function show(Product $product)
    {
        abort_unless($product->is_active, 404);
        return response()->json($product->load('category'));
    }
}
