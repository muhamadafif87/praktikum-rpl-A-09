import React, { useRef, useLayoutEffect, useCallback, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TransitionLink from '../../components/ViewTransition/TransitionLink';
import '../landing/LandingPage/LandingPage.css';
import './TentangKamiPage.css';

const AnimatedStat = ({ target, suffix = "", prefix = "", label }) => {
    const [count, setCount] = useState(0);
    const duration = 1500;

    useEffect(() => {
        let start = null;
        let animationFrame;

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            const easeOut = percentage * (2 - percentage);

            setCount(Math.floor(easeOut * target));

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [target]);

    const formattedCount = count.toLocaleString('en-US');

    return (
        <div className="tk-stats-item group">
            <div className="tk-stats-number">
                {prefix}{formattedCount}{suffix}
            </div>
            <div className="tk-stats-label">{label}</div>
        </div>
    );
};

const TentangKamiPage = () => {
    const navigate = useNavigate();
    const navLinksRef = useRef(null);
    const [activeTab, setActiveTab] = useState('misi');
    const { user, isAuthenticated, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const tabContent = {
        misi: "Layanan yang tepat waktu dan transparan adalah kunci dari ekosistem yang kami bangun. Kami bekerja keras untuk memverifikasi setiap mitra agar Anda bisa fokus sepenuhnya pada perkuliahan.",
        visi: "Menjadi platform marketplace hiperlokal mahasiswa nomor satu di Indonesia yang mengintegrasikan, mendigitalisasi, dan mempermudah seluruh ekosistem kebutuhan hidup di anak kos."
    };

    // ── Sliding Indicator Logic (Reused from LandingPage) ──
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

    return (
        <div className="tk-container">
            {/* TopNavBar */}
            <nav className="lp-navbar">
                <div className="lp-container lp-navbar-inner">
                    <div className="lp-brand">
                        <Link to="/" className="lp-brand-link">
                            KostHub<span className="lp-brand-dot">.</span>
                        </Link>
                    </div>

                    <ul className="lp-nav-links" ref={navLinksRef} onMouseLeave={handleNavLeave}>
                        <li className="lp-nav-item">
                            <TransitionLink className="lp-nav-link" to="/" onMouseEnter={handleNavHover} onClick={handleNavClick}>Home</TransitionLink>
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
                            <a className="lp-nav-link lp-nav-link--active" href="#" onMouseEnter={handleNavHover} onClick={handleNavClick} aria-current="page">Tentang Kami</a>
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

            <main className="tk-main">
                {/* Hero Section */}
                <section className="tk-hero">
                    <div className="tk-hero-inner">
                        <span className="tk-hero-badge">Our Story</span>
                        <h1 className="tk-hero-title">Tentang Kami</h1>
                        <p className="tk-hero-subtitle">
                            Menembus batas kenyamanan dunia perkuliahan. KostHub hadir sebagai pioneer marketplace hiperlokal yang mendigitalisasi dan menghubungkan langsung kebutuhan harian mahasiswa dengan jaringan mitra tepercaya di sekitar kampus.
                        </p>
                    </div>
                </section>

                {/* Mission & Values Section */}
                <section className="tk-mission">
                    <div className="tk-mission-inner">
                        <div className="tk-mission-card">
                            <div className="tk-mission-content">
                                <h2 className="tk-mission-title">Membantu Mahasiswa Menemukan Layanan Terbaik</h2>
                                <p className="tk-mission-desc">
                                    Kami menyadari tantangan hidup mandiri di perantauan. KostHub hadir untuk memastikan setiap mahasiswa memiliki akses mudah ke mitra layanan kebersihan, laundry, hingga kebutuhan dasar seperti gas dan air galon tanpa harus keluar kamar.
                                </p>
                                <div className="tk-mission-buttons">
                                    <button
                                        className={activeTab === 'misi' ? "tk-btn-primary" : "tk-btn-outline"}
                                        onClick={() => setActiveTab('misi')}
                                    >
                                        Misi
                                    </button>
                                    <button
                                        className={activeTab === 'visi' ? "tk-btn-primary" : "tk-btn-outline"}
                                        onClick={() => setActiveTab('visi')}
                                    >
                                        Visi
                                    </button>
                                </div>
                                <div className="tk-mission-card-content">
                                    <h4 className="tk-mission-card-title">
                                        {activeTab === 'misi' ? "Misi Utama Kami" : "Visi Strategis KostHub"}
                                    </h4>
                                    <p className="tk-mission-card-text">
                                        {tabContent[activeTab]}
                                    </p>
                                </div>
                            </div>

                            <div className="tk-mission-image-wrapper">
                                <div className="tk-mission-image-container">
                                    <img
                                        className="tk-mission-image"
                                        alt="College students in common area"
                                        src="/images/mission-service.png"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bento Grid Section */}
                <section className="tk-bento">
                    <div className="tk-mission-inner">
                        <div className="tk-bento-header">
                            <h2 className="tk-bento-title">Mengapa Memilih KostHub?</h2>
                            <p className="tk-bento-subtitle">
                                Keunggulan utama yang membuat hidup mahasiswa lebih mudah dan aman.
                            </p>
                        </div>
                        <div className="tk-elite-grid">
                            {/* Card 1: Sistem Escrow Aman */}
                            <div className="tk-elite-card tk-col-span-2">
                                <div className="tk-elite-icon-bg">
                                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>security</span>
                                </div>
                                <h3 className="tk-elite-title">Sistem Escrow (Rekening Bersama)</h3>
                                <p className="tk-elite-desc">
                                    Keamanan transaksi Anda adalah prioritas utama kami. Melalui sistem Escrow KostHub, dana pembayaran mahasiswa akan ditampung dengan aman dan baru dilepaskan ke dompet mitra setelah Anda mengonfirmasi bahwa layanan telah selesai dikerjakan dengan sempurna.
                                </p>
                            </div>

                            {/* Card 2: Kecepatan Hyperlocal */}
                            <div className="tk-elite-card tk-col-span-1">
                                <div className="tk-elite-icon-bg">
                                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>bolt</span>
                                </div>
                                <h3 className="tk-elite-title">Kecepatan Hyperlocal</h3>
                                <p className="tk-elite-desc">
                                    Tidak perlu menunggu berjam-jam. Algoritma KostHub secara otomatis menghubungkan pesanan Anda dengan jaringan mitra terdekat yang berada tepat di sekitar radius kos dan area kampus Anda.
                                </p>
                            </div>

                            {/* Card 3: Jaminan Mitra Terverifikasi */}
                            <div className="tk-elite-card tk-col-span-1">
                                <div className="tk-elite-icon-bg">
                                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>verified_user</span>
                                </div>
                                <h3 className="tk-elite-title">Mitra Terverifikasi</h3>
                                <p className="tk-elite-desc">
                                    Semua penyedia jasa Gas, Galon, Laundry, hingga Daily Cleaning telah melewati proses seleksi, verifikasi identitas, dan pelatihan ketat untuk memastikan kenyamanan dan keamanan privasi kamar kos Anda.
                                </p>
                            </div>

                            {/* Card 4: All-in-One Student Ecosystem */}
                            <div className="tk-elite-card tk-col-span-2">
                                <div className="tk-elite-icon-bg">
                                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>layers</span>
                                </div>
                                <h3 className="tk-elite-title">Ekosistem Kebutuhan Terintegrasi</h3>
                                <p className="tk-elite-desc">
                                    Satu platform untuk mengendalikan seluruh kerepotan anak kos. Nikmati kemudahan memesan Gas &amp; Galon Delivery, Laundry Express, hingga Daily Cleaning secara terjadwal langsung dari satu dasbor aplikasi terpadu.
                                </p>
                                <div className="tk-badge-container">
                                    <span className="tk-badge">Gas &amp; Galon</span>
                                    <span className="tk-badge">Laundry Express</span>
                                    <span className="tk-badge">Daily Cleaning</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="tk-stats">
                    <div className="tk-stats-container">
                        <div className="tk-stats-grid">
                            <AnimatedStat target={1200} suffix="+" label="TOTAL PESANAN SELESAI" />
                            <AnimatedStat target={98} suffix="%" label="TINGKAT KEPUASAN MAHASISWA" />
                            <AnimatedStat target={50} suffix="+" label="MITRA TERVERIFIKASI" />
                            <AnimatedStat target={3} suffix="+" label="AREA KAMPUS TERINTEGRASI" />
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="tk-team">
                    <h2 className="tk-team-title">Temui Tim Pendiri Kami</h2>
                    <p className="tk-team-subtitle">
                        Di balik setiap baris kode dan interaksi di KostHub, ada tim kecil yang berfokus pada satu misi: menghapus kerepotan hidup merantau. Kami menggabungkan keahlian visual, ketangguhan arsitektur backend, dan kualitas sistem untuk menghadirkan solusi marketplace hiperlokal terbaik.
                    </p>
                    <div className="tk-team-grid">
                        {/* Member 1 */}
                        <div className="tk-team-member">
                            <div className="tk-team-avatar">
                                <span className="material-symbols-outlined tk-team-icon">person</span>
                            </div>
                            <h3 className="tk-team-name">Ade</h3>
                            <p className="tk-team-role">Lead Software Engineer &amp; Quality Assurance</p>
                            <div className="tk-team-socials">
                                <a href="https://github.com/daffaade" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                                    <svg viewBox="0 0 24 24" className="tk-social-icon"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                </a>
                                <a href="https://www.linkedin.com/in/muhammad-daffa-ade-nugraha-b99aa4328/" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                                    <svg viewBox="0 0 24 24" className="tk-social-icon"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                </a>
                            </div>
                        </div>
                        {/* Member 2 */}
                        <div className="tk-team-member">
                            <div className="tk-team-avatar">
                                <span className="material-symbols-outlined tk-team-icon">person</span>
                            </div>
                            <h3 className="tk-team-name">Valent</h3>
                            <p className="tk-team-role">UI/UX Designer &amp; Frontend Engineer</p>
                            <div className="tk-team-socials">
                                <a href="https://github.com/snoopyvs" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                                    <svg viewBox="0 0 24 24" className="tk-social-icon"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                </a>
                                <a href="https://www.linkedin.com/in/valentinojoancesar/" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                                    <svg viewBox="0 0 24 24" className="tk-social-icon"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                </a>
                            </div>
                        </div>
                        {/* Member 3 */}
                        <div className="tk-team-member">
                            <div className="tk-team-avatar">
                                <span className="material-symbols-outlined tk-team-icon">person</span>
                            </div>
                            <h3 className="tk-team-name">Aerio</h3>
                            <p className="tk-team-role">Full-Stack Developer</p>
                            <div className="tk-team-socials">
                                <a href="https://github.com/aerioade" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                                    <svg viewBox="0 0 24 24" className="tk-social-icon"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                </a>
                                <a href="https://www.linkedin.com/in/aerioade/" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                                    <svg viewBox="0 0 24 24" className="tk-social-icon"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                </a>
                            </div>
                        </div>
                        {/* Member 4 */}
                        <div className="tk-team-member">
                            <div className="tk-team-avatar">
                                <span className="material-symbols-outlined tk-team-icon">person</span>
                            </div>
                            <h3 className="tk-team-name">Afif</h3>
                            <p className="tk-team-role">Lead Backend Engineer &amp; System Architect</p>
                            <div className="tk-team-socials">
                                <a href="https://github.com/muhamadafif87" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                                    <svg viewBox="0 0 24 24" className="tk-social-icon"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                </a>
                                <a href="https://www.linkedin.com/in/muhamad-afif-aji-putra-b3666a30b/" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                                    <svg viewBox="0 0 24 24" className="tk-social-icon"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Visionary Statements */}
                <section className="tk-vision">
                    <div className="tk-vision-box">
                        <div className="tk-vision-grid">
                            <div className="tk-vision-list">
                                <div className="tk-vision-item">
                                    <div className="tk-vision-icon">
                                        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>auto_awesome</span>
                                    </div>
                                    <div>
                                        <h3 className="tk-vision-item-title">Bebas Repot, Fokus Kuliah</h3>
                                        <p className="tk-vision-item-desc">
                                            Serahkan urusan cucian menumpuk, galon kosong, dan kamar berdebu kepada mitra tepercaya kami. Anda bisa sepenuhnya menghemat energi untuk fokus pada tugas akademis dan organisasi.
                                        </p>
                                    </div>
                                </div>
                                <div className="tk-vision-item">
                                    <div className="tk-vision-icon">
                                        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>schedule</span>
                                    </div>
                                    <div>
                                        <h3 className="tk-vision-item-title">Pemesanan Fleksibel &amp; Terjadwal</h3>
                                        <p className="tk-vision-item-desc">
                                            Atur waktu kedatangan mitra sesuai dengan jadwal kosong kuliah Anda. Sistem kami memastikan tidak ada bentrokan waktu antara jam kelas dengan proses pengantaran layanan.
                                        </p>
                                    </div>
                                </div>
                                <div className="tk-vision-item">
                                    <div className="tk-vision-icon">
                                        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>favorite</span>
                                    </div>
                                    <div>
                                        <h3 className="tk-vision-item-title">Ramah Kantong Mahasiswa</h3>
                                        <p className="tk-vision-item-desc">
                                            Semua tarif layanan di ekosistem KostHub dirancang transparan sejak awal tanpa biaya tersembunyi, sangat bersahabat dengan manajemen keuangan bulanan anak kos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="tk-vision-image-wrapper">
                                <img
                                    className="tk-vision-image"
                                    alt="Modern student dormitory interior"
                                    src="/images/features-cozy.jpg"
                                />
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

export default TentangKamiPage;
