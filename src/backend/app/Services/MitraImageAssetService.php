<?php

namespace App\Services;

use App\Models\MitraImageAsset;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class MitraImageAssetService
{
    public function __construct(
        private readonly SupabaseStorageService $storage
    ) {}

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
        // Upload to Supabase Storage
        $imageUrl = $this->storage->upload(
            $data['image'],
            'mitra/' . $data['id_mitra']  // Organize by mitra ID
        );

        return MitraImageAsset::create([
            'id_mitra'    => $data['id_mitra'],
            'description' => $data['description'] ?? null,
            'image_url'   => $imageUrl,  // Store URL instead of binary
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
            // Update image in Supabase Storage
            $newImageUrl = $this->storage->update(
                $asset->image_url,
                $data['image'],
                'mitra/' . $asset->id_mitra
            );
            $payload['image_url'] = $newImageUrl;
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

        // Delete from Supabase Storage
        if ($asset->image_url) {
            $this->storage->delete($asset->image_url);
        }

        $asset->delete();
    }
}
