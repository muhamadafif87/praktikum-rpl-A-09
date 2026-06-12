<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Override;

class Pesanan extends Model
{

    protected $table = 'pesanan';
    protected $primaryKey = 'id_pesanan';

    public $timestamps = false;

    const STATUS_MENUNGGU    = 'pending';
    const STATUS_PROSES      = 'diproses';
    const STATUS_SIAP        = 'siap';
    const STATUS_SELESAI     = 'selesai';
    const STATUS_DIBATALKAN  = 'dibatalkan';

    const STATUSES = [
        self::STATUS_MENUNGGU,
        self::STATUS_PROSES,
        self::STATUS_SIAP,
        self::STATUS_SELESAI,
        self::STATUS_DIBATALKAN,
    ];

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

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status_pesanan', $status);
    }

    public function scopeSelesai($query)
    {
        return $query->where('status_pesanan', self::STATUS_SELESAI);
    }

    public function DetailPesanan()
    {
        return $this->hasMany(DetailPesanan::class, 'id_pesanan');
    }

    public function Ulasan()
    {
        return $this->hasOne(Ulasan::class, 'id_pesanan');
    }

    public function Pembayaran()
    {
        return $this->hasOne(Pembayaran::class, 'id_pesanan');
    }

    public function TransaksiKeuangan()
    {
        return $this->hasOne(TransaksiKeuangan::class, 'id_pesanan');
    }

    public function User()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function Mitra()
    {
        return $this->belongsTo(Mitra::class, 'id_mitra', 'id_mitra');
    }
}
