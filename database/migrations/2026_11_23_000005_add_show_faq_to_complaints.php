<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            // true = pertanyaan + balasan admin ditampilkan di halaman Bantuan & FAQ
            $table->boolean('show_faq')->default(false)->after('reply');
        });
    }

    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropColumn('show_faq');
        });
    }
};
