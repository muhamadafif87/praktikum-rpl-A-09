<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransaksiKeuangan extends Model
{
    protected $table = 'transaksi_keuangan';
    protected $primaryKey = 'id';

    public $timestamps = false;

    const STATUS_TERSEDIA = 'Tersedia';
    const STATUS_TERTAHAN = 'Tertahan (Escrow)';

    protected $fillable = [
        'id_transaksi',
        'id_mitra',
        'id_pesanan',
        'nama_pelanggan',
        'jumlah',
        'status_dana',
        'tanggal_transaksi',
    ];

    protected $casts = [
        'jumlah'             => 'decimal:2',
        'tanggal_transaksi'  => 'datetime',
    ];

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeTersedia($query)
    {
        return $query->where('status_dana', self::STATUS_TERSEDIA);
    }

    public function scopeTertahan($query)
    {
        return $query->where('status_dana', self::STATUS_TERTAHAN);
    }

    // ─── Relasi ───────────────────────────────────────────────────────────────

    public function Mitra()
    {
        return $this->belongsTo(Mitra::class, 'id_mitra', 'id_mitra');
    }

    public function Pesanan()
    {
        return $this->belongsTo(Pesanan::class, 'id_pesanan', 'id_pesanan');
    }
}
