<?php

namespace App\Http\Controllers\Api\V1\Dashboard\Mitra;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Dashboard\Mitra\Settings\UpdateProfileMitraRequest;
use App\Http\Requests\Dashboard\Mitra\Settings\UpdateJadwalMitraRequest;
use App\Http\Requests\Dashboard\Mitra\Settings\UpdatePasswordMitraRequest;
use App\Services\Mitra\MitraProfileService;

class MitraProfileController extends Controller
{
    public function __construct(
        private readonly MitraProfileService $profileService
    ) {}

    /**
     * GET /v1/dashboard/mitra/settings
     *
     * Ambil semua data pengaturan mitra yang sedang login.
     */
    public function getSettings(Request $request): JsonResponse
    {
        $mitra  = $request->user();
        $result = $this->profileService->getSettings($mitra);

        $status = $result['success'] ? 200 : 500;

        return response()->json($result, $status);
    }

    /**
     * PUT /v1/dashboard/mitra/settings/profil
     *
     * Update profil bisnis mitra (nama, deskripsi, alamat, telepon, koordinat).
     * jenis_jasa TIDAK bisa diubah dari endpoint ini.
     */
    public function updateProfil(UpdateProfileMitraRequest $request): JsonResponse
    {
        $mitra  = $request->user();
        $result = $this->profileService->updateProfil($mitra, $request);

        $status = $result['success'] ? 200 : 500;

        return response()->json($result, $status);
    }

    /**
     * PUT /v1/dashboard/mitra/settings/jadwal
     *
     * Update jadwal operasional (slot waktu pada kolom catatan).
     * Key yang digunakan (jadwal_penjemputan / jadwal_pengiriman) ditentukan
     * otomatis berdasarkan jenis_jasa mitra yang login.
     */
    public function updateJadwal(UpdateJadwalMitraRequest $request): JsonResponse
    {
        $mitra  = $request->user();
        $result = $this->profileService->updateJadwal($mitra, $request);

        $status = $result['success'] ? 200 : 500;

        return response()->json($result, $status);
    }


    /**
     * PUT /v1/dashboard/mitra/settings/password
     *
     * Update password akun login mitra.
     * Membutuhkan verifikasi password lama terlebih dahulu.
     * Setelah berhasil, semua token aktif dicabut (force re-login).
     */
    public function updatePassword(UpdatePasswordMitraRequest $request): JsonResponse
    {
        $mitra  = $request->user();
        $result = $this->profileService->updatePassword($mitra, $request);

        // Password lama salah → 422 agar konsisten dengan response validasi
        if (!$result['success'] && isset($result['errors'])) {
            return response()->json($result, 422);
        }

        $status = $result['success'] ? 200 : 500;

        return response()->json($result, $status);
    }
}
