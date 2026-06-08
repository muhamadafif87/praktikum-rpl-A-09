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

    protected $hidden = ['image_file'];

    protected $appends = ['image_base64'];

    public function Mitra(): BelongsTo
    {
        return $this->belongsTo(Mitra::class, 'id_mitra', 'id_mitra');
    }

    public function getImageBase64Attribute(): ?string
    {
        if (is_null($this->image_file)) {
            return null;
        }

        $binary = is_resource($this->image_file)
            ? stream_get_contents($this->image_file)
            : $this->image_file;

        return 'data:image/jpeg;base64,' . base64_encode($binary);
    }
}
