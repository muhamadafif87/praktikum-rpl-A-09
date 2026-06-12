<?php

namespace App\Http\Controllers\Api\V1\Dashboard\Mitra;

use App\Http\Controllers\Api\V1\ApiController as V1ApiController;
use App\Http\Requests\Dashboard\Mitra\Layanan\StoreLayananRequest as LayananStoreLayananRequest;
use App\Http\Requests\Mitra\Layanan\UpdateLayananRequest;
use App\Models\Layanan;
use App\Models\Mitra;
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
        $mitraUser = auth('mitra-api')->user();
        $layanan   = $this->layananService->index($mitraUser);

        return $this->success($layanan);
    }

    public function stok(Request $request): JsonResponse{
        $mitraUser = auth('mitra-api')->user();
        $stok   = $this->layananService->stok($mitraUser);

        return response()->json([
            'success' => true,
            'data' => $stok
        ]);
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
            $mitraUser = auth('mitra-api')->user();
            $layanan   = $this->layananService->toggle($mitraUser, $id);
            $statusMsg = $layanan->is_aktif ? 'diaktifkan' : 'dinonaktifkan';

            return $this->success($layanan, "Layanan berhasil {$statusMsg}.");

        } catch (ModelNotFoundException $e) {
            return $this->error($e->getMessage(), 404);
        }
    }

    public function stokManagement(Request $request)
    {
        try {
            $mitraId = auth('mitra-api')->user();

            $filters = [
                'search' => $request->query('search'),
                'status' => $request->query('status'),
            ];

            // Panggil Service
            $items = $this->layananService->stokManagement($mitraId, $filters);

            // Return response JSON sesuai ekspektasi MitraInventory.jsx
            return response()->json([
                'success' => true,
                'message' => 'Data inventaris berhasil diambil.',
                'data'    => [
                    'items' => $items
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data inventaris: ' . $e->getMessage(),
                'data'    => null
            ], 500);
        }
    }

    public function updateStok(Request $request, $id)
    {
        $request->validate([
            'stok' => 'required|integer|min:0'
        ]);

        try {
            $mitraId = auth('mitra-api')->user();
            $stokBaru = $request->input('stok');

            // Panggil service untuk eksekusi update
            $layananUpdated = $this->layananService->updateStok($id, $mitraId, $stokBaru);

            return response()->json([
                'success' => true,
                'message' => 'Stok produk berhasil diperbarui.',
                'data'    => [
                    'id'          => $layananUpdated->id_layanan,
                    'stok_update' => $layananUpdated->stok_tersedia
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui stok: ' . $e->getMessage()
            ], 403);
        }
    }
}
