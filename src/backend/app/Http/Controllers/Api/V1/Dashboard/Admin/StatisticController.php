<?php

namespace App\Http\Controllers\Api\V1\Dashboard\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\StatisticService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatisticController extends Controller
{
    public function __construct(
        protected StatisticService $statisticService
    ) {}

    /**
     * GET /admin/dashboard/statistic/summary
     * Ringkasan total transaksi dan info mitra aktif.
     */
    public function overviewSummary(): JsonResponse
    {
        $data = $this->statisticService->getOverviewSummary();

        return response()->json([
            'status'           => 'success',
            'total_transaksi'  => $data['total_transaksi'],
            'mitra'            => $data['mitra'],
        ]);
    }

    /**
     * GET /admin/dashboard/inventory/summary
     * Ringkasan total layanan, stok rendah, dan stok habis.
     */
    public function inventorySummary(): JsonResponse
    {
        $data = $this->statisticService->getInventorySummary();

        return response()->json([
            'status'                   => 'success',
            'total_layanan'            => $data['total_layanan'],
            'persentase_ketersediaan'  => $data['persentase_ketersediaan'],
            'layanan_stok_rendah'      => $data['layanan_stok_rendah'],
            'layanan_stok_habis'       => $data['layanan_stok_habis'],
        ]);
    }

    /**
     * GET /admin/dashboard/mitra/summary
     * Ringkasan total, aktif, baru, dan suspend mitra.
     */
    public function mitraSummary(): JsonResponse
    {
        $data = $this->statisticService->getMitraSummary();

        return response()->json([
            'status'              => 'success',
            'total_mitra'         => $data['total_mitra'],
            'total_mitra_aktif'   => $data['total_mitra_aktif'],
            'jumlah_mitra_baru'   => $data['jumlah_mitra_baru'],
            'mitra_disuspend'     => $data['mitra_disuspend'],
        ]);
    }
}
