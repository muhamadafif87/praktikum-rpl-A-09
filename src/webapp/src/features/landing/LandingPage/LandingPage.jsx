import React, { useEffect, useRef, useLayoutEffect, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TransitionLink from '../../../components/ViewTransition/TransitionLink';
import LocationSearch from '../../location/LocationSearch/LocationSearch';
import './LandingPage.css';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from '../../../context/LocationContext';
import api from '../../../services/api';

const LandingPage = () => {
    const navigate = useNavigate();
    const servicesRef = useRef(null);
    const navLinksRef = useRef(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isSelectingNew, setIsSelectingNew] = useState(false);

    const { user, isAuthenticated, logout } = useAuth();
    const { location, syncWithUser } = useLocation();

    // ── Auto-sync Location from Profile ──
    useEffect(() => {
        if (isAuthenticated && user && user.latitude && user.longitude && !location.isConfirmed) {
            syncWithUser(user);
        }
    }, [isAuthenticated, user, location.isConfirmed, syncWithUser]);

    // ── Sliding Indicator Logic ──
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

    const handleNavHover = (e) => {
        updateIndicator(e.currentTarget);
    };

    const handleNavLeave = () => {
        const ul = navLinksRef.current;
        if (!ul) return;
        const activeLink = ul.querySelector('.lp-nav-link--active');
        if (activeLink) {
            updateIndicator(activeLink);
        }
    };

    const handleNavClick = () => {
        const ul = navLinksRef.current;
        if (!ul) return;
        const left = ul.style.getPropertyValue('--indicator-left');
        const width = ul.style.getPropertyValue('--indicator-width');
        if (left && width) {
            sessionStorage.setItem('nav-indicator', JSON.stringify({ left, width }));
        }
    };

    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const [stats, setStats] = useState({
        jumlah_user_aktif: 0,
        jumlah_mitra_bekerja_sama: 0,
    });

    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState('');

    // ── Fetch Statistics ──
    const fetchStatistics = async () => {
        setStatsLoading(true);
        setStatsError('');

        try {
            const response = await api.get('/v1/landing-page/statistic');
            const { data } = response.data;

            setStats({
                jumlah_user_aktif: data?.jumlah_user_aktif || 0,
                jumlah_mitra_bekerja_sama: data?.jumlah_mitra_bekerja_sama || 0,
            });
        } catch (err) {
            console.error('Error fetching statistics:', err);
            if (err.response) {
                setStatsError(err.response.data?.message || 'Gagal memuat statistik');
            } else if (err.request) {
                setStatsError('Tidak dapat terhubung ke server.');
            } else {
                setStatsError('Terjadi kesalahan saat memuat statistik.');
            }

            setStats({
                jumlah_user_aktif: 0,
                jumlah_mitra_bekerja_sama: 0,
            });
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch statistics on component mount
    useEffect(() => {
        fetchStatistics();
    }, []);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach((el) => {
            observer.observe(el);
        });

        return () => {
            animatedElements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    /**
     * Smooth scroll ke section "Pilih Layanan KostHub"
     * Dipicu saat user klik "Cari Layanan" atau Enter setelah konfirmasi lokasi.
     */
    const handleSearchSubmit = () => {
        if (servicesRef.current) {
            servicesRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <div className="landing-page">
            {/* TopNavBar */}
            <nav className="lp-navbar">
                <div className="lp-container lp-navbar-inner">
                    {/* Brand Logo */}
                    <div className="lp-brand">
                        <Link to="/" className="lp-brand-link">
                            KostHub<span className="lp-brand-dot">.</span>
                        </Link>
                    </div>

                    {/* Navigation Links (Center) */}
                    <ul className="lp-nav-links" ref={navLinksRef} onMouseLeave={handleNavLeave}>
                        <li className="lp-nav-item">
                            <a className="lp-nav-link lp-nav-link--active" href="#" onMouseEnter={handleNavHover} onClick={handleNavClick} aria-current="page">Home</a>
                        </li>
                        <li className="lp-nav-item">
                            <TransitionLink className="lp-nav-link" to="/gas-galon" onMouseEnter={handleNavHover} onClick={handleNavClick}>Gas &amp; Galon</TransitionLink>
                        </li>
                        <li className="lp-nav-item">
                            <TransitionLink className="lp-nav-link" to="/laundry" onMouseEnter={handleNavHover} onClick={handleNavClick}>Laundry Express</TransitionLink>
                        </li>
                        <li className="lp-nav-item">
                            <TransitionLink className="lp-nav-link" to="/daily-cleaning" onMouseEnter={handleNavHover} onClick={handleNavClick}>Daily Cleaning</TransitionLink>
                        </li>
                        <li className="lp-nav-item">
                            <TransitionLink className="lp-nav-link" to="/tentang-kami" onMouseEnter={handleNavHover} onClick={handleNavClick}>Tentang Kami</TransitionLink>
                        </li>
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
                                        <button className="lp-profile-link lp-profile-logout" onClick={() => { logout(); setShowProfileMenu(false); window.location.href = '/'; }}>
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

            <main>
                {/* Hero Section */}
                <section className="lp-hero">
                    <div className="lp-hero-content animate-on-scroll">
                        <span className="lp-hero-badge">
                            Trusted Marketplace di Solo
                        </span>
                        <h1 className="lp-hero-title">
                            Layanan Kos Instan, Aman &amp; Anti-Cemas
                        </h1>
                        <p className="lp-hero-subtitle">
                            Temukan layanan harian terbaik untuk kosmu di Solo dengan jaminan keamanan 100%.
                        </p>

                        <button className="lp-hero-location-btn" onClick={() => setIsMapOpen(true)}>
                            <div className="lp-hero-location-icon-wrapper">
                                <span className="material-symbols-outlined lp-hero-location-icon" style={{fontVariationSettings: "'FILL' 1"}}>location_on</span>
                            </div>
                            <div className="lp-hero-location-text">
                                <span className="lp-hero-location-label">
                                    {location.isConfirmed 
                                        ? (location.isFromProfile ? 'Kirim ke (Sesuai Profil):' : 'Kirim ke (Lokasi Sementara):') 
                                        : 'Kirim ke:'}
                                </span>
                                <span className="lp-hero-location-value" title={location.isConfirmed ? location.address : 'Belum Diatur'}>
                                    {location.isConfirmed ? location.address : 'Belum Diatur - Pilih Lokasi'}
                                </span>
                            </div>
                            <span className="material-symbols-outlined lp-hero-location-chevron">expand_more</span>
                        </button>
                    </div>

                    {/* Location Modal */}
                    {isMapOpen && (
                        <div className="lp-modal-overlay" onClick={() => setIsMapOpen(false)}>
                            <div className="lp-modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="lp-modal-header">
                                    <h3 className="lp-modal-title">Atur Lokasi Pengiriman</h3>
                                    <button className="lp-modal-close" onClick={() => setIsMapOpen(false)}>
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                <div className="lp-modal-body">
                                    {isAuthenticated && user?.latitude && user?.longitude && !isSelectingNew ? (
                                        <div className="lp-location-options">
                                            <p className="lp-location-options-title">
                                                Pilih alamat pengiriman untuk layanan KostHub:
                                            </p>
                                            
                                            {/* Option 1: Profile Address */}
                                            <div 
                                                className={`lp-loc-option ${location.isFromProfile ? 'lp-loc-option--active' : ''}`}
                                                onClick={() => {
                                                    syncWithUser(user);
                                                    setIsMapOpen(false);
                                                }}
                                            >
                                                <div className="lp-loc-option-icon">
                                                    <span className="material-symbols-outlined">home</span>
                                                </div>
                                                <div className="lp-loc-option-text">
                                                    <h4>Gunakan Alamat Profil</h4>
                                                    <p>{user.address_detail || 'Sesuai Profil'}</p>
                                                </div>
                                                {location.isFromProfile && <span className="material-symbols-outlined lp-loc-check">check_circle</span>}
                                            </div>

                                            {/* Option 2: Temporary Address */}
                                            <div 
                                                className={`lp-loc-option ${!location.isFromProfile && location.isConfirmed ? 'lp-loc-option--active' : ''}`}
                                                onClick={() => setIsSelectingNew(true)}
                                            >
                                                <div className="lp-loc-option-icon">
                                                    <span className="material-symbols-outlined">pin_drop</span>
                                                </div>
                                                <div className="lp-loc-option-text">
                                                    <h4>Alamat Sementara</h4>
                                                    <p>
                                                        {!location.isFromProfile && location.isConfirmed 
                                                            ? location.address 
                                                            : 'Cari lokasi lain di peta...'}
                                                    </p>
                                                </div>
                                                {!location.isFromProfile && location.isConfirmed && <span className="material-symbols-outlined lp-loc-check">check_circle</span>}
                                                {location.isFromProfile && <span className="material-symbols-outlined lp-loc-arrow">chevron_right</span>}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {isAuthenticated && user?.latitude && user?.longitude && (
                                                <button 
                                                    onClick={() => setIsSelectingNew(false)}
                                                    className="lp-loc-back-btn"
                                                >
                                                    <span className="material-symbols-outlined">arrow_back</span>
                                                    Kembali ke Pilihan Alamat
                                                </button>
                                            )}
                                            <LocationSearch 
                                                onConfirm={() => {
                                                    setIsMapOpen(false);
                                                    setIsSelectingNew(false);
                                                }}
                                                onSearchSubmit={() => {
                                                    setIsMapOpen(false);
                                                    setIsSelectingNew(false);
                                                    handleSearchSubmit();
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Abstract Background Element */}
                    <div className="lp-hero-bg">
                        <div className="lp-hero-orb-1"></div>
                        <div className="lp-hero-orb-2"></div>
                    </div>
                </section>

                {/* Interactive Escrow Section (The Workflow) */}
                <section className="lp-workflow">
                    <div className="lp-container">
                        <div className="lp-section-header animate-on-scroll">
                            <h2 className="lp-section-title">Bagaimana KostHub Melindungimu?</h2>
                            <div className="lp-section-divider"></div>
                        </div>

                        <div className="lp-workflow-grid animate-on-scroll">
                            {/* Connector Line (Desktop Only) */}
                            <div className="lp-workflow-connector"></div>

                            {/* Step 1 */}
                            <div className="lp-workflow-step">
                                <div className="lp-workflow-icon">
                                    <span className="material-symbols-outlined">account_balance_wallet</span>
                                </div>
                                <h3 className="lp-workflow-title">Bayar Lunas 100% di Depan</h3>
                                <p className="lp-workflow-desc">Dana Anda aman ditahan sementara oleh platform KostHub.</p>
                            </div>

                            {/* Step 2 */}
                            <div className="lp-workflow-step">
                                <div className="lp-workflow-icon">
                                    <span className="material-symbols-outlined">moped</span>
                                </div>
                                <h3 className="lp-workflow-title">Mitra Mengerjakan Pesanan</h3>
                                <p className="lp-workflow-desc">Kurir atau staff cleaner datang menyelesaikan kebutuhan kos Anda.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="lp-workflow-step">
                                <div className="lp-workflow-icon">
                                    <span className="material-symbols-outlined">verified</span>
                                </div>
                                <h3 className="lp-workflow-title">Konfirmasi &amp; Dana Cair</h3>
                                <p className="lp-workflow-desc">Uang baru diteruskan ke rekening mitra setelah Anda konfirmasi semuanya beres.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Service Cards Section (Bento Inspired Grid) */}
                <section className="lp-services" id="pilih-layanan" ref={servicesRef}>
                    <div className="lp-container">
                        <div className="lp-services-header animate-on-scroll">
                            <div>
                                <h2 className="lp-services-title">Pilih Layanan KostHub</h2>
                                <p className="lp-services-desc">Dapatkan layanan esensial langsung ke pintu kamarmu.</p>
                            </div>
                            <a className="lp-services-link" href="#">
                                Lihat semua layanan <span className="material-symbols-outlined">arrow_forward</span>
                            </a>
                        </div>

                        <div className="lp-services-grid animate-on-scroll">
                            {/* Gas & Galon Card */}
                            <div className="lp-service-card">
                                <img
                                    alt="Layanan Gas dan Galon"
                                    className="lp-service-img"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDn68W3rFM4GudQFBrdGbGAcbh3fY2Hl7ApVpf5dQ3YCw5INPj172n_KRsTcKEJkJQ2XcXrpfQ1yqIRx3hrYqxpX8RsXzWuV9VsJcqYhjoJWY5sERqHASD4DSfwqn9mRTykLTx-aimRG6SbXzPT2RuSClhdGf7FljkGwz-bh4s0Jtz1GmV39Hi02xFIAnyRAuENhZQXkiqcS7uBGrrBYUnXOeX-6Y0Q7kamYKrBGcosh99_1bnXXJNuCnlHA9GaLhxbIAjEiwYY4V0"
                                />
                                <div className="lp-service-overlay"></div>
                                <div className="lp-service-content">
                                    <span className="lp-service-badge lp-badge-1">Terpopuler</span>
                                    <h3 className="lp-service-title">Gas &amp; Galon</h3>
                                    <p className="lp-service-text">Antar cepat &amp; gratis jemput</p>
                                    <button className="lp-service-btn" onClick={() => navigate('/gas-galon')}>Pesan Sekarang</button>
                                </div>
                            </div>

                            {/* Laundry Express Card */}
                            <div className="lp-service-card">
                                <img
                                    alt="Laundry Express"
                                    className="lp-service-img"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLoMsMeQDJox5uHwi7g8W9LOMW0uI-_WBzencNuurllWzxLeyOKBxyUd3et-XUK27wMgmHR8JDyQ057CTdrU40vtsNbGwcAt8_GBiuMR_Clv_cE1zOiwv82VwfUYDaFITtplTOvrCvi5V_m9F4yY9N2iEaLClVFAnGSlocM9ay3pZvU67AH-fS2E-yIcingNhSLIXXiMOj7U56tCnplrEgjFSqkNkJ5FH4PbjiMGnrtBRsIYap0ZLagvUNCXlLQh-aD9SMIQbGlu8"
                                />
                                <div className="lp-service-overlay"></div>
                                <div className="lp-service-content">
                                    <span className="lp-service-badge lp-badge-2">Kilat</span>
                                    <h3 className="lp-service-title">Laundry Express</h3>
                                    <p className="lp-service-text">Cuci &amp; lipat mulai 24 jam</p>
                                    <button className="lp-service-btn" onClick={() => navigate('/laundry')}>Pesan Sekarang</button>
                                </div>
                            </div>

                            {/* Daily Cleaning Card */}
                            <div className="lp-service-card">
                                <img
                                    alt="Daily Cleaning"
                                    className="lp-service-img"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBahTHHcsbnLrH2d1sYgl2LFaA_tYi3UBqcn0fMpk2ktaL-UTY9JikZaMr_UmYexLZKQYWGAYEq6XmBHUevi1G4Yra1sLbnyeQtPYh9464mRPv0OSOrdvMvKCe9kHzBTNItQVoFZ3CfWmOs56h3M97i-pqEgmBco2D-pE51ezyAN297xjp07ulfd2hFoCxAmYFY7PfmcvfwUmZqb_qfHFANXaz4as-TdnbVU4k0xz6vcIXSdxbDU7Rgfh0mhVJnsIVQH-aiYR7JkmU"
                                />
                                <div className="lp-service-overlay"></div>
                                <div className="lp-service-content">
                                    <span className="lp-service-badge lp-badge-3">Higienis</span>
                                    <h3 className="lp-service-title">Daily Cleaning</h3>
                                    <p className="lp-service-text">Bersih-bersih kamar kos</p>
                                    <button className="lp-service-btn" onClick={() => navigate('/daily-cleaning')}>Pesan Sekarang</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                {/* Trust Section */}
                <section className="lp-trust">
                    <div className="lp-container lp-trust-inner animate-on-scroll">
                        <div className="lp-trust-content">
                            <h2 className="lp-trust-title">Aman. Transparan. Tanpa Khawatir.</h2>
                            <p className="lp-trust-desc">Kami mengerti mahasiswa butuh kepastian. KostHub hadir sebagai penengah terpercaya antara kamu dan mitra penyedia layanan. Setiap transaksi dilindungi sistem escrow yang memastikan layanan dikerjakan sesuai standar sebelum pembayaran dilepaskan.</p>
                        </div>
                        <div className="lp-trust-stats">
                            <div className="lp-stat">
                                <div className="lp-stat-value">
                                    {statsLoading ? '...' : `${stats.jumlah_user_aktif}+`}
                                </div>
                                <div className="lp-stat-label">Pengguna Aktif</div>
                            </div>
                            <div className="lp-stat">
                                <div className="lp-stat-value">100%</div>
                                <div className="lp-stat-label">Garansi Aman</div>
                            </div>
                            <div className="lp-stat">
                                <div className="lp-stat-value">
                                    {statsLoading ? '...' : `${stats.jumlah_mitra_bekerja_sama}+`}
                                </div>
                                <div className="lp-stat-label">Mitra Terverifikasi</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="lp-footer">
                <div className="lp-container lp-footer-inner">
                    <div className="lp-footer-brand">
                        <Link to="/" className="lp-footer-logo">
                            KostHub<span className="lp-footer-dot">.</span>
                        </Link>
                        <p className="lp-footer-desc">Solusi praktis anak kos di Solo.</p>
                    </div>
                    <div className="lp-footer-links">
                        <a className="lp-footer-link" href="#">Syarat &amp; Ketentuan</a>
                        <a className="lp-footer-link" href="#">Kebijakan Privasi</a>
                        <a className="lp-footer-link" href="#">Hubungi Kami</a>
                    </div>
                    <p className="lp-footer-copy">
                        © 2024 KostHub. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

