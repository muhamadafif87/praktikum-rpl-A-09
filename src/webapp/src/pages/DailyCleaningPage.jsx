import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DetailMitraCleaning from '../features/mitra/DetailMitraCleaning/DetailMitraCleaning';
import AuthInterceptor from '../features/auth/AuthInterceptor/AuthInterceptor';

/**
 * DailyCleaningPage — Page-level component
 * Menghubungkan DetailMitraCleaning (daftar mitra cleaning) dengan AuthInterceptor (modal autentikasi).
 * 
 * Flow:
 * 1. User melihat daftar mitra daily cleaning (DetailMitraCleaning)
 * 2. User klik "Pesan Sekarang" pada salah satu mitra
 * 3. DetailMitraCleaning cek token di localStorage (dari Laravel Sanctum + Supabase)
 * 4. Jika belum login → trigger onOrderClick → modal AuthInterceptor muncul
 * 5. User bisa pilih: Masuk (/login), Daftar (/register), atau Kembali (tutup modal)
 */
const DailyCleaningPage = () => {
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
            <DetailMitraCleaning onOrderClick={handleOrderClick} />

            <AuthInterceptor
                isOpen={showAuthModal}
                onClose={handleCloseModal}
            />
        </>
    );
};

export default DailyCleaningPage;
