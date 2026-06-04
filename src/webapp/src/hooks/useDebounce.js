import { useState, useEffect } from 'react';

/**
 * useDebounce — Menunda perubahan value selama delay tertentu.
 * 
 * Digunakan untuk menghindari terlalu banyak API call saat user mengetik.
 * Value baru hanya di-emit setelah user berhenti mengetik selama `delay` ms.
 * 
 * @param {any} value - Value yang ingin di-debounce
 * @param {number} delay - Delay dalam milidetik (default: 400ms)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 400) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
