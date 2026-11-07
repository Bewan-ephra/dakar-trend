<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::where('is_active', true)->withCount(['products' => fn ($q) => $q->where('is_active', true)])->orderBy('name')->get());
    }
}
