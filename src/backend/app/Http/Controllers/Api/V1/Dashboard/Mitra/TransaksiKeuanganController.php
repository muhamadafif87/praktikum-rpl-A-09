<?php

namespace App\Http\Controllers\Api\V1\Dashboard\Mitra;

use App\Http\Controllers\Api\V1\ApiController as V1ApiController;
use App\Http\Controllers\ApiController;
use App\Http\Requests\Dashboard\Mitra\Ulasan\IndexTransaksiRequest as UlasanIndexTransaksiRequest;
use App\Http\Requests\Mitra\TransaksiKeuangan\IndexTransaksiRequest;
use App\Services\Mitra\TransaksiKeuanganService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransaksiKeuanganController extends V1ApiController
{
    public function __construct(private readonly TransaksiKeuanganService $transaksiService) {}

    /**
     * GET /v1/mitra/keuangan/transaksi
     * List transaksi dengan filter status_dana + search + pagination.
     */
    public function index(UlasanIndexTransaksiRequest $request): JsonResponse
    {
        $mitraUser = $request->user('mitra');
        $paginator = $this->transaksiService->index($mitraUser, $request->validated());

        return $this->paginated($paginator);
    }

    /**
     * GET /v1/mitra/keuangan/ringkasan
     * Total tersedia, tertahan, dan grand total untuk widget finansial.
     */
    public function ringkasan(Request $request): JsonResponse
    {
        $mitraUser = $request->user('mitra');
        $data      = $this->transaksiService->ringkasan($mitraUser);

        return $this->success($data);
    }
}
