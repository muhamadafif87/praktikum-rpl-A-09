<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
         Schema::create('transaksi_keuangan', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('id_transaksi', 20)->unique()->comment('format: TX-XXXXXX');

            $table->foreignId('id_mitra')->constrained('mitra', 'id_mitra')->cascadeOnDelete();
            // Nullable karena bisa ada transaksi manual (pencairan saldo, dll)
            $table->foreignId('id_pesanan')->nullable()->constrained('pesanan', 'id_pesanan')->nullOnDelete();

            $table->string('nama_pelanggan', 100)->nullable()->comment('snapshot dari pesanan');
            $table->decimal('jumlah', 12, 2);
            $table->enum('status_dana', [
                'Tersedia',
                'Tertahan (Escrow)',
            ])->default('Tertahan (Escrow)');

            $table->timestamp('tanggal_transaksi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::dropIfExists('transaksi_keuangan');
    }
};
