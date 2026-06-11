<?php

namespace App\Services;

use App\Models\DetailPesanan;
use App\Models\Mitra;
use App\Models\Pesanan;
use Illuminate\Support\Facades\DB;

class PesananService
{
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
        array  $jadwalLayanan,
        array  $estimasi,
        array  $biayaTambahan,
        ?string $catatanPengiriman
    ): array {
        return DB::transaction(function () use (
            $idUser, $idMitra, $jadwalLayanan, $typeLayanan, $items,
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
                'jadwal_layanan'     => $jadwalLayanan ?: null,
                'total_pembayaran'   => $estimasi['total_pembayaran'],
                'catatan_pengiriman' => $catatanPengiriman,
            ];

            if($typeLayanan === 'daily_cleaning'){
                $catatanPesanan_s['biaya_tambahan_alat'] = $estimasi['biaya_tambahan_alat'] ?? 0;
                $catatanPesanan_s['biaya_transportasi'] = $estimasi['biaya_transportasi'] ?? 0;
                $catatanPesanan_s['detail_alat_tambahan'] = array_keys($biayaTambahan);
            }
            if($typeLayanan === 'laundry'){
                $catatanPesanan_s['biaya_ongkir']      = $estimasi['biaya_ongkir'] ?? 0;
                $catatanPesanan_s['durasi_pengerjaan'] = $biayaTambahan['durasi_pengerjaan']['type'] ?? 'reguler';
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
                    'id_pesanan'        => $pesanan->id_pesanan,
                    'id_unique_pesanan' => $pesanan->id_unique_pesanan,
                    'status_pesanan'    => $pesanan->status_pesanan,
                    'detail_layanan'    => $detailList,
                    'detail_alat_tambahan' => array_keys($biayaTambahan),
                    'ringkasan_biaya'   => [
                        'subtotal'            => $estimasi['subtotal'],
                        'biaya_transportasi'  => $estimasi['biaya_transportasi'] ?? 0,
                        'biaya_tambahan_alat' => $estimasi['biaya_tambahan_alat'] ?? 0,
                        'biaya_aplikasi'      => 1000,
                        'total_pembayaran'    => $estimasi['total_pembayaran'],
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
                    'ringkasan_biaya' => [
                        'subtotal'              => $estimasi['subtotal'],
                        'biaya_ongkir'          => $estimasi['biaya_ongkir'] ?? 0,
                        'biaya_tambahan_durasi' => $estimasi['biaya_tambahan_durasi'] ?? 0, // tambah
                        'durasi_pengerjaan'     => $biayaTambahan['durasi_pengerjaan']['type'] ?? 'reguler', // tambah
                        'biaya_aplikasi'        => 1000,
                        'total_pembayaran'      => $estimasi['total_pembayaran'],
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
    public function showDetailPesanan(string $idUniquePesanan, int $idUser): array
    {
        $pesanan = Pesanan::with([
                'DetailPesanan.Layanan',
                'Mitra:id_mitra,nama_mitra,jenis_jasa,alamat_mitra,nomor_telepon',
                'User:id_user,nama_lengkap,nomor_telepon,alamat_kost',
                'Pembayaran',
                'Ulasan',
            ])
            ->where('id_unique_pesanan', $idUniquePesanan)
            ->where('id_user', $idUser)
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
        string $typeLayanan,
        ?array $layananList,
        int $jarakOngkir,
        ?array $biayaTambahan,
        ?array $biayaTambahanAlat
    ) {
        $mitra = Mitra::find($idMitra);
        if (!$mitra) {
            throw new \Exception('Mitra tidak ditemukan');
        }

        $detailLayanan = [];
        $totalBiayaPokok = 0;
        $totalBiayaTambahanKhusus = 0;

        foreach ($layananList as $index => $item) {
            $idLayanan = $item['idLayanan'];
            $qty = $item['qty'];

            $layanan = $mitra->Layanan()->where('id_layanan', $idLayanan)->first();
            if (!$layanan) {
                throw new \Exception("Layanan dengan ID {$idLayanan} tidak ditemukan pada mitra ini");
            }

            $biayaPokok = (float)$layanan->harga * $qty;
            $totalBiayaPokok += $biayaPokok;

            if ($typeLayanan === 'laundry') {
                $durasiObj = $biayaTambahan['durasi_pengerjaan'] ?? [];
                $durasi    = is_array($durasiObj) ? (float)($durasiObj['biaya'] ?? 0) : (float)$durasiObj;
                $biayaTambahanKhusus = $durasi * $qty;

                $detailLayanan[] = [
                    'id_layanan' => $idLayanan,
                    'nama_layanan' => $layanan->nama_layanan,
                    'qty' => $qty,
                    'satuan' => 'kg',
                    'harga_satuan' => (float)$layanan->harga,
                    'subtotal' => $biayaPokok,
                    'durasi_pengerjaan' => $durasi,
                    'biaya_tambahan_durasi' => $biayaTambahanKhusus
                ];

            } elseif ($typeLayanan === 'galon_gas') {
                $beliBaru = 0;
                foreach ($biayaTambahan as $tambahan) {
                    if (isset($tambahan['idLayanan']) && $tambahan['idLayanan'] == $idLayanan) {
                        $beliBaru = (float)($tambahan['beli_baru'] ?? 0);
                        break;
                    }
                }

                $biayaTambahanKhusus = $beliBaru * $qty;
                $totalBiayaTambahanKhusus += $biayaTambahanKhusus;

                $detailLayanan[] = [
                    'id_layanan' => $idLayanan,
                    'nama_layanan' => $layanan->nama_layanan,
                    'qty' => $qty,
                    'satuan' => 'item',
                    'harga_satuan' => (float)$layanan->harga,
                    'subtotal' => $biayaPokok,
                    'beli_baru_per_item' => $beliBaru,
                    'total_beli_baru' => $biayaTambahanKhusus
                ];

            } else {
                $detailLayanan[] = [
                    'id_layanan' => $idLayanan,
                    'nama_layanan' => $layanan->nama_layanan,
                    'qty' => $qty,
                    'satuan' => 'jam',
                    'harga_satuan' => (float)$layanan->harga,
                    'subtotal' => $biayaPokok
                ];
            }
        }

        $biayaOngkir = 0;
        $biayaTransport = 0;
        $biayaAplikasi = 1000;
        $totalBiayaTambahanAlat = 0;

        $firstLayananId = $layananList[0]['idLayanan'];
        $firstLayanan = $mitra->Layanan()->where('id_layanan', $firstLayananId)->first();

        if ($typeLayanan === 'daily_cleaning') {
            $biayaTransport = (float)($firstLayanan->catatan['biaya_transportasi'] ?? 0) * $jarakOngkir;

            if (!empty($biayaTambahanAlat)) {
                $totalBiayaTambahanAlat = array_sum(array_map('floatval', $biayaTambahanAlat));
            }

        } elseif ($typeLayanan === 'laundry' || $typeLayanan === 'galon_gas') {
            $biayaOngkir = (float)($firstLayanan->catatan['biaya_ongkir'] ?? 0) * $jarakOngkir;
        }

        $totalPembayaran = $totalBiayaPokok
            + $biayaOngkir
            + $biayaTransport
            + $biayaAplikasi
            + $totalBiayaTambahanKhusus
            + $totalBiayaTambahanAlat;

        if ($typeLayanan === 'laundry') {
            return [
                'type_layanan' => 'laundry',
                'detail_layanan' => $detailLayanan,
                'ringkasan' => [
                    'subtotal' => $totalBiayaPokok,
                    'biaya_ongkir' => $biayaOngkir,
                    'biaya_layanan_aplikasi' => $biayaAplikasi,
                    'biaya_tambahan_durasi' => $totalBiayaTambahanKhusus,
                    'total_pembayaran' => $totalPembayaran
                ]
            ];

        } elseif ($typeLayanan === 'galon_gas') {
            return [
                'type_layanan' => 'galon_gas',
                'detail_layanan' => $detailLayanan,
                'ringkasan' => [
                    'subtotal' => $totalBiayaPokok,
                    'biaya_ongkir' => $biayaOngkir,
                    'biaya_layanan_aplikasi' => $biayaAplikasi,
                    'total_beli_baru' => $totalBiayaTambahanKhusus,
                    'total_pembayaran' => $totalPembayaran
                ]
            ];

        } else {
            return [
                'type_layanan' => 'daily_cleaning',
                'detail_layanan' => $detailLayanan,
                'biaya_tambahan_alat' => $biayaTambahanAlat,
                'ringkasan' => [
                    'subtotal' => $totalBiayaPokok,
                    'biaya_tambahan_alat' => $totalBiayaTambahanAlat,
                    'biaya_transportasi' => $biayaTransport,
                    'biaya_layanan_aplikasi' => $biayaAplikasi,
                    'total_pembayaran' => $totalPembayaran
                ]
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
                'durasi_pengerjaan' => $catatan['durasi_pengerjaan'] ?? null,
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
