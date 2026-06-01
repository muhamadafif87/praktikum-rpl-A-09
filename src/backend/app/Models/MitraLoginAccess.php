<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class MitraLoginAccess extends Authenticatable{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'mitra_login_access';
    public $timestamps = false;
    protected $primaryKey = 'id_mitra_user';

    protected $foreignKey = 'id_mitra';

    protected $hidden = ['password'];

    protected function casts(){
        return [
            'password' => 'hashed',
        ];
    }

    public function Mitra(){
        return $this->hasOne(Mitra::class, 'id_mitra', 'id_mitra_user');
    }
}
