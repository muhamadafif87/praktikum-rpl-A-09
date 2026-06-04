<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Layanan extends Model {
    protected $table = 'layanan';

    public $timestamps = false;

    protected $fillable = [
        'id_mitra',
        'nama_layanan',
        'harga',
        'satuan'
    ];

    public function Mitra(){
        return $this->belongsTo(Mitra::class, 'id_mitra', 'id_mitra');
    }

    public function DetailPesanan(){
        return $this->hasMany(DetailPesanan::class, localKey: 'id_layanan');
    }
}
