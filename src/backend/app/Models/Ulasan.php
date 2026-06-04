<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ulasan extends Model
{
    protected $table = 'ulasan';

    public $timestamps = false;

    protected $primaryKey = 'id_ulasan';

    protected $fillable = [
        'id_pesanan',
        'rating',
        'komentar'
    ];

    public function casts(){
        return [
            'created_at' => 'datetime'
        ];
    }

    public function Pesanan(){
        return $this->belongsTo(Pesanan::class, 'id_pesanan', 'id_pesanan');
    }
}
