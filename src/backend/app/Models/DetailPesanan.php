<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailPesanan extends Model
{
    protected $table = 'detail_pesanan';

    protected $primaryKey = 'id_detail_pesanan';

    public $timestamps = false;

    protected $fillable = [
        'id_layanan',
        'id_pesanan',
        'jumlah',
        'harga',
        'subtotal'
    ];

    public function Pesanan(){
        return $this->belongsTo(Pesanan::class, 'id_pesanan', 'id_pesanan');
    }

    public function Layanan(){
        return $this->belongsTo(Layanan::class, 'id_layanan');
    }
}
