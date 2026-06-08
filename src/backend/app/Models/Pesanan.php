<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Override;

class Pesanan extends Model
{

    protected $table = 'pesanan';
    protected $primaryKey = 'id_pesanan';

    public $timestamps = false;

    protected $fillable = [
        'id_unique_pesanan',
        'id_user',
        'id_mitra',
        'status_pesanan',
        'tgl_pesanan',
        'catatan'
    ];

    #[Override]
    protected function casts(){
        return [
            'tgl_pesanan' => 'datetime',
            'catatan' => 'array'
        ];
    }

    public function DetailPesanan(){
        return $this->hasMany(DetailPesanan::class, 'id_pesanan');
    }

    public function Ulasan(){
        return $this->hasOne(Ulasan::class, 'id_pesanan', 'id_pesanan');
    }

    public function Pembayaran(){
        return $this->hasOne(Pembayaran::class, 'id_pesanan');
    }

    public function User(){
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function Mitra(){
        return $this->belongsTo(Mitra::class, 'id_mitra', 'id_mitra');
    }
}
