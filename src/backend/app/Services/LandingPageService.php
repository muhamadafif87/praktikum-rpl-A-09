<?php

namespace App\Services;

use App\Models\Ulasan;
use App\Models\Layanan;
use App\Models\Mitra;
use App\Models\User;
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
     * @param array $kategori Filter kategori: 'Pakaian', 'Sprei', 'BedCover', atau 'All'
     * @param string $sortBy Sort order: 'Terdekat', 'Terlaris', 'Terbaik', 'Harga Bersahabat'
     * @return SupportCollection
     */
    public function laundryExpress(array $kategori = ['All'], string $sortBy = 'Terbaik'): SupportCollection {
        $query = Mitra::where('jenis_jasa', 'laundry')
            ->with([
                'Layanan' => fn($q) => $q->select('id_mitra', 'id_layanan', 'nama_layanan', 'harga', 'satuan'),

                'Pesanan.Ulasan.Pesanan.User:id_user,nama_lengkap',
            ])
            ->withAvg('Ulasan as avg_rating', 'rating')
            ->withCount('Ulasan as jumlah_ulasan');

        $kategori = array_values(array_filter(array_map('trim', $kategori)));

        if (!empty($kategori) && !in_array('All', $kategori, true)) {
            if (!empty($kategori)) {
                $names = array_values(array_unique($kategori));
                // $query->whereHas('Layanan', function ($q) use ($names) {
                //     $q->whereIn('nama_layanan', $names);
                // });
                $query->where(function($q) use ($names) {
                    foreach ($names as $name) {
                        $q->orWhereJsonContains('catatan->jenis_kain', $name);
                    }
                });
            }
        }

        $query = $this->applySorting($query, $sortBy);

        $data = $query->get();

        return $this->enrichLayananData($data);
    }

    /**
     * Get data layanan galon/gas dengan optional filter dan sorting
     * @param array $kategori Filter kategori: 'Galon', 'Gas', atau 'All'
     * @param string $sortBy Sort order: 'Terdekat', 'Terlaris', 'Terbaik', 'Harga Bersahabat'
     * @return SupportCollection
     */
    public function galonGas(array $kategori = ['All'], string $sortBy = 'Terbaik'): SupportCollection {
        $query = Mitra::whereIn('jenis_jasa', ['galon','gas','galon_gas'])
            ->with([
                'Layanan' => fn($q) => $q->select('id_mitra', 'id_layanan', 'nama_layanan', 'harga', 'satuan'),

                'Pesanan.Ulasan.Pesanan.User:id_user,nama_lengkap',
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

        $query = $this->applySorting($query, $sortBy);

        $data = $query->get();

        return $this->enrichLayananData($data);
    }

    /**
     * Get data layanan daily cleaning dengan optional filter dan sorting
     * @param array $kategori Filter kategori: 'KamarKost', 'Gudang', atau 'All'
     * @param string $sortBy Sort order: 'Terdekat', 'Terlaris', 'Terbaik', 'Harga Bersahabat'
     * @return SupportCollection
     */
    public function dailyCleaning(array $kategori = ['All'], string $sortBy = 'Terbaik'): SupportCollection {
        $map = [
            'sapu_pel'      => 'Sapu & Pel',
            'cuci_piring'   => 'Cuci Piring',
            'rapikan_kamar' => 'Rapikan Kamar',
            'paket_lengkap' => 'Paket Lengkap',
        ];

        $query = Mitra::where('jenis_jasa', 'daily_cleaning')
            ->with([
                'Layanan' => fn($q) => $q->select('id_mitra', 'id_layanan', 'nama_layanan', 'harga', 'satuan'),

                'Pesanan.Ulasan.Pesanan.User:id_user,nama_lengkap',
            ])
            ->withAvg('Ulasan as avg_rating', 'rating')
            ->withCount('Ulasan as jumlah_ulasan');

        $kategori = array_values(array_filter(array_map('trim', $kategori)));
        $kategoriLower = array_map('strtolower', $kategori);


        if (!empty($kategoriLower) && !in_array('all', $kategoriLower, true)) {

            $availableNames = array_values($map);
            $names = [];

            foreach ($kategoriLower as $k) {
                if (isset($map[$k])) {
                    $names[] = $map[$k];
                    continue;
                }

                foreach ($availableNames as $av) {
                    if (strtolower($av) === $k) {
                        $names[] = $av;
                        break;
                    }
                }
            }

            if (!empty($names)) {
                $names = array_values(array_unique($names));
                $query->whereHas('Layanan', function ($q) use ($names) {
                    $q->whereIn('nama_layanan', $names);
                });
            }
        }

        $query = $this->applySorting($query, $sortBy);

        $data = $query->get();

        return $this->enrichLayananData($data);
    }

    /**
     * Apply sorting berdasarkan kriteria
     * @param mixed $query
     * @param string $sortBy
     * @return mixed
     */
    private function applySorting($query, string $sortBy)
    {
        switch ($sortBy) {
            case 'Terdekat':
                // Implementasi sesuai dengan lokasi user (memerlukan geolocation)
                $query->orderBy('alamat_mitra');
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

            $reviews = $mitra->Pesanan
                    ->flatMap(fn($p) => $p->Ulasan ?? collect())
                    ->sortByDesc('created_at')
                    ->take(5);

            return [
                'id_mitra'       => $mitra->id_mitra,
                'nama_mitra'     => $mitra->nama_mitra,
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
