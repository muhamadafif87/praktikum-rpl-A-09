import React, { useState, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TransitionLink from '../../../components/ViewTransition/TransitionLink';
import { useLocation } from '../../../context/LocationContext';
import { calculateDistance } from '../../../utils/distance';
import './DetailMitra.css';

// Data mitra laundry (static data - nanti bisa diganti dari API backend Laravel + Supabase)
// Setiap mitra sekarang memiliki koordinat lat/lng untuk kalkulasi jarak
const mitraData = [
    {
        id: 1,
        name: 'Super Laundry UNS',
        lat: -7.5600,
        lng: 110.8550,
        rating: 4.8,
        reviewCount: 120,
        description: 'Layanan laundry kiloan terbaik di sekitar UNS dengan proses pengerjaan 1 hari jadi. Menggunakan deterjen premium dan parfum tahan lama.',
        price: 'Mulai dari Rp 6.000/kg',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2sTHRoVQPgOtt6O544pQtG5gy0gwW77ECi_DR6gJcfYUyBoeh4GV1M9FVuRYvUAxV6PJ6jjz8BSllW57EQacjxGmxQpnaliiO0qXxGpx0crhe_Q6j_S-3ae73kgKbMaMsK6R2yzqCerV-vpG3MerFJiCq8ARvLSULYu0d5r3jWWiloa7malq4nVW2JiqQnMy6mRAmEuqTvSzNxI2Ak4b6-sU1dLLtuGkcQ928wVxI25BaL_j1Ny6e6lM5hxRFDqmWUEv5qSnR4s8',
        reviews: [
            { name: 'Ade', rating: '5.0', text: 'Wangi banget, jemputan kilat!' },
            { name: 'Afif', rating: '4.8', text: 'Cucian rapi, bedcover bersih pool' },
            { name: 'Aerio', rating: '5.0', text: 'Suka banget langganan di sini' },
        ],
        marqueeSpeed: '30s',
    },
    {
        id: 2,
        name: 'Solo Clean Express',
        lat: -7.5530,
        lng: 110.8580,
        rating: 4.9,
        reviewCount: 210,
        description: 'Spesialis express 6 jam jadi. Cocok buat mahasiswa yang butuh pakaian cepat bersih untuk acara mendadak.',
        price: 'Mulai dari Rp 8.500/kg',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuutGa2SI-VZXt1A64IUr9ZChKBz0e1_OVvuFxCOpBToguYXLoLgw6kZmfg5rFPjbh1qf5x5X7cwFudfK-zUimxizVi6Rofd3GfN7IPhhO-c3WmeUUKwDABdn5JINc2g3SUjKGxB4DpuDt_NEv6O-CCn3y6qfkuG4cKckUHm5zF2g4JW69CmD5nvMBaNPo_nlWcLc_A5MmmjP6g2Fi_GZJy0eMUlT_k2kQhC5tt95zMflRvcXu1h3Fbrd0wQACNfd9LANBYm-ErdQ',
        reviews: [
            { name: 'Ade', rating: '5.0', text: 'Wangi banget, jemputan kilat!' },
            { name: 'Afif', rating: '4.8', text: 'Cucian rapi, bedcover bersih pool' },
            { name: 'Aerio', rating: '5.0', text: 'Suka banget langganan di sini' },
        ],
        marqueeSpeed: '25s',
    },
    {
        id: 3,
        name: 'Kentingan Laundry Pods',
        lat: -7.5650,
        lng: 110.8520,
        rating: 4.7,
        reviewCount: 85,
        description: 'Layanan laundry mandiri dengan mesin modern. Bisa ditunggu sambil nugas karena ada area Wi-Fi gratis.',
        price: 'Mulai dari Rp 10.000/kg',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjA_GMUuQr_j019v6Wvbu9tjBu3OJN4zkE01lZc_Kl9Zgpn7SMzvjk27rB-S38m6GqKQDo3N1UPin2ayJmp4x0G-Q5LKdJWTNe3xCvzi-5cGPgxBEH8TSV2fKWTcuwtc3F1duY_5TlxJ6ZIAkQMXkKN6iFJmqdX2bcyldLCuLhlh6XRULjdCicrhKfLlXjLvlsFBwFRpEGioUwXLzWS8rcygygALyQBKklZh6B9sCFyEUoOXxLYK7RXP_RUrN5ZtPKGL1pqf-AhOY',
        reviews: [
            { name: 'Ade', rating: '5.0', text: 'Wangi banget, jemputan kilat!' },
            { name: 'Afif', rating: '4.8', text: 'Cucian rapi, bedcover bersih pool' },
            { name: 'Aerio', rating: '5.0', text: 'Suka banget langganan di sini' },
        ],
        marqueeSpeed: '35s',
    },
];

const DetailMitra = ({ onOrderClick }) => {
    const navigate = useNavigate();
    const { location } = useLocation();
    const [selectedCategories, setSelectedCategories] = useState(['pakaian']);
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
        const activeLink = ul.querySelector('.dm-nav-link--active');
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
        const activeLink = ul.querySelector('.dm-nav-link--active');
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
        // Cek apakah user sudah login (token di localStorage dari Laravel Sanctum)
        const token = localStorage.getItem('token');
        if (!token) {
            // User belum login → trigger auth interceptor
            if (onOrderClick) {
                onOrderClick(mitra);
            }
        } else {
            // User sudah login → lanjut ke pemesanan (belum diimplementasi)
            console.log('Melanjutkan pemesanan untuk:', mitra.name);
        }
    };

    return (
        <div className="detail-mitra-page">
            {/* TopNavBar */}
            <nav className="dm-navbar">
                <div className="dm-navbar-inner">
                    {/* Brand Logo */}
                    <div className="dm-brand">
                        <Link to="/" className="dm-brand-link">
                            KostHub<span className="dm-brand-dot">.</span>
                        </Link>
                    </div>

                    {/* Navigation Links (Desktop) */}
                    <ul className="dm-nav-links" ref={navLinksRef} onMouseLeave={handleNavLeave}>
                        <li className="dm-nav-item">
                            <TransitionLink className="dm-nav-link" to="/" onMouseEnter={handleNavHover} onClick={handleNavClick}>Home</TransitionLink>
                        </li>
                        <li className="dm-nav-item">
                            <TransitionLink className="dm-nav-link" to="/gas-galon" onMouseEnter={handleNavHover} onClick={handleNavClick}>Gas &amp; Galon</TransitionLink>
                        </li>
                        <li className="dm-nav-item">
                            <a className="dm-nav-link dm-nav-link--active" href="#" onMouseEnter={handleNavHover} onClick={handleNavClick} aria-current="page">Laundry Express</a>
                        </li>
                        <li className="dm-nav-item">
                            <TransitionLink className="dm-nav-link" to="/daily-cleaning" onMouseEnter={handleNavHover} onClick={handleNavClick}>Daily Cleaning</TransitionLink>
                        </li>
                        <li className="dm-nav-item">
                            <TransitionLink className="dm-nav-link" to="/tentang-kami" onMouseEnter={handleNavHover} onClick={handleNavClick}>Tentang Kami</TransitionLink>
                        </li>
                    </ul>

                    {/* Trailing Action */}
                    <div className="dm-nav-actions">
                        <button
                            onClick={() => navigate('/login')}
                            className="dm-btn-nav"
                        >
                            Masuk / Daftar
                        </button>
                    </div>
                </div>
            </nav>

            <main>
                {/* Sub-header */}
                <section className="dm-subheader">
                    <div className="dm-subheader-inner">
                        <nav className="dm-breadcrumb">
                            <Link to="/">Layanan</Link>
                            <span className="material-symbols-outlined">chevron_right</span>
                            <span className="dm-breadcrumb-current">Laundry</span>
                        </nav>
                        <div className="dm-location">
                            <span className="material-symbols-outlined">location_on</span>
                            <h1 className="dm-location-title">
                                Menampilkan mitra di dekat: <span className="dm-location-highlight">{location.address}</span>
                            </h1>
                        </div>
                    </div>
                </section>

                {/* Main Layout */}
                <div className="dm-main-layout">
                    {/* Sidebar Filters */}
                    <aside className="dm-sidebar">
                        <div className="dm-sidebar-inner">
                            <div className="dm-filter-header">
                                <h2 className="dm-filter-title">Filter</h2>
                                <button
                                    className="dm-filter-reset"
                                    onClick={() => setSelectedCategories(['pakaian'])}
                                >
                                    Reset
                                </button>
                            </div>

                            {/* Filter Groups */}
                            <div>
                                <div className="dm-filter-group">
                                    <label className="dm-filter-label">Kategori</label>
                                    <div className="dm-filter-options">
                                        {['pakaian', 'sprei', 'bedcover', 'semuanya'].map((cat) => (
                                            <label key={cat} className="dm-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    className="dm-checkbox-input"
                                                    checked={selectedCategories.includes(cat)}
                                                    onChange={() => handleCategoryChange(cat)}
                                                />
                                                <span className="dm-checkbox-text">
                                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="dm-filter-group">
                                    <label className="dm-filter-label">Urutkan</label>
                                    <select
                                        className="dm-filter-select"
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

                    {/* Card List */}
                    <section className="dm-card-list">
                        {mitraWithDistance.map((mitra) => (
                            <article key={mitra.id} className="dm-card">
                                <div className="dm-card-body">
                                    <div className="dm-card-img-wrapper">
                                        <img
                                            className="dm-card-img"
                                            src={mitra.image}
                                            alt={mitra.name}
                                        />
                                    </div>
                                    <div className="dm-card-content">
                                        <div>
                                            <div className="dm-card-header">
                                                <h3 className="dm-card-title">{mitra.name}</h3>
                                                <span className="dm-card-badge">
                                                    Berada dalam jangkauan ({mitra.distance} KM)
                                                </span>
                                            </div>
                                            <div className="dm-card-rating">
                                                <span className="material-symbols-outlined">star</span>
                                                <span className="dm-card-rating-value">{mitra.rating}</span>
                                                <span className="dm-card-rating-count">({mitra.reviewCount} Ulasan)</span>
                                            </div>
                                            <p className="dm-card-desc">{mitra.description}</p>
                                        </div>
                                        <div className="dm-card-footer">
                                            <div className="dm-card-price">{mitra.price}</div>
                                            <button
                                                className="dm-card-order-btn"
                                                onClick={() => handleOrderClick(mitra)}
                                            >
                                                Pesan Sekarang
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Marquee Reviews */}
                                <div className="dm-marquee-section">
                                    <div className="dm-marquee-container">
                                        <div
                                            className="dm-marquee-content"
                                            style={{ animationDuration: mitra.marqueeSpeed }}
                                        >
                                            {/* Original + Duplicate for seamless loop */}
                                            {[...mitra.reviews, ...mitra.reviews].map((review, idx) => (
                                                <div key={idx} className="dm-review-chip">
                                                    <span className="dm-review-name">{review.name}</span>
                                                    <span className="dm-review-rating">{review.rating}★</span>
                                                    <span className="dm-review-text">"{review.text}"</span>
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

            {/* Footer */}
            <footer className="dm-footer">
                <div className="dm-footer-inner">
                    <div className="dm-footer-brand">
                        <Link to="/" className="dm-brand-link">
                            KostHub<span className="dm-brand-dot">.</span>
                        </Link>
                    </div>
                    <div className="dm-footer-links">
                        <a className="dm-footer-link" href="#">Syarat &amp; Ketentuan</a>
                        <a className="dm-footer-link" href="#">Kebijakan Privasi</a>
                        <a className="dm-footer-link" href="#">Hubungi Kami</a>
                    </div>
                    <p className="dm-footer-copy">
                        © 2024 KostHub. Seluruh hak cipta dilindungi.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default DetailMitra;
