<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $categories = collect(['Vêtements', 'Chaussures', 'Bijoux', 'Montres', 'Audio & accessoires'])->mapWithKeys(fn ($name) => [$name => Category::updateOrCreate(['name' => $name], ['slug' => str($name)->slug(), 'is_active' => true])]);
        $products = json_decode(file_get_contents(database_path('seeders/products.json')), true, flags: JSON_THROW_ON_ERROR);
        foreach ($products as $item) {
            Product::updateOrCreate(['sku' => $item['id']], [
                'category_id' => $categories[$item['category']]->id,
                'sku' => $item['id'], 'name' => $item['name'], 'slug' => str($item['name'].'-'.$item['id'])->slug(), 'kind' => $item['kind'],
                'description' => $item['description'], 'specifications' => $item['specs'], 'price' => $item['price'], 'old_price' => $item['oldPrice'],
                'badge' => $item['badge'], 'rating' => $item['rating'], 'reviews' => $item['reviews'], 'colors' => $item['colors'], 'sizes' => $item['sizes'],
                'gallery' => $item['gallery'], 'stock' => $item['stock'], 'is_flash' => $item['isFlash'], 'is_active' => true,
            ]);
        }
        User::updateOrCreate(['email' => 'admin@dakartend.sn'], ['name' => 'Dakar Trend Admin', 'password' => 'ChangeMe_2026!', 'is_admin' => true]);
    }
}
