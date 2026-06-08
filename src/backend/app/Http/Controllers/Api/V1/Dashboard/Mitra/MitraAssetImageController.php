<?php

namespace App\Http\Controllers\Api\V1\Dashboard\Mitra;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Mitra\StoreMitraImageAssetRequest;
use App\Http\Requests\Dashboard\Mitra\UpdateMitraImageAssetRequest;
use App\Services\MitraImageAssetService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Throwable;

class MitraAssetImageController extends Controller
{
    public function __construct(
        private readonly MitraImageAssetService $service
    ) {}

    public function index(int $idMitra): JsonResponse
    {
        try {
            $assets = $this->service->getByMitra($idMitra);

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil daftar gambar.',
                'data'    => $assets,
            ]);
        } catch (Throwable $e) {
            return $this->serverError($e);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $asset = $this->service->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil data gambar.',
                'data'    => $asset,
            ]);
        } catch (ModelNotFoundException) {
            return $this->notFound();
        } catch (Throwable $e) {
            return $this->serverError($e);
        }
    }

    /**
     * Form-data keys:
     *   - id_mitra    (integer, required)
     *   - description (string, optional)
     *   - image       (file, required)
     */
    public function store(StoreMitraImageAssetRequest $request): JsonResponse
    {
        try {
            $asset = $this->service->store([
                'id_mitra'    => $request->integer('id_mitra'),
                'description' => $request->input('description'),
                'image'       => $request->file('image'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Gambar berhasil diupload.',
                'data'    => $asset,
            ], 201);
        } catch (Throwable $e) {
            return $this->serverError($e);
        }
    }

    // ── POST /api/mitra-images/{id} (method-spoofing PUT) ───────────────────

    /**
     * Update gambar / deskripsi.
     *
     * Form-data keys (semua opsional):
     *   - description (string)
     *   - image       (file)
     *
     * Catatan: gunakan POST + _method=PUT karena multipart/form-data
     * tidak kompatibel dengan verb PUT di banyak client.
     */
    public function update(UpdateMitraImageAssetRequest $request, int $id): JsonResponse
    {
        try {
            $asset = $this->service->update($id, [
                'description' => $request->input('description'),
                'image'       => $request->file('image'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Gambar berhasil diperbarui.',
                'data'    => $asset,
            ]);
        } catch (ModelNotFoundException) {
            return $this->notFound();
        } catch (Throwable $e) {
            return $this->serverError($e);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->destroy($id);

            return response()->json([
                'success' => true,
                'message' => 'Gambar berhasil dihapus.',
                'data'    => null,
            ]);
        } catch (ModelNotFoundException) {
            return $this->notFound();
        } catch (Throwable $e) {
            return $this->serverError($e);
        }
    }

    private function notFound(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Data gambar tidak ditemukan.',
            'data'    => null,
        ], 404);
    }

    private function serverError(Throwable $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Terjadi kesalahan pada server.',
            'error'   => config('app.debug') ? $e->getMessage() : null,
        ], 500);
    }
}
