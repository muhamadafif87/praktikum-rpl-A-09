import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './PesananSukses.css';

const PesananSukses = () => {
    const navigate = useNavigate();
    const { id_pesanan } = useParams();

    return (
        <div className="ps-container">
            <div className="ps-card">
                <div className="ps-icon-wrapper">
                    <span className="material-symbols-outlined ps-icon" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                </div>
                
                <h1 className="ps-title">Pembayaran Berhasil!</h1>
                <p className="ps-subtitle">Hore! Pesanan Anda telah diterima dan diteruskan ke Mitra KostHub.</p>
                
                <div className="ps-order-id">
                    <span>ID Pesanan:</span>
                    <strong>{id_pesanan}</strong>
                </div>

                <div className="ps-info-box">
                    <span className="material-symbols-outlined">info</span>
                    <p>Mitra kami akan segera memproses pesanan Anda. Pastikan nomor WhatsApp Anda aktif agar mitra bisa menghubungi Anda jika diperlukan.</p>
                </div>

                <div className="ps-actions">
                    <button className="ps-btn-primary" onClick={() => navigate('/')}>
                        Kembali ke Beranda
                    </button>
                    {/* Placeholder for future history feature */}
                    {/* <button className="ps-btn-secondary" onClick={() => navigate('/riwayat-pesanan')}>Lihat Riwayat Pesanan</button> */}
                </div>
            </div>

            <footer className="lp-footer" style={{marginTop: 'auto', width: '100%'}}>
                <div className="lp-container lp-footer-inner" style={{paddingTop: '24px', paddingBottom: '24px'}}>
                    <div className="lp-footer-brand">
                        <Link to="/" className="lp-footer-logo">KostHub<span className="lp-footer-dot">.</span></Link>
                        <p className="lp-footer-desc">Solusi praktis anak kos di Solo.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PesananSukses;
