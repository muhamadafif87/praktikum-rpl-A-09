import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DetailMitraLaundry from '../features/mitra/DetailMitraLaundry/DetailMitraLaundry';
import AuthInterceptor from '../features/auth/AuthInterceptor/AuthInterceptor';

/**
 * LaundryPage — Page-level component
 * Menghubungkan DetailMitra (daftar mitra) dengan AuthInterceptor (modal autentikasi).
 *
 * Flow:
 * 1. User melihat daftar mitra laundry (DetailMitra)
 * 2. User klik "Pesan Sekarang" pada salah satu mitra
 * 3. DetailMitra cek token di localStorage (dari Laravel Sanctum + Supabase)
 * 4. Jika belum login → trigger onOrderClick → modal AuthInterceptor muncul
 * 5. User bisa pilih: Masuk (/login), Daftar (/register), atau Kembali (tutup modal)
 */
const LaundryPage = () => {
    const navigate = useNavigate();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedMitra, setSelectedMitra] = useState(null);

    const handleOrderClick = (mitra) => {
        setSelectedMitra(mitra);
        setShowAuthModal(true);
    };

    const handleCloseModal = () => {
        setShowAuthModal(false);
        setSelectedMitra(null);
    };

    return (
        <>
            <DetailMitraLaundry onOrderClick={handleOrderClick} />

            <AuthInterceptor
                isOpen={showAuthModal}
                onClose={handleCloseModal}
            />
        </>
    );
};

export default LaundryPage;
