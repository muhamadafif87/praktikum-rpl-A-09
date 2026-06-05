import React, { useRef, useLayoutEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TransitionLink from '../../components/ViewTransition/TransitionLink';
import '../landing/LandingPage/LandingPage.css';
import './TentangKamiPage.css';

const TentangKamiPage = () => {
    const navigate = useNavigate();
    const navLinksRef = useRef(null);

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
                        <button 
                            onClick={() => navigate('/login')}
                            className="lp-btn-primary"
                        >
                            Masuk / Daftar
                        </button>
                    </div>
                </div>
            </nav>

            <main className="tk-main">
                {/* Hero Section */}
                <section className="tk-hero">
                    <div className="tk-hero-inner">
                        <h1 className="tk-hero-title">Tentang Kami</h1>
                        <p className="tk-hero-subtitle">
                            KostHub adalah marketplace hiperlokal yang dirancang khusus untuk mahasiswa. Kami menghubungkan Anda dengan layanan esensial di sekitar kampus dengan mudah, transparan, dan terpercaya.
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
                                    <button className="tk-btn-primary">Misi Kami</button>
                                    <button className="tk-btn-outline">Visi</button>
                                    <button className="tk-btn-outline">Nilai</button>
                                </div>
                                <p className="tk-mission-quote">
                                    "Layanan yang tepat waktu dan transparan adalah kunci dari ekosistem yang kami bangun. Kami bekerja keras untuk memverifikasi setiap mitra agar Anda bisa fokus sepenuhnya pada perkuliahan."
                                </p>
                            </div>
                            
                            <div className="tk-mission-image-wrapper">
                                <div className="tk-mission-image-container">
                                    <img 
                                        className="tk-mission-image" 
                                        alt="College students in common area" 
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4u8jAkvFEpmHtwXBh3vj3RylPYlr-Yjur9ovgLt7jMCPLo0JNm1lb_AVp2zXLuuaUo1CvSGokGJh8mQ5gTaGCs-4O29ltgEXeFMQQH7kA_SJ_JURezuNPYywjR0IfqYysZhCvuLuayT1v61gcQi2rsbHHUmttBwsUWONPi8M5dwI-cjwc8KtSWud4OWQRfniQlSVAxp4Xdcpx3PAsFAV4vUoLmucgNiVSKOGnCvJlC4j7HBLcUqIkF-cs2tJMpB74yuOyYcML_kg"
                                    />
                                    <div className="tk-mission-widget">
                                        <div className="tk-widget-header">
                                            <span className="tk-widget-dot"></span>
                                            <span className="tk-widget-title">14 Mitra Online</span>
                                        </div>
                                        <div className="tk-widget-list">
                                            <div className="tk-widget-item">
                                                <div className="tk-widget-avatar-1">B</div>
                                                <span className="tk-widget-text">Budi - Laundry Express</span>
                                            </div>
                                            <div className="tk-widget-item">
                                                <div className="tk-widget-avatar-2">S</div>
                                                <span className="tk-widget-text">Siti - Kost Cleaners</span>
                                            </div>
                                        </div>
                                    </div>
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
                        <div className="tk-bento-grid">
                            {/* Large Card: Sistem Escrow */}
                            <div className="tk-card tk-card-large">
                                <div>
                                    <div className="tk-icon-box tk-icon-box-lg">
                                        <span className="material-symbols-outlined text-[32px]">shield_with_heart</span>
                                    </div>
                                    <h3 className="tk-card-title-lg">Sistem Escrow Aman</h3>
                                    <p className="tk-card-desc">
                                        Pembayaran Anda baru akan diteruskan ke mitra setelah layanan selesai dikonfirmasi. Transaksi 100% aman dan terpercaya.
                                    </p>
                                </div>
                                <div className="tk-card-footer">
                                    <div className="tk-footer-text">
                                        <span className="material-symbols-outlined">verified</span>
                                        <span>Keamanan Prioritas Utama Kami</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Medium Card: Kecepatan */}
                            <div className="tk-card tk-card-medium-h">
                                <div className="tk-icon-box tk-icon-box-lg">
                                    <span className="material-symbols-outlined text-[32px]">bolt</span>
                                </div>
                                <div>
                                    <h3 className="tk-card-title-md">Kecepatan Hyperlocal</h3>
                                    <p className="tk-card-desc-sm">
                                        Mitra terdekat di sekitar kampus Anda, memastikan penjemputan dan pengantaran kilat.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Medium Card: Mitra Terverifikasi */}
                            <div className="tk-card-medium-split">
                                <div className="tk-card-inner">
                                    <div className="tk-icon-box tk-icon-box-md">
                                        <span className="material-symbols-outlined text-[24px]">verified_user</span>
                                    </div>
                                    <h3 className="tk-card-title-sm">Mitra Terverifikasi</h3>
                                    <p className="tk-card-desc-xs">
                                        Proses seleksi ketat menjamin kualitas terbaik.
                                    </p>
                                </div>
                                <div className="tk-card-small-stack">
                                    {/* Small Card: Dukungan Mahasiswa */}
                                    <div className="tk-card-small">
                                        <div className="tk-icon-box tk-icon-box-sm">
                                            <span className="material-symbols-outlined text-[20px]">school</span>
                                        </div>
                                        <h3 className="tk-card-title-xs">Dukungan Mahasiswa</h3>
                                    </div>
                                    {/* Small Card: Transparansi Harga */}
                                    <div className="tk-card-small">
                                        <div className="tk-icon-box tk-icon-box-sm">
                                            <span className="material-symbols-outlined text-[20px]">sell</span>
                                        </div>
                                        <h3 className="tk-card-title-xs">Transparansi Harga</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="tk-stats">
                    <div className="tk-stats-grid">
                        <div className="tk-stats-item">
                            <div className="tk-stats-number">10+</div>
                            <div className="tk-stats-label">Tahun Pengalaman</div>
                        </div>
                        <div className="tk-stats-item">
                            <div className="tk-stats-number">99%</div>
                            <div className="tk-stats-label">Tingkat Akurasi</div>
                        </div>
                        <div className="tk-stats-item">
                            <div className="tk-stats-number">500+</div>
                            <div className="tk-stats-label">Review Positif</div>
                        </div>
                        <div className="tk-stats-item">
                            <div className="tk-stats-number">600+</div>
                            <div className="tk-stats-label">Mitra Terpercaya</div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="tk-team">
                    <h2 className="tk-team-title">Temui Tim Pendiri Kami</h2>
                    <p className="tk-team-subtitle">
                        Inilah orang-orang di balik KostHub yang berdedikasi tinggi untuk mempermudah hidup mahasiswa di seluruh Indonesia.
                    </p>
                    <div className="tk-team-grid">
                        {/* Member 1 */}
                        <div className="tk-team-member">
                            <div className="tk-team-avatar">
                                <span className="material-symbols-outlined tk-team-icon">person</span>
                            </div>
                            <h3 className="tk-team-name">Valent</h3>
                            <p className="tk-team-role">Founder &amp; CEO</p>
                        </div>
                        {/* Member 2 */}
                        <div className="tk-team-member">
                            <div className="tk-team-avatar">
                                <span className="material-symbols-outlined tk-team-icon">person</span>
                            </div>
                            <h3 className="tk-team-name">Ade</h3>
                            <p className="tk-team-role">Lead Tech Ops</p>
                        </div>
                        {/* Member 3 */}
                        <div className="tk-team-member">
                            <div className="tk-team-avatar">
                                <span className="material-symbols-outlined tk-team-icon">person</span>
                            </div>
                            <h3 className="tk-team-name">Afif</h3>
                            <p className="tk-team-role">Head of Partners</p>
                        </div>
                        {/* Member 4 */}
                        <div className="tk-team-member">
                            <div className="tk-team-avatar">
                                <span className="material-symbols-outlined tk-team-icon">person</span>
                            </div>
                            <h3 className="tk-team-name">Aerio</h3>
                            <p className="tk-team-role">Product Designer</p>
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
                                        <span className="material-symbols-outlined text-[32px]">bolt</span>
                                    </div>
                                    <div>
                                        <h3 className="tk-vision-item-title">Menyederhanakan Hidup Mahasiswa</h3>
                                        <p className="tk-vision-item-desc">
                                            Misi kami adalah menghapus segala hambatan logistik harian. Mulai dari cucian yang menumpuk hingga galon yang habis, KostHub menyelesaikannya dalam sekejap.
                                        </p>
                                    </div>
                                </div>
                                <div className="tk-vision-item">
                                    <div className="tk-vision-icon">
                                        <span className="material-symbols-outlined text-[32px]">verified_user</span>
                                    </div>
                                    <div>
                                        <h3 className="tk-vision-item-title">Keamanan &amp; Kecepatan Utama</h3>
                                        <p className="tk-vision-item-desc">
                                            Setiap mitra kami melalui proses seleksi ketat. Kami menjamin setiap layanan diberikan dengan standar keamanan tertinggi dan kecepatan yang tidak tertandingi.
                                        </p>
                                    </div>
                                </div>
                                <div className="tk-vision-item">
                                    <div className="tk-vision-icon">
                                        <span className="material-symbols-outlined text-[32px]">hub</span>
                                    </div>
                                    <div>
                                        <h3 className="tk-vision-item-title">Ekosistem Hiperlokal</h3>
                                        <p className="tk-vision-item-desc">
                                            Kami percaya pada kekuatan komunitas lokal. Dengan memberdayakan penyedia jasa sekitar kampus, kami membangun ekonomi yang berkelanjutan dan saling menguntungkan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="tk-vision-image-wrapper">
                                <img 
                                    className="tk-vision-image" 
                                    alt="Modern student dormitory interior" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO91nJb_WBFagk4lmKFygXfbhxVB8TlL5vHr2XuGVodbL9lEnYRH55sQqv5ltBA6MR_uXgDQxgJi7lrhsS3KWP1D6btK21mIGcRZeQg_VIAIvOHfQwvA0kgWSyRvWV1jLc40isxDKxTnxtTkJ2DBbYq9383stKLnhFvQtcM4l1hgQ_yFcvWYfLMer9RypgJXJ-44T23maCHIU5xKqVXUlz-Vir8Gb2pcC1_tOOhMmE4bLlYmoKGDJsM_cxhwrLXzVWh5tPn5RmDuU"
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
