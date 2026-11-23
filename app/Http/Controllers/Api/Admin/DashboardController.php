<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Complaint;
use App\Models\CustomRequest;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /** Semua data untuk panel admin (dimuat sekali setelah login). */
    public function data(): JsonResponse
    {
        return response()->json([
            'orders'     => Order::orderBy('id')->get()->map(fn ($o) => $o->toFront())->values(),
            'cq'         => CustomRequest::orderBy('id')->get()->map(fn ($c) => $c->toFront())->values(),
            'iss'        => Complaint::orderBy('id')->get()->map(fn ($c) => $c->toFront())->values(),
            'products'   => self::allProducts(),
            'categories' => self::allCategories(),
            'settings'   => Setting::values(),
            'admin'      => ['username' => auth()->user()->username],
        ]);
    }

    public static function allProducts()
    {
        return Product::with('category')->orderBy('id')->get()->map(fn ($p) => $p->toFront())->values();
    }

    public static function allCategories()
    {
        return Category::orderBy('sort_order')->orderBy('id')->get()->map(fn ($c) => $c->toFront())->values();
    }
}
