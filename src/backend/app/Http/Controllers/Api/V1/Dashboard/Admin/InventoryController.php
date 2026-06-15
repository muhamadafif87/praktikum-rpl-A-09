<?php

namespace App\Http\Controllers\Api\V1\Dashboard\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Admin\InventoryFilterRequest;
use App\Services\Admin\InventoryService as AdminInventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(
        protected AdminInventoryService $inventoryService
    ){}

    /**
     * GET /admin/dashboard/inventory/list
     * Daftar inventaris lintas mitra dengan filter dan pagination.
     */

    public function inventoryList(InventoryFilterRequest $request): JsonResponse
    {
        $filters  = $request->validated();
        $perPage  = $filters['per_page'] ?? 10;

        $paginated = $this->inventoryService->getInventoryList($filters, $perPage);

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
}
