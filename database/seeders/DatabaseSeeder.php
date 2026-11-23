<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Data awal: akun admin, kategori, 13 produk contoh, dan 2 pesanan contoh (LCS001, LCS002).
 * Aman dijalankan ulang: data yang sudah ada tidak digandakan.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---- Admin ----
        // Hanya dibuat bila belum ada admin. Username/password selanjutnya diganti di Admin > Pengaturan.
        if (User::count() === 0) {
            User::create([
                'name'     => 'Admin',
                'username' => config('littlecandy.admin.username'),
                'password' => config('littlecandy.admin.password'),
            ]);
        }

        // ---- Kategori ----
        $cats = [];
        foreach (['Mini Flower', 'Bouquet', 'Greeting Card', 'Celebration Gift'] as $i => $name) {
            $cats[$name] = Category::firstOrCreate(['name' => $name], ['sort_order' => $i + 1]);
        }

        // ---- Produk: [id, nama, kategori, harga, nomor foto|null, deskripsi, unggulan] ----
        $products = [
            [1, 'Yellow Snack Bouquet', 'Celebration Gift', 250000, 15, 'Bunga chenille stem kuning di tumbler, lengkap dengan susu, snack, dan kartu ucapan.', true],
            [2, 'Sun Flower Mini', 'Mini Flower', 30000, null, 'Satu tangkai bunga matahari mini dalam pot rajut. Hadiah kecil yang manis.', true],
            [3, 'Eternal Flower Bouquet', 'Greeting Card', 50000, 20, 'Tiga tulip maroon pada papan kartu ucapan bergelombang dengan tile putih dan pita.', true],
            [4, 'Pink Garden Bouquet', 'Bouquet', 175000, 10, 'Buket pastel pink dan lilac dengan wrapping mint dan pita lembut.', true],
            [5, 'Pastel Mix Bouquet', 'Bouquet', 150000, 11, 'Bunga warna-warni dengan wrapping nude dan pita pink. Ceria untuk wisuda.', false],
            [6, 'Blush Protea Bouquet', 'Bouquet', 185000, 12, 'Perpaduan putih dan blush pink bergaya protea, dibalut tile berenda.', false],
            [7, 'Teachers Day Bouquet', 'Bouquet', 165000, 13, 'Buket pink dengan kartu ucapan Hari Guru dan wrapping krem hangat.', false],
            [8, 'Birthday Box', 'Celebration Gift', 220000, 9, 'Bunga pastel di dalam box pink bertali rami, lengkap dengan kartu ulang tahun.', false],
            [9, 'Graduation Box', 'Celebration Gift', 240000, 18, 'Box bunga dengan topper nama custom dan kartu ucapan kelulusan.', false],
            [10, 'Wedding Frame Sunflower', 'Celebration Gift', 200000, 16, 'Bingkai shadow box bunga matahari dengan nama dan tanggal pernikahan.', false],
            [11, 'Wedding Frame Pastel', 'Celebration Gift', 230000, 17, 'Bingkai bunga pastel dengan ilustrasi pasangan dan tanggal acara.', false],
            [12, 'Bestie Hanging Card', 'Greeting Card', 60000, 19, 'Kartu gantung ulang tahun dengan tulip dan gerbera chenille.', false],
            [13, 'Maroon Tulip Bouquet', 'Bouquet', 180000, 1, 'Buket maroon klasik dengan lily dan tulip, wrapping putih dan pita rose gold.', false],
        ];

        foreach ($products as [$id, $name, $cat, $price, $img, $desc, $featured]) {
            if (Product::whereKey($id)->exists()) {
                continue;
            }
            $p = new Product([
                'name'        => $name,
                'category_id' => $cats[$cat]->id,
                'price'       => $price,
                'image'       => $img ? "assets/img/produk-{$img}.jpg" : null,
                'description' => $desc,
                'is_active'   => true,
                'sold_out'    => false,
                'is_featured' => $featured,
            ]);
            $p->id = $id; // id dikunci supaya sama dengan data lama
            $p->save();
        }

        // ---- Pesanan contoh (supaya kode LCS001 bisa dicoba di halaman Lacak Pesanan) ----
        $samples = [
            [1, '2026-11-12', ['name' => 'Fitri', 'wa' => '081200000001', 'items' => 'Pink Garden Bouquet x1', 'sub' => 175000, 'ongkir' => 30000, 'total' => 205000, 'metode' => 'antar', 'area' => 'Kepanjen', 'alamat' => 'Contoh alamat', 'status' => 2, 'paid' => true]],
            [2, '2026-11-02', ['name' => 'Rifka', 'wa' => '081200000002', 'items' => 'Wedding Frame Pastel x1', 'sub' => 230000, 'ongkir' => 0, 'total' => 230000, 'metode' => 'ambil', 'area' => '', 'alamat' => null, 'status' => 4, 'paid' => true]],
        ];
        foreach ($samples as [$id, $date, $attrs]) {
            if (Order::whereKey($id)->exists()) {
                continue;
            }
            $o = new Order($attrs);
            $o->id = $id;
            $o->created_at = Carbon::parse($date . ' 10:00:00');
            $o->updated_at = $o->created_at;
            $o->save();
        }
    }
}
