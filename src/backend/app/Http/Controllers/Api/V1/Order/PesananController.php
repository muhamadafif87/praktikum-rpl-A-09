<?php

namespace App\Http\Controllers\Api\V1\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\DetailPesananRequest;
use App\Services\PesananService;
use Illuminate\Http\Request;

class PesananController extends Controller
{
    public function createPesanan(){
        //
    }

    private function generateIdPesanan(){
        //
    }

    public function showRiwayatPesanan(){
        //
    }

    public function cancelPesanan(){
        //
    }

    protected PesananService $PesananService;

    public function __construct(PesananService $PesananService)
    {
        $this->PesananService = $PesananService;
    }

    public function seedingDetailPesanan(DetailPesananRequest $request)
    {
        try {
            $type_layanan = $request->input('type_layanan', 'laundry');
            $id_mitra = $request->input('id_mitra');

            $data = $this->PesananService->seedingDetailPesanan($type_layanan, $id_mitra);

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil didapatkan',
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data: ' . $e->getMessage()
            ], 500);
        }
    }
}
