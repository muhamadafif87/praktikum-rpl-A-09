import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * LocationContext — Global state untuk menyimpan lokasi pilihan user.
 * 
 * Data yang disimpan:
 * - address (string): Teks alamat yang dipilih user
 * - lat (number): Latitude koordinat final
 * - lng (number): Longitude koordinat final
 * - isConfirmed (boolean): True setelah user mengonfirmasi pin di peta
 * - isFromProfile (boolean): True jika ditarik otomatis dari database profile
 * 
 * Default fallback: Kosong agar user harus set lokasi.
 */

const DEFAULT_LOCATION = {
    address: '',
    lat: null,
    lng: null,
    isConfirmed: false,
    isFromProfile: false,
};

const LocationContext = createContext(undefined);

export const LocationProvider = ({ children }) => {
    const [location, setLocationState] = useState(() => {
        try {
            const saved = localStorage.getItem('userLocation');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Kompatibilitas mundur untuk data lama yang belum punya flag isConfirmed
                if (parsed.isConfirmed === undefined) {
                    parsed.isConfirmed = true;
                }
                return parsed;
            }
        } catch (e) {
            console.error('Failed to parse userLocation from localStorage', e);
        }
        return DEFAULT_LOCATION;
    });
    const [isMapOpen, setIsMapOpen] = useState(false);

    const setLocation = useCallback((address, lat, lng, isFromProfile = false) => {
        const newLocation = {
            address,
            lat,
            lng,
            isConfirmed: true,
            isFromProfile,
        };
        setLocationState(newLocation);
        localStorage.setItem('userLocation', JSON.stringify(newLocation));
    }, []);

    const clearLocation = useCallback(() => {
        setLocationState(DEFAULT_LOCATION);
        localStorage.removeItem('userLocation');
    }, []);

    const syncWithUser = useCallback((user) => {
        if (user && user.latitude && user.longitude) {
            const newLocation = {
                address: user.address_detail || 'Sesuai Profil',
                lat: parseFloat(user.latitude),
                lng: parseFloat(user.longitude),
                isConfirmed: true,
                isFromProfile: true,
            };
            setLocationState(newLocation);
            localStorage.setItem('userLocation', JSON.stringify(newLocation));
        }
    }, []);

    const openMap = useCallback(() => setIsMapOpen(true), []);
    const closeMap = useCallback(() => setIsMapOpen(false), []);

    return (
        <LocationContext.Provider value={{ location, setLocation, clearLocation, syncWithUser, isMapOpen, openMap, closeMap }}>
            {children}
        </LocationContext.Provider>
    );
};

/**
 * Custom hook untuk mengakses LocationContext.
 * Throw error jika digunakan di luar LocationProvider.
 */
export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation harus digunakan di dalam LocationProvider');
    }
    return context;
};

export default LocationContext;
