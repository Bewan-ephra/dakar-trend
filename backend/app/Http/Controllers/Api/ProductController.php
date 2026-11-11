<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
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

    public function adminIndex(Request $request)
    {
        return response()->json(Product::with('category')->latest()->paginate(min((int) $request->input('per_page', 100), 200)));
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['name']);
        $product = Product::create($data);
        return response()->json($product->load('category'), 201);
    }

    public function update(Request $request, Product $product)
    {
        $data = $this->validated($request, $product);
        $data['slug'] = $product->name !== $data['name'] ? $this->uniqueSlug($data['name'], $product) : $product->slug;
        $product->update($data);
        return response()->json($product->fresh()->load('category'));
    }

    public function destroy(Product $product)
    {
        if ($product->orderItems()->exists()) {
            $product->update(['is_active' => false]);
            return response()->json(['message' => 'Produit archivé car il apparaît dans une commande.', 'product' => $product->fresh()->load('category')]);
        }
        $product->delete();
        return response()->json(['message' => 'Produit supprimé.']);
    }

    public function uploadImage(Request $request)
    {
        $request->validate(['image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120']]);
        $path = $request->file('image')->store('products', 'public');
        return response()->json(['url' => '/api/media/'.$path]);
    }

    public function image(string $path)
    {
        abort_unless(Str::startsWith($path, 'products/') && ! Str::contains($path, '..'), 404);
        $diskPath = Storage::disk('public')->path($path);
        abort_unless(is_file($diskPath), 404);
        return response()->file($diskPath);
    }

    private function validated(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'sku' => ['required', 'string', 'max:80', Rule::unique('products', 'sku')->ignore($product?->id)],
            'name' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'old_price' => ['nullable', 'integer', 'min:0'],
            'badge' => ['nullable', 'string', 'max:50'],
            'colors' => ['nullable', 'array'],
            'sizes' => ['nullable', 'array'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['nullable', 'string', 'max:1000'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_flash' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function uniqueSlug(string $name, ?Product $ignore = null): string
    {
        $base = Str::slug($name) ?: 'produit';
        $slug = $base;
        $counter = 2;
        while (Product::where('slug', $slug)->when($ignore, fn ($q) => $q->where('id', '!=', $ignore->id))->exists()) $slug = $base.'-'.$counter++;
        return $slug;
    }
}
