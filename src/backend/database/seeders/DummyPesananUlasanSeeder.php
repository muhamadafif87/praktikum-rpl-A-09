<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Mitra;
use App\Models\User;
use App\Models\Pesanan;
use App\Models\Ulasan;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

class DummyPesananUlasanSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            $user = User::create([
                'id_user' => (string) Str::uuid(),
                'nama' => 'Dummy User',
                'email' => 'dummy@example.com',
                'password' => bcrypt('password'),
            ]);
            $users = collect([$user]);
        }

        $mitras = Mitra::all();
        $commentsPool = [
            "Layanannya mantap banget, super cepat!",
            "Agak lama sih nunggunya, tapi hasilnya oke.",
            "Biasa aja, standar.",
            "Wah gila ini sih terbaik di area sini, langganan terus!",
            "Kurang memuaskan, mungkin karena lagi ramai.",
            "Pelayanannya ramah, harganya juga bersahabat.",
            "Sangat direkomendasikan buat anak kos!",
            "Oke banget, packing rapi dan aman.",
            "Bagus, tapi bisa ditingkatkan lagi responnya.",
            "Perfect! Nggak ada celah, mantul pokoknya."
        ];

        $index = 0;
        foreach ($mitras as $mitra) {
            $index++;
            // Generate varied pesanan count per mitra so they don't easily match
            $pesananCount = rand(5, 15) + ($index * 2) + rand(1, 5);

            for ($i = 0; $i < $pesananCount; $i++) {
                $user = $users->random();
                
                // Pilih layanan secara acak dari mitra ini
                $layananList = \App\Models\Layanan::where('id_mitra', $mitra->id_mitra)->get();
                $layanan = $layananList->isNotEmpty() ? $layananList->random() : null;
                
                $jumlah = rand(1, 5);
                $harga = $layanan ? $layanan->harga : rand(10000, 50000);
                $subtotal = $jumlah * $harga;
                $ongkir = rand(5, 15) * 1000;
                $total_pembayaran = $subtotal + $ongkir;

                $pesanan = Pesanan::create([
                    'id_unique_pesanan' => 'DUMMY-' . strtoupper(Str::random(8)),
                    'id_user' => $user->id_user,
                    'id_mitra' => $mitra->id_mitra,
                    'status_pesanan' => 'selesai',
                    'tgl_pesanan' => Carbon::now()->subDays(rand(1, 30))->subHours(rand(1, 24)),
                    'catatan' => [
                        'type_layanan' => $mitra->jenis_jasa,
                        'note' => 'Ini pesanan dummy untuk testing ulasan.',
                        'total_pembayaran' => $total_pembayaran
                    ]
                ]);

                if ($layanan) {
                    \App\Models\DetailPesanan::create([
                        'id_layanan' => $layanan->id_layanan,
                        'id_pesanan' => $pesanan->id_pesanan,
                        'jumlah'     => $jumlah,
                        'harga'      => $harga,
                        'subtotal'   => $subtotal,
                    ]);
                }

                // Create varied ratings depending on the index to make the average look unique
                $chance = rand(1, 100);
                if ($index % 3 == 0) {
                    // mostly 5 and 4
                    $rating = $chance > 15 ? 5 : 4;
                } elseif ($index % 3 == 1) {
                    // mostly 4 and 3
                    $rating = $chance > 20 ? 4 : rand(3, 5);
                } else {
                    // mixed
                    $rating = $chance > 40 ? 5 : rand(2, 4);
                }
                
                $komentar = $commentsPool[array_rand($commentsPool)];

                Ulasan::create([
                    'id_pesanan' => $pesanan->id_pesanan,
                    'rating' => $rating,
                    'komentar' => $komentar,
                    'created_at' => Carbon::parse($pesanan->tgl_pesanan)->addHours(rand(1, 24))
                ]);
            }
            
            $this->command->info("Created $pesananCount pesanan & ulasan for Mitra: {$mitra->nama_mitra}");
        }
    }
}
