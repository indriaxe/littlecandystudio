<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Support\ImageStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $d = $this->validated($request);
        $this->checkFeatured($d['bs'], null);

        $product = Product::create($this->attributes($d) + [
            'image' => ImageStore::resolve($d['img'] ?? null, 'products') ?: null,
        ]);

        return response()->json($product->load('category')->toFront(), 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $d = $this->validated($request);
        $this->checkFeatured($d['bs'], $product);

        $attrs = $this->attributes($d);

        // Foto baru -> simpan, hapus foto lama. Selain itu foto tidak berubah.
        if (ImageStore::isDataUrl($d['img'] ?? null)) {
            $old = $product->image;
            $attrs['image'] = ImageStore::save($d['img'], 'products');
            ImageStore::delete($old, 'products');
        }

        $product->update($attrs);

        return response()->json($product->load('category')->toFront());
    }

    public function destroy(Product $product): JsonResponse
    {
        ImageStore::delete($product->image, 'products');
        $product->delete();

        return response()->json(['ok' => true]);
    }

    private function validated(Request $request): array
    {
        $d = $request->validate([
            'n'   => 'required|string|max:150',
            'k'   => ['required', 'string', Rule::exists('categories', 'name')],
            'pr'  => 'required|integer|min:1|max:1000000000',
            'd'   => 'nullable|string|max:2000',
            'img' => 'nullable|string',
            'on'  => 'required|boolean',
            'so'  => 'required|boolean',
            'bs'  => 'required|boolean',
        ]);
        $d['bs'] = (bool) $d['bs'];

        return $d;
    }

    private function attributes(array $d): array
    {
        return [
            'name'        => trim($d['n']),
            'category_id' => Category::where('name', $d['k'])->value('id'),
            'price'       => (int) $d['pr'],
            'description' => $d['d'] ?? null,
            'is_active'   => (bool) $d['on'],
            'sold_out'    => (bool) $d['so'],
            'is_featured' => (bool) $d['bs'],
        ];
    }

    /** Produk unggulan di beranda dibatasi (default 4). */
    private function checkFeatured(bool $wantsFeatured, ?Product $current): void
    {
        if (! $wantsFeatured || ($current && $current->is_featured)) {
            return;
        }
        $max = (int) config('littlecandy.max_featured');
        $count = Product::where('is_featured', true)
            ->when($current, fn ($q) => $q->where('id', '!=', $current->id))
            ->count();

        if ($count >= $max) {
            throw ValidationException::withMessages([
                'bs' => "Tidak bisa menambah bintang: produk unggulan sudah {$max}. Hapus bintang salah satu produk unggulan dulu.",
            ]);
        }
    }
}
