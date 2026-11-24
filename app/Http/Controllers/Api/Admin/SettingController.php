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
            'wa'       => 'sometimes|required|string|max:30',
            'qrisNama' => 'sometimes|required|string|max:60',
            'jam'      => 'sometimes|required|string|max:80',
            'po'       => 'sometimes|required|integer|min:0|max:365',
            'dp'       => 'sometimes|required|integer|min:0|max:100',
            'base'     => 'sometimes|required|integer|min:0|max:10000000',
            'km'       => 'sometimes|required|integer|min:0|max:10000000',
            'min'      => 'sometimes|required|integer|min:0|max:10000000',
            'qris'     => 'nullable|string',
        ]);

        foreach (['wa', 'qrisNama', 'jam', 'po', 'dp', 'base', 'km', 'min'] as $key) {
            if (array_key_exists($key, $d)) { // field boleh dikirim sendiri-sendiri (mis. hanya gambar QRIS)
                Setting::put($key, $d[$key]);
            }
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
