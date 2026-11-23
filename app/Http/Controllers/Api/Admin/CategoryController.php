<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\ImageStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $d = $request->validate([
            'name' => ['required', 'string', 'max:30', Rule::unique('categories', 'name')],
        ]);

        Category::create([
            'name'       => trim($d['name']),
            'sort_order' => (int) Category::max('sort_order') + 1,
        ]);

        return $this->payload();
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $d = $request->validate([
            'name'         => ['sometimes', 'required', 'string', 'max:30', Rule::unique('categories', 'name')->ignore($category->id)],
            'image'        => 'nullable|string',
            'remove_image' => 'nullable|boolean',
        ]);

        if (isset($d['name'])) {
            $category->name = trim($d['name']);
        }
        if (ImageStore::isDataUrl($d['image'] ?? null)) {
            ImageStore::delete($category->image, 'categories');
            $category->image = ImageStore::save($d['image'], 'categories');
        } elseif (! empty($d['remove_image'])) {
            ImageStore::delete($category->image, 'categories');
            $category->image = null;
        }
        $category->save();

        return $this->payload();
    }

    public function destroy(Category $category): JsonResponse
    {
        $used = $category->products()->count();
        if ($used > 0) {
            throw ValidationException::withMessages([
                'category' => "Kategori \"{$category->name}\" masih dipakai {$used} produk. Pindahkan atau hapus produknya dulu.",
            ]);
        }
        if (Category::count() <= 1) {
            throw ValidationException::withMessages(['category' => 'Minimal harus ada 1 kategori.']);
        }

        ImageStore::delete($category->image, 'categories');
        $category->delete();

        return $this->payload();
    }

    /** Kategori terbaru + semua produk (nama kategori produk bisa berubah setelah rename). */
    private function payload(): JsonResponse
    {
        return response()->json([
            'categories' => DashboardController::allCategories(),
            'products'   => DashboardController::allProducts(),
        ]);
    }
}
