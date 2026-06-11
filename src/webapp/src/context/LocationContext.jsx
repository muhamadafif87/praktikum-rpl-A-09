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
    const [location, setLocationState] = useState(DEFAULT_LOCATION);

    const setLocation = useCallback((address, lat, lng, isFromProfile = false) => {
        setLocationState({
            address,
            lat,
            lng,
            isConfirmed: true,
            isFromProfile,
        });
    }, []);

    const clearLocation = useCallback(() => {
        setLocationState(DEFAULT_LOCATION);
    }, []);

    const syncWithUser = useCallback((user) => {
        if (user && user.latitude && user.longitude) {
            setLocationState({
                address: user.address_detail || 'Sesuai Profil',
                lat: parseFloat(user.latitude),
                lng: parseFloat(user.longitude),
                isConfirmed: true,
                isFromProfile: true,
            });
        }
    }, []);

    return (
        <LocationContext.Provider value={{ location, setLocation, clearLocation, syncWithUser }}>
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
