<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Admin extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'admin';

    protected $primaryKey = 'id_admin';

    public $timestamps = false;

    protected $fillable = [
        'nama_admin',
        'email',
        'password',
        'nomor_telepon'
    ];

    protected $hidden = ['password'];

    protected function casts(): array{
        return [
            'password'   => 'hashed',
            'created_at' => 'datetime',
        ];
    }

    public function Mitra(){
        return $this->hasMany(Mitra::class, localKey: 'id_admin');
    }
}
