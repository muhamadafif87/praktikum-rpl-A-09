<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users')) {
            return;
        }

        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id_user');
            $table->string('nama_lengkap', 155);
            $table->string('email', 255)->unique();
            $table->string('password', 255);
            $table->string('nomor_telepon', 25)->unique();
            $table->text('alamat_kost');
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
