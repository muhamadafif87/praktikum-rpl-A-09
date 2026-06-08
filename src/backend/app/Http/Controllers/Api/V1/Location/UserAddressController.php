<?php

namespace App\Http\Controllers\Api\V1\Location;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAddressRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserAddressController extends Controller
{
    /**
     * GET /user/address
     * Ambil alamat tersimpan user saat ini.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'alamat_kost' => $user->alamat_kost,
                'address_detail' => $user->address_detail,
                'latitude' => $user->latitude,
                'longitude' => $user->longitude,
            ],
        ]);
    }

    /**
     * PUT /user/address
     * Simpan/perbarui alamat user.
     */
    public function update(UpdateAddressRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'alamat_kost' => $request->input('alamat_kost'),
            'address_detail' => $request->input('address_detail'),
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil disimpan.',
            'data' => [
                'alamat_kost' => $user->alamat_kost,
                'latitude' => $user->latitude,
                'longitude' => $user->longitude,
            ],
        ]);
    }

    /**
     * DELETE /user/address
     * Hapus alamat tersimpan.
     */
    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'alamat_kost' => null,
            'address_detail' => null,
            'latitude' => null,
            'longitude' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil dihapus.',
        ]);
    }
}
