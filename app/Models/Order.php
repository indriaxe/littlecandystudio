<?php

namespace App\Models;

use App\Models\Concerns\GeneratesCode;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use GeneratesCode;

    public const CODE_PREFIX = 'LCS';

    protected $fillable = [
        'name', 'wa', 'items', 'sub', 'ongkir', 'total', 'metode', 'area', 'alamat', 'tgl',
        'bayar_tipe', 'dibayar', 'sisa', 'kartu', 'status', 'paid', 'bukti', 'bukti_tgl', 'int_note',
        'source_code', 'bukti_lunas', 'bukti_lunas_tgl', 'lunas_ok', 'received_at',
    ];

    protected $casts = [
        'kartu'  => 'array',
        'paid'   => 'boolean',
        'status' => 'integer',
        'tgl'    => 'date',
        'lunas_ok'    => 'boolean',
        'received_at' => 'datetime',
    ];

    /** Pelanggan boleh membayar pelunasan: DP, sudah tahap Dikemas, belum mengirim bukti pelunasan. */
    public function canSettle(): bool
    {
        return $this->bayar_tipe === 'dp' && ! $this->lunas_ok && ! $this->bukti_lunas
            && $this->status >= 2 && $this->status < 4;
    }

    /**
     * Pelanggan boleh konfirmasi "sudah diterima" HANYA untuk pesanan yang DIANTAR.
     * (Pesanan ambil di studio dikonfirmasi oleh admin.) Syarat: tahap "Siap diambil / dikirim",
     * pembayaran sudah diverifikasi admin, dan untuk DP pelunasan sudah diverifikasi.
     */
    public function canReceive(): bool
    {
        return $this->metode === 'antar' && $this->status === 3 && $this->paid
            && ($this->bayar_tipe !== 'dp' || $this->lunas_ok);
    }

    private function receivedLabel(): string
    {
        return $this->received_at ? $this->received_at->copy()->locale('id')->translatedFormat('j M Y') : '';
    }

    /** Data lengkap untuk panel admin. */
    public function toFront(): array
    {
        return [
            'code'      => $this->code,
            'name'      => $this->name,
            'wa'        => $this->wa,
            'items'     => $this->items,
            'sub'       => (int) $this->sub,
            'ongkir'    => (int) $this->ongkir,
            'total'     => (int) $this->total,
            'metode'    => $this->metode,
            'area'      => (string) $this->area,
            'alamat'    => (string) $this->alamat,
            'tgl'       => $this->tgl ? $this->tgl->format('Y-m-d') : '',
            'bayarTipe' => $this->bayar_tipe,
            'dibayar'   => $this->dibayar,
            'sisa'      => $this->sisa,
            'kartu'     => $this->kartu ?? [],
            'status'    => $this->status,
            'paid'      => $this->paid,
            'date'      => $this->dateLabel(),
            'bukti'     => (string) $this->bukti,
            'buktiTgl'  => (string) $this->bukti_tgl,
            'int'       => (string) $this->int_note,
            'source'       => (string) $this->source_code,
            'buktiLunas'   => (string) $this->bukti_lunas,
            'buktiLunasTgl' => (string) $this->bukti_lunas_tgl,
            'lunasOk'      => $this->lunas_ok,
            'receivedAt'   => $this->receivedLabel(),
        ];
    }

    /** Data yang boleh dilihat pelanggan di halaman Lacak Pesanan (tanpa alamat, catatan internal, dll). */
    public function toPublic(): array
    {
        return [
            'code'      => $this->code,
            'name'      => $this->name,
            'items'     => $this->items,
            'total'     => (int) $this->total,
            'metode'    => $this->metode,
            'area'      => (string) $this->area,
            'bayarTipe' => $this->bayar_tipe,
            'dibayar'   => $this->dibayar,
            'sisa'      => $this->sisa,
            'status'    => $this->status,
            'paid'      => $this->paid,
            'date'      => $this->dateLabel(),
            'bukti'     => (string) $this->bukti,
            'buktiTgl'  => (string) $this->bukti_tgl,
            'source'       => (string) $this->source_code,
            'buktiLunas'   => (string) $this->bukti_lunas,
            'buktiLunasTgl' => (string) $this->bukti_lunas_tgl,
            'lunasOk'      => $this->lunas_ok,
            'receivedAt'   => $this->receivedLabel(),
            'canSettle'    => $this->canSettle(),
            'canReceive'   => $this->canReceive(),
        ];
    }
}
