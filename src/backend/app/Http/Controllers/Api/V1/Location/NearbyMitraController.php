<?php

namespace App\Http\Controllers\Api\V1\Location;

use App\Http\Controllers\Controller;
use App\Models\Mitra;
use App\Services\DistanceLocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NearbyMitraController extends Controller
{
    /**
     * GET /mitra/nearby
     *
     * Query params:
     * - lat: float (required) — latitude user
     * - lng: float (required) — longitude user
     * - radius: float (optional) — radius dalam km, default 10
     * - limit: int (optional) — jumlah maksimal hasil, default 20
     * - jenis_jasa: string (optional) — filter jenis_jasa mitra
     * - sort_by: string (optional) — 'distance' (default) atau 'rating'
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:0.1|max:50',
            'limit' => 'nullable|integer|min:1|max:100',
            'jenis_jasa' => 'nullable|string|max:50',
            'sort_by' => 'nullable|in:distance,rating',
        ]);

        $userLat = (float) $validated['lat'];
        $userLng = (float) $validated['lng'];
        $radius = (float) ($validated['radius'] ?? 10);
        $limit = (int) ($validated['limit'] ?? 20);
        $jenis_jasa = $validated['jenis_jasa'] ?? null;
        $sortBy = $validated['sort_by'] ?? 'distance';

        $query = Mitra::active();

        if ($jenis_jasa) {
            $query->byCategory($jenis_jasa);
        }

        $haversineSql = DistanceLocationService::haversineSqlExpression($userLat, $userLng);

        $query->selectRaw("mitra.*, {$haversineSql} as jarak_km")
              ->whereRaw("{$haversineSql} <= ?", [$radius]);

        if ($sortBy === 'rating') {
            $query->orderByDesc('rating')->orderBy('jarak_km');
        } else {
            $query->orderBy('jarak_km');
        }

        $mitraList = $query->limit($limit)->get();

        $results = $mitraList->map(function ($mitra) use ($userLat, $userLng) {
            return [
                'id' => $mitra->id_mitra,
                'nama_mitra' => $mitra->nama_mitra,
                'jenis_jasa' => $mitra->jenis_jasa,
                'alamat_lengkap' => $mitra->alamat_mitra,
                'latitude' => (float) $mitra->latitude,
                'longitude' => (float) $mitra->longitude,
                //'foto' => $mitra->foto ? asset('storage/' . $mitra->foto) : null,
                'nomor_telepon' => $mitra->nomor_telepon,
                //'rating' => (float) $mitra->rating,
                //'total_review' => $mitra->total_review,
                'radius_layanan' => (float) $mitra->radius_layanan,
                'jarak_km' => (float) $mitra->jarak_km,
                'maps_url' => sprintf(
                    'https://www.google.com/maps/dir/?api=1&destination=%f,%f',
                    $mitra->latitude,
                    $mitra->longitude
                ),
                'maps_origin' => sprintf(
                    'https://www.google.com/maps/dir/?api=1&origin=%f,%f&destination=%f,%f',
                    $userLat, $userLng,
                    $mitra->latitude, $mitra->longitude
                ),
            ];
        });

        return response()->json([
            'success' => true,
            'meta' => [
                'user_lat' => $userLat,
                'user_lng' => $userLng,
                'radius_km' => $radius,
                'total' => $results->count(),
                'filter_jenis_jasa' => $jenis_jasa,
                'sort_by' => $sortBy,
            ],
            'data' => $results,
        ]);
    }

    /**
     * GET /mitra/nearby/categories
     * Mengembalikan daftar jenis_jasa yang tersedia (untuk filter dropdown di frontend).
     */
    public function categories(): JsonResponse
    {
        $categories = Mitra::active()
            ->whereNotNull('jenis_jasa')
            ->distinct()
            ->pluck('jenis_jasa')
            ->values();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * POST /mitra/nearby
     * Menerima alamat (string), lalu geocode dengan Mapbox.
     * Cocok jika frontend hanya kirim teks alamat tanpa koordinat.
     */
    public function searchByAddress(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'alamat_mitra' => 'required|string|max:500',
            'radius' => 'nullable|numeric|min:0.1|max:50',
            'limit' => 'nullable|integer|min:1|max:100',
            'jenis_jasa' => 'nullable|string|max:50',
            'sort_by' => 'nullable|in:distance,rating',
        ]);

        $coordinates = $this->geocodeWithMapbox($validated['address']);

        if (!$coordinates) {
            return response()->json([
                'success' => false,
                'message' => 'Alamat tidak dapat ditemukan. Silakan coba alamat yang lebih spesifik.',
            ], 422);
        }

        $request->merge([
            'lat' => $coordinates['lat'],
            'lng' => $coordinates['lng'],
        ]);

        return $this->index($request);
    }

    /**
     * Geocode alamat dengan Mapbox Geocoding API v6.
     */
    private function geocodeWithMapbox(string $address): ?array
    {
        $token = 'pk.eyJ1Ijoia29zdGh1YjEyMyIsImEiOiJjbXB5NmRwcWQwMjh6MnJyMjN5dXJjdDJmIn0.LUM5OChfrkGTYowXXQVqUA';
        // pk.eyJ1Ijoia29zdGh1YjEyMyIsImEiOiJjbXB5NmRwcWQwMjh6MnJyMjN5dXJjdDJmIn0.LUM5OChfrkGTYowXXQVqUA

        // Bounding box Solo
        $soloBbox = '110.73,-7.62,110.89,-7.50';
        $soloCenter = '110.8237,-7.5755';

        $params = http_build_query([
            'access_token' => $token,
            'q' => $address,
            'bbox' => $soloBbox,
            'proximity' => $soloCenter,
            'types' => 'poi,address,neighborhood,locality,place',
            'language' => 'id',
            'limit' => 1,
        ]);

        $url = "https://api.mapbox.com/search/searchbox/v1/forward?{$params}";

        try {
            $client = new \GuzzleHttp\Client(['timeout' => 5]);
            $response = $client->get($url);
            $data = json_decode($response->getBody(), true);

            if (!empty($data['features'])) {
                $feature = $data['features'][0];
                [$lng, $lat] = $feature['geometry']['coordinates'];
                return ['lat' => $lat, 'lng' => $lng];
            }
        } catch (\Exception $e) {
            Log::error('Mapbox geocoding error: ' . $e->getMessage());
        }

        return null;
    }
}
