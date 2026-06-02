import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DetailMitraGas from '../features/mitra/DetailMitraGas/DetailMitraGas';
import AuthInterceptor from '../features/auth/AuthInterceptor/AuthInterceptor';

/**
 * GasGalonPage — Page-level component
 * Menghubungkan DetailMitraGas (daftar mitra gas & galon) dengan AuthInterceptor (modal autentikasi).
 * 
 * Flow:
 * 1. User melihat daftar mitra gas & galon (DetailMitraGas)
 * 2. User klik "Pesan Sekarang" pada salah satu mitra
 * 3. DetailMitraGas cek token di localStorage (dari Laravel Sanctum + Supabase)
 * 4. Jika belum login → trigger onOrderClick → modal AuthInterceptor muncul
 * 5. User bisa pilih: Masuk (/login), Daftar (/register), atau Kembali (tutup modal)
 */
const GasGalonPage = () => {
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
            <DetailMitraGas onOrderClick={handleOrderClick} />

            <AuthInterceptor
                isOpen={showAuthModal}
                onClose={handleCloseModal}
            />
        </>
    );
};

export default GasGalonPage;
