import React, { useState, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TransitionLink from '../../../components/ViewTransition/TransitionLink';
import { useLocation } from '../../../context/LocationContext';
import { calculateDistance } from '../../../utils/distance';
import './DetailMitraCleaning.css';

// Data mitra daily cleaning (static data - nanti bisa diganti dari API backend Laravel + Supabase)
// Setiap mitra sekarang memiliki koordinat lat/lng untuk kalkulasi jarak
const mitraData = [
    {
        id: 1,
        name: 'KostBersih Solo',
        lat: -7.5580,
        lng: 110.8530,
        rating: 4.8,
        reviewCount: 156,
        description: 'Jasa bersih-bersih kamar kos profesional. Melayani sapu, pel, lap debu, hingga cuci piring. Staff terlatih dan menggunakan alat kebersihan berkualitas.',
        price: 'Mulai dari Rp 35.000/sesi',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBahTHHcsbnLrH2d1sYgl2LFaA_tYi3UBqcn0fMpk2ktaL-UTY9JikZaMr_UmYexLZKQYWGAYEq6XmBHUevi1G4Yra1sLbnyeQtPYh9464mRPv0OSOrdvMvKCe9kHzBTNItQVoFZ3CfWmOs56h3M97i-pqEgmBco2D-pE51ezyAN297xjp07ulfd2hFoCxAmYFY7PfmcvfwUmZqb_qfHFANXaz4as-TdnbVU4k0xz6vcIXSdxbDU7Rgfh0mhVJnsIVQH-aiYR7JkmU',
        reviews: [
            { name: 'Ade', rating: '5.0', text: 'Kamar jadi kinclong, mantap!' },
            { name: 'Afif', rating: '4.8', text: 'Bersih dan rapi, recommended' },
            { name: 'Aerio', rating: '5.0', text: 'Langganan tiap minggu' },
        ],
        marqueeSpeed: '30s',
    },
    {
        id: 2,
        name: 'Sparkling Clean UNS',
        lat: -7.5550,
        lng: 110.8600,
        rating: 4.9,
        reviewCount: 198,
        description: 'Layanan cleaning premium khusus area kos mahasiswa UNS. Tersedia paket lengkap termasuk rapikan kamar, ganti sprei, dan pembersihan kamar mandi.',
        price: 'Mulai dari Rp 40.000/sesi',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLoMsMeQDJox5uHwi7g8W9LOMW0uI-_WBzencNuurllWzxLeyOKBxyUd3et-XUK27wMgmHR8JDyQ057CTdrU40vtsNbGwcAt8_GBiuMR_Clv_cE1zOiwv82VwfUYDaFITtplTOvrCvi5V_m9F4yY9N2iEaLClVFAnGSlocM9ay3pZvU67AH-fS2E-yIcingNhSLIXXiMOj7U56tCnplrEgjFSqkNkJ5FH4PbjiMGnrtBRsIYap0ZLagvUNCXlLQh-aD9SMIQbGlu8',
        reviews: [
            { name: 'Ade', rating: '5.0', text: 'Paket lengkap worth it!' },
            { name: 'Afif', rating: '4.9', text: 'Staff ramah dan teliti' },
            { name: 'Aerio', rating: '5.0', text: 'Kamar mandi jadi wangi' },
        ],
        marqueeSpeed: '25s',
    },
    {
        id: 3,
        name: 'Rapih Kos Jebres',
        lat: -7.5670,
        lng: 110.8480,
        rating: 4.5,
        reviewCount: 73,
        description: 'Jasa cleaning murah untuk anak kos area Jebres. Cocok buat yang sibuk kuliah dan butuh bantuan bersih-bersih mingguan dengan harga terjangkau.',
        price: 'Mulai dari Rp 30.000/sesi',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2sTHRoVQPgOtt6O544pQtG5gy0gwW77ECi_DR6gJcfYUyBoeh4GV1M9FVuRYvUAxV6PJ6jjz8BSllW57EQacjxGmxQpnaliiO0qXxGpx0crhe_Q6j_S-3ae73kgKbMaMsK6R2yzqCerV-vpG3MerFJiCq8ARvLSULYu0d5r3jWWiloa7malq4nVW2JiqQnMy6mRAmEuqTvSzNxI2Ak4b6-sU1dLLtuGkcQ928wVxI25BaL_j1Ny6e6lM5hxRFDqmWUEv5qSnR4s8',
        reviews: [
            { name: 'Ade', rating: '4.5', text: 'Murah tapi tetap bersih' },
            { name: 'Afif', rating: '4.8', text: 'Harga mahasiswa banget' },
            { name: 'Aerio', rating: '4.5', text: 'Jadwal fleksibel, oke!' },
        ],
        marqueeSpeed: '35s',
    },
];

const DetailMitraCleaning = ({ onOrderClick }) => {
    const navigate = useNavigate();
    const { location } = useLocation();
    const [selectedCategories, setSelectedCategories] = useState(['kamar_mandi']);
    const [sortBy, setSortBy] = useState('terdekat');
    const navLinksRef = useRef(null);

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
        const activeLink = ul.querySelector('.dmc-nav-link--active');
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
        const activeLink = ul.querySelector('.dmc-nav-link--active');
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

    // Hitung jarak dinamis untuk setiap mitra berdasarkan lokasi user
    const mitraWithDistance = useMemo(() => {
        return mitraData.map((mitra) => {
            const distance = calculateDistance(
                location.lat, location.lng,
                mitra.lat, mitra.lng
            );
            return { ...mitra, distance };
        });
    }, [location.lat, location.lng]);

    const handleCategoryChange = (category) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const handleOrderClick = (mitra) => {
        const token = localStorage.getItem('token');
        if (!token) {
            if (onOrderClick) {
                onOrderClick(mitra);
            }
        } else {
            console.log('Melanjutkan pemesanan untuk:', mitra.name);
        }
    };

    return (
        <div className="detail-mitra-cleaning-page">
            {/* TopNavBar */}
            <nav className="dmc-navbar">
                <div className="dmc-navbar-inner">
                    <div className="dmc-brand">
                        <Link to="/" className="dmc-brand-link">
                            KostHub<span className="dmc-brand-dot">.</span>
                        </Link>
                    </div>

                    <ul className="dmc-nav-links" ref={navLinksRef} onMouseLeave={handleNavLeave}>
                        <li className="dmc-nav-item">
                            <TransitionLink className="dmc-nav-link" to="/" onMouseEnter={handleNavHover} onClick={handleNavClick}>Home</TransitionLink>
                        </li>
                        <li className="dmc-nav-item">
                            <TransitionLink className="dmc-nav-link" to="/gas-galon" onMouseEnter={handleNavHover} onClick={handleNavClick}>Gas &amp; Galon</TransitionLink>
                        </li>
                        <li className="dmc-nav-item">
                            <TransitionLink className="dmc-nav-link" to="/laundry" onMouseEnter={handleNavHover} onClick={handleNavClick}>Laundry Express</TransitionLink>
                        </li>
                        <li className="dmc-nav-item">
                            <a className="dmc-nav-link dmc-nav-link--active" href="#" onMouseEnter={handleNavHover} onClick={handleNavClick} aria-current="page">Daily Cleaning</a>
                        </li>
                        <li className="dmc-nav-item">
                            <TransitionLink className="dmc-nav-link" to="/tentang-kami" onMouseEnter={handleNavHover} onClick={handleNavClick}>Tentang Kami</TransitionLink>
                        </li>
                    </ul>

                    <div className="dmc-nav-actions">
                        <button onClick={() => navigate('/login')} className="dmc-btn-nav">
                            Masuk / Daftar
                        </button>
                    </div>
                </div>
            </nav>

            <main>
                <section className="dmc-subheader">
                    <div className="dmc-subheader-inner">
                        <nav className="dmc-breadcrumb">
                            <Link to="/">Layanan</Link>
                            <span className="material-symbols-outlined">chevron_right</span>
                            <span className="dmc-breadcrumb-current">Daily Cleaning</span>
                        </nav>
                        <div className="dmc-location">
                            <span className="material-symbols-outlined">location_on</span>
                            <h1 className="dmc-location-title">
                                Menampilkan mitra di dekat: <span className="dmc-location-highlight">{location.address}</span>
                            </h1>
                        </div>
                    </div>
                </section>

                <div className="dmc-main-layout">
                    <aside className="dmc-sidebar">
                        <div className="dmc-sidebar-inner">
                            <div className="dmc-filter-header">
                                <h2 className="dmc-filter-title">Filter</h2>
                                <button className="dmc-filter-reset" onClick={() => setSelectedCategories(['sapu_pel'])}>
                                    Reset
                                </button>
                            </div>

                            <div>
                                <div className="dmc-filter-group">
                                    <label className="dmc-filter-label">Kategori</label>
                                    <div className="dmc-filter-options">
                                        {[
                                            { key: 'sapu_pel', label: 'Sapu & Pel' },
                                            { key: 'cuci_piring', label: 'Cuci Piring' },
                                            { key: 'rapikan_kamar', label: 'Rapikan Kamar' },
                                            { key: 'paket_lengkap', label: 'Paket Lengkap' },
                                        ].map((cat) => (
                                            <label key={cat.key} className="dmc-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    className="dmc-checkbox-input"
                                                    checked={selectedCategories.includes(cat.key)}
                                                    onChange={() => handleCategoryChange(cat.key)}
                                                />
                                                <span className="dmc-checkbox-text">{cat.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="dmc-filter-group">
                                    <label className="dmc-filter-label">Urutkan</label>
                                    <select
                                        className="dmc-filter-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="terdekat">Terdekat</option>
                                        <option value="harga">Harga Terendah</option>
                                        <option value="rating">Rating Tertinggi</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="dmc-card-list">
                        {mitraWithDistance.map((mitra) => (
                            <article key={mitra.id} className="dmc-card">
                                <div className="dmc-card-body">
                                    <div className="dmc-card-img-wrapper">
                                        <img className="dmc-card-img" src={mitra.image} alt={mitra.name} />
                                    </div>
                                    <div className="dmc-card-content">
                                        <div>
                                            <div className="dmc-card-header">
                                                <h3 className="dmc-card-title">{mitra.name}</h3>
                                                <span className="dmc-card-badge">Berada dalam jangkauan ({mitra.distance} KM)</span>
                                            </div>
                                            <div className="dmc-card-rating">
                                                <span className="material-symbols-outlined">star</span>
                                                <span className="dmc-card-rating-value">{mitra.rating}</span>
                                                <span className="dmc-card-rating-count">({mitra.reviewCount} Ulasan)</span>
                                            </div>
                                            <p className="dmc-card-desc">{mitra.description}</p>
                                        </div>
                                        <div className="dmc-card-footer">
                                            <div className="dmc-card-price">{mitra.price}</div>
                                            <button className="dmc-card-order-btn" onClick={() => handleOrderClick(mitra)}>
                                                Pesan Sekarang
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="dmc-marquee-section">
                                    <div className="dmc-marquee-container">
                                        <div className="dmc-marquee-content" style={{ animationDuration: mitra.marqueeSpeed }}>
                                            {[...mitra.reviews, ...mitra.reviews].map((review, idx) => (
                                                <div key={idx} className="dmc-review-chip">
                                                    <span className="dmc-review-name">{review.name}</span>
                                                    <span className="dmc-review-rating">{review.rating}★</span>
                                                    <span className="dmc-review-text">"{review.text}"</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            </main>

            <footer className="dmc-footer">
                <div className="dmc-footer-inner">
                    <div className="dmc-footer-brand">
                        <Link to="/" className="dmc-brand-link">
                            KostHub<span className="dmc-brand-dot">.</span>
                        </Link>
                    </div>
                    <div className="dmc-footer-links">
                        <a className="dmc-footer-link" href="#">Syarat &amp; Ketentuan</a>
                        <a className="dmc-footer-link" href="#">Kebijakan Privasi</a>
                        <a className="dmc-footer-link" href="#">Hubungi Kami</a>
                    </div>
                    <p className="dmc-footer-copy">© 2024 KostHub. Seluruh hak cipta dilindungi.</p>
                </div>
            </footer>
        </div>
    );
};

export default DetailMitraCleaning;
