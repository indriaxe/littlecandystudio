<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\ImageStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $d = $request->validate([
            'wa'       => 'required|string|max:30',
            'qrisNama' => 'required|string|max:60',
            'jam'      => 'required|string|max:80',
            'po'       => 'required|integer|min:0|max:365',
            'dp'       => 'required|integer|min:0|max:100',
            'base'     => 'required|integer|min:0|max:10000000',
            'km'       => 'required|integer|min:0|max:10000000',
            'min'      => 'required|integer|min:0|max:10000000',
            'qris'     => 'nullable|string',
        ]);

        foreach (['wa', 'qrisNama', 'jam', 'po', 'dp', 'base', 'km', 'min'] as $key) {
            Setting::put($key, $d[$key]);
        }

        // Gambar QRIS baru (kalau diunggah)
        if (ImageStore::isDataUrl($d['qris'] ?? null)) {
            $old = Setting::values()['qris'];
            Setting::put('qris', ImageStore::save($d['qris'], 'qris'));
            ImageStore::delete($old, 'qris');
        }

        return response()->json(Setting::values());
    }
}
