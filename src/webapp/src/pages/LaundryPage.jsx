import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DetailMitra from '../features/mitra/DetailMitra/DetailMitra';

/**
 * LaundryPage — Page-level component
 * Menghubungkan DetailMitra (daftar mitra) dengan AuthInterceptor (modal autentikasi).
 * AuthInterceptor akan ditambahkan di branch feature/landingpage-authinterceptor.
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
            <DetailMitra onOrderClick={handleOrderClick} />

            {/* AuthInterceptor modal akan diintegrasikan di branch authinterceptor */}
        </>
    );
};

export default LaundryPage;
