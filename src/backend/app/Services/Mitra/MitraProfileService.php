<?php

namespace App\Services\Mitra;

use App\Http\Requests\Dashboard\Mitra\Settings\UpdateJadwalMitraRequest;
use App\Http\Requests\Dashboard\Mitra\Settings\UpdatePasswordMitraRequest;
use App\Http\Requests\Dashboard\Mitra\Settings\UpdateProfileMitraRequest;
use App\Models\Mitra;
use App\Models\MitraLoginAccess;

class MitraProfileService
{
    /**
     * Update data profil mitra (tanpa jenis_jasa — hanya admin yang boleh ubah).
     */
    public function updateProfil(Mitra $mitra, UpdateProfileMitraRequest $request): array
    {
        try {
            $mitra->update([
                'nama_mitra'     => $request->nama_mitra,
                'deskripsi'      => $request->deskripsi,
                'alamat_mitra'   => $request->alamat_mitra,
                'nomor_telepon'  => $request->nomor_telepon,
                'latitude'       => $request->latitude,
                'longitude'      => $request->longitude,
                'radius_layanan' => $request->radius_layanan,
            ]);

            return [
                'success' => true,
                'message' => 'Profil berhasil diperbarui.',
                'data'    => $this->formatProfilResponse($mitra->fresh()),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui profil.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ];
        }
    }

    /**
     * Update array jadwal pada kolom catatan mitra.
     *
     * Key yang diupdate ditentukan otomatis berdasarkan jenis_jasa:
     *  - 'gas_galon' → 'jadwal_pengiriman'
     *  - lainnya (laundry, cleaning) → 'jadwal_penjemputan'
     */
    public function updateJadwal(Mitra $mitra, UpdateJadwalMitraRequest $request): array
    {
        try {
            $jadwalKey = $this->resolveJadwalKey($mitra->jenis_jasa);

            $catatanLama = $mitra->catatan ?? [];
            $catatanBaru = array_merge($catatanLama, [
                $jadwalKey => $request->jadwal,
            ]);

            $mitra->update(['catatan' => $catatanBaru]);

            return [
                'success' => true,
                'message' => 'Jadwal operasional berhasil diperbarui.',
                'data'    => [
                    'jenis_jasa'  => $mitra->jenis_jasa,
                    'jadwal_key'  => $jadwalKey,
                    'jadwal'      => $request->jadwal,
                ],
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui jadwal.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ];
        }
    }

    /**
     * Update password pada tabel mitra_login_access.
     *
     * Verifikasi password lama dilakukan di sini sebelum update.
     */
    public function updatePassword(Mitra $mitra, UpdatePasswordMitraRequest $request): array
    {
        try {
            /** @var MitraLoginAccess|null $mitraAccess */
            $mitraAccess = $mitra->MitraAccess;

            if (!$mitraAccess) {
                return [
                    'success' => false,
                    'message' => 'Akun login mitra tidak ditemukan.',
                    'data'    => null,
                ];
            }

            // Verifikasi password lama
            if (!$request->verifyOldPassword($mitraAccess->password)) {
                return [
                    'success' => false,
                    'message' => 'Password lama tidak sesuai.',
                    'errors'  => [
                        'password_lama' => ['Password lama yang Anda masukkan salah.'],
                    ],
                ];
            }

            $mitraAccess->update([
                'password' => $request->password_baru,
                // password di-hash otomatis via cast 'hashed' di MitraLoginAccess
            ]);

            // Cabut semua token aktif agar sesi lama tidak bisa dipakai
            $mitraAccess->tokens()->delete();

            return [
                'success' => true,
                'message' => 'Password berhasil diperbarui. Silakan login kembali.',
                'data'    => null,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui password.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ];
        }
    }

    /**
     * Ambil semua data pengaturan mitra untuk ditampilkan di halaman Settings.
     */
    public function getSettings(Mitra $mitra): array
    {
        $catatan   = $mitra->catatan ?? [];
        $jadwalKey = $this->resolveJadwalKey($mitra->jenis_jasa);
        $jadwal    = $catatan[$jadwalKey] ?? [];

        return [
            'success' => true,
            'message' => 'Berhasil mengambil data pengaturan.',
            'data'    => [
                'profilBisnis' => $this->formatProfilResponse($mitra),
                'jadwal'       => $jadwal,
                'jadwal_key'   => $jadwalKey,
                'jenis_jasa'   => $mitra->jenis_jasa,
            ],
        ];
    }

    /**
     * Tentukan key jadwal berdasarkan jenis_jasa mitra.
     *
     * Sesuaikan nilai string dengan ENUM/konstanta yang dipakai di DB.
     */
    private function resolveJadwalKey(string $jenisJasa): string
    {
        return match (strtolower($jenisJasa)) {
            'gas_galon', 'gas'  => 'jadwal_pengiriman',
            default             => 'jadwal_penjemputan',  // laundry, cleaning, dll.
        };
    }

    /**
     * Format respons profil yang konsisten.
     */
    private function formatProfilResponse(Mitra $mitra): array
    {
        return [
            'id_mitra'       => $mitra->id_mitra,
            'nama_mitra'     => $mitra->nama_mitra,
            'deskripsi'      => $mitra->deskripsi,
            'jenis_jasa'     => $mitra->jenis_jasa,
            'alamat_mitra'   => $mitra->alamat_mitra,
            'nomor_telepon'  => $mitra->nomor_telepon,
            'latitude'       => $mitra->latitude,
            'longitude'      => $mitra->longitude,
            'radius_layanan' => $mitra->radius_layanan,
        ];
    }
}
