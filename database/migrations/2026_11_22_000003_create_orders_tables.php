<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pesanan dari keranjang (kode LCS001, LCS002, ...)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('code', 12)->nullable()->unique();
            $table->string('name', 100);
            $table->string('wa', 30);
            $table->text('items');                         // ringkasan: "Pink Garden Bouquet x1, ..."
            $table->unsignedInteger('sub');                // total produk
            $table->unsignedInteger('ongkir')->default(0);
            $table->unsignedInteger('total');
            $table->string('metode', 10)->default('ambil'); // ambil | antar
            $table->string('area', 80)->nullable();
            $table->text('alamat')->nullable();
            $table->date('tgl')->nullable();               // tanggal dibutuhkan
            $table->string('bayar_tipe', 10)->nullable();  // lunas | dp
            $table->unsignedInteger('dibayar')->nullable();
            $table->unsignedInteger('sisa')->nullable();
            $table->json('kartu')->nullable();             // kartu ucapan & catatan per bunga
            $table->unsignedTinyInteger('status')->default(0); // 0..4
            $table->boolean('paid')->default(false);
            $table->string('bukti')->nullable();           // foto bukti pembayaran
            $table->string('bukti_tgl', 30)->nullable();
            $table->text('int_note')->nullable();          // catatan internal admin
            $table->timestamps();
        });

        // Tanya harga & custom order (kode CQ001, ...)
        Schema::create('custom_requests', function (Blueprint $table) {
            $table->id();
            $table->string('code', 12)->nullable()->unique();
            $table->string('mode', 20);                    // Custom Order | Tanya Harga
            $table->string('nama', 100);
            $table->string('wa', 30);
            $table->string('kat', 60);
            $table->text('des');
            $table->date('tgl')->nullable();
            $table->unsignedInteger('bud')->default(0);
            $table->string('ant', 20)->nullable();         // Ambil sendiri | Diantar
            $table->string('area', 80)->nullable();
            $table->unsignedInteger('ongkir')->default(0);
            $table->text('alm')->nullable();
            $table->string('dari', 100)->nullable();
            $table->string('untuk', 100)->nullable();
            $table->text('pes')->nullable();
            $table->string('ref')->nullable();             // foto referensi
            $table->string('kartu_foto')->nullable();
            $table->string('kartu_cat', 300)->nullable();
            $table->string('bukti')->nullable();
            $table->string('bukti_tgl', 30)->nullable();
            $table->string('tpl', 150)->nullable();        // nama produk template
            $table->string('status', 20)->default('Baru');
            $table->unsignedInteger('quote')->default(0);  // harga penawaran admin
            $table->text('reply')->nullable();
            $table->string('bayar', 120)->nullable();
            $table->timestamps();
        });

        // Keluhan & pertanyaan (kode IS001, ...)
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('code', 12)->nullable()->unique();
            $table->string('nama', 100);
            $table->string('kontak', 150);
            $table->string('jenis', 30)->nullable();
            $table->text('text');
            $table->string('status', 20)->default('Baru');
            $table->text('reply')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
        Schema::dropIfExists('custom_requests');
        Schema::dropIfExists('orders');
    }
};
