<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Complaint;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;

class PageController extends Controller
{
    /** Halaman utama (satu halaman, perpindahan menu ditangani JavaScript lewat #hash). */
    public function index()
    {
        $products = Product::with('category')
            ->where('is_active', true)
            ->orderBy('id')
            ->get()
            ->map(fn (Product $p) => $p->toFront())
            ->values();

        $categories = Category::orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (Category $c) => $c->toFront())
            ->values();

        // Pertanyaan pelanggan yang dipilih admin untuk tampil di Bantuan & FAQ (pertanyaan + jawaban saja, tanpa nama/kontak)
        $faqs = Complaint::where('show_faq', true)
            ->whereNotNull('reply')
            ->where('reply', '!=', '')
            ->orderBy('id')
            ->get()
            ->map(fn (Complaint $c) => ['q' => $c->text, 'a' => $c->reply])
            ->values();

        // Data awal yang langsung dibaca JavaScript (window.BOOT)
        return view('app', [
            'boot' => [
                'products'   => $products,
                'categories' => $categories,
                'settings'   => Setting::values(),
                'areas'      => config('littlecandy.areas'),
                'faqs'       => $faqs,
                'isAdmin'    => Auth::check(),
            ],
        ]);
    }
}
