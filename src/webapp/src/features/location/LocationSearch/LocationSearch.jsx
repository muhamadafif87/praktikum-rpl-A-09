import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLocation } from '../../../context/LocationContext';
import { useDebounce } from '../../../hooks/useDebounce';
import './LocationSearch.css';

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
 * 
 * Props:
 * - onConfirm: callback ketika user mengonfirmasi lokasi (opsional)
 * - onSearchSubmit: callback ketika user klik "Cari Layanan" (opsional)
 */
const LocationSearch = ({ onConfirm, onSearchSubmit }) => {
    const { location, setLocation } = useLocation();

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

    const debouncedQuery = useDebounce(query, 400);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Close suggestions dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions from Nominatim when debounced query changes
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 3) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setIsLoadingSuggestions(true);
            try {
                // Nominatim search with viewbox limited to Solo area
                // viewbox: west,south,east,north (Solo area bounding box)
                const params = new URLSearchParams({
                    q: debouncedQuery,
                    format: 'json',
                    addressdetails: '1',
                    limit: '6',
                    viewbox: '110.75,-7.62,110.90,-7.50',
                    bounded: '1',
                    'accept-language': 'id',
                });

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
                    {
                        headers: {
                            'User-Agent': 'KostHub-App/1.0',
                        },
                    }
                );

                if (!response.ok) throw new Error('Nominatim API error');

                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(data.length > 0);
            } catch (err) {
                console.error('Error fetching suggestions:', err);
                setSuggestions([]);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        fetchSuggestions();
    }, [debouncedQuery]);

    /**
     * Format display name dari Nominatim response.
     * Menampilkan detail kelurahan, kecamatan, kota/kabupaten.
     */
    const formatAddress = (item) => {
        const addr = item.address || {};
        const parts = [];

        // Road/place name
        if (addr.road) parts.push(addr.road);
        else if (addr.hamlet) parts.push(addr.hamlet);
        else if (addr.village) parts.push(addr.village);
        else if (item.display_name) {
            // Use first part of display_name as fallback
            const firstPart = item.display_name.split(',')[0];
            parts.push(firstPart);
        }

        // Kelurahan/Suburb
        if (addr.suburb) parts.push(addr.suburb);
        else if (addr.village) parts.push(addr.village);

        // Kecamatan
        if (addr.city_district) parts.push(addr.city_district);
        else if (addr.borough) parts.push(addr.borough);

        // Kota/Kabupaten
        if (addr.city) parts.push(addr.city);
        else if (addr.town) parts.push(addr.town);
        else if (addr.county) parts.push(addr.county);

        // Deduplicate
        const unique = [...new Set(parts)];
        return unique.join(', ') || item.display_name;
    };

    /**
     * Saat user memilih alamat dari dropdown autocomplete.
     */
    const handleSelectSuggestion = (item) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const address = formatAddress(item);

        setPinLat(lat);
        setPinLng(lng);
        setSelectedAddress(address);
        setQuery(address);
        setShowSuggestions(false);
        setShowMap(true);
        setIsConfirmed(false);
    };

    /**
     * Saat user menggeser pin di peta.
     */
    const handleMarkerDragEnd = (lat, lng) => {
        setPinLat(lat);
        setPinLng(lng);
        setIsConfirmed(false);
    };

    /**
     * Tombol "Konfirmasi Lokasi" — simpan ke context.
     */
    const handleConfirmLocation = () => {
        if (pinLat && pinLng && selectedAddress) {
            setLocation(selectedAddress, pinLat, pinLng);
            setIsConfirmed(true);
            if (onConfirm) onConfirm();
        }
    };

    /**
     * Tombol "Cari Layanan" atau Enter.
     */
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        
        // Auto-confirm jika belum dikonfirmasi
        if (!isConfirmed && pinLat && pinLng && selectedAddress) {
            setLocation(selectedAddress, pinLat, pinLng);
            setIsConfirmed(true);
        }

        if (onSearchSubmit) onSearchSubmit();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (showSuggestions && suggestions.length > 0) {
                handleSelectSuggestion(suggestions[0]);
            } else if (isConfirmed || (pinLat && pinLng)) {
                handleSearchSubmit();
            }
        }
    };

    return (
        <div className="loc-search" ref={wrapperRef}>
            {/* Search Input Bar */}
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
                            if (e.target.value.length < 3) {
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
                    disabled={!location.isConfirmed && !isConfirmed && !(pinLat && pinLng)}
                >
                    Cari Layanan
                </button>
            </form>

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <ul className="loc-suggestions" id="location-suggestions">
                    {suggestions.map((item, idx) => (
                        <li
                            key={item.place_id || idx}
                            className="loc-suggestion-item"
                            onClick={() => handleSelectSuggestion(item)}
                        >
                            <span className="material-symbols-outlined loc-suggestion-icon">place</span>
                            <div className="loc-suggestion-text">
                                <span className="loc-suggestion-main">
                                    {item.address?.road || item.address?.hamlet || item.address?.village || item.display_name.split(',')[0]}
                                </span>
                                <span className="loc-suggestion-detail">
                                    {formatAddress(item)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Mini-Map with Draggable Pin */}
            {showMap && pinLat && pinLng && (
                <div className="loc-map-container">
                    <div className="loc-map-header">
                        <span className="material-symbols-outlined">my_location</span>
                        <span>Geser pin untuk akurasi lokasi yang lebih presisi</span>
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
