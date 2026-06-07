<?php

namespace App\Services;

use App\Models\DetailPesanan;
use App\Models\Mitra;
use App\Models\Pesanan;
use Illuminate\Support\Facades\DB;

class PesananService
{

    // {
    //     "idMitra": "6",
    //     "typeLayanan": "daily_cleaning",
    //     "items": [
    //         { "idLayanan": "9", "qty": 2 },
    //         { "idLayanan": "10", "qty": 1 }
    //     ],
    //     "jarakOngkir": 3,
    //     "biayaTambahan": { "Sapu": 5000, "Pel": 7000 },
    //     "estimasi": {
    //         "subtotal": 80000,
    //         "biaya_ongkir": 9000,
    //         "biaya_aplikasi": 1000,
    //         "biaya_tambahan_alat": 12000,
    //         "total_pembayaran": 102000
    //     },
    //     "catatanPengiriman": "Tolong datang pagi"
    // }
    // -------------------------------------------------------------------------
    // Format: ORD-{typeLayanan uppercase}-{YYYYMMDD}-{6 char random}
    // Contoh: ORD-LAUNDRY-20250607-A3F9K1
    // -------------------------------------------------------------------------
    private function generateIdPesanan(string $typeLayanan): string {
        $prefix = 'ORD-' . strtoupper($typeLayanan) . '-' . now()->format('Ymd');

        do {
            $suffix = strtoupper(\Illuminate\Support\Str::random(6));
            $idUnique = "{$prefix}-{$suffix}";
        } while (Pesanan::where('id_unique_pesanan', $idUnique)->exists());

        return $idUnique;
    }

    public function createPesanan(
        string $idUser,
        string $idMitra,
        string $typeLayanan,
        array  $items,
        int    $jarakOngkir,
        array  $estimasi,
        array  $biayaTambahan,
        ?string $catatanPengiriman
    ): array {
        return DB::transaction(function () use (
            $idUser, $idMitra, $typeLayanan, $items,
            $jarakOngkir, $estimasi, $biayaTambahan, $catatanPengiriman
        ) {
            $mitra = Mitra::find($idMitra);
            if (!$mitra) {
                throw new \Exception('Mitra tidak ditemukan.');
            }

            $idLayananList = array_column($items, 'idLayanan');
            $layanans = $mitra->Layanan()
                ->whereIn('id_layanan', $idLayananList)
                ->get()
                ->keyBy('id_layanan');

            if ($layanans->count() !== count($idLayananList)) {
                throw new \Exception('Satu atau lebih layanan tidak ditemukan atau bukan milik mitra ini.');
            }

            $idUniquePesanan = $this->generateIdPesanan($typeLayanan);

            $catatanPesanan_s = [
                'jarak_ongkir'       => $jarakOngkir,
                'biaya_aplikasi'     => 1000,
                'biaya_tambahan'     => $biayaTambahan ?: null,
                'total_pembayaran'   => $estimasi['total_pembayaran'],
                'catatan_pengiriman' => $catatanPengiriman,
            ];

            if($typeLayanan === 'daily_cleaning'){
                $catatanPesanan_s['biaya_tambahan_alat'] = $estimasi['biaya_tambahan_alat'] ?? 0;
                $catatanPesanan_s['biaya_transportasi'] = $estimasi['biaya_transportasi'] ?? 0;
                $catatanPesanan_s['detail_alat_tambahan'] = array_keys($biayaTambahan);
            }
            if($typeLayanan === 'laundry'){
                $catatanPesanan_s['biaya_ongkir'] = $estimasi['biaya_ongkir'] ?? 0;
            }
            if ($typeLayanan === 'galon_gas') {
                $catatanPesanan_s['biaya_ongkir'] = $estimasi['biaya_ongkir'] ?? 0;
                $catatanPesanan_s['jenis_layanan'] = isset($biayaTambahan['beli_baru']) && $biayaTambahan['beli_baru'] > 0
                    ? 'beli_baru'
                    : 'isi_ulang';
            }

            $pesanan = Pesanan::create([
                'id_unique_pesanan' => $idUniquePesanan,
                'id_user'           => $idUser,
                'id_mitra'          => $idMitra,
                'status_pesanan'    => 'pending',
                'catatan'           => $catatanPesanan_s,
            ]);

            $detailList = [];
            foreach ($items as $item) {
                $layanan = $layanans->get($item['idLayanan']);
                $harga    = $layanan->harga;
                $qty      = $item['qty'];
                $subtotal = $harga * $qty;

                $detail = DetailPesanan::create([
                    'id_pesanan'  => $pesanan->id_pesanan,
                    'id_layanan'  => $layanan->id_layanan,
                    'jumlah'      => $qty,
                    'harga'       => $harga,
                    'subtotal'    => $subtotal,
                ]);

                $detailList[] = [
                    'id_detail_pesanan' => $detail->id_detail_pesanan,
                    'nama_layanan'      => $layanan->nama_layanan,
                    'satuan'            => $layanan->satuan,
                    'harga'             => $harga,
                    'jumlah'            => $qty,
                    'subtotal'          => $subtotal,
                ];
            }

            if ($typeLayanan === 'daily_cleaning') {
                return [
                    'id_pesanan'         => $pesanan->id_pesanan,
                    'id_unique_pesanan'  => $pesanan->id_unique_pesanan,
                    'status_pesanan'     => $pesanan->status_pesanan,
                    'detail_layanan'     => $detailList, //array
                    'detail_alat_tambahan'   => array_keys($biayaTambahan),
                    'ringkasan_biaya'    => [
                        'subtotal'          => $estimasi['subtotal'],
                        'biaya_transportasi'=> $estimasi['biaya_transportasi'],
                        'biaya_tambahan_alat' => $estimasi['biaya_tambahan_alat'],
                        'biaya_aplikasi'    => 1000,
                        'total_pembayaran'  => $estimasi['total_pembayaran'],
                    ],
                    'catatan_pengiriman' => $catatanPengiriman,
                ];
            }
            elseif($typeLayanan === 'laundry'){
                return [
                    'id_pesanan'         => $pesanan->id_pesanan,
                    'id_unique_pesanan'  => $pesanan->id_unique_pesanan,
                    'status_pesanan'     => $pesanan->status_pesanan,
                    'detail_layanan'     => $detailList,
                    'ringkasan_biaya'    => [
                        'subtotal'          => $estimasi['subtotal'],
                        'biaya_ongkir'      => $estimasi['biaya_ongkir'],
                        'biaya_aplikasi'    => 1000,
                        'total_pembayaran'  => $estimasi['total_pembayaran'],
                    ],
                    'catatan_pengiriman' => $catatanPengiriman,
                ];
            }
            else{
                return [
                    'id_pesanan'         => $pesanan->id_pesanan,
                    'id_unique_pesanan'  => $pesanan->id_unique_pesanan,
                    'status_pesanan'     => $pesanan->status_pesanan,
                    'detail_layanan'     => $detailList,
                    'ringkasan_biaya'    => [
                        'subtotal'          => $estimasi['subtotal'],
                        'biaya_ongkir'      => $estimasi['biaya_ongkir'],
                        'biaya_aplikasi'    => 1000,
                        'total_pembayaran'  => $estimasi['total_pembayaran'],
                    ],
                    'catatan_pengiriman' => $catatanPengiriman,
                ];
            }
        });
    }

    // -------------------------------------------------------------------------
    // SHOW RIWAYAT PESANAN — USER
    // -------------------------------------------------------------------------
    public function riwayatPesananUser(
        string  $idUser,
        ?string $status,
        ?string $tglDari,
        ?string $tglSampai,
        int     $perPage
    ) {
        $query = Pesanan::with([
                'DetailPesanan.Layanan',
                'Mitra:id_mitra,nama_mitra,jenis_jasa,alamat_mitra',
            ])
            ->where('id_user', $idUser)
            ->orderBy('tgl_pesanan', 'desc');

        if ($status) {
            $query->where('status_pesanan', $status);
        }

        if ($tglDari) {
            $query->whereDate('tgl_pesanan', '>=', $tglDari);
        }

        if ($tglSampai) {
            $query->whereDate('tgl_pesanan', '<=', $tglSampai);
        }

        $paginated = $query->paginate($perPage);

        return [
            'data'  => $paginated->map(fn($p) => $this->formatRiwayat($p)),
            'meta'  => [
                'current_page'  => $paginated->currentPage(),
                'last_page'     => $paginated->lastPage(),
                'per_page'      => $paginated->perPage(),
                'total'         => $paginated->total(),
            ],
        ];
    }

    // -------------------------------------------------------------------------
    // SHOW RIWAYAT PESANAN — MITRA
    // -------------------------------------------------------------------------
    public function riwayatPesananMitra(
        string  $idMitra,
        ?string $status,
        ?string $tglDari,
        ?string $tglSampai,
        int     $perPage
    ) {
        $query = Pesanan::with([
                'DetailPesanan.Layanan',
                'User:id_user,nama_lengkap,nomor_telepon,alamat_kost',
            ])
            ->where('id_mitra', $idMitra)
            ->orderBy('tgl_pesanan', 'desc');

        if ($status) {
            $query->where('status_pesanan', $status);
        }

        if ($tglDari) {
            $query->whereDate('tgl_pesanan', '>=', $tglDari);
        }

        if ($tglSampai) {
            $query->whereDate('tgl_pesanan', '<=', $tglSampai);
        }

        $paginated = $query->paginate($perPage);

        return [
            'data'  => $paginated->map(fn($p) => $this->formatRiwayat($p)),
            'meta'  => [
                'current_page'  => $paginated->currentPage(),
                'last_page'     => $paginated->lastPage(),
                'per_page'      => $paginated->perPage(),
                'total'         => $paginated->total(),
            ],
        ];
    }

    // -------------------------------------------------------------------------
    // SHOW DETAIL PESANAN
    // -------------------------------------------------------------------------
    public function showDetailPesanan(string $idUniquePesanan): array
    {
        $pesanan = Pesanan::with([
                'DetailPesanan.Layanan',
                'Mitra:id_mitra,nama_mitra,jenis_jasa,alamat_mitra,nomor_telepon',
                'User:id_user,nama_lengkap,nomor_telepon,alamat_kost',
                'Pembayaran',
                'Ulasan',
            ])
            ->where('id_unique_pesanan', $idUniquePesanan)
            ->first();

        if (!$pesanan) {
            throw new \Exception('Pesanan tidak ditemukan.');
        }

        $catatan = $pesanan->catatan ?? [];

        return [
            'id_pesanan'         => $pesanan->id_pesanan,
            'id_unique_pesanan'  => $pesanan->id_unique_pesanan,
            'status_pesanan'     => $pesanan->status_pesanan,
            'tgl_pesanan'        => $pesanan->tgl_pesanan,
            'mitra'              => $pesanan->Mitra,
            'user'               => $pesanan->User,
            'detail_layanan'     => $pesanan->DetailPesanan->map(fn($d) => [
                'id_detail_pesanan' => $d->id_detail_pesanan,
                'nama_layanan'      => $d->Layanan->nama_layanan ?? '-',
                'satuan'            => $d->Layanan->satuan ?? '-',
                'harga'             => $d->harga,
                'jumlah'            => $d->jumlah,
                'subtotal'          => $d->subtotal,
            ]),
            'ringkasan_biaya'    => [
                'subtotal'              => $catatan['subtotal'] ?? null,
                'biaya_ongkir'          => $catatan['biaya_ongkir'] ?? null,
                'biaya_aplikasi'        => $catatan['biaya_aplikasi'] ?? null,
                'biaya_tambahan_alat'   => $catatan['biaya_tambahan_alat'] ?? null,
                'total_pembayaran'      => $catatan['total_pembayaran'] ?? null,
            ],
            'catatan_pengiriman' => $catatan['catatan_pengiriman'] ?? null,
            'pembayaran'         => $pesanan->Pembayaran,
            'ulasan'             => $pesanan->Ulasan,
        ];
    }

    // -------------------------------------------------------------------------
    // CANCEL PESANAN — USER (hanya saat pending)
    // -------------------------------------------------------------------------
    public function cancelPesananUser(string $idUniquePesanan, string $idUser): array
    {
        $pesanan = Pesanan::where('id_unique_pesanan', $idUniquePesanan)
            ->where('id_user', $idUser)
            ->first();

        if (!$pesanan) {
            throw new \Exception('Pesanan tidak ditemukan.');
        }

        if ($pesanan->status_pesanan !== 'pending') {
            throw new \Exception(
                'Pesanan tidak dapat dibatalkan. Pembatalan hanya bisa dilakukan saat status masih pending.'
            );
        }

        $pesanan->update(['status_pesanan' => 'dibatalkan']);

        return [
            'id_unique_pesanan' => $pesanan->id_unique_pesanan,
            'status_pesanan'    => 'dibatalkan',
        ];
    }

    // -------------------------------------------------------------------------
    // CANCEL PESANAN — MITRA (bisa di semua status kecuali selesai/dibatalkan)
    // -------------------------------------------------------------------------
    public function cancelPesananMitra(string $idUniquePesanan, string $idMitra): array
    {
        $pesanan = Pesanan::where('id_unique_pesanan', $idUniquePesanan)
            ->where('id_mitra', $idMitra)
            ->first();

        if (!$pesanan) {
            throw new \Exception('Pesanan tidak ditemukan.');
        }

        if (in_array($pesanan->status_pesanan, ['selesai', 'dibatalkan'])) {
            throw new \Exception(
                "Pesanan dengan status '{$pesanan->status_pesanan}' tidak dapat dibatalkan."
            );
        }

        $pesanan->update(['status_pesanan' => 'dibatalkan']);

        return [
            'id_unique_pesanan' => $pesanan->id_unique_pesanan,
            'status_pesanan'    => 'dibatalkan',
        ];
    }

    // -------------------------------------------------------------------------
    // HELPER — Format riwayat untuk response list
    // -------------------------------------------------------------------------
    private function formatRiwayat(Pesanan $pesanan): array
    {
        $catatan = $pesanan->catatan ?? [];

        return [
            'id_unique_pesanan'  => $pesanan->id_unique_pesanan,
            'status_pesanan'     => $pesanan->status_pesanan,
            'tgl_pesanan'        => $pesanan->tgl_pesanan,
            'mitra'              => isset($pesanan->Mitra) ? [
                'nama_mitra'  => $pesanan->Mitra->nama_mitra,
                'jenis_jasa'  => $pesanan->Mitra->jenis_jasa,
            ] : null,
            'user'               => isset($pesanan->User) ? [
                'nama_lengkap'  => $pesanan->User->nama_lengkap,
                'nomor_telepon' => $pesanan->User->nomor_telepon,
            ] : null,
            'detail_layanan'     => $pesanan->DetailPesanan->map(fn($d) => [
                'nama_layanan'  => $d->Layanan->nama_layanan ?? '-',
                'jumlah'        => $d->jumlah,
                'subtotal'      => $d->subtotal,
            ]),
            'total_pembayaran'   => $catatan['total_pembayaran'] ?? null,
        ];
    }

    public function estimateFeePesanan(
        string $idMitra,
        string $idLayanan,
        string $typeLayanan,
        int $qty,
        int $jarakOngkir,
        array $biayaTambahan
    ){
        $mitra = Mitra::find($idMitra);
        if (!$mitra) {
            throw new \Exception('Mitra tidak ditemukan');
        }

        $layanan = $mitra->Layanan()->where('id_layanan', $idLayanan)->first();
        if (!$layanan) {
            throw new \Exception('Layanan tidak ditemukan');
        }

        $biayaPokok    = $layanan->harga * $qty;
        $biayaOngkir   = ($layanan->catatan['biaya_ongkir'] ?? 0) * $jarakOngkir;
        $biayaTransport = ($layanan->catatan['biaya_transportasi'] ?? 0) * $jarakOngkir;
        $biayaAplikasi = 1000;

        if ($typeLayanan === 'laundry') {
            return [
                'subtotal'          => $biayaPokok,
                'biaya_ongkir'      => $biayaOngkir,
                'biaya_layanan'     => $biayaAplikasi,
                'total_pembayaran'  => $biayaPokok + $biayaOngkir + $biayaAplikasi
            ];
        } elseif ($typeLayanan === 'galon_gas') {
            $tambahan = ($biayaTambahan['beli_baru'] ?? 0) * $qty;
            return [
                'subtotal'         => $biayaPokok,
                'biaya_ongkir'     => $biayaOngkir,
                'biaya_layanan'    => $biayaAplikasi,
                'beli_baru'        => $tambahan,
                'total_pembayaran' => $biayaPokok + $biayaOngkir + $biayaAplikasi + $tambahan
            ];
        } else {
            $totalBiayaTambahan = array_sum($biayaTambahan);
            return [
                'subtotal'              => $biayaPokok,
                'biaya_tambahan_alat'   => $totalBiayaTambahan,
                'biaya_transportasi'    => $biayaTransport,
                'biaya_layanan'         => $biayaAplikasi,
                'total_pembayaran'      => $biayaPokok + $totalBiayaTambahan + $biayaTransport + $biayaAplikasi
            ];
        }
    }

    public function seedingDetailPesanan(string $type_layanan, string $idMitra){
        // informasi tambahan ketika user ingin membuat pesanan

        $mitra = Mitra::find($idMitra);
        if (!$mitra) {
            throw new \Exception('Mitra tidak ditemukan');
        }

        $catatan = $mitra->catatan;
        if (is_string($catatan)) {
            $catatan = json_decode($catatan, true);
        }

        $layanan = $mitra->Layanan;

        if ($type_layanan === 'laundry') {
            return [
                'id_mitra' => $mitra->id_mitra,
                'nama_mitra' => $mitra->nama_mitra,
                'layanan' => $layanan->map(fn($l) => [
                    'id_layanan' => $l->id_layanan,
                    'nama_layanan' => $l->nama_layanan,
                    'harga_layanan' => $l->harga
                ])->toArray(),
                'jenis_kain' => $catatan['jenis_kain'] ?? null,
                'jadwal_penjemputan' => $catatan['jadwal_penjemputan'] ?? null
            ];
        }
        elseif ($type_layanan === 'daily_cleaning') {
            return [
                'id_mitra' => $mitra->id_mitra,
                'nama_mitra' => $mitra->nama_mitra,
                'layanan' => $layanan->map(fn($l) => [
                    'id_layanan' => $l->id_layanan,
                    'nama_layanan' => $l->nama_layanan,
                    'harga_layanan' => $l->harga
                ])->toArray(),
                'alat_pembersih_tambahan' => $catatan['alat_pembersih_tambahan'] ?? null,
                'jadwal_pembersihan' => $catatan['jadwal_pembersihan'] ?? null
            ];
        }
        else {
            return [
                'id_mitra' => $mitra->id_mitra,
                'nama_mitra' => $mitra->nama_mitra,
                'layanan' => $layanan->map(fn($l) => [
                    'id_layanan' => $l->id_layanan,
                    'nama_layanan' => $l->nama_layanan,
                    'harga_barang' => $l->harga,
                    'beli_baru' => $l->catatan['beli_baru'] ?? null
                ])->toArray(),
                'jadwal_pengiriman' => $catatan['jadwal_pengiriman'] ?? null
            ];
        }
    }

    // catatan pada mitra general, sedangkan layanan spesifik

    /**
     * pertimbangkan untuk menambahkan column catatan pada pesanan, berikut detailnya:
     *
     * #laundry express
     * {
     *      jenis_kain: [
     *          "Pakaian Harian",
     *          "Sprei",
     *          "BedCover"
     *          *bisa multiple/single choice
     *      ],
     *      estimasi_berat: [
     *          "Kategori Ringan (Maks 3kg)",
     *          "Kategori Sedang (Maks 6kg)",
     *          "Kategori Berat (Maks 12kg)"
     *      ],
     *      jadwal_penjemputan: [
     *          "09:00",
     *          "10:00",
     *          "11:00",
     *          "12:00",
     *          "13:00",
     *          "14:00",
     *          "15:00",
     *          "16:00"
     *      ]
     * }
     *
     * #daily cleaning
     * nama_layanan,
     * {
     *      paket_durasi: [
     *          "1 Jam (Ringan)",
     *          "2 Jam (Sedang)",
     *          "3 jam (Berat)"
     *      ], ->handle di fe
     *      alat_pembersih_tambahan: [
     *          "Sapu",
     *          "Vacum Cleaner",
     *          "Pel",
     *          *opsional
     *      ],
     *      jadwal_pembersihan: {
     *          "09:00",
     *          "10:00",
     *          "11:00",
     *          "12:00",
     *          "13:00",
     *          "14:00",
     *          "15:00"
     *      },
     *      catatan_pengiriman: "(opsional)"
     * }
     *
     * #gas & galon
     * gas_galon: {
     *      item: {
     *          "Gas":{
     *              jenis: x (kg),
     *              jumlah: x,
     *              harga: x
     *          },
     *          "Galon":{
     *              jenis: x (kg),
     *              jumlah: x,
     *              harga: x
     *          },
     *          *bisa multiple item
     *      },
     *      jenis_layanan: "isi ulang OR beli tabung/galon baru", ->handle di fe dan di pesanan
     *      catatan_pengiriman: "(opsional)"
     * }
     */


    //seeding detail_pesanan
    //#laundry express
    /**
     * jenis_kain: {
     *      "pakaian harian",
     *      "sprei",
     *      "bedcover"
     * },
     * kategori_berat: {
     *      "ringan (max:3kg)",
     *      "sedang (max:6kg)",
     *      "berat (max:12)"
     * },
     * jadwal_kurir:{
     *      "09:00",
     *      "xx:xx"
     * }
     */

    //#daily cleaning
    /**
     * paket_durasi: {
     *      waktu: { 1, 2, 3 } (jam),
     *      kategori: {
     *          "ringan": Rp.xxxx,
     *          "sedang": Rp.xxxx,
     *          "berat": Rp.xxxx
     *      },
     * },
     * list_alat_pembersih: {
     *      "Sapu": Rp.xxxx,
     *      "Pel": Rp.xxxx
     * },
     * jadwal_pembersihan: {
     *      date(dd/mm/yyyy): {
     *          "09:00",
     *          "xx:xx"
     *      }
     * }
     */

    //#gas galon
    /**
     * item:{
     *   "Gas":{
     *      jenis: x (kg),
     *      jumlah: x,
     *      harga: x
     *   },
     *   "Galon":{
     *      jenis: x (kg),
     *      jumlah: x,
     *      harga: x
     *   },
     * },
     * harga_jenis_layanan:{
     *   "Gas": {
     *      isi_ulang: Rp.xxxx,
     *      beli_baru: Rp.xxxx
     *   },
     *   "Galon": {
     *      isi_ulang: Rp.xxxx,
     *      beli_baru: Rp.xxxx
     *   },
     * }
     */
}
