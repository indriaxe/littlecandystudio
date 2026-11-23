<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\CustomRequest;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Support\ImageStore;
use App\Support\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/** Endpoint yang dipakai pengunjung (tanpa login). */
class PublicController extends Controller
{
    // ------------------------------------------------------------ Checkout keranjang
    public function storeOrder(Request $request): JsonResponse
    {
        $s = Setting::values();

        $data = $request->validate([
            'name'              => 'required|string|max:100',
            'wa'                => 'required|string|max:30',
            'tgl'               => 'required|date_format:Y-m-d',
            'metode'            => 'required|in:ambil,antar',
            'area'              => 'nullable|string|max:5',
            'alamat'            => 'nullable|string|max:500',
            'bayarTipe'         => 'required|in:lunas,dp',
            'items'             => 'required|array|min:1|max:50',
            'items.*.id'        => 'required|integer',
            'items.*.qty'       => 'required|integer|min:1|max:99',
            'kartu'             => 'nullable|array|max:200',
            'kartu.*.no'        => 'nullable|integer',
            'kartu.*.bunga'     => 'nullable|string|max:150',
            'kartu.*.dari'      => 'nullable|string|max:100',
            'kartu.*.untuk'     => 'nullable|string|max:100',
            'kartu.*.pes'       => 'nullable|string|max:1000',
            'kartu.*.desain'    => 'nullable|string|max:300',
            'kartu.*.foto'      => 'nullable|string',
            'kartu.*.cat'       => 'nullable|string|max:500',
        ]);

        if (strlen(Shop::digits($data['wa'])) < 9) {
            throw ValidationException::withMessages(['wa' => 'Nomor WhatsApp tidak valid.']);
        }
        if ($data['tgl'] < Shop::minDate($s)) {
            throw ValidationException::withMessages([
                'tgl' => "Pesanan minimal {$s['po']} hari dari hari ini.",
            ]);
        }

        // Harga selalu dihitung ulang dari database (bukan dari angka kiriman browser)
        $ids = collect($data['items'])->pluck('id')->unique()->all();
        $products = Product::whereIn('id', $ids)->get()->keyBy('id');
        $sub = 0;
        $lines = [];
        foreach ($data['items'] as $item) {
            $p = $products->get($item['id']);
            if (! $p || ! $p->is_active || $p->sold_out) {
                throw ValidationException::withMessages([
                    'items' => 'Ada produk di keranjang yang sudah tidak tersedia. Muat ulang halaman lalu cek keranjangmu.',
                ]);
            }
            $sub += $p->price * $item['qty'];
            $lines[] = $p->name . ' x' . $item['qty'];
        }

        // Ongkir
        $area = '';
        $ongkir = 0;
        if ($data['metode'] === 'antar') {
            $found = Shop::area($data['area'] ?? '');
            if (! $found || trim((string) ($data['alamat'] ?? '')) === '') {
                throw ValidationException::withMessages(['area' => 'Lengkapi area tujuan dan alamat pengiriman.']);
            }
            $area = $found[0];
            $ongkir = $found[1] > 0 ? Shop::fee($found[1], $s) : 0; // "Area lain" -> dikonfirmasi admin
        }

        $total = $sub + $ongkir;
        $dibayar = Shop::due($total, $data['bayarTipe'], $s);

        $kartu = collect($data['kartu'] ?? [])->map(function ($k, $i) {
            return [
                'no'     => (int) ($k['no'] ?? $i + 1),
                'bunga'  => $k['bunga'] ?? '',
                'dari'   => $k['dari'] ?? '',
                'untuk'  => $k['untuk'] ?? '',
                'pes'    => $k['pes'] ?? '',
                'desain' => $k['desain'] ?? '',
                'foto'   => ImageStore::isDataUrl($k['foto'] ?? null) ? ImageStore::save($k['foto'], 'kartu') : '',
                'cat'    => $k['cat'] ?? '',
            ];
        })->values()->all();

        $order = Order::create([
            'name'       => trim($data['name']),
            'wa'         => trim($data['wa']),
            'items'      => implode(', ', $lines),
            'sub'        => $sub,
            'ongkir'     => $ongkir,
            'total'      => $total,
            'metode'     => $data['metode'],
            'area'       => $area,
            'alamat'     => $data['alamat'] ?? null,
            'tgl'        => $data['tgl'],
            'bayar_tipe' => $data['bayarTipe'],
            'dibayar'    => $dibayar,
            'sisa'       => $total - $dibayar,
            'kartu'      => $kartu,
            'status'     => 0,
            'paid'       => false,
        ]);

        return response()->json($order->fresh()->toPublic(), 201);
    }

    // ------------------------------------------------------------ Tanya harga / Custom order
    public function storeCustom(Request $request): JsonResponse
    {
        $s = Setting::values();

        $d = $request->validate([
            'mode'      => ['required', Rule::in(['Custom Order', 'Tanya Harga'])],
            'nama'      => 'required|string|max:100',
            'wa'        => 'required|string|max:30',
            'kat'       => ['required', 'string', Rule::exists('categories', 'name')],
            'des'       => 'required|string|max:2000',
            'tgl'       => 'nullable|date_format:Y-m-d',
            'bud'       => 'nullable|integer|min:0|max:100000000',
            'ant'       => ['nullable', Rule::in(['Ambil sendiri', 'Diantar'])],
            'area'      => 'nullable|string|max:5',
            'alm'       => 'nullable|string|max:500',
            'dari'      => 'nullable|string|max:100',
            'untuk'     => 'nullable|string|max:100',
            'pes'       => 'nullable|string|max:1000',
            'ref'       => 'required|string',
            'kartuFoto' => 'nullable|string',
            'kartuCat'  => 'nullable|string|max:300',
            'bukti'     => 'nullable|string',
            'tpl'       => 'nullable|string|max:150',
            'py'        => ['nullable', Rule::in(['lunas', 'dp'])],
        ]);

        if (strlen(Shop::digits($d['wa'])) < 9) {
            throw ValidationException::withMessages(['wa' => 'Nomor WhatsApp tidak valid.']);
        }

        $custom = $d['mode'] === 'Custom Order';
        $deliver = $custom && ($d['ant'] ?? '') === 'Diantar';
        $area = '';
        $ongkir = 0;

        if ($custom) {
            if (empty($d['tgl']) || $d['tgl'] < Shop::minDate($s)) {
                throw ValidationException::withMessages([
                    'tgl' => "Pesanan minimal {$s['po']} hari dari hari ini.",
                ]);
            }
            if (! ImageStore::isDataUrl($d['bukti'] ?? null)) {
                throw ValidationException::withMessages(['bukti' => 'Upload bukti pembayaran dulu ya.']);
            }
        }
        if ($deliver) {
            $found = Shop::area($d['area'] ?? '');
            if (! $found || trim((string) ($d['alm'] ?? '')) === '') {
                throw ValidationException::withMessages(['area' => 'Lengkapi area tujuan dan alamat pengiriman.']);
            }
            $area = $found[0];
            $ongkir = $found[1] > 0 ? Shop::fee($found[1], $s) : 0;
        }

        $bud = (int) ($d['bud'] ?? 0);
        $payBase = $bud ? $bud + $ongkir : 0;
        $bayar = '';
        if ($custom) {
            $tipe = $d['py'] ?? 'lunas';
            $bayar = 'QRIS · ' . ($tipe === 'dp' ? 'DP ' . $s['dp'] . '%' : 'Lunas')
                . ($payBase ? ' · ' . Shop::rupiah(Shop::due($payBase, $tipe, $s)) : '');
        }

        $cr = CustomRequest::create([
            'mode'       => $d['mode'],
            'nama'       => trim($d['nama']),
            'wa'         => trim($d['wa']),
            'kat'        => $d['kat'],
            'des'        => $d['des'],
            'tgl'        => $custom ? $d['tgl'] : null,
            'bud'        => $bud,
            'ant'        => $custom ? ($d['ant'] ?? 'Ambil sendiri') : null,
            'area'       => $area,
            'ongkir'     => $ongkir,
            'alm'        => $d['alm'] ?? null,
            'dari'       => $d['dari'] ?? null,
            'untuk'      => $d['untuk'] ?? null,
            'pes'        => $d['pes'] ?? null,
            'ref'        => ImageStore::resolve($d['ref'], 'custom'),
            'kartu_foto' => ImageStore::resolve($d['kartuFoto'] ?? null, 'kartu'),
            'kartu_cat'  => $d['kartuCat'] ?? null,
            'bukti'      => $custom ? ImageStore::resolve($d['bukti'], 'proof') : null,
            'bukti_tgl'  => $custom ? Shop::todayLabel() : null,
            'tpl'        => $d['tpl'] ?? null,
            'status'     => 'Baru',
            'quote'      => 0,
            'bayar'      => $bayar,
            'bayar_tipe' => $custom ? ($d['py'] ?? 'lunas') : null,
        ]);

        return response()->json($cr->fresh()->toPublic(), 201);
    }

    // ------------------------------------------------------------ Keluhan / pertanyaan
    public function storeComplaint(Request $request): JsonResponse
    {
        $d = $request->validate([
            'nama'   => 'required|string|max:100',
            'kontak' => 'required|string|max:150',
            'jenis'  => ['nullable', Rule::in(['Pertanyaan', 'Keluhan pesanan', 'Saran'])],
            'text'   => 'required|string|max:3000',
        ]);

        $c = Complaint::create([
            'nama'   => trim($d['nama']),
            'kontak' => trim($d['kontak']),
            'jenis'  => $d['jenis'] ?? 'Pertanyaan',
            'text'   => $d['text'],
            'status' => 'Baru',
        ]);

        return response()->json($c->fresh()->toPublic(), 201);
    }

    // ------------------------------------------------------------ Lacak pesanan
    public function track(string $code): JsonResponse
    {
        [$type, $record] = $this->findByCode($code);
        if (! $record) {
            return response()->json(['message' => 'Kode tidak ditemukan.'], 404);
        }

        return response()->json(['type' => $type, 'data' => $record->toPublic()]);
    }

    // ------------------------------------------------------------ Balasan pelanggan atas penawaran custom
    /**
     * Setelah admin membalas (status "Dibalas"):
     *  - agree = true  -> pesanan langsung dibuat (masuk ke Pesanan admin), pelanggan menerima kode LCS baru
     *  - agree = false -> permintaan ditolak; bila sudah membayar, pelanggan mengirim rekening untuk pengembalian dana
     */
    public function respondCustom(Request $request, string $code): JsonResponse
    {
        $d = $request->validate([
            'agree'     => 'required|boolean',
            'bank'      => 'nullable|string|max:60',
            'rekening'  => 'nullable|string|max:40',
            'atas_nama' => 'nullable|string|max:100',
        ]);

        $cr = CustomRequest::where('code', strtoupper(trim($code)))->first();
        if (! $cr) {
            return response()->json(['message' => 'Kode tidak ditemukan.'], 404);
        }

        // ---- Setuju ----
        if ($d['agree']) {
            $order = $cr->makeOrder(true);

            return response()->json([
                'order'   => $order->fresh()->toPublic(),
                'request' => $cr->fresh()->toPublic(),
            ], 201);
        }

        // ---- Tidak setuju ----
        $needsRefund = (bool) $cr->bukti;
        $alreadyDeclined = $cr->status === 'Ditolak';

        if (! in_array($cr->status, ['Dibalas', 'Ditolak'], true) || $cr->order_code) {
            return response()->json(['message' => 'Permintaan ini sudah diproses.'], 422);
        }
        if ($alreadyDeclined && (! $needsRefund || $cr->refund_at)) {
            return response()->json(['message' => 'Permintaan ini sudah ditolak.'], 422);
        }

        if ($needsRefund) {
            $rek = Shop::digits($d['rekening'] ?? '');
            if (trim((string) ($d['bank'] ?? '')) === '' || trim((string) ($d['atas_nama'] ?? '')) === '') {
                throw ValidationException::withMessages(['bank' => 'Isi nama bank/e-wallet dan nama pemilik rekening.']);
            }
            if (strlen($rek) < 6 || strlen($rek) > 25) {
                throw ValidationException::withMessages(['rekening' => 'Nomor rekening tidak valid (6-25 angka).']);
            }
            $cr->refund_bank = trim($d['bank']);
            $cr->refund_no = $rek;
            $cr->refund_name = trim($d['atas_nama']);
            $cr->refund_at = now();
        }

        $cr->status = 'Ditolak';
        $cr->save();

        return response()->json(['request' => $cr->fresh()->toPublic()]);
    }

    // ------------------------------------------------------------ Pelunasan DP
    /** Pelanggan mengunggah bukti pelunasan (hanya bila pesanan DP sudah tahap Dikemas). */
    public function uploadSettlement(Request $request, string $code): JsonResponse
    {
        $request->validate(['bukti' => 'required|string']);

        $order = Order::where('code', strtoupper(trim($code)))->first();
        if (! $order) {
            return response()->json(['message' => 'Kode tidak ditemukan.'], 404);
        }
        if (! $order->canSettle()) {
            return response()->json(['message' => 'Pelunasan belum bisa dilakukan untuk pesanan ini.'], 422);
        }
        if (! ImageStore::isDataUrl($request->input('bukti'))) {
            throw ValidationException::withMessages(['bukti' => 'Bukti pelunasan harus berupa gambar.']);
        }

        $order->bukti_lunas = ImageStore::save($request->input('bukti'), 'proof');
        $order->bukti_lunas_tgl = Shop::todayLabel();
        $order->save();

        return response()->json($order->toPublic());
    }

    // ------------------------------------------------------------ Konfirmasi pesanan diterima
    public function confirmReceived(string $code): JsonResponse
    {
        $order = Order::where('code', strtoupper(trim($code)))->first();
        if (! $order) {
            return response()->json(['message' => 'Kode tidak ditemukan.'], 404);
        }
        if (! $order->canReceive()) {
            return response()->json([
                'message' => 'Pesanan belum bisa dikonfirmasi. Konfirmasi diterima hanya untuk pesanan yang diantar, saat statusnya "Siap diambil / dikirim" dan pembayaran sudah lunas.',
            ], 422);
        }

        $order->status = 4; // Selesai
        $order->received_at = now();
        $order->save();

        return response()->json($order->toPublic());
    }

    /** Upload bukti pembayaran dari halaman Lacak / setelah checkout (hanya bila belum ada bukti). */
    public function uploadProof(Request $request, string $code): JsonResponse
    {
        $request->validate(['bukti' => 'required|string']);

        [$type, $record] = $this->findByCode($code);
        if (! $record || ! in_array($type, ['order', 'cq'], true)) {
            return response()->json(['message' => 'Kode tidak ditemukan.'], 404);
        }
        if ($type === 'cq' && ! $record->bayar) {
            return response()->json(['message' => 'Permintaan ini tidak memerlukan bukti pembayaran.'], 422);
        }
        if ($record->bukti) {
            return response()->json(['message' => 'Bukti pembayaran sudah pernah dikirim.'], 422);
        }
        if (! ImageStore::isDataUrl($request->input('bukti'))) {
            throw ValidationException::withMessages(['bukti' => 'Bukti pembayaran harus berupa gambar.']);
        }

        $record->bukti = ImageStore::save($request->input('bukti'), 'proof');
        $record->bukti_tgl = Shop::todayLabel();
        $record->save();

        return response()->json(['bukti' => $record->bukti, 'buktiTgl' => $record->bukti_tgl]);
    }

    /** Kode LCS = pesanan, CQ = custom/tanya harga, IS = keluhan. */
    private function findByCode(string $code): array
    {
        $code = strtoupper(trim($code));

        if (str_starts_with($code, 'LCS')) {
            return ['order', Order::where('code', $code)->first()];
        }
        if (str_starts_with($code, 'CQ')) {
            return ['cq', CustomRequest::where('code', $code)->first()];
        }
        if (str_starts_with($code, 'IS')) {
            return ['iss', Complaint::where('code', $code)->first()];
        }

        return ['', null];
    }
}
