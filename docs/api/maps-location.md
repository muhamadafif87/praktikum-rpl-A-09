#  API Dokumentasi: Fitur Pencarian Mitra Terdekat

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Autentikasi](#autentikasi)
3. [Endpoints](#endpoints)
   - [1. Ambil Alamat User](#1-ambil-alamat-user)
   - [2. Simpan Alamat User](#2-simpan-alamat-user)
   - [3. Hapus Alamat User](#3-hapus-alamat-user)
   - [4. Cari Mitra Terdekat (dengan Koordinat)](#4-cari-mitra-terdekat-dengan-koordinat)
   - [5. Cari Mitra Terdekat (dengan Alamat)](#5-cari-mitra-terdekat-dengan-alamat)
   - [6. Daftar jenis_jasa Mitra](#6-daftar-jenis_jasa-mitra)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [React Integration Guide](#react-integration-guide)
7. [Testing Examples](#testing-examples)
8. [Rate Limiting](#rate-limiting)

---

## Overview

API ini menyediakan layanan untuk mencari mitra (partner) terdekat berdasarkan lokasi user. Fitur utama meliputi:

- ✅ Menyimpan/mengambil alamat user
- ✅ Mencari mitra dalam radius tertentu
- ✅ Menghitung jarak otomatis dengan Haversine formula
- ✅ Filter berdasarkan jenis_jasa
- ✅ Sorting berdasarkan jarak atau rating
- ✅ Geocoding alamat ke koordinat (via Mapbox)

**Fokus Area:** Surakarta/Solo Raya (bounding box: `110.73,-7.62` sampai `110.89,-7.50`)

---

## Autentikasi

**Untuk endpoint user address** (wajib auth):
```
Header: Authorization: Bearer {token}
```

**Untuk endpoint pencarian mitra** (public, tanpa auth):
```
Tidak memerlukan token
```

> **Catatan:** Token didapatkan dari endpoint login Laravel Sanctum

---

## Endpoints

### 1. Ambil Alamat User

Mengambil alamat tersimpan user yang sedang login.

```
GET /v1/user/address
```

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "alamat_kost": "Jl. Slamet Riyadi No. 50, Solo",
    "address_detail": "Dekat Bank BRI",
    "latitude": -7.5685,
    "longitude": 110.825
  }
}
```

**Response jika belum ada alamat (200):**
```json
{
  "success": true,
  "data": {
    "alamat_kost": null,
    "address_detail": null,
    "latitude": null,
    "longitude": null
  }
}
```

---

### 2. Simpan Alamat User

Menyimpan atau memperbarui alamat user yang sedang login.

```
PUT /v1/user/address
```

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

**Request Body:**
```json
{
  "alamat_kost": "Jl. Slamet Riyadi No. 50, Solo",
  "address_detail": "Dekat Bank BRI",
  "latitude": -7.5685,
  "longitude": 110.825
}
```

**Parameter:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `alamat_kost` | string | ✅ Yes | Alamat lengkap (max 500 karakter) |
| `address_detail` | string | ❌ No | Detail tambahan (landmark, patokan) |
| `latitude` | number | ✅ Yes | Koordinat latitude (-90 sampai 90) |
| `longitude` | number | ✅ Yes | Koordinat longitude (-180 sampai 180) |

**Response Success (200):**
```json
{
  "success": true,
  "message": "Alamat berhasil disimpan.",
  "data": {
    "alamat_kost": "Jl. Slamet Riyadi No. 50, Solo",
    "latitude": -7.5685,
    "longitude": 110.825
  }
}
```

**Response Error (422 - Validasi):**
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "latitude": ["Koordinat latitude diperlukan."],
    "longitude": ["Koordinat longitude diperlukan."]
  }
}
```

---

### 3. Hapus Alamat User

Menghapus alamat tersimpan user.

```
DELETE /v1/user/address
```

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Alamat berhasil dihapus."
}
```

---

### 4. Cari Mitra Terdekat (dengan Koordinat)

Mencari mitra terdekat berdasarkan koordinat yang diberikan. **Endpoint ini yang paling sering dipakai.**

```
GET /v1/landing-page/mitra/nearby
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `lat` | number | ✅ Yes | - | Latitude user |
| `lng` | number | ✅ Yes | - | Longitude user |
| `radius` | number | ❌ No | 10 | Radius pencarian dalam KM (0.1 - 50) |
| `limit` | integer | ❌ No | 20 | Jumlah maksimal hasil (1 - 100) |
| `jenis_jasa` | string | ❌ No | - | Filter jenis_jasa (laundry, cleaning, catering, dll) |
| `sort_by` | string | ❌ No | distance | Sorting: `distance` atau `rating` |

**Contoh Request:**
```
GET /v1/landing-page/mitra/nearby?lat=-7.5755&lng=110.8237&radius=5&limit=10&jenis_jasa=laundry&sort_by=distance
```

**Response Success (200):**
```json
{
  "success": true,
  "meta": {
    "user_lat": -7.5755,
    "user_lng": 110.8237,
    "radius_km": 5,
    "total": 3,
    "filter_jenis_jasa": "laundry",
    "sort_by": "distance"
  },
  "data": [
    {
      "id": 1,
      "nama_mitra": "Laundry Bersih Solo",
      "jenis_jasa": "laundry",
      "alamat_lengkap": "Jl. Slamet Riyadi No. 50, Solo",
      "latitude": -7.5685,
      "longitude": 110.825,
      "nomor_telepon": "0812-3456-7890",
      "radius_layanan_km": 10,
      "jarak_km": 0.85,
      "maps_url": "https://www.google.com/maps/dir/?api=1&destination=-7.5685,110.825",
      "maps_origin": "https://www.google.com/maps/dir/?api=1&origin=-7.5755,110.8237&destination=-7.5685,110.825"
    },
    {
      "id": 5,
      "nama": "Laundry Wangi",
      "slug": "laundry-wangi",
      "deskripsi": "Spesialis laundry express 6 jam",
      "jenis_jasa": "laundry",
      "alamat_lengkap": "Jl. Dr. Radjiman No. 15, Solo",
      "latitude": -7.579,
      "longitude": 110.82,
      "foto": null,
      "nomor_telepon": "0856-7890-1234",
      "rating": 4.2,
      "total_review": 45,
      "jam_buka": "07:00",
      "jam_tutup": "22:00",
      "radius_layanan_km": 8,
      "jarak_km": 1.2,
      "maps_url": "https://www.google.com/maps/dir/?api=1&destination=-7.579,110.82",
      "maps_origin": "https://www.google.com/maps/dir/?api=1&origin=-7.5755,110.8237&destination=-7.579,110.82"
    }
  ]
}
```

**Penting:**
- `maps_url`: Link Google Maps ke lokasi mitra (tanpa origin)
- `maps_origin`: Link Google Maps dengan rute dari lokasi user ke mitra (untuk navigasi)
- `jarak_km`: Jarak dalam kilometer (akurat hingga 3 desimal)
- Urutan data: default terdekat dulu (jika `sort_by=distance`)

---

### 5. Cari Mitra Terdekat (dengan Alamat)

Alternatif jika frontend hanya punya alamat dalam bentuk teks. Backend akan melakukan geocoding otomatis.

```
POST /v1/landing-page/mitra/nearby
```

**Headers:**
```
Accept: application/json
Content-Type: application/json
```

**Request Body:**
```json
{
  "alamat_mitra": "Jl. Slamet Riyadi No. 50, Solo",
  "radius": 10,
  "limit": 20,
  "jenis_jasa": "laundry",
  "sort_by": "distance"
}
```

**Parameter:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `address` | string | ✅ Yes | - | Alamat lengkap (max 500 karakter) |
| `radius` | number | ❌ No | 10 | Radius dalam KM |
| `limit` | integer | ❌ No | 20 | Jumlah maksimal hasil |
| `jenis_jasa` | string | ❌ No | - | Filter jenis_jasa |
| `sort_by` | string | ❌ No | distance | `distance` atau `rating` |

**Response Success (200):**
```json
{
  "success": true,
  "meta": {
    "user_lat": -7.5685,
    "user_lng": 110.825,
    "radius_km": 10,
    "total": 5,
    "filter_jenis_jasa": "laundry",
    "sort_by": "distance"
  },
  "data": [...]
}
```

**Response Error (422 - Alamat tidak ditemukan):**
```json
{
  "success": false,
  "message": "Alamat tidak dapat ditemukan. Silakan coba alamat yang lebih spesifik."
}
```

> ⚠️ **Rekomendasi:** Gunakan endpoint GET dengan koordinat (`/v1/landing-page/mitra/nearby?lat=...&lng=...`) untuk performa lebih baik. Endpoint POST dengan alamat melakukan geocoding yang lebih lambat.

---

### 6. Daftar jenis_jasa Mitra

Mendapatkan daftar jenis_jasa yang tersedia (untuk dropdown filter).

```
GET /v1/landing-page/mitra/nearby/categories
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    "laundry",
    "daily_cleaning",
    "galon_gas"
  ]
}
```

---

## Response Format

Semua response mengikuti format standar:

### Success Response
```json
{
  "success": true,
  "message": "Pesan sukses (opsional)",
  "data": { ... },        // Data utama
  "meta": { ... }         // Metadata (opsional)
}
```

### Error Response
```json
{
  "success": false,
  "message": "Pesan error",
  "errors": {             // Detail error validasi (opsional)
    "field": ["Error message"]
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Status | Description | Kapan Terjadi |
|--------|-------------|---------------|
| 200 | OK | Request berhasil |
| 401 | Unauthorized | Token tidak valid/kadaluarsa |
| 422 | Validation Error | Input tidak valid |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

### Contoh Error 401
```json
{
  "message": "Unauthenticated."
}
```

### Contoh Error 422
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "lat": ["The lat field is required."],
    "lng": ["The lng field is required."]
  }
}
```

---

## React Integration Guide

### A. Setup API Client

```javascript
// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Helper: Ambil token dari localStorage/cookie
const getToken = () => localStorage.getItem('auth_token');

// Helper: Default headers
const defaultHeaders = (includeAuth = false) => {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Helper: Handle response
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || 'Terjadi kesalahan',
      errors: data.errors || null,
    };
  }
  
  return data;
};

// Generic request function
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, options);
    return await handleResponse(response);
  } catch (error) {
    if (error.status) throw error;
    throw { status: 500, message: 'Gagal terhubung ke server' };
  }
};
```

### B. Hooks untuk User Address

```javascript
// src/hooks/useUserAddress.js
import { useState, useEffect } from 'react';
import { apiRequest, defaultHeaders } from '../services/api';

export const useUserAddress = () => {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch address
  const fetchAddress = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/user/address', {
        headers: defaultHeaders(true),
      });
      setAddress(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save address
  const saveAddress = async (addressData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/user/address', {
        method: 'PUT',
        headers: defaultHeaders(true),
        body: JSON.stringify(addressData),
      });
      setAddress(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const deleteAddress = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await apiRequest('/user/address', {
        method: 'DELETE',
        headers: defaultHeaders(true),
      });
      setAddress(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  return {
    address,
    loading,
    error,
    saveAddress,
    deleteAddress,
    refreshAddress: fetchAddress,
  };
};
```

### C. Hooks untuk Nearby Mitra

```javascript
// src/hooks/useNearbyMitra.js
import { useState, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const useNearbyMitra = () => {
  const [mitraList, setMitraList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchNearbyMitra = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await apiRequest(
        `/mitra/nearby?${queryParams.toString()}`
      );
      
      setMitraList(response.data);
      setMeta(response.meta);
      return response;
    } catch (err) {
      setError(err.message);
      setMitraList([]);
      setMeta(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByAddress = useCallback(async (addressData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/mitra/nearby', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });
      
      setMitraList(response.data);
      setMeta(response.meta);
      return response;
    } catch (err) {
      setError(err.message);
      setMitraList([]);
      setMeta(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mitraList,
    meta,
    loading,
    error,
    searchNearbyMitra,
    searchByAddress,
  };
};
```

### D. Hooks untuk jenis_jasa

```javascript
// src/hooks/useCategories.js
import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiRequest('/mitra/nearby/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};
```

### E. Contoh Penggunaan di Komponen Utama

```jsx
// src/pages/SearchMitra.jsx
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNearbyMitra } from '../hooks/useNearbyMitra';
import { useCategories } from '../hooks/useCategories';
import { useUserAddress } from '../hooks/useUserAddress';
import LocationSearch from '../components/LocationSearch';

const SearchMitra = () => {
  const { mitraList, meta, loading, error, searchNearbyMitra } = useNearbyMitra();
  const { categories } = useCategories();
  const { address, saveAddress } = useUserAddress();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [radius, setRadius] = useState(10);
  const [sortBy, setSortBy] = useState('distance');
  const [userLocation, setUserLocation] = useState(null);

  // Trigger pencarian setelah user konfirmasi lokasi
  const handleLocationConfirm = (locationData) => {
    setUserLocation({
      lat: locationData.lat,
      lng: locationData.lng,
    });
    
    // Simpan alamat ke backend
    saveAddress({
      address: locationData.address,
      latitude: locationData.lat,
      longitude: locationData.lng,
    }).catch(console.error);
  };

  // Tombol "Cari Layanan" diklik
  const handleSearch = async () => {
    if (!userLocation) return;
    
    await searchNearbyMitra({
      lat: userLocation.lat,
      lng: userLocation.lng,
      radius: radius,
      jenis_jasa: selectedCategory || undefined,
      sort_by: sortBy,
      limit: 20,
    });
  };

  return (
    <div className="search-mitra-container">
      {/* Header Search */}
      <div className="search-header">
        <LocationSearch 
          onConfirm={handleLocationConfirm}
          onSearchSubmit={handleSearch}
        />
      </div>

      {/* Filters */}
      <div className="search-filters">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Semua jenis_jasa</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <select 
          value={radius} 
          onChange={(e) => setRadius(Number(e.target.value))}
        >
          <option value="5">5 KM</option>
          <option value="10">10 KM</option>
          <option value="20">20 KM</option>
        </select>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="distance">Terdekat</option>
          <option value="rating">Rating Tertinggi</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-spinner">Mencari mitra terdekat...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-message">
          ❌ {error}
          <button onClick={handleSearch}>Coba Lagi</button>
        </div>
      )}

      {/* Map + Results */}
      {userLocation && (
        <div className="search-results-container">
          <div className="map-section">
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              {/* User Marker */}
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>📍 Lokasi Anda</Popup>
              </Marker>
              
              {/* Mitra Markers */}
              {mitraList.map((mitra) => (
                <Marker 
                  key={mitra.id}
                  position={[mitra.latitude, mitra.longitude]}
                >
                  <Popup>
                    <div className="mitra-popup">
                      <h4>{mitra.nama}</h4>
                      <p>{mitra.alamat_lengkap}</p>
                      <p>⭐ {mitra.rating} ({mitra.total_review} review)</p>
                      <p>📏 {mitra.jarak_km} km</p>
                      <a href={mitra.maps_origin} target="_blank" rel="noopener">
                        🗺️ Petunjuk Arah
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="list-section">
            <h3>
              {meta?.total || 0} Mitra Ditemukan 
              (dalam {meta?.radius_km || radius} km)
            </h3>
            
            {mitraList.length === 0 && !loading && (
              <div className="empty-state">
                <p>Tidak ada mitra ditemukan di sekitar lokasi Anda.</p>
                <p>Coba perluas radius pencarian atau ubah jenis_jasa.</p>
              </div>
            )}
            
            {mitraList.map((mitra) => (
              <div key={mitra.id} className="mitra-card">
                {mitra.foto && <img src={mitra.foto} alt={mitra.nama} />}
                <div className="mitra-info">
                  <h4>{mitra.nama}</h4>
                  <span className="badge">{mitra.jenis_jasa}</span>
                  <p>{mitra.alamat_lengkap}</p>
                  <div className="mitra-meta">
                    <span>⭐ {mitra.rating} ({mitra.total_review})</span>
                    <span>📏 {mitra.jarak_km} km</span>
                    {mitra.jam_buka && (
                      <span>🕐 {mitra.jam_buka} - {mitra.jam_tutup}</span>
                    )}
                  </div>
                  <div className="mitra-actions">
                    <a 
                      href={mitra.maps_origin} 
                      target="_blank" 
                      rel="noopener"
                      className="btn-directions"
                    >
                      🗺️ Petunjuk Arah
                    </a>
                    <a 
                      href={`tel:${mitra.nomor_telepon}`}
                      className="btn-call"
                    >
                      📞 Hubungi
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchMitra;
```

### F. Integrasi dengan LocationSearch (Flow Lengkap)

```jsx
// Di komponen induk (App.jsx atau Home.jsx)
const handleSearchFlow = async (addressInfo) => {
  // Step 1: User sudah konfirmasi lokasi di LocationSearch
  // Step 2: Simpan ke backend
  await saveAddress({
    address: addressInfo.address,
    latitude: addressInfo.lat,
    longitude: addressInfo.lng,
  });

  // Step 3: Cari mitra terdekat
  await searchNearbyMitra({
    lat: addressInfo.lat,
    lng: addressInfo.lng,
    radius: currentRadius,
    jenis_jasa: currentCategory,
    sort_by: currentSort,
  });

  // Step 4: Update UI untuk menunjukkan hasil
  setShowResults(true);
};
```

---

## Testing Examples

### A. cURL Commands

```bash
# 1. Login (dapatkan token)
curl -X POST https://api.example.com/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 2. Cari mitra terdekat (dengan koordinat)
curl -X GET "https://api.example.com/v1/landing-page/mitra/nearby?lat=-7.5755&lng=110.8237&radius=10&jenis_jasa=laundry&sort_by=distance" \
  -H "Accept: application/json"

# 3. Simpan alamat user
curl -X PUT https://api.example.com/v1/user/address \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alamat_kost": "Jl. Slamet Riyadi No. 50, Solo",
    "address_detail": "Dekat Bank BRI",
    "latitude": -7.5685,
    "longitude": 110.825
  }'

# 4. Ambil alamat user
curl -X GET https://api.example.com/v1/user/address \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Dapatkan daftar jenis_jasa
curl -X GET https://api.example.com/v1/landing-page/mitra/nearby/categories
```

### B. JavaScript Fetch Example

```javascript
// Pencarian mitra dengan berbagai filter
async function exampleSearch() {
  try {
    const params = new URLSearchParams({
      lat: '-7.5755',
      lng: '110.8237',
      radius: '10',
      limit: '20',
      jenis_jasa: 'laundry',
      sort_by: 'distance'
    });
    
    const response = await fetch(
      `https://api.example.com/v1/landing-page/mitra/nearby?${params}`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`Ditemukan ${data.meta.total} mitra`);
      data.data.forEach(mitra => {
        console.log(`${mitra.nama} - ${mitra.jarak_km} km - ⭐${mitra.rating}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## Rate Limiting

Untuk melindungi API dari abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `GET /v1/landing-page/mitra/nearby` | 60 requests | per menit |
| `POST /v1/landing-page/mitra/nearby` | 10 requests | per menit |
| `GET /v1/landing-page/mitra/nearby/categories` | 30 requests | per menit |
| User address endpoints | 30 requests | per menit |

**Headers response rate limit:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 55
Retry-After: 30
```

Saat limit tercapai (HTTP 429), frontend harus menunggu sebelum retry. Contoh handling:

```javascript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After') || 30;
  console.log(`Rate limited. Retry after ${retryAfter} seconds`);
  // Tampilkan pesan ke user
  showNotification('Terlalu banyak request. Silakan tunggu sebentar.');
}
```

---

## Environment Variables (.env Frontend)

```env
VITE_API_BASE_URL=https://api.example.com/api
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiw...
```

---
