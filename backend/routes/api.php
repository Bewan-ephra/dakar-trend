<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\EnsureAdmin;

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);
Route::middleware(['web', EnsureAdmin::class])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::patch('/admin/orders/{order}', [OrderController::class, 'update']);
});
Route::get('/orders/{reference}', [OrderController::class, 'show']);
