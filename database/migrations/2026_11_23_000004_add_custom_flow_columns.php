<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Custom order: skema bayar, kode pesanan hasil persetujuan, data rekening refund
        Schema::table('custom_requests', function (Blueprint $table) {
            $table->string('bayar_tipe', 10)->nullable()->after('bayar');      // lunas | dp
            $table->string('order_code', 12)->nullable()->after('bayar_tipe'); // kode LCS yang dibuat saat pelanggan setuju
            $table->string('refund_bank', 60)->nullable();
            $table->string('refund_no', 40)->nullable();
            $table->string('refund_name', 100)->nullable();
            $table->timestamp('refund_at')->nullable();       // pelanggan mengirim data rekening
            $table->timestamp('refund_done_at')->nullable();  // admin sudah mentransfer pengembalian dana
        });

        // Pesanan: pelunasan DP, konfirmasi diterima, asal custom order
        Schema::table('orders', function (Blueprint $table) {
            $table->string('source_code', 12)->nullable()->after('code');      // kode CQ asal pesanan
            $table->string('bukti_lunas')->nullable();
            $table->string('bukti_lunas_tgl', 30)->nullable();
            $table->boolean('lunas_ok')->default(false);       // admin sudah memverifikasi pelunasan
            $table->timestamp('received_at')->nullable();      // pelanggan konfirmasi pesanan diterima
        });
    }

    public function down(): void
    {
        Schema::table('custom_requests', function (Blueprint $table) {
            $table->dropColumn(['bayar_tipe', 'order_code', 'refund_bank', 'refund_no', 'refund_name', 'refund_at', 'refund_done_at']);
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['source_code', 'bukti_lunas', 'bukti_lunas_tgl', 'lunas_ok', 'received_at']);
        });
    }
};
