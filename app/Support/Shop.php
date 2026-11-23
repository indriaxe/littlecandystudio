<?php

namespace App\Support;

use Carbon\Carbon;

/** Aturan bisnis toko: ongkir, DP, tanggal minimal pesanan. (Sama dengan perhitungan di JavaScript.) */
class Shop
{
    /** Cari area dari nilai form (nomor urut, atau "x" untuk area lain). Hasil: [nama, jarakKm] atau null bila tidak sah. */
    public static function area($index): ?array
    {
        if ($index === 'x') {
            return ['Area lain', 0];
        }
        $areas = config('littlecandy.areas');
        if (is_numeric($index) && isset($areas[(int) $index]) && (string) (int) $index === (string) $index) {
            return $areas[(int) $index];
        }
        return null;
    }

    /** Ongkir = biaya dasar + km x tarif, dibulatkan ke ribuan, minimal ongkir minimum. */
    public static function fee(int $km, array $s): int
    {
        return (int) max($s['min'], round(($s['base'] + $km * $s['km']) / 1000) * 1000);
    }

    /** Jumlah yang dibayar sekarang: lunas = total, DP = persen dari total (dibulatkan ke ribuan). */
    public static function due(int $total, ?string $tipe, array $s): int
    {
        return $tipe === 'dp' ? (int) (round($total * $s['dp'] / 100 / 1000) * 1000) : $total;
    }

    /** Tanggal paling cepat pesanan boleh dibutuhkan: hari ini + minimal hari pre-order. */
    public static function minDate(array $s): string
    {
        return Carbon::today()->addDays($s['po'])->toDateString();
    }

    public static function rupiah(int $n): string
    {
        return 'Rp ' . number_format($n, 0, ',', '.');
    }

    /** Hanya angka dari nomor telepon. */
    public static function digits(?string $value): string
    {
        return preg_replace('/\D/', '', (string) $value);
    }

    public static function todayLabel(): string
    {
        return Carbon::now()->locale('id')->translatedFormat('j M Y');
    }
}
