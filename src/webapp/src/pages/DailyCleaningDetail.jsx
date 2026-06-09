import './DailyCleaningDetail.css';
import '../features/landing/LandingPage/LandingPage.css';
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DailyCleaningDetail = () => {
    const { id_mitra } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [sewaAlat, setSewaAlat] = useState(false);
    const [tanggal, setTanggal] = useState('');
    const [jam, setJam] = useState('');
    const [catatan, setCatatan] = useState('');

    const navLinksRef = useRef(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const updateIndicator = useCallback((targetEl) => {
        const ul = navLinksRef.current;
        if (!ul || !targetEl) return;
        const ulRect = ul.getBoundingClientRect();
        const linkRect = targetEl.getBoundingClientRect();
        ul.style.setProperty('--indicator-left', `${linkRect.left - ulRect.left}px`);
        ul.style.setProperty('--indicator-width', `${linkRect.width}px`);
    }, []);

    useLayoutEffect(() => {
        const ul = navLinksRef.current;
        if (!ul) return;
        const activeLink = ul.querySelector('.lp-nav-link--active');
        if (!activeLink) return;
        const prevRaw = sessionStorage.getItem('nav-indicator');
        const hasPrev = !!prevRaw;
        ul.style.setProperty('--indicator-transition', 'none');
        if (hasPrev) {
            const { left, width } = JSON.parse(prevRaw);
            ul.style.setProperty('--indicator-left', left);
            ul.style.setProperty('--indicator-width', width);
            sessionStorage.removeItem('nav-indicator');
        } else {
            updateIndicator(activeLink);
        }
        void ul.offsetHeight;
        ul.style.removeProperty('--indicator-transition');
        if (hasPrev) {
            updateIndicator(activeLink);
        }
    }, [updateIndicator]);

    const handleNavHover = (e) => updateIndicator(e.currentTarget);
    const handleNavLeave = () => {
        const ul = navLinksRef.current;
        if (!ul) return;
        const activeLink = ul.querySelector('.lp-nav-link--active');
        if (activeLink) updateIndicator(activeLink);
    };
    const handleNavClick = () => {
        const ul = navLinksRef.current;
        if (!ul) return;
        const left = ul.style.getPropertyValue('--indicator-left');
        const width = ul.style.getPropertyValue('--indicator-width');
        if (left && width) sessionStorage.setItem('nav-indicator', JSON.stringify({ left, width }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/v1/landing-page/daily-cleaning/detail-pesanan', {
                    params: { id_mitra, type_layanan: 'daily_cleaning' }
                });
                setData(response.data.data);
                if (response.data.data?.layanan?.length > 0) {
                    setSelectedDuration(response.data.data.layanan[0]);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Terjadi kesalahan saat memuat data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id_mitra]);

    if (loading || error || !data) {
        return (
            <div className="dp-fallback">
                <div className="dp-fallback-card">
                    <span className="material-symbols-outlined dp-fallback-icon" style={{fontVariationSettings: "'FILL' 1"}}>
                        {loading ? 'hourglass_empty' : 'error'}
                    </span>
                    <h2 className="dp-fallback-title">
                        {loading ? 'Memuat Data...' : 'Terjadi Kesalahan'}
                    </h2>
                    <p className="dp-fallback-text">
                        {loading ? 'Mohon tunggu sebentar.' : error || 'Data pesanan tidak ditemukan.'}
                    </p>
                    {!loading && (
                        <button 
                            onClick={() => navigate(-1)} 
                            className="dp-fallback-btn"
                        >
                            Kembali ke Halaman Sebelumnya
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const hargaPaket = selectedDuration ? selectedDuration.harga_layanan : 0;
    const biayaAlat = sewaAlat ? 15000 : 0; // Example static
    const biayaTransport = 10000;
    const total = (parseInt(hargaPaket) || 0) + biayaAlat + biayaTransport;

    return (
        <div className="dp-page">
                        <nav className="lp-navbar">
                <div className="lp-container lp-navbar-inner">
                    <div className="lp-brand">
                        <Link to="/" className="lp-brand-link">KostHub<span className="lp-brand-dot">.</span></Link>
                    </div>
                    <ul className="lp-nav-links" ref={navLinksRef} onMouseLeave={handleNavLeave}>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/' === '/daily-cleaning' ? 'lp-nav-link--active' : ''}`} to="/" onMouseEnter={handleNavHover} onClick={handleNavClick}>Home</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/gas-galon' === '/daily-cleaning' ? 'lp-nav-link--active' : ''}`} to="/gas-galon" onMouseEnter={handleNavHover} onClick={handleNavClick}>Gas &amp; Galon</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/laundry' === '/daily-cleaning' ? 'lp-nav-link--active' : ''}`} to="/laundry" onMouseEnter={handleNavHover} onClick={handleNavClick}>Laundry Express</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/daily-cleaning' === '/daily-cleaning' ? 'lp-nav-link--active' : ''}`} to="/daily-cleaning" onMouseEnter={handleNavHover} onClick={handleNavClick}>Daily Cleaning</Link></li>
                        <li className="lp-nav-item"><Link className="lp-nav-link" to="/tentang-kami" onMouseEnter={handleNavHover} onClick={handleNavClick}>Tentang Kami</Link></li>
                    </ul>
                    <div className="lp-nav-actions">
                        {isAuthenticated ? (
                            <div className="lp-profile-menu">
                                <button className="lp-profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)} title={user?.nama_lengkap || user?.nama_mitra || user?.nama || 'User'}>
                                    <div className="lp-profile-avatar">
                                        {(() => {
                                            const name = user?.nama_lengkap || user?.nama_mitra || user?.nama || 'User';
                                            const names = name.trim().split(' ');
                                            return names.length >= 2 ? (names[0][0] + names[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
                                        })()}
                                   </div>
                                </button>
                                {showProfileMenu && (
                                    <div className="lp-profile-dropdown">
                                        <div className="lp-profile-info">
                                            <p className="lp-profile-name">{user?.nama_lengkap || user?.nama_mitra || user?.nama || 'User'}</p>
                                            <p className="lp-profile-email">{user?.email}</p>
                                        </div>
                                        <hr className="lp-profile-divider" />
                                        <button className="lp-profile-link" onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}>
                                            <span className="material-symbols-outlined">person</span> Profil Saya
                                        </button>
                                        <button className="lp-profile-link lp-profile-logout" onClick={() => { logout(); setShowProfileMenu(false); navigate('/'); }}>
                                            <span className="material-symbols-outlined">logout</span> Keluar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button onClick={() => navigate('/login')} className="lp-btn-primary">Masuk / Daftar</button>
                        )}
                    </div>
                </div>
            </nav>

            <div className="dp-stepper">
                <div className="dp-stepper-inner">
                    <div className="dp-step dp-step-completed">
                        <span className="material-symbols-outlined dp-step-icon">check_circle</span>
                        <span>Pilih Mitra</span>
                    </div>
                    <div className="dp-step-line"></div>
                    <div className="dp-step dp-step-current">
                        <div className="dp-step-number">2</div>
                        <span>Detail Pesanan</span>
                    </div>
                    <div className="dp-step-line"></div>
                    <div className="dp-step dp-step-upcoming">
                        <div className="dp-step-number">3</div>
                        <span>Pembayaran</span>
                    </div>
                </div>
            </div>

            <main className="dp-main">
                <div className="dp-header">
                    <h1 className="dp-title">Konfigurasi Pesanan Daily Cleaning</h1>
                    <p className="dp-subtitle">Mitra: <span className="dp-subtitle-bold">{data.nama_mitra}</span></p>
                </div>

                <div className="dp-content-left">
                    <section className="dp-section">
                        <div className="dp-section-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>timer</span>
                            <h2 className="dp-section-title">Pilih Paket Durasi</h2>
                        </div>
                        <div className="dp-grid-3">
                            {data.layanan.map((layanan) => {
                                const isChecked = selectedDuration?.id_layanan === layanan.id_layanan;
                                return (
                                    <label key={layanan.id_layanan} className="dp-card-radio">
                                        <input 
                                            className="dp-card-radio-input" 
                                            name="duration" 
                                            type="radio" 
                                            value={layanan.id_layanan} 
                                            checked={isChecked}
                                            onChange={() => setSelectedDuration(layanan)}
                                        />
                                        <div className="dp-card-radio-content">
                                            <div className="dp-card-title">{layanan.nama_layanan}</div>
                                            <div className="dp-card-price">Rp {parseInt(layanan.harga_layanan).toLocaleString('id-ID')}</div>
                                            {isChecked && (
                                                <div className="dp-card-check">
                                                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </section>

                    <section className="dp-section">
                        <div className="dp-section-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>cleaning_services</span>
                            <h2 className="dp-section-title">Alat Pembersih</h2>
                        </div>
                        <div className="dp-checkbox-wrap">
                            <label className="dp-checkbox-label">
                                <input 
                                    className="dp-checkbox-input" 
                                    type="checkbox" 
                                    checked={sewaAlat}
                                    onChange={(e) => setSewaAlat(e.target.checked)}
                                />
                                <div>
                                    <div className="dp-checkbox-title">Sewa Alat Pembersih Tambahan dari Mitra</div>
                                    <div className="dp-checkbox-subtitle">+ Rp 15.000</div>
                                </div>
                            </label>
                        </div>
                    </section>

                    <section className="dp-section">
                        <div className="dp-section-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>event</span>
                            <h2 className="dp-section-title">Pilih Tanggal &amp; Jam Pembersihan</h2>
                        </div>
                        <div className="dp-grid-2">
                            <div className="dp-form-group">
                                <label className="dp-form-label">Tanggal</label>
                                <input 
                                    className="dp-input" 
                                    type="date" 
                                    value={tanggal}
                                    onChange={(e) => setTanggal(e.target.value)}
                                />
                            </div>
                            <div className="dp-form-group">
                                <label className="dp-form-label">Pilih Jam</label>
                                <div className="dp-time-grid">
                                    {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'].map((time) => {
                                        const isSelected = jam === time;
                                        return (
                                            <button 
                                                key={time}
                                                className={`dp-time-btn ${isSelected ? 'active' : ''}`}
                                                onClick={() => setJam(time)}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="dp-section">
                        <div className="dp-section-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>note_alt</span>
                            <h2 className="dp-section-title">Catatan untuk Mitra (Opsional)</h2>
                        </div>
                        <div className="dp-form-group">
                            <textarea 
                                className="dp-textarea" 
                                placeholder="Contoh: Tolong fokus bersihkan area kamar mandi..."
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                            ></textarea>
                        </div>
                    </section>
                </div>

                <div className="dp-content-right">
                    <div className="dp-summary-sticky">
                        <div className="dp-summary-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>receipt_long</span>
                            <h2 className="dp-summary-title">Ringkasan Pembayaran</h2>
                        </div>
                        <div className="dp-summary-list">
                            <div className="dp-summary-item">
                                <span className="dp-summary-item-label">Harga Paket</span>
                                <span className="dp-summary-item-value">Rp {parseInt(hargaPaket).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="dp-summary-item">
                                <span className="dp-summary-item-label">Biaya Tambahan Alat</span>
                                <span className="dp-summary-item-value">{biayaAlat > 0 ? `Rp ${biayaAlat.toLocaleString('id-ID')}` : '-'}</span>
                            </div>
                            <div className="dp-summary-item">
                                <span className="dp-summary-item-label">Biaya Transportasi</span>
                                <span className="dp-summary-item-value">Rp {biayaTransport.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="dp-summary-total">
                                <span className="dp-summary-total-label">Total Pembayaran</span>
                                <span className="dp-summary-total-value">Rp {total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                        <div className="dp-info-box">
                            <span className="material-symbols-outlined dp-info-icon">info</span>
                            <p className="dp-info-text">
                                Transaksi Anda dilindungi oleh Sistem Escrow KostHub. Dana akan diteruskan ke mitra hanya setelah layanan selesai sesuai pesanan Anda.
                            </p>
                        </div>
                        <button className="dp-btn-primary">
                            Lanjutkan ke Pembayaran
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </main>

                        <footer className="lp-footer">
                <div className="lp-container lp-footer-inner">
                    <div className="lp-footer-brand">
                        <Link to="/" className="lp-footer-logo">KostHub<span className="lp-footer-dot">.</span></Link>
                        <p className="lp-footer-desc">Solusi praktis anak kos di Solo.</p>
                    </div>
                    <div className="lp-footer-links">
                        <a className="lp-footer-link" href="#">Syarat &amp; Ketentuan</a>
                        <a className="lp-footer-link" href="#">Kebijakan Privasi</a>
                        <a className="lp-footer-link" href="#">Hubungi Kami</a>
                    </div>
                    <p className="lp-footer-copy">© 2024 KostHub. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};
export default DailyCleaningDetail;
