<?php

use App\Http\Controllers\Api\Admin\AccountController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\ComplaintController;
use App\Http\Controllers\Api\Admin\CustomRequestController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\OrderController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\SettingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

// Halaman utama (semua menu ada di satu halaman, diatur JavaScript)
Route::get('/', [PageController::class, 'index']);

Route::prefix('api')->group(function () {

    // ---- Pengunjung ----
    Route::post('orders', [PublicController::class, 'storeOrder'])->middleware('throttle:15,1');
    Route::post('custom-requests', [PublicController::class, 'storeCustom'])->middleware('throttle:15,1');
    Route::post('complaints', [PublicController::class, 'storeComplaint'])->middleware('throttle:15,1');
    Route::get('track/{code}', [PublicController::class, 'track'])->middleware('throttle:60,1');
    Route::post('track/{code}/respond', [PublicController::class, 'respondCustom'])->middleware('throttle:15,1');
    Route::post('track/{code}/settle', [PublicController::class, 'uploadSettlement'])->middleware('throttle:15,1');
    Route::post('track/{code}/received', [PublicController::class, 'confirmReceived'])->middleware('throttle:15,1');
    Route::post('track/{code}/proof', [PublicController::class, 'uploadProof'])->middleware('throttle:15,1');

    // ---- Admin ----
    Route::post('admin/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    Route::prefix('admin')->middleware('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('data', [DashboardController::class, 'data']);
        Route::put('settings', [SettingController::class, 'update']);
        Route::put('account', [AccountController::class, 'update'])->middleware('throttle:10,1');

        Route::post('products', [ProductController::class, 'store']);
        Route::put('products/{product}', [ProductController::class, 'update']);
        Route::delete('products/{product}', [ProductController::class, 'destroy']);

        Route::post('categories', [CategoryController::class, 'store']);
        Route::patch('categories/{category}', [CategoryController::class, 'update']);
        Route::delete('categories/{category}', [CategoryController::class, 'destroy']);

        // Pesanan, custom order, dan keluhan dicari berdasarkan kode (LCS001, CQ001, IS001)
        Route::patch('orders/{order:code}', [OrderController::class, 'update']);
        Route::delete('orders/{order:code}', [OrderController::class, 'destroy']);

        Route::patch('custom-requests/{customRequest:code}', [CustomRequestController::class, 'update']);
        Route::delete('custom-requests/{customRequest:code}', [CustomRequestController::class, 'destroy']);
        Route::post('custom-requests/{customRequest:code}/convert', [CustomRequestController::class, 'convert']);

        Route::patch('complaints/{complaint:code}', [ComplaintController::class, 'update']);
        Route::delete('complaints/{complaint:code}', [ComplaintController::class, 'destroy']);
    });
});
