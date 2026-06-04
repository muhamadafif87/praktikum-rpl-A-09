<?php

namespace App\Http\Controllers\Api\V1\Page;

use App\Http\Controllers\Controller;
use App\Services\LandingPageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LandingPageController extends Controller
{
    private LandingPageService $landingPageService;

    public function __construct(LandingPageService $landingPageService)
    {
        $this->landingPageService = $landingPageService;
    }

    /**
     * Get statistik landing page
     * @return JsonResponse
     */
    public function statistic(): JsonResponse
    {
        try {
            $data = $this->landingPageService->statistic();

            return response()->json([
                'success' => true,
                'message' => 'Statistik berhasil diambil',
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search layanan
     * @param Request $request
     * @return JsonResponse
     */
    public function searchLayanan(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'query' => 'required|string|min:1'
            ]);

            $query = $request->input('query');
            $data = $this->landingPageService->searchLayanan($query);

            return response()->json([
                'success' => true,
                'message' => 'Data layanan berhasil diambil',
                'data' => $data
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencari layanan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get layanan laundry express
     * @param Request $request
     * @return JsonResponse
     */
    public function laundryExpress(Request $request): JsonResponse
    {
        try {
            $kategori = $request->input('kategori', ['All']);
            $sortBy = $request->input('sortBy', 'Terbaik');

            if (!is_array($kategori)) {
                $kategori = ['All'];
            }

            $data = $this->landingPageService->laundryExpress($kategori, $sortBy);

            return response()->json([
                'success' => true,
                'message' => 'Data layanan laundry express berhasil diambil',
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data layanan laundry express: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get layanan galon/gas
     * @param Request $request
     * @return JsonResponse
     */
    public function galonGas(Request $request): JsonResponse
    {
        try {
            $kategori = $request->input('kategori', ['All']);
            $sortBy = $request->input('sortBy', 'Terbaik');

            if (!is_array($kategori)) {
                $kategori = ['All'];
            }

            $data = $this->landingPageService->galonGas($kategori, $sortBy);

            return response()->json([
                'success' => true,
                'message' => 'Data layanan galon/gas berhasil diambil',
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data layanan galon/gas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get layanan daily cleaning
     * @param Request $request
     * @return JsonResponse
     */
    public function dailyCleaning(Request $request): JsonResponse
    {
        try {
            $kategori = $request->input('kategori', ['All']);
            $sortBy = $request->input('sortBy', 'Terbaik');

            if (!is_array($kategori)) {
                $kategori = ['All'];
            }

            $data = $this->landingPageService->dailyCleaning($kategori, $sortBy);

            return response()->json([
                'success' => true,
                'message' => 'Data layanan daily cleaning berhasil diambil',
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data layanan daily cleaning: ' . $e->getMessage()
            ], 500);
        }
    }
}
