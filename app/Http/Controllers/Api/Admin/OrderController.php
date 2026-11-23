<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\ImageStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function update(Request $request, Order $order): JsonResponse
    {
        $d = $request->validate([
            'status' => 'sometimes|integer|min:0|max:4',
            'paid'   => 'sometimes|boolean',
            'ongkir' => 'sometimes|integer|min:0|max:100000000',
            'int'    => 'sometimes|nullable|string|max:500',
            'lunas_ok'    => 'sometimes|boolean',  // pelunasan DP sudah diverifikasi
            'clear_lunas' => 'sometimes|boolean',  // tolak bukti pelunasan (pelanggan upload ulang)
        ]);

        if (array_key_exists('status', $d)) {
            $order->status = (int) $d['status'];
            // Pesanan AMBIL di studio: admin yang mengonfirmasi sudah diambil (Selesai)
            if ($order->status === 4 && $order->metode === 'ambil' && ! $order->received_at) {
                $order->received_at = now();
            }
            if ($order->status < 4 && $order->metode === 'ambil') {
                $order->received_at = null;
            }
        }
        if (array_key_exists('paid', $d)) {
            $order->paid = (bool) $d['paid'];
            // Begitu ditandai lunas, pesanan yang masih "Menunggu pembayaran" lanjut ke "Dikerjakan"
            if ($order->paid && $order->status === 0) {
                $order->status = 1;
            }
        }
        if (array_key_exists('ongkir', $d)) {
            $order->ongkir = (int) $d['ongkir'];
            $order->total = $order->sub + $order->ongkir;
            if ($order->bayar_tipe === 'dp') {
                $order->sisa = max(0, $order->total - (int) $order->dibayar);
            } elseif ($order->bayar_tipe === 'lunas') {
                $order->dibayar = $order->total;
                $order->sisa = 0;
            }
        }
        if (array_key_exists('lunas_ok', $d)) {
            $order->lunas_ok = (bool) $d['lunas_ok'];
            // Lunas berarti pembayaran awal (DP) pasti juga sudah diterima
            if ($order->lunas_ok) {
                $order->paid = true;
            }
        }
        if (! empty($d['clear_lunas'])) {
            ImageStore::delete($order->bukti_lunas, 'proof');
            $order->bukti_lunas = null;
            $order->bukti_lunas_tgl = null;
            $order->lunas_ok = false;
        }
        if (array_key_exists('int', $d)) {
            $order->int_note = $d['int'];
        }
        $order->save();

        return response()->json($order->toFront());
    }

    public function destroy(Order $order): JsonResponse
    {
        ImageStore::delete($order->bukti, 'proof');
        ImageStore::delete($order->bukti_lunas, 'proof');
        foreach (($order->kartu ?? []) as $k) {
            ImageStore::delete($k['foto'] ?? null, 'kartu');
        }
        $order->delete();

        return response()->json(['ok' => true]);
    }
}
