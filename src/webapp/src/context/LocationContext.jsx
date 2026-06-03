import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * LocationContext — Global state untuk menyimpan lokasi pilihan user.
 * 
 * Data yang disimpan:
 * - address (string): Teks alamat yang dipilih user
 * - lat (number): Latitude koordinat final
 * - lng (number): Longitude koordinat final
 * - isConfirmed (boolean): True setelah user mengonfirmasi pin di peta
 * 
 * Default fallback: area UNS Surakarta (-7.5567, 110.8565)
 */

const DEFAULT_LOCATION = {
    address: 'Jl. Ir. Sutami, Jebres, Surakarta',
    lat: -7.5567,
    lng: 110.8565,
    isConfirmed: false,
};

const LocationContext = createContext(undefined);

export const LocationProvider = ({ children }) => {
    const [location, setLocationState] = useState(DEFAULT_LOCATION);

    const setLocation = useCallback((address, lat, lng) => {
        setLocationState({
            address,
            lat,
            lng,
            isConfirmed: true,
        });
    }, []);

    const clearLocation = useCallback(() => {
        setLocationState(DEFAULT_LOCATION);
    }, []);

    return (
        <LocationContext.Provider value={{ location, setLocation, clearLocation }}>
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
