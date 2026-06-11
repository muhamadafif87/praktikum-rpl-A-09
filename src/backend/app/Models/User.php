<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $primaryKey = 'id_user';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'nama_lengkap',
        'email',
        'password',
        'nomor_telepon',
        'alamat_kost',
        'latitude',
        'longitude',
        'address_detail',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password'   => 'hashed',
            'created_at' => 'datetime',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function Pesanan(){
        return $this->hasMany(Pesanan::class, 'id_user', 'id_user');
    }

    public function Ulasan(){
        return $this->hasManyThrough(
            Ulasan::class,
            Pesanan::class,
            'id_user',
            'id_pesanan',
            'id_user',
            'id_pesanan'
        );
    }
}
