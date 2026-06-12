<?php

namespace App\Http\Controllers\Api\V1\Dashboard\Mitra;

use App\Http\Controllers\Api\V1\ApiController as V1ApiController;
use App\Http\Controllers\ApiController;
use App\Http\Requests\Mitra\Ulasan\IndexUlasanRequest;
use App\Services\Mitra\UlasanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UlasanController extends V1ApiController
{
    public function __construct(private readonly UlasanService $ulasanService) {}

    /**
     * GET /v1/mitra/ulasan
     * List ulasan dengan filter rating + search + pagination.
     */
    public function index(IndexUlasanRequest $request): JsonResponse
    {
        $mitraUser = $request->user('mitra');
        $paginator = $this->ulasanService->index($mitraUser, $request->validated());

        return $this->paginated($paginator);
    }

    /**
     * GET /v1/mitra/ulasan/statistik
     * Agregat performa: avg rating, total, distribusi per bintang.
     */
    public function statistik(Request $request): JsonResponse
    {
        $mitraUser = $request->user('mitra');
        $data      = $this->ulasanService->statistik($mitraUser);

        return $this->success($data);
    }
}
