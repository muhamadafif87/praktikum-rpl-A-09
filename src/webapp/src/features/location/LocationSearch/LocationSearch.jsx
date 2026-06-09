import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLocation } from '../../../context/LocationContext';
import { useAuth } from '../../../context/AuthContext';
import { useDebounce } from '../../../hooks/useDebounce';
import api from '../../../services/api';
import './LocationSearch.css';

// ══════════════════════════════════════════════════════════════
// Mapbox Access Token — loaded from environment variable
// Set VITE_MAPBOX_TOKEN in .env at the Vite project root
// Get one free at: https://account.mapbox.com/access-tokens/
// ══════════════════════════════════════════════════════════════
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

if (!MAPBOX_TOKEN) {
    console.warn(
        '[LocationSearch] VITE_MAPBOX_TOKEN is not set. ' +
        'Add it to src/webapp/.env to enable location search.'
    );
}

// Mapbox Search Box API (v6) endpoints - specifically designed for POIs and businesses
const MAPBOX_SUGGEST_URL = 'https://api.mapbox.com/search/searchbox/v1/suggest';
const MAPBOX_RETRIEVE_URL = 'https://api.mapbox.com/search/searchbox/v1/retrieve';
const MAPBOX_REVERSE_URL = 'https://api.mapbox.com/search/searchbox/v1/reverse';

// Surakarta/Solo center coordinates (for proximity bias)
const SOLO_CENTER = { lng: 110.8237, lat: -7.5755 };

// Strict Surakarta bounding box: [minLng, minLat, maxLng, maxLat]
const SOLO_BBOX = '110.73,-7.62,110.89,-7.50';

// Fix default marker icon issue with bundlers (Vite/Webpack)
// Leaflet's default icon paths break when bundled — we manually set them
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * Komponen internal: Mengubah posisi center peta saat koordinat berubah.
 */
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 17, { duration: 1.2 });
        }
    }, [lat, lng, map]);
    return null;
};

/**
 * Komponen internal: Marker yang bisa digeser (draggable).
 * Setiap kali drag selesai, koordinat baru dikirim ke parent via onDragEnd.
 */
const DraggableMarker = ({ position, onDragEnd }) => {
    const markerRef = useRef(null);

    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const { lat, lng } = marker.getLatLng();
                onDragEnd(lat, lng);
            }
        },
    }), [onDragEnd]);

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
};

/**
 * LocationSearch — Komponen pencarian lokasi dengan autocomplete + mini-map.
 * Menggunakan Mapbox Geocoding API v5 untuk forward & reverse geocoding.
 *
 * Props:
 * - onConfirm: callback ketika user mengonfirmasi lokasi (opsional)
 * - onSearchSubmit: callback ketika user klik "Cari Layanan" (opsional)
 */
const LocationSearch = ({ onConfirm, onSearchSubmit }) => {
    const { location, setLocation } = useLocation();
    const { isAuthenticated, updateUser } = useAuth();

    // Input & autocomplete state
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Pin position (local state sebelum dikonfirmasi ke context)
    const [pinLat, setPinLat] = useState(null);
    const [pinLng, setPinLng] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    // Generate a session token for Mapbox suggest/retrieve pairing
    const [sessionToken] = useState(() => Math.random().toString(36).substring(2) + Date.now().toString(36));

    // Debounce lowered to 200ms for snappier Mapbox typeahead
    const debouncedQuery = useDebounce(query, 200);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Close suggestions dropdown when clicking outside
    useEffect(() => {
        console.log("Token loaded:", import.meta.env.VITE_MAPBOX_TOKEN ? "Yes" : "No", "Token value:", import.meta.env.VITE_MAPBOX_TOKEN);
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Forward Geocoding: Fetch suggestions from Mapbox ──
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 1) {
            setSuggestions([]);
            return;
        }

        const controller = new AbortController();

        const fetchSuggestions = async () => {
            setIsLoadingSuggestions(true);
            try {
                // Mapbox Search Box API (v6) Suggest endpoint for true typeahead
                const params = new URLSearchParams({
                    access_token: MAPBOX_TOKEN,
                    q: debouncedQuery.trim(),
                    bbox: SOLO_BBOX,
                    proximity: `${SOLO_CENTER.lng},${SOLO_CENTER.lat}`,
                    types: 'poi,address,neighborhood,locality,place',
                    language: 'id',
                    limit: '8',
                    session_token: sessionToken
                });

                const fetchUrl = `${MAPBOX_SUGGEST_URL}?${params.toString()}`;
                console.log("Fetching URL:", fetchUrl);

                const response = await fetch(fetchUrl, { signal: controller.signal });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Mapbox Geocoding API error ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                const features = data.suggestions || []; // v6 suggest returns 'suggestions'

                // Deduplicate by mapbox_id
                const seenIds = new Set();
                const deduped = features.filter((f) => {
                    const id = f.mapbox_id;
                    if (seenIds.has(id)) return false;
                    seenIds.add(id);
                    return true;
                });

                setSuggestions(deduped);
                setShowSuggestions(deduped.length > 0);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Mapbox Fetch Error:', err);
                    setSuggestions([]);
                }
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        fetchSuggestions();

        return () => controller.abort();
    }, [debouncedQuery]);

    /**
     * Mengambil label utama (title) dari Mapbox v6 suggest feature.
     */
    const getSuggestionTitle = (feature) => {
        return feature.name || 'Lokasi';
    };

    /**
     * Mengambil detail alamat dari Mapbox v6 suggest feature.
     */
    const getAddressDetail = (feature) => {
        return feature.place_formatted || feature.full_address || '';
    };

    /**
     * Format a Mapbox feature into a clean display address for the input field.
     */
    const formatDisplayAddress = (feature) => {
        const title = getSuggestionTitle(feature);
        const detail = getAddressDetail(feature);
        if (detail && detail !== title) {
            return `${title}, ${detail}`;
        }
        return title;
    };

    /**
     * Saat user memilih alamat dari dropdown autocomplete.
     * v6 suggest returns a mapbox_id. We must retrieve coordinates via /retrieve.
     */
    const handleSelectSuggestion = async (feature) => {
        setIsReverseGeocoding(true); // Re-use spinner for retrieving coordinates
        try {
            const retrieveUrl = `${MAPBOX_RETRIEVE_URL}/${feature.mapbox_id}?access_token=${MAPBOX_TOKEN}&session_token=${sessionToken}`;
            const response = await fetch(retrieveUrl);
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                const fullFeature = data.features[0];
                const [lng, lat] = fullFeature.geometry.coordinates;
                const address = formatDisplayAddress(feature); // formatting using the original suggestion

                setPinLat(lat);
                setPinLng(lng);
                setSelectedAddress(address);
                setQuery(address);
                setShowSuggestions(false);
                setShowMap(true);
                setIsConfirmed(false);
            }
        } catch (e) {
            console.error("Retrieve error", e);
        } finally {
            setIsReverseGeocoding(false);
        }
    };

    /**
     * Saat user menggeser pin di peta.
     * Focuses PURELY on capturing latitude and longitude coordinates.
     * Does NOT reverse geocode or overwrite the user's main search input text.
     */
    const handleMarkerDragEnd = (lat, lng) => {
        setPinLat(lat);
        setPinLng(lng);
        setIsConfirmed(false);
    };

    /**
     * Tombol "Konfirmasi Lokasi" — simpan ke context dan database jika login.
     */
    const handleConfirmLocation = async () => {
        if (pinLat && pinLng && selectedAddress) {
            setLocation(selectedAddress, pinLat, pinLng);
            setIsConfirmed(true);
            
            // Save to database if authenticated
            if (isAuthenticated) {
                try {
                    const response = await api.put('/v1/auth/me', {
                        latitude: pinLat,
                        longitude: pinLng,
                        address_detail: selectedAddress
                    });
                    // Update AuthContext user data seamlessly
                    updateUser(response.data.data);
                } catch (error) {
                    console.error("Gagal menyimpan lokasi ke profil:", error);
                }
            }

            if (onConfirm) onConfirm();
        }
    };

    /**
     * Tombol "Cari Layanan" atau Enter.
     */
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        
        // Hanya lanjut jika lokasi sudah dikonfirmasi
        if (!isConfirmed) return;

        if (onSearchSubmit) onSearchSubmit();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (showSuggestions && suggestions.length > 0) {
                handleSelectSuggestion(suggestions[0]);
            } else if (isConfirmed) {
                handleSearchSubmit();
            }
        }
    };

    return (
        <div className="loc-search" ref={wrapperRef}>
            {/* Search Input Bar + Dropdown Anchor */}
            <div className="loc-search-anchor">
                <form className="loc-search-box" onSubmit={handleSearchSubmit}>
                    <div className="loc-search-input-wrapper">
                        <span className="material-symbols-outlined loc-search-icon">location_on</span>
                        <input
                            ref={inputRef}
                            className="loc-search-input"
                            placeholder="Masukkan alamat kos atau apartemenmu di Solo..."
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setIsConfirmed(false);
                                if (e.target.value.length < 1) {
                                    setShowMap(false);
                                }
                            }}
                            onFocus={() => {
                                if (suggestions.length > 0) setShowSuggestions(true);
                            }}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                            id="location-search-input"
                        />
                        {isLoadingSuggestions && (
                            <div className="loc-search-spinner" />
                        )}
                        {isConfirmed && (
                            <span className="material-symbols-outlined loc-search-confirmed">check_circle</span>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="loc-search-btn"
                        disabled={!isConfirmed}
                    >
                        Cari Layanan
                    </button>
                </form>

                {/* Autocomplete Dropdown — anchored to search box, overlays map */}
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="loc-suggestions" id="location-suggestions">
                        {suggestions.map((feature, idx) => (
                            <li
                                key={feature.id || idx}
                                className="loc-suggestion-item"
                                onClick={() => handleSelectSuggestion(feature)}
                            >
                                <span className="material-symbols-outlined loc-suggestion-icon">place</span>
                                <div className="loc-suggestion-text">
                                    <span className="loc-suggestion-main">
                                        {getSuggestionTitle(feature)}
                                    </span>
                                    <span className="loc-suggestion-detail">
                                        {getAddressDetail(feature)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Mini-Map with Draggable Pin */}
            {showMap && pinLat && pinLng && (
                <div className="loc-map-container">
                    <div className={`loc-map-header${isReverseGeocoding ? ' loc-map-header--loading' : ''}`}>
                        <span className="material-symbols-outlined">my_location</span>
                        <span>
                            {isReverseGeocoding
                                ? 'Memperbarui alamat...'
                                : 'Geser pin untuk akurasi lokasi yang lebih presisi'}
                        </span>
                    </div>
                    <div className="loc-map-wrapper" id="location-minimap">
                        <MapContainer
                            center={[pinLat, pinLng]}
                            zoom={17}
                            scrollWheelZoom={true}
                            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <RecenterMap lat={pinLat} lng={pinLng} />
                            <DraggableMarker
                                position={[pinLat, pinLng]}
                                onDragEnd={handleMarkerDragEnd}
                            />
                        </MapContainer>
                    </div>
                    <div className="loc-map-footer">
                        <div className="loc-map-coords">
                            <span className="material-symbols-outlined loc-coords-icon">explore</span>
                            <span className="loc-coords-text">
                                {pinLat.toFixed(6)}, {pinLng.toFixed(6)}
                            </span>
                        </div>
                        <button
                            className={`loc-confirm-btn ${isConfirmed ? 'loc-confirm-btn--confirmed' : ''}`}
                            onClick={handleConfirmLocation}
                            type="button"
                            id="confirm-location-btn"
                        >
                            <span className="material-symbols-outlined">
                                {isConfirmed ? 'check_circle' : 'pin_drop'}
                            </span>
                            {isConfirmed ? 'Lokasi Dikonfirmasi' : 'Konfirmasi Lokasi'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationSearch;
