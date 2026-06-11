<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Mitra;
use App\Models\Layanan;
use Illuminate\Support\Facades\DB;

class ReseedData extends Command
{
    protected $signature = 'db:reseed-data';
    protected $description = 'Reseed data for all mitra according to new rules';

    public function handle()
    {
        $this->info('Starting reseed data...');

        DB::transaction(function () {
            // Delete all pesanan related data due to foreign keys
            DB::table('ulasan')->delete();
            DB::table('pembayaran')->delete();
            DB::table('detail_pesanan')->delete();
            DB::table('pesanan')->delete();
            
            // Delete all layanan
            Layanan::query()->delete();
            $this->info('Cleared all layanan and related orders.');

            $mitras = Mitra::all();

            foreach ($mitras as $mitra) {
                $this->info("Processing Mitra ID: {$mitra->id_mitra} ({$mitra->jenis_jasa})");

                $catatan = is_string($mitra->catatan) ? json_decode($mitra->catatan, true) : ($mitra->catatan ?? []);

                if ($mitra->jenis_jasa === 'galon_gas') {
                    $allGasGalon = [
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Gas 3kg', 'harga' => 23000, 'satuan' => 'tabung', 'stok_tersedia' => rand(30, 100), 'catatan' => null],
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Gas 5.5kg', 'harga' => 115000, 'satuan' => 'tabung', 'stok_tersedia' => rand(30, 100), 'catatan' => null],
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Gas 12kg', 'harga' => 240000, 'satuan' => 'tabung', 'stok_tersedia' => rand(30, 100), 'catatan' => null],
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Galon 19L', 'harga' => 18000, 'satuan' => 'galon', 'stok_tersedia' => rand(30, 100), 'catatan' => json_encode(['beli_baru' => 37000])],
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Galon 15L', 'harga' => 7000, 'satuan' => 'galon', 'stok_tersedia' => rand(30, 100), 'catatan' => json_encode(['beli_baru' => 22000])],
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Galon 5L', 'harga' => 4000, 'satuan' => 'galon', 'stok_tersedia' => rand(30, 100), 'catatan' => json_encode(['beli_baru' => 16000])]
                    ];
                    $keys = array_rand($allGasGalon, rand(2, 4));
                    if (!is_array($keys)) $keys = [$keys];
                    $selected = array_intersect_key($allGasGalon, array_flip($keys));
                    DB::table('layanan')->insert($selected);
                }
                elseif ($mitra->jenis_jasa === 'laundry') {
                    $allLaundry = [
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Laundry Kiloan Reguler', 'harga' => 10000, 'satuan' => 'kg', 'catatan' => null],
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Laundry Kiloan Express', 'harga' => 15000, 'satuan' => 'kg', 'catatan' => null],
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Kemeja', 'harga' => rand(7, 10) * 1000, 'satuan' => 'pcs', 'catatan' => null],
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Celana', 'harga' => rand(6, 10) * 1000, 'satuan' => 'pcs', 'catatan' => null],
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Hoodie / Jaket', 'harga' => rand(10, 15) * 1000, 'satuan' => 'pcs', 'catatan' => null],
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Jas / Almamater', 'harga' => rand(15, 20) * 1000, 'satuan' => 'pcs', 'catatan' => null]
                    ];
                    $keys = array_rand($allLaundry, rand(2, 5));
                    if (!is_array($keys)) $keys = [$keys];
                    $selected = array_intersect_key($allLaundry, array_flip($keys));
                    DB::table('layanan')->insert($selected);
                    
                    $catatan['jenis_kain'] = ['Pakaian Harian', 'Sprei', 'Bedcover', 'Selimut', 'Jas/Hoodie'];
                    $mitra->catatan = json_encode($catatan);
                    $mitra->save();
                }
                elseif ($mitra->jenis_jasa === 'daily_cleaning') {
                    $allCleaning = [
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Paket Kamar Basic', 'harga' => 15000, 'satuan' => 'jam', 'catatan' => null],
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Paket Kamar + Kamar Mandi', 'harga' => 25000, 'satuan' => 'jam', 'catatan' => null],
                        ['id_mitra' => $mitra->id_mitra, 'nama_layanan' => 'Paket Kosan Bareng', 'harga' => rand(40, 60) * 1000, 'satuan' => 'jam', 'catatan' => null]
                    ];
                    $keys = array_rand($allCleaning, rand(1, 3));
                    if (!is_array($keys)) $keys = [$keys];
                    $selected = array_intersect_key($allCleaning, array_flip($keys));
                    DB::table('layanan')->insert($selected);

                    $catatan['alat_pembersih_tambahan'] = [
                        'Sabun & Cairan Kaca' => ['harga' => 10000, 'stok' => rand(30, 100)],
                        'Obat Pel & Karbol Premium' => ['harga' => 10000, 'stok' => rand(30, 100)],
                        'Pembersih Kerak Kamar Mandi' => ['harga' => 15000, 'stok' => rand(30, 100)],
                        'Vacuum Cleaner Khusus' => ['harga' => 25000, 'stok' => rand(30, 100)]
                    ];
                    $mitra->catatan = json_encode($catatan);
                    $mitra->save();
                }
            }
        });

        $this->info('Reseed data completed.');
    }
}
