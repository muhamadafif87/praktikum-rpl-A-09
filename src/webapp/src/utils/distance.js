/**
 * Haversine Formula — Menghitung jarak antara dua titik koordinat GPS.
 * 
 * Cocok untuk jarak pendek dalam satu kota (area Solo ~20km radius).
 * Mengembalikan jarak dalam kilometer, dibulatkan 1 desimal.
 * 
 * @param {number} lat1 - Latitude titik 1 (derajat)
 * @param {number} lng1 - Longitude titik 1 (derajat) 
 * @param {number} lat2 - Latitude titik 2 (derajat)
 * @param {number} lng2 - Longitude titik 2 (derajat)
 * @returns {number} Jarak dalam kilometer (1 desimal)
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius bumi dalam kilometer

    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return Math.round(distance * 10) / 10; // 1 decimal place
}
