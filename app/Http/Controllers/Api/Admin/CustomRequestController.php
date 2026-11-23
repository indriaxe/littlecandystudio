<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomRequest;
use App\Support\ImageStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class CustomRequestController extends Controller
{
    public function update(Request $request, CustomRequest $customRequest): JsonResponse
    {
        $d = $request->validate([
            'status' => ['sometimes', Rule::in(['Baru', 'Dibalas', 'Disetujui', 'Ditolak'])],
            'quote'  => 'sometimes|integer|min:0|max:1000000000',
            'reply'  => 'sometimes|nullable|string|max:3000',
            'refund_done' => 'sometimes|boolean', // dana sudah dikembalikan ke pelanggan
        ]);

        $customRequest->fill(Arr::only($d, ['status', 'quote', 'reply']));
        if (array_key_exists('refund_done', $d)) {
            $customRequest->refund_done_at = $d['refund_done'] ? now() : null;
        }
        $customRequest->save();

        return response()->json($customRequest->toFront());
    }

    public function destroy(CustomRequest $customRequest): JsonResponse
    {
        ImageStore::delete($customRequest->ref, 'custom');
        ImageStore::delete($customRequest->kartu_foto, 'kartu');
        ImageStore::delete($customRequest->bukti, 'proof');
        $customRequest->delete();

        return response()->json(['ok' => true]);
    }

    /** Jadikan permintaan ini sebuah pesanan secara manual (misal kesepakatan lewat WhatsApp). Aman dipanggil ulang. */
    public function convert(CustomRequest $customRequest): JsonResponse
    {
        $order = $customRequest->makeOrder();

        return response()->json([
            'order'   => $order->fresh()->toFront(),
            'request' => $customRequest->fresh()->toFront(),
        ]);
    }
}
