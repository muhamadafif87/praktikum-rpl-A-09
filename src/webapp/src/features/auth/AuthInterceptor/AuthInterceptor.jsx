import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthInterceptor.css';

/**
 * AuthInterceptor — Modal autentikasi yang muncul saat user belum login
 * dan mencoba menekan tombol "Pesan Sekarang" di halaman Detail Mitra.
 * 
 * Props:
 * - isOpen: boolean — apakah modal ditampilkan
 * - onClose: function — callback untuk menutup modal
 */
const AuthInterceptor = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    // Lock body scroll ketika modal terbuka
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleLogin = () => {
        onClose();
        navigate('/login');
    };

    const handleRegister = () => {
        onClose();
        navigate('/register');
    };

    return (
        <div className="ai-overlay">
            {/* Backdrop */}
            <div className="ai-backdrop" onClick={onClose}></div>

            {/* Modal Card */}
            <div className="ai-card">
                {/* Icon */}
                <div className="ai-icon-wrapper">
                    <span className="material-symbols-outlined" aria-hidden="true">shield</span>
                </div>

                {/* Typography */}
                <h2 className="ai-title">
                    Langkah Aman: Autentikasi Diperlukan
                </h2>
                <p className="ai-description">
                    Untuk melanjutkan pemesanan jasa dengan perlindungan Escrow KostHub, Anda wajib masuk ke akun Anda terlebih dahulu agar data transaksi tercatat dengan aman.
                </p>

                {/* Actions */}
                <div className="ai-actions">
                    <button
                        className="ai-btn-login"
                        type="button"
                        onClick={handleLogin}
                    >
                        Masuk ke Akun Saya
                    </button>

                    <button
                        className="ai-btn-register"
                        type="button"
                        onClick={handleRegister}
                    >
                        Daftar Akun Baru (Pelanggan)
                    </button>

                    <button
                        className="ai-btn-back"
                        type="button"
                        onClick={onClose}
                    >
                        Kembali Jelajahi Katalog
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthInterceptor;
