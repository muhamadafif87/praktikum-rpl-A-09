<?php

namespace App\Services;

class DistanceLocationService
{
    public static function haversineKm(
        float $lat1, float $lng1,
        float $lat2, float $lng2
    ): float {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 3);
    }

    /**
     * Haversine SQL expression (untuk query langsung).
     * Return jarak dalam kilometer.
     */
    public static function haversineSqlExpression(
        float $lat,
        float $lng
    ): string {
        return sprintf(
            "(
                6371 * acos(
                    cos(radians(%f)) * cos(radians(latitude)) *
                    cos(radians(longitude) - radians(%f)) +
                    sin(radians(%f)) * sin(radians(latitude))
                )
            )",
            $lat, $lng, $lat
        );
    }
}
