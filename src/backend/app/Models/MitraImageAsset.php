<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MitraImageAsset extends Model
{
    protected $table = 'mitra_asset_image';

    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'id_mitra',
        'description',
        'image_file'
    ];

    public function Mitra(): BelongsTo
    {
        return $this->belongsTo(Mitra::class, 'id_mitra', 'id_mitra');
    }

    public function getImageFileAttribute(): ?string
    {
        return $this->attributes['image_file'] ?? null;
    }
}
