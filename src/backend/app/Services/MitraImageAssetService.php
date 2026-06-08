<?php

namespace App\Services;

use App\Models\MitraImageAsset;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class MitraImageAssetService
{
    public function getByMitra(int $idMitra): Collection
    {
        return MitraImageAsset::where('id_mitra', $idMitra)->get();
    }

    /**
     *
     * @throws ModelNotFoundException
     */
    public function findOrFail(int $id): MitraImageAsset
    {
        return MitraImageAsset::findOrFail($id);
    }

    /**
     *
     * @param  array{id_mitra: int, description: string|null, image: UploadedFile}  $data
     */
    public function store(array $data): MitraImageAsset
    {
        $binary = $this->readBinary($data['image']);

        return MitraImageAsset::create([
            'id_mitra'    => $data['id_mitra'],
            'description' => $data['description'] ?? null,
            'image_file'  => $binary,
        ]);
    }

    /**
     *
     * @param  array{description?: string|null, image?: UploadedFile|null}  $data
     *
     * @throws ModelNotFoundException
     */
    public function update(int $id, array $data): MitraImageAsset
    {
        $asset = $this->findOrFail($id);

        $payload = [];

        if (array_key_exists('description', $data)) {
            $payload['description'] = $data['description'];
        }

        if (!empty($data['image'])) {
            $payload['image_file'] = $this->readBinary($data['image']);
        }

        if (!empty($payload)) {
            $asset->fill($payload)->save();
        }

        return $asset->fresh();
    }

    /**
     *
     * @throws ModelNotFoundException
     */
    public function destroy(int $id): void
    {
        $asset = $this->findOrFail($id);
        $asset->delete();
    }

    /**
     * PostgreSQL BYTEA membutuhkan konten binary mentah — bukan path file.
     */
    private function readBinary(UploadedFile $file): string
    {
        return file_get_contents($file->getRealPath());
    }
}
