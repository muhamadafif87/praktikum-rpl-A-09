<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\MitraImageAsset;

class Mitra extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'mitra';
    protected $primaryKey = 'id_mitra';
    public $timestamps = false;

    protected $casts = [
        'catatan' => 'array',
    ];

    protected $fillable = [
        'nama_mitra',
        'jenis_jasa',
        'alamat_mitra',
        'status_verifikasi',
        'id_admin',
        'nomor_telepon',
        'catatan',
        'latitude',
        'longitude',
        'radius_layanan'
    ];

    protected function casts(){
        return [
            'verified_at' => 'datetime',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('status_verifikasi', true);
    }

    // Scope: berdasarkan kategori
    public function scopeByCategory($query, string $jenisLayanan){
        return $query->where('jenis_jasa', $jenisLayanan);
    }

    public function MitraAccess(){
        return $this->hasOne(MitraLoginAccess::class, 'id_mitra');
    }

    public function MitraImageAsset(){
        return $this->hasMany(MitraImageAsset::class, 'id_mitra');
    }

    public function Layanan(){
        return $this->hasMany(Layanan::class, 'id_mitra', 'id_mitra');
    }

    public function Admin(){
        return $this->belongsTo(Admin::class, 'id_admin', 'id_mitra');
    }

    public function Pesanan(){
        return $this->hasMany(Pesanan::class, 'id_mitra', 'id_mitra');
    }

    public function Ulasan(){
        return $this->hasManyThrough(
            Ulasan::class,
            Pesanan::class,
            'id_mitra',   // FK di tabel pesanan
            'id_pesanan', // FK di tabel ulasan
            'id_mitra',   // PK di tabel mitra
            'id_pesanan'  // PK di tabel pesanan
        );
    }
}
