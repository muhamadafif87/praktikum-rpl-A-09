<?php

namespace App\Http\Controllers\Api\V1\Dashboard\Mitra;

use App\Http\Controllers\Api\V1\ApiController as V1ApiController;
use App\Http\Requests\Dashboard\Mitra\Layanan\StoreLayananRequest as LayananStoreLayananRequest;
use App\Http\Requests\Mitra\Layanan\UpdateLayananRequest;
use App\Services\Mitra\LayananService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use RuntimeException;

class LayananController extends V1ApiController
{
    public function __construct(private readonly LayananService $layananService) {}

    /**
     * GET /v1/mitra/layanan
     * List semua layanan milik mitra.
     */
    public function index(Request $request): JsonResponse
    {
        $mitraUser = $request->user('mitra');
        $layanan   = $this->layananService->index($mitraUser);

        return $this->success($layanan);
    }

    /**
     * POST /v1/mitra/layanan
     * Tambah layanan baru ke katalog.
     */
    public function store(LayananStoreLayananRequest $request): JsonResponse
    {
        $mitraUser = $request->user('mitra');
        $layanan   = $this->layananService->store($mitraUser, $request->validated());

        return $this->success($layanan, 'Layanan berhasil ditambahkan.', 201);
    }

    /**
     * GET /v1/mitra/layanan/{id}
     * Detail satu layanan.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $mitraUser = $request->user('mitra');
            $layanan   = $this->layananService->show($mitraUser, $id);

            return $this->success($layanan);

        } catch (ModelNotFoundException $e) {
            return $this->error($e->getMessage(), 404);
        }
    }

    /**
     * PUT /v1/mitra/layanan/{id}
     * Update data layanan.
     */
    public function update(UpdateLayananRequest $request, int $id): JsonResponse
    {
        try {
            $mitraUser = $request->user('mitra');
            $layanan   = $this->layananService->update($mitraUser, $id, $request->validated());

            return $this->success($layanan, 'Layanan berhasil diperbarui.');

        } catch (ModelNotFoundException $e) {
            return $this->error($e->getMessage(), 404);
        }
    }

    /**
     * DELETE /v1/mitra/layanan/{id}
     * Hapus layanan (dicegah jika masih ada pesanan aktif).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $mitraUser = $request->user('mitra');
            $this->layananService->destroy($mitraUser, $id);

            return $this->success(null, 'Layanan berhasil dihapus.');

        } catch (ModelNotFoundException $e) {
            return $this->error($e->getMessage(), 404);
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage(), 409); // 409 Conflict
        }
    }

    /**
     * PATCH /v1/mitra/layanan/{id}/toggle
     * Toggle status aktif/nonaktif layanan.
     */
    public function toggle(Request $request, int $id): JsonResponse
    {
        try {
            $mitraUser = $request->user('mitra');
            $layanan   = $this->layananService->toggle($mitraUser, $id);
            $statusMsg = $layanan->is_aktif ? 'diaktifkan' : 'dinonaktifkan';

            return $this->success($layanan, "Layanan berhasil {$statusMsg}.");

        } catch (ModelNotFoundException $e) {
            return $this->error($e->getMessage(), 404);
        }
    }
}
