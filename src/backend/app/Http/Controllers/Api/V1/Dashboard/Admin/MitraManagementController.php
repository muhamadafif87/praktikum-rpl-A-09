<?php

namespace App\Http\Controllers\Api\V1\Dashboard\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Admin\MitraActionRequest;
use App\Http\Requests\Dashboard\Admin\MitraFilterRequest;
use App\Services\Admin\MitraManagementService;
use App\Services\Admin\StatisticService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MitraManagementController extends Controller
{
    public function __construct(
        protected StatisticService $statisticService,
        protected MitraManagementService $mitraManagementService
    ){}


    /**
     * GET /admin/dashboard/mitra/list
     * Daftar mitra dengan filter search, jenis layanan, status, dan rating.
     */
    public function MitraList(MitraFilterRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $perPage = $filters['per_page'] ?? 10;

        $paginated = $this->mitraManagementService->getMitraList($filters, $perPage);

        return response()->json([
            'status'     => 'success',
            'list_mitra' => $paginated->items(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
                'last_page'    => $paginated->lastPage(),
            ],
        ]);
    }

    /**
     * GET /admin/dashboard/mitra/active-Mitra
     * Daftar mitra yang sedang aktif beserta load status & rating.
     */
    public function overviewActiveMitra(): JsonResponse
    {
        $data = $this->mitraManagementService->getActiveMitra();

        return response()->json([
            'status'     => 'success',
            'list_mitra' => $data,
        ]);
    }

    /**
     * GET /admin/dashboard/admin/mitra/{idMitra}
     * Detail satu mitra beserta list layanan dan rekap pesanan.
     */
    public function MitraDetail(int $idMitra): JsonResponse
    {
        $data = $this->mitraManagementService->getMitraDetail($idMitra);

        if (!$data) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Mitra tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }


    /**
     * PATCH /admin/dashboard/mitra/action
     * Activate atau suspend sebuah mitra.
     */
    public function MitraAction(MitraActionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->mitraManagementService->updateMitraStatus(
            $validated['id_mitra'],
            $validated['action']
        );

        return response()->json([
            'status'  => 'success',
            'message' => $result['message'],
        ]);
    }
}
