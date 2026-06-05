import React, { useState, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TransitionLink from '../../../components/ViewTransition/TransitionLink';
import { useLocation } from '../../../context/LocationContext';
import { calculateDistance } from '../../../utils/distance';
import './DetailMitraGas.css';

// Data mitra gas & galon (static data - nanti bisa diganti dari API backend Laravel + Supabase)
// Setiap mitra sekarang memiliki koordinat lat/lng untuk kalkulasi jarak
const mitraData = [
    {
        id: 1,
        name: 'Gas Mantap Solo',
        lat: -7.5540,
        lng: 110.8560,
        rating: 4.9,
        reviewCount: 185,
        description: 'Agen gas LPG dan galon air mineral terpercaya di Solo. Melayani antar cepat ke area kos-kosan sekitar UNS dengan harga bersahabat dan stok selalu tersedia.',
        price: 'Mulai dari Rp 20.000/tabung 3kg',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDn68W3rFM4GudQFBrdGbGAcbh3fY2Hl7ApVpf5dQ3YCw5INPj172n_KRsTcKEJkJQ2XcXrpfQ1yqIRx3hrYqxpX8RsXzWuV9VsJcqYhjoJWY5sERqHASD4DSfwqn9mRTykLTx-aimRG6SbXzPT2RuSClhdGf7FljkGwz-bh4s0Jtz1GmV39Hi02xFIAnyRAuENhZQXkiqcS7uBGrrBYUnXOeX-6Y0Q7kamYKrBGcosh99_1bnXXJNuCnlHA9GaLhxbIAjEiwYY4V0',
        reviews: [
            { name: 'Ade', rating: '5.0', text: 'Antar cepat, gas selalu ready!' },
            { name: 'Afif', rating: '4.8', text: 'Harga murah, pelayanan ramah' },
            { name: 'Aerio', rating: '5.0', text: 'Langganan sejak semester 1' },
        ],
        marqueeSpeed: '30s',
    },
    {
        id: 2,
        name: 'Galon Berkah Jebres',
        lat: -7.5620,
        lng: 110.8510,
        rating: 4.7,
        reviewCount: 142,
        description: 'Spesialis galon air mineral berbagai merek. Tersedia Aqua, Le Minerale, dan Cleo. Free ongkir untuk area Jebres dan sekitarnya dengan minimum pembelian 2 galon.',
        price: 'Mulai dari Rp 18.000/galon',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuutGa2SI-VZXt1A64IUr9ZChKBz0e1_OVvuFxCOpBToguYXLoLgw6kZmfg5rFPjbh1qf5x5X7cwFudfK-zUimxizVi6Rofd3GfN7IPhhO-c3WmeUUKwDABdn5JINc2g3SUjKGxB4DpuDt_NEv6O-CCn3y6qfkuG4cKckUHm5zF2g4JW69CmD5nvMBaNPo_nlWcLc_A5MmmjP6g2Fi_GZJy0eMUlT_k2kQhC5tt95zMflRvcXu1h3Fbrd0wQACNfd9LANBYm-ErdQ',
        reviews: [
            { name: 'Ade', rating: '5.0', text: 'Galon always fresh, suka!' },
            { name: 'Afif', rating: '4.5', text: 'Pilihan merek lengkap' },
            { name: 'Aerio', rating: '4.8', text: 'Free ongkir mantap!' },
        ],
        marqueeSpeed: '25s',
    },
    {
        id: 3,
        name: 'Depot Air Kentingan',
        lat: -7.5590,
        lng: 110.8640,
        rating: 4.6,
        reviewCount: 97,
        description: 'Depot air minum isi ulang dan agen gas LPG lengkap. Tersedia gas 3kg dan 12kg. Bisa pesan via WhatsApp dan antar langsung ke depan kos.',
        price: 'Mulai dari Rp 15.000/galon',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjA_GMUuQr_j019v6Wvbu9tjBu3OJN4zkE01lZc_Kl9Zgpn7SMzvjk27rB-S38m6GqKQDo3N1UPin2ayJmp4x0G-Q5LKdJWTNe3xCvzi-5cGPgxBEH8TSV2fKWTcuwtc3F1duY_5TlxJ6ZIAkQMXkKN6iFJmqdX2bcyldLCuLhlh6XRULjdCicrhKfLlXjLvlsFBwFRpEGioUwXLzWS8rcygygALyQBKklZh6B9sCFyEUoOXxLYK7RXP_RUrN5ZtPKGL1pqf-AhOY',
        reviews: [
            { name: 'Ade', rating: '4.5', text: 'Air isi ulang murah banget' },
            { name: 'Afif', rating: '4.8', text: 'Gas 12kg juga ada, lengkap!' },
            { name: 'Aerio', rating: '5.0', text: 'Pesan WA langsung antar' },
        ],
        marqueeSpeed: '35s',
    },
];

const DetailMitraGas = ({ onOrderClick }) => {
    const navigate = useNavigate();
    const { location } = useLocation();
    const [selectedCategories, setSelectedCategories] = useState(['gas_3kg']);
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
        const activeLink = ul.querySelector('.dmg-nav-link--active');
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
        const activeLink = ul.querySelector('.dmg-nav-link--active');
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
        <div className="detail-mitra-gas-page">
            {/* TopNavBar */}
            <nav className="dmg-navbar">
                <div className="dmg-navbar-inner">
                    {/* Brand Logo */}
                    <div className="dmg-brand">
                        <Link to="/" className="dmg-brand-link">
                            KostHub<span className="dmg-brand-dot">.</span>
                        </Link>
                    </div>

                    {/* Navigation Links (Desktop) */}
                    <ul className="dmg-nav-links" ref={navLinksRef} onMouseLeave={handleNavLeave}>
                        <li className="dmg-nav-item">
                            <TransitionLink className="dmg-nav-link" to="/" onMouseEnter={handleNavHover} onClick={handleNavClick}>Home</TransitionLink>
                        </li>
                        <li className="dmg-nav-item">
                            <a className="dmg-nav-link dmg-nav-link--active" href="#" onMouseEnter={handleNavHover} onClick={handleNavClick} aria-current="page">Gas &amp; Galon</a>
                        </li>
                        <li className="dmg-nav-item">
                            <TransitionLink className="dmg-nav-link" to="/laundry" onMouseEnter={handleNavHover} onClick={handleNavClick}>Laundry Express</TransitionLink>
                        </li>
                        <li className="dmg-nav-item">
                            <TransitionLink className="dmg-nav-link" to="/daily-cleaning" onMouseEnter={handleNavHover} onClick={handleNavClick}>Daily Cleaning</TransitionLink>
                        </li>
                        <li className="dmg-nav-item">
                            <TransitionLink className="dmg-nav-link" to="/tentang-kami" onMouseEnter={handleNavHover} onClick={handleNavClick}>Tentang Kami</TransitionLink>
                        </li>
                    </ul>

                    {/* Trailing Action */}
                    <div className="dmg-nav-actions">
                        <button
                            onClick={() => navigate('/login')}
                            className="dmg-btn-nav"
                        >
                            Masuk / Daftar
                        </button>
                    </div>
                </div>
            </nav>

            <main>
                {/* Sub-header */}
                <section className="dmg-subheader">
                    <div className="dmg-subheader-inner">
                        <nav className="dmg-breadcrumb">
                            <Link to="/">Layanan</Link>
                            <span className="material-symbols-outlined">chevron_right</span>
                            <span className="dmg-breadcrumb-current">Gas &amp; Galon</span>
                        </nav>
                        <div className="dmg-location">
                            <span className="material-symbols-outlined">location_on</span>
                            <h1 className="dmg-location-title">
                                Menampilkan mitra di dekat: <span className="dmg-location-highlight">{location.address}</span>
                            </h1>
                        </div>
                    </div>
                </section>

                {/* Main Layout */}
                <div className="dmg-main-layout">
                    {/* Sidebar Filters */}
                    <aside className="dmg-sidebar">
                        <div className="dmg-sidebar-inner">
                            <div className="dmg-filter-header">
                                <h2 className="dmg-filter-title">Filter</h2>
                                <button
                                    className="dmg-filter-reset"
                                    onClick={() => setSelectedCategories(['gas_3kg'])}
                                >
                                    Reset
                                </button>
                            </div>

                            {/* Filter Groups */}
                            <div>
                                <div className="dmg-filter-group">
                                    <label className="dmg-filter-label">Kategori</label>
                                    <div className="dmg-filter-options">
                                        {[
                                            { key: 'gas_3kg', label: 'Gas 3kg' },
                                            { key: 'gas_12kg', label: 'Gas 12kg' },
                                            { key: 'galon_aqua', label: 'Galon Aqua' },
                                            { key: 'galon_le_minerale', label: 'Galon Le Minerale' },
                                        ].map((cat) => (
                                            <label key={cat.key} className="dmg-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    className="dmg-checkbox-input"
                                                    checked={selectedCategories.includes(cat.key)}
                                                    onChange={() => handleCategoryChange(cat.key)}
                                                />
                                                <span className="dmg-checkbox-text">
                                                    {cat.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="dmg-filter-group">
                                    <label className="dmg-filter-label">Urutkan</label>
                                    <select
                                        className="dmg-filter-select"
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
                    <section className="dmg-card-list">
                        {mitraWithDistance.map((mitra) => (
                            <article key={mitra.id} className="dmg-card">
                                <div className="dmg-card-body">
                                    <div className="dmg-card-img-wrapper">
                                        <img
                                            className="dmg-card-img"
                                            src={mitra.image}
                                            alt={mitra.name}
                                        />
                                    </div>
                                    <div className="dmg-card-content">
                                        <div>
                                            <div className="dmg-card-header">
                                                <h3 className="dmg-card-title">{mitra.name}</h3>
                                                <span className="dmg-card-badge">
                                                    Berada dalam jangkauan ({mitra.distance} KM)
                                                </span>
                                            </div>
                                            <div className="dmg-card-rating">
                                                <span className="material-symbols-outlined">star</span>
                                                <span className="dmg-card-rating-value">{mitra.rating}</span>
                                                <span className="dmg-card-rating-count">({mitra.reviewCount} Ulasan)</span>
                                            </div>
                                            <p className="dmg-card-desc">{mitra.description}</p>
                                        </div>
                                        <div className="dmg-card-footer">
                                            <div className="dmg-card-price">{mitra.price}</div>
                                            <button
                                                className="dmg-card-order-btn"
                                                onClick={() => handleOrderClick(mitra)}
                                            >
                                                Pesan Sekarang
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Marquee Reviews */}
                                <div className="dmg-marquee-section">
                                    <div className="dmg-marquee-container">
                                        <div
                                            className="dmg-marquee-content"
                                            style={{ animationDuration: mitra.marqueeSpeed }}
                                        >
                                            {/* Original + Duplicate for seamless loop */}
                                            {[...mitra.reviews, ...mitra.reviews].map((review, idx) => (
                                                <div key={idx} className="dmg-review-chip">
                                                    <span className="dmg-review-name">{review.name}</span>
                                                    <span className="dmg-review-rating">{review.rating}★</span>
                                                    <span className="dmg-review-text">"{review.text}"</span>
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
            <footer className="dmg-footer">
                <div className="dmg-footer-inner">
                    <div className="dmg-footer-brand">
                        <Link to="/" className="dmg-brand-link">
                            KostHub<span className="dmg-brand-dot">.</span>
                        </Link>
                    </div>
                    <div className="dmg-footer-links">
                        <a className="dmg-footer-link" href="#">Syarat &amp; Ketentuan</a>
                        <a className="dmg-footer-link" href="#">Kebijakan Privasi</a>
                        <a className="dmg-footer-link" href="#">Hubungi Kami</a>
                    </div>
                    <p className="dmg-footer-copy">
                        © 2024 KostHub. Seluruh hak cipta dilindungi.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default DetailMitraGas;
