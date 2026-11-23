<?php

return [

    /*
    | Daftar area pengiriman: [nama area, jarak km dari Pakisaji].
    | Dipakai di form checkout / custom order (dikirim ke browser lewat window.BOOT.areas)
    | dan untuk menghitung ongkir di server.
    */
    'areas' => [
        ['Pakisaji (sekitar studio)', 2],
        ['Sukun, Kota Malang', 7],
        ['Wagir', 8],
        ['Dau', 12],
        ['Kepanjen', 12],
        ['Bululawang', 12],
        ['Klojen, Kota Malang', 12],
        ['Lowokwaru, Kota Malang', 16],
        ['Blimbing, Kota Malang', 16],
        ['Kedungkandang, Kota Malang', 17],
        ['Gondanglegi', 18],
        ['Wajak', 20],
        ['Batu', 22],
        ['Turen', 22],
        ['Karangploso', 22],
        ['Singosari', 25],
        ['Pakis', 25],
        ['Tumpang', 30],
        ['Dampit', 35],
        ['Lawang', 38],
    ],

    /*
    | Nilai awal pengaturan toko. Setelah diubah di Admin > Pengaturan,
    | nilainya disimpan di tabel `settings` dan menggantikan nilai di sini.
    */
    'defaults' => [
        'wa'       => '6281234567890',
        'qris'     => 'assets/img/qris.svg',
        'qrisNama' => 'Little Candy Studio',
        'dp'       => 50,
        'jam'      => 'Setiap hari, 09.00–21.00 WIB',
        'po'       => 14,
        'base'     => 6000,
        'km'       => 2000,
        'min'      => 8000,
    ],

    // Maksimal produk "Unggulan di beranda"
    'max_featured' => 4,

    // Akun admin yang dibuat oleh seeder (atur di file .env)
    'admin' => [
        'username' => env('ADMIN_USERNAME', 'admin'),
        'password' => env('ADMIN_PASSWORD', 'admin123'),
    ],
];
