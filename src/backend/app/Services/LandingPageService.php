<?php

namespace App\Services;

use App\Models\Ulasan;
use App\Models\Layanan;
use App\Models\Mitra;
use App\Models\User;
use App\Services\DistanceLocationService;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class LandingPageService {
    /**
     * Memberikan data statistik landing page
     * @return array
     */
    public function statistic(): array
    {
        $jumlahUserAktif = User::count();
        $jumlahMitraBekerja = Mitra::whereRaw('status_verifikasi = true')->count();

        return [
            'jumlah_user_aktif' => $jumlahUserAktif,
            'jumlah_mitra_bekerja_sama' => $jumlahMitraBekerja,
        ];
    }

    /**
     * Search layanan berdasarkan query
     * @param string $query
     * @return SupportCollection
     */
    public function searchLayanan(string $query): SupportCollection
    {
        return Layanan::whereRaw('LOWER(nama_layanan) LIKE ?', ['%' . strtolower($query) . '%'])
            ->with(['Mitra' => function ($query) {
                $query->where('status_verifikasi', true);
            }])
            ->get();
    }

    /**
     * Get data layanan laundry express dengan optional filter dan sorting
     * @param array $kategori Filter kategori: 'Kiloan Express', 'Kiloan Reguler', 'Satuan', atau 'All'
     * @param string $sortBy Sort order: 'Terdekat', 'Terlaris', 'Terbaik', 'Harga Bersahabat'
     * @param float|null $lat User latitude
     * @param float|null $lng User longitude
     * @return SupportCollection
     */
    public function seedingDataLayanan_laundryExpress(array $kategori = ['All'], string $sortBy = 'Terbaik', ?float $lat = null, ?float $lng = null): SupportCollection {
        $query = Mitra::where('jenis_jasa', 'laundry')
            ->with([
                'Layanan' => fn($q) => $q->select('id_mitra', 'id_layanan', 'nama_layanan', 'harga', 'satuan'),
                'Ulasan.Pesanan.User:id_user,nama_lengkap',
            ])
            ->withAvg('Ulasan as avg_rating', 'rating')
            ->withCount('Ulasan as jumlah_ulasan');

        $kategori = array_values(array_filter(array_map('trim', $kategori)));

        if (!empty($kategori) && !in_array('All', $kategori, true)) {
            if (!empty($kategori)) {
                $names = array_values(array_unique($kategori));
                $query->where(function($q) use ($names) {
                    foreach ($names as $name) {
                        $q->orWhereJsonContains('catatan->kategori', $name);
                    }
                });
            }
        }

        $query = $this->applyLocationFilterAndSorting($query, $lat, $lng, $sortBy);

        $data = $query->get();

        return $this->enrichLayananData($data);
    }

    /**
     * Get data layanan galon/gas dengan optional filter dan sorting
     * @param array $kategori Filter kategori: 'Galon 19L', 'Galon 15L', 'Galon 5L', 'Gas 3kg', 'Gas 5.5kg', 'Gas 12kg', atau 'All'
     * @param string $sortBy Sort order: 'Terdekat', 'Terlaris', 'Terbaik', 'Harga Bersahabat'
     * @param float|null $lat User latitude
     * @param float|null $lng User longitude
     * @return SupportCollection
     */
    public function seedingDataLayanan_galonGas(array $kategori = ['All'], string $sortBy = 'Terbaik', ?float $lat = null, ?float $lng = null): SupportCollection {
        $query = Mitra::whereIn('jenis_jasa', ['galon','gas','galon_gas'])
            ->with([
                'Layanan' => fn($q) => $q->select('id_mitra', 'id_layanan', 'nama_layanan', 'harga', 'satuan'),

                'Ulasan.Pesanan.User:id_user,nama_lengkap',
            ])
            ->withAvg('Ulasan as avg_rating', 'rating')
            ->withCount('Ulasan as jumlah_ulasan');

        $kategori = array_values(array_filter(array_map('trim', $kategori)));
        $kategoriLower = array_map('strtolower', $kategori);


        if (!empty($kategori) && !in_array('All', $kategori, true)) {
            if (!empty($kategori)) {
                $names = array_values(array_unique($kategori));
                $query->whereHas('Layanan', function ($q) use ($names) {
                    $q->whereIn('nama_layanan', $names);
                });
            }
        }

        $query = $this->applyLocationFilterAndSorting($query, $lat, $lng, $sortBy);

        $data = $query->get();

        return $this->enrichLayananData($data);
    }

    /**
     * Get data layanan daily cleaning dengan optional filter dan sorting
     * @param array $kategori Filter kategori: 'Paket Kamar Basic', 'Paket Kamar + Kamar Mandi', 'Paket Kamar Kosan Bareng', atau 'All'
     * @param string $sortBy Sort order: 'Terdekat', 'Terlaris', 'Terbaik', 'Harga Bersahabat'
     * @param float|null $lat User latitude
     * @param float|null $lng User longitude
     * @return SupportCollection
     */
    public function seedingDataLayanan_dailyCleaning(array $kategori = ['All'], string $sortBy = 'Terbaik', ?float $lat = null, ?float $lng = null): SupportCollection {
        $query = Mitra::where('jenis_jasa', 'daily_cleaning')
            ->with([
                'Layanan' => fn($q) => $q->select('id_mitra', 'id_layanan', 'nama_layanan', 'harga', 'satuan'),
                'Ulasan.Pesanan.User:id_user,nama_lengkap',
            ])
            ->withAvg('Ulasan as avg_rating', 'rating')
            ->withCount('Ulasan as jumlah_ulasan');

        $kategori = array_values(array_filter(array_map('trim', $kategori)));

        if (!empty($kategori) && !in_array('All', $kategori, true)) {
            if (!empty($kategori)) {
                $names = array_values(array_unique($kategori));
                $query->whereHas('Layanan', function($q) use ($names) {
                    // foreach ($names as $name) {
                    //     $q->orWhereJsonContains('catatan->kategori', $name);
                    // }
                    $q->whereIn('nama_layanan', $names);
                });
            }
        }

        $query = $this->applyLocationFilterAndSorting($query, $lat, $lng, $sortBy);

        $data = $query->get();

        return $this->enrichLayananData($data);
    }

    /**
     * Apply sorting berdasarkan kriteria dan filter lokasi jika lat/lng tersedia
     * @param mixed $query
     * @param float|null $lat
     * @param float|null $lng
     * @param string $sortBy
     * @return mixed
     */
    private function applyLocationFilterAndSorting($query, ?float $lat, ?float $lng, string $sortBy)
    {
        if ($lat !== null && $lng !== null) {
            $haversineSql = DistanceLocationService::haversineSqlExpression($lat, $lng);
            $query->selectRaw("mitra.*, {$haversineSql} as jarak_km");
        }

        switch ($sortBy) {
            case 'Terdekat':
                if ($lat !== null && $lng !== null) {
                    $query->orderBy('jarak_km');
                } else {
                    $query->orderBy('alamat_mitra');
                }
                break;
            case 'Terlaris':
                // Order by order count (most frequently ordered)
                $query->withCount('Pesanan')
                    ->orderByDesc('pesanan_count');
                break;
            case 'Terbaik':
                // Order by average rating using withAvg (already done in the caller)
                $query->orderByDesc('avg_rating');
                break;
            case 'Harga Bersahabat':
                // Order by lowest price using subquery to avoid connection pool issues
                $query->orderBy(
                    Layanan::selectRaw('MIN(harga)')
                        ->whereColumn('id_mitra', 'mitra.id_mitra')
                );
                break;
            default:
                $query->orderByDesc('id_mitra');
        }

        // Tambahkan fallback sorting stabil untuk mencegah perubahan urutan pada nilai yang sama (mencegah blink/jumping di UI)
        $query->orderBy('mitra.id_mitra');

        return $query;
    }

    /**
     * Enrich data dengan rating, jumlah ulasan, dan sample ulasan
     * @param SupportCollection $data
     * @return SupportCollection
     */
    private function enrichLayananData(EloquentCollection $data): SupportCollection {
        return $data->map(function ($mitra) {
            $rating = $mitra->avg_rating ?? 0;
            $jumlahUlasan = $mitra->jumlah_ulasan ?? 0;

            $reviews = $mitra->Ulasan
                    ->sortByDesc('created_at')
                    ->take(5);

            return [
                'id_mitra'       => $mitra->id_mitra,
                'nama_mitra'     => $mitra->nama_mitra,
                'deskripsi'      => $mitra->deskripsi,
                'profil_image'   => $mitra->MitraImageAsset()->first()?->image_file,
                'jenis_jasa'     => $mitra->jenis_jasa,
                'lokasi_layanan' => $mitra->alamat_mitra,
                'rating'         => round((float) $rating, 1),
                'jumlah_ulasan'  => $jumlahUlasan,
                'layanan'        => $mitra->Layanan->map(fn($l) => [
                    'id_layanan'   => $l->id_layanan ?? null,
                    'nama_layanan' => $l->nama_layanan,
                    'harga_satuan' => $l->harga,
                    'satuan'       => $l->satuan,
                ])->toArray(),
                'jarak_km'       => isset($mitra->jarak_km) ? (float) $mitra->jarak_km : null,
                'is_dalam_jangkauan' => isset($mitra->jarak_km) ? ((float) $mitra->jarak_km <= (float) ($mitra->radius_layanan ?? 10)) : true,
                'sample_ulasan' => $reviews->map(function ($ulasan) {
                    $user = $ulasan->Pesanan?->User;
                    return [
                        'nama_user'  => $user?->nama_lengkap ?? 'Anonymous',
                        'rating'     => $ulasan->rating,
                        'komentar'   => $ulasan->komentar,
                        'tgl_ulasan' => $ulasan->created_at?->format('Y-m-d H:i:s'),
                    ];
                })->values()->toArray(),
            ];
        });
    }
}
