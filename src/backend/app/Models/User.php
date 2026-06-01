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
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password'   => 'hashed',
            'created_at' => 'datetime',
        ];
    }

    public function Pesanan(){
        return $this->hasMany(Pesanan::class, localKey: 'id_user');
    }
}
