<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    protected $table = 'pembayaran';

    protected $primaryKey = 'id_pembayaran';

    public $timestamps = false;

    protected $fillable = [
        'id_pesanan',
        'metode_pembayaran',
        'jumlah_bayar',
        'status_pembayaran',
        'bukti_pembayaran',
        'id_transaksi'
    ];

    public function casts(){
        return [
            'tgl_bayar' => 'datetime'
        ];
    }

    public function Pesanan(){
        return $this->belongsTo(Pesanan::class, 'id_pesanan');
    }
}
