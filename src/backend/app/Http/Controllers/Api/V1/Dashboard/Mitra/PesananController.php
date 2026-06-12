<?php

namespace App\Http\Controllers\Api\V1\Dashboard\Mitra;

use App\Http\Controllers\Api\V1\ApiController as V1ApiController;
use App\Http\Controllers\ApiController;
use App\Http\Requests\Dashboard\Mitra\Pesanan\IndexPesananRequest as PesananIndexPesananRequest;
use App\Http\Requests\Dashboard\Mitra\Pesanan\UpdateStatusPesananRequest as PesananUpdateStatusPesananRequest;
use App\Http\Requests\Mitra\Pesanan\IndexPesananRequest;
use App\Http\Requests\Mitra\Pesanan\UpdateStatusPesananRequest;
use App\Services\Mitra\PesananService;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use InvalidArgumentException;

class PesananController extends V1ApiController
{
    public function __construct(private readonly PesananService $pesananService) {}

    /**
     * GET /v1/mitra/pesanan
     * List pesanan dengan filter status + search + pagination.
     */
    public function index(PesananIndexPesananRequest $request): JsonResponse
    {
        $mitraUser = auth('mitra-api')->user();
        $paginator = $this->pesananService->index($mitraUser, $request->validated());

        return $this->paginated($paginator);
    }

    /**
     * GET /v1/mitra/pesanan/{id}
     * Detail satu pesanan beserta item dan ulasan.
     */
    public function show(PesananIndexPesananRequest $request, int $id): JsonResponse
    {
        try {
            $mitraUser = auth('mitra-api')->user();
            $pesanan   = $this->pesananService->show($mitraUser, $id);

            $responseData = [
                'status'            => $pesanan->status_pesanan,
                'id_unique_pesanan' => $pesanan->id_unique_pesanan,
                'pelanggan'         => [
                    'nama_lengkap'    => $pesanan->User->nama_lengkap ?? '-',
                    'alamat_kost'     => $pesanan->User->alamat_kost ?? '-',
                    'tanggal_pesan'   => $pesanan->tgl_pesanan,
                    'catatan_pesanan' => $pesanan->catatan['note'],
                ],
                'item_pesanan'      => [
                    'items' => $pesanan->DetailPesanan->map(function ($item) {
                        return [
                            'layanan'  => $item->layanan->nama_layanan ?? '-',
                            'qty'      => (int) ($item->jumlah ?? 1),
                            'harga'    => (int) ($item->harga ?? 0),
                            'subtotal' => (int) ($item->subtotal ?? (($item->harga ?? 0) * ($item->jumlah ?? 1))),
                        ];
                    })->toArray(),
                    'total_pembayaran'  => (int) ($pesanan->catatan['total_pembayaran'] ?? 0),
                    'metode_pembayaran' => $pesanan->Pembayaran->metode_pembayaran ?? 'Transfer',
                    'status_pembayaran' => $pesanan->Pembayaran->status_pembayaran ?? 'Lunas',
                ],
                'ulasan'            => $pesanan->Ulasan ? [
                    'rating'   => (int) $pesanan->Ulasan->rating,
                    'komentar' => $pesanan->Ulasan->komentar,
                ] : null,
            ];

            return $this->success($responseData);

        } catch (ModelNotFoundException $e) {
            return $this->error($e->getMessage(), 404);
        }
    }

    public function stats(Request $request): JsonResponse
    {
        $mitraUser = auth('mitra-api')->user();
        $data      = $this->pesananService->stats($mitraUser);

        return $this->success($data);
    }

    /**
     * PATCH /v1/mitra/pesanan/{id}/status
     * Update status alur kerja pesanan.
     */
    public function updateStatus(PesananUpdateStatusPesananRequest $request, int $id): JsonResponse
    {
        try {
            $mitraUser  = auth('mitra-api')->user();
            $newStatus  = $request->validated('status_pesanan');
            $pesanan    = $this->pesananService->updateStatus($mitraUser, $id, $newStatus);

            return $this->success($pesanan, 'Status pesanan berhasil diperbarui.');

        } catch (ModelNotFoundException $e) {
            return $this->error($e->getMessage(), 404);
        } catch (InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}
