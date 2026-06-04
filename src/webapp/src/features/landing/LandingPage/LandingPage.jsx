import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LocationSearch from '../../location/LocationSearch/LocationSearch';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const servicesRef = useRef(null);

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
                    <ul className="lp-nav-links">
                        <li className="lp-nav-item">
                            <a className="lp-nav-link lp-nav-link--active" href="#">Home</a>
                        </li>
                        <li className="lp-nav-item">
                            <Link className="lp-nav-link" to="/gas-galon">Gas &amp; Galon</Link>
                        </li>
                        <li className="lp-nav-item">
                            <Link className="lp-nav-link" to="/laundry">Laundry Express</Link>
                        </li>
                        <li className="lp-nav-item">
                            <Link className="lp-nav-link" to="/daily-cleaning">Daily Cleaning</Link>
                        </li>
                        <li className="lp-nav-item">
                            <a className="lp-nav-link" href="#">Tentang Kami</a>
                        </li>
                    </ul>

                    {/* Trailing Action */}
                    <div className="lp-nav-actions">
                        <button 
                            onClick={() => navigate('/login')}
                            className="lp-btn-primary"
                        >
                            Masuk / Daftar
                        </button>
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

                        {/* LocationSearch — Autocomplete + Mini-Map */}
                        <LocationSearch onSearchSubmit={handleSearchSubmit} />
                    </div>

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
                <section className="lp-trust">
                    <div className="lp-container lp-trust-inner animate-on-scroll">
                        <div className="lp-trust-content">
                            <h2 className="lp-trust-title">Aman. Transparan. Tanpa Khawatir.</h2>
                            <p className="lp-trust-desc">Kami mengerti mahasiswa butuh kepastian. KostHub hadir sebagai penengah terpercaya antara kamu dan mitra penyedia layanan. Setiap transaksi dilindungi sistem escrow yang memastikan layanan dikerjakan sesuai standar sebelum pembayaran dilepaskan.</p>
                        </div>
                        <div className="lp-trust-stats">
                            <div className="lp-stat">
                                <div className="lp-stat-value">1.2k+</div>
                                <div className="lp-stat-label">Mahasiswa Aktif</div>
                            </div>
                            <div className="lp-stat">
                                <div className="lp-stat-value">100%</div>
                                <div className="lp-stat-label">Garansi Aman</div>
                            </div>
                            <div className="lp-stat">
                                <div className="lp-stat-value">50+</div>
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

