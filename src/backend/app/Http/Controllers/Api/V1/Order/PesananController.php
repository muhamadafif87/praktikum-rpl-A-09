<?php

namespace App\Http\Controllers\Api\V1\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CreatePesananRequest;
use App\Http\Requests\Order\GenerateFeeRequest;
use App\Http\Requests\Order\RiwayatPesananRequest;
use App\Http\Requests\Order\DetailPesananRequest;
use App\Http\Requests\Order\RiwayatPesananRequest as RequestsRiwayatPesananRequest;
use App\Services\PesananService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PesananController extends Controller {
    protected PesananService $PesananService;

    public function __construct(PesananService $PesananService)
    {
        $this->PesananService = $PesananService;
    }

    public function createPesanan(CreatePesananRequest $request): JsonResponse
    {
        try {
            /** @var \App\Models\User $user */
            $user = $request->user();

            $data = $this->PesananService->createPesanan(
                idUser:            (string) $user->id_user,
                idMitra:           $request->input('idMitra'),
                typeLayanan:       $request->input('typeLayanan'),
                items:             $request->input('items'),
                jarakOngkir:       $request->input('jarakOngkir'),
                jadwalLayanan:     $request->input('jadwal_layanan', []),
                estimasi:          $request->input('estimasi', []),
                biayaTambahan:     $request->input('biayaTambahan', []),
                catatanPengiriman: $request->input('catatanPengiriman'),
            );

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat.',
                'data'    => $data,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    // -------------------------------------------------------------------------
    // GET /landing-page/pesanan/riwayat  (user)
    // -------------------------------------------------------------------------
    public function riwayatPesananUser(RequestsRiwayatPesananRequest $request): JsonResponse
    {
        try {
            /** @var \App\Models\User $user */
            $user = $request->user();

            $data = $this->PesananService->riwayatPesananUser(
                idUser:     (string) $user->id_user,
                status:     $request->input('status'),
                tglDari:    $request->input('tgl_dari'),
                tglSampai:  $request->input('tgl_sampai'),
                perPage:    (int) $request->input('per_page', 10),
            );

            return response()->json([
                'success' => true,
                'message' => 'Riwayat pesanan berhasil didapatkan.',
                'data'    => $data['data'],
                'meta'    => $data['meta'],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // -------------------------------------------------------------------------
    // GET /mitra/pesanan/riwayat  (mitra)
    // -------------------------------------------------------------------------
    public function riwayatPesananMitra(RiwayatPesananRequest $request): JsonResponse
    {
        try {
            // Guard mitra menggunakan MitraLoginAccess, ambil id_mitra dari relasi
            /** @var \App\Models\MitraLoginAccess $mitraAccess */
            $mitraAccess = $request->user('mitra');
            $idMitra     = (string) $mitraAccess->id_mitra;

            $data = $this->PesananService->riwayatPesananMitra(
                idMitra:    $idMitra,
                status:     $request->input('status'),
                tglDari:    $request->input('tgl_dari'),
                tglSampai:  $request->input('tgl_sampai'),
                perPage:    (int) $request->input('per_page', 10),
            );

            return response()->json([
                'success' => true,
                'message' => 'Riwayat pesanan berhasil didapatkan.',
                'data'    => $data['data'],
                'meta'    => $data['meta'],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // -------------------------------------------------------------------------
    // GET /landing-page/pesanan/{idUniquePesanan}  (user & mitra)
    // -------------------------------------------------------------------------
    public function showDetailPesanan(Request $request, string $idUniquePesanan): JsonResponse
    {
        try {
            $user = $request->user();
            $idUser = $user->id_user;
            $data = $this->PesananService->showDetailPesanan($idUniquePesanan, $idUser);

            return response()->json([
                'success' => true,
                'message' => 'Detail pesanan berhasil didapatkan.',
                'data'    => $data,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    // -------------------------------------------------------------------------
    // PATCH /landing-page/pesanan/{idUniquePesanan}/cancel  (user)
    // -------------------------------------------------------------------------
    public function cancelPesananUser(Request $request, string $idUniquePesanan): JsonResponse {
        try {
            /** @var \App\Models\User $user */
            $user = $request->user();

            $data = $this->PesananService->cancelPesananUser(
                idUniquePesanan: $idUniquePesanan,
                idUser:          (string) $user->id_user,
            );

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibatalkan.',
                'data'    => $data,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    // -------------------------------------------------------------------------
    // PATCH /mitra/pesanan/{idUniquePesanan}/cancel  (mitra)
    // -------------------------------------------------------------------------
    public function cancelPesananMitra(Request $request, string $idUniquePesanan): JsonResponse
    {
        try {
            /** @var \App\Models\MitraLoginAccess $mitraAccess */
            $mitraAccess = $request->user('mitra');
            $idMitra     = (string) $mitraAccess->id_mitra;

            $data = $this->PesananService->cancelPesananMitra(
                idUniquePesanan: $idUniquePesanan,
                idMitra:         $idMitra,
            );

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibatalkan.',
                'data'    => $data,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
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

    public function estimateFeePesanan(GenerateFeeRequest $request)
    {
        try {
            $idMitra           = $request->input('idMitra');
            $typeLayanan       = $request->input('typeLayanan');
            $layananList       = $request->input('items');
            $jarakOngkir       = $request->input('jarakOngkir');
            $biayaTambahan     = $request->input('biayaTambahan', []);
            $biayaTambahanAlat = $request->input('biayaTambahanAlat', []); // khusus daily_cleaning

            $data = $this->PesananService->estimateFeePesanan(
                $idMitra,
                $typeLayanan,
                $layananList,
                $jarakOngkir,
                $biayaTambahan,
                $biayaTambahanAlat
            );

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil didapatkan',
                'data'    => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data: ' . $e->getMessage()
            ], 500);
        }
    }
}
