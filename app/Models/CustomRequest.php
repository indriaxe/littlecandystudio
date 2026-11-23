<?php

namespace App\Models;

use App\Models\Concerns\GeneratesCode;
use App\Support\ImageStore;
use App\Support\Shop;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomRequest extends Model
{
    use GeneratesCode;

    public const CODE_PREFIX = 'CQ';

    protected $fillable = [
        'mode', 'nama', 'wa', 'kat', 'des', 'tgl', 'bud', 'ant', 'area', 'ongkir', 'alm',
        'dari', 'untuk', 'pes', 'ref', 'kartu_foto', 'kartu_cat', 'bukti', 'bukti_tgl',
        'tpl', 'status', 'quote', 'reply', 'bayar', 'bayar_tipe', 'order_code',
        'refund_bank', 'refund_no', 'refund_name', 'refund_at', 'refund_done_at',
    ];

    protected $casts = [
        'tgl'    => 'date',
        'bud'    => 'integer',
        'ongkir' => 'integer',
        'quote'  => 'integer',
        'refund_at'      => 'datetime',
        'refund_done_at' => 'datetime',
    ];

    /**
     * Ubah permintaan ini menjadi pesanan (kode LCS baru) berdasarkan harga penawaran.
     * Aman dipanggil dua kali: bila pesanan sudah pernah dibuat, yang lama dikembalikan.
     *
     * @param bool $mustBeReplied true = hanya boleh bila status "Dibalas" (dipakai saat pelanggan menekan Setuju)
     */
    public function makeOrder(bool $mustBeReplied = false): Order
    {
        $order = DB::transaction(function () use ($mustBeReplied) {
            $cr = static::query()->whereKey($this->id)->lockForUpdate()->first();

            if ($cr->order_code && ($old = Order::where('code', $cr->order_code)->first())) {
                return $old;
            }
            if ($mustBeReplied && $cr->status !== 'Dibalas') {
                throw ValidationException::withMessages([
                    'status' => 'Penawaran ini tidak bisa disetujui (belum dibalas admin, atau sudah diproses).',
                ]);
            }
            if ($cr->quote <= 0) {
                throw ValidationException::withMessages(['quote' => 'Isi harga penawaran dulu.']);
            }

            $s = Setting::values();
            $total = $cr->quote + $cr->ongkir;
            $tipe = $cr->bayar_tipe ?: 'lunas';
            $dibayar = Shop::due($total, $tipe, $s);

            // Kartu ucapan dari form custom ikut dibawa ke pesanan
            $kartu = [];
            if ($cr->dari || $cr->untuk || $cr->pes || $cr->kartu_cat || $cr->kartu_foto) {
                $kartu[] = [
                    'no'     => 1,
                    'bunga'  => '',
                    'dari'   => (string) $cr->dari,
                    'untuk'  => (string) $cr->untuk,
                    'pes'    => (string) $cr->pes,
                    'desain' => (string) $cr->kartu_cat,
                    'foto'   => ImageStore::copy($cr->kartu_foto, 'kartu') ?? '',
                    'cat'    => '',
                ];
            }

            $order = Order::create([
                'name'        => $cr->nama,
                'wa'          => $cr->wa,
                'items'       => 'Custom ' . $cr->kat . ' (' . $cr->code . ')',
                'sub'         => $cr->quote,
                'ongkir'      => $cr->ongkir,
                'total'       => $total,
                'metode'      => str_starts_with((string) $cr->ant, 'Diantar') ? 'antar' : 'ambil',
                'area'        => $cr->area,
                'alamat'      => $cr->alm,
                'tgl'         => $cr->tgl,
                'bayar_tipe'  => $tipe,
                'dibayar'     => $dibayar,
                'sisa'        => $total - $dibayar,
                'kartu'       => $kartu,
                'status'      => 0,
                'paid'        => false,
                'source_code' => $cr->code,
                // Disalin supaya menghapus salah satu data tidak menghapus fotonya di data yang lain
                'bukti'       => ImageStore::copy($cr->bukti, 'proof'),
                'bukti_tgl'   => $cr->bukti_tgl,
            ]);

            $cr->update(['status' => 'Disetujui', 'order_code' => $order->code]);

            return $order;
        });

        $this->refresh();

        return $order;
    }

    public function toFront(): array
    {
        return [
            'code'      => $this->code,
            'mode'      => $this->mode,
            'nama'      => $this->nama,
            'wa'        => $this->wa,
            'kat'       => $this->kat,
            'des'       => $this->des,
            'tgl'       => $this->tgl ? $this->tgl->format('Y-m-d') : '',
            'bud'       => $this->bud,
            'ant'       => (string) $this->ant,
            'area'      => (string) $this->area,
            'ongkir'    => $this->ongkir,
            'alm'       => (string) $this->alm,
            'dari'      => (string) $this->dari,
            'untuk'     => (string) $this->untuk,
            'pes'       => (string) $this->pes,
            'ref'       => (string) $this->ref,
            'kartuFoto' => (string) $this->kartu_foto,
            'kartuCat'  => (string) $this->kartu_cat,
            'bukti'     => (string) $this->bukti,
            'buktiTgl'  => (string) $this->bukti_tgl,
            'tpl'       => (string) $this->tpl,
            'status'    => $this->status,
            'quote'     => $this->quote,
            'reply'     => (string) $this->reply,
            'bayar'     => (string) $this->bayar,
            'bayarTipe' => $this->bayar_tipe,
            'orderCode' => (string) $this->order_code,
            'refundBank' => (string) $this->refund_bank,
            'refundNo'   => (string) $this->refund_no,
            'refundName' => (string) $this->refund_name,
            'refundSent' => (bool) $this->refund_at,
            'refundDone' => (bool) $this->refund_done_at,
            'date'      => $this->dateLabel(),
        ];
    }

    public function toPublic(): array
    {
        return [
            'code'     => $this->code,
            'mode'     => $this->mode,
            'date'     => $this->dateLabel(),
            'status'   => $this->status,
            'quote'    => $this->quote,
            'reply'    => (string) $this->reply,
            'bayar'    => (string) $this->bayar,
            'bukti'    => (string) $this->bukti,
            'buktiTgl' => (string) $this->bukti_tgl,
            'orderCode' => (string) $this->order_code,
            'hasPaid'    => (bool) $this->bukti,   // sudah membayar -> perlu data rekening bila batal
            'refundSent' => (bool) $this->refund_at, // nomor rekening sengaja tidak ditampilkan
            'refundDone' => (bool) $this->refund_done_at,
        ];
    }
}
