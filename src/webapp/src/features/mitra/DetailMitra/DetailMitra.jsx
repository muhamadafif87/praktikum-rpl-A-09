import React, { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TransitionLink from '../../../components/ViewTransition/TransitionLink';
import { useLocation } from '../../../context/LocationContext';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import './DetailMitra.css';
import '../../landing/LandingPage/LandingPage.css';

const DetailMitra = ({ onOrderClick }) => {
    const navigate = useNavigate();
    const { location } = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState(['All']);
    const [sortBy, setSortBy] = useState('Terbaik');
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

    const [mitraList, setMitraList] = useState([]);
    const [mitraLoading, setMitraLoading] = useState(true);
    const [mitraError, setMitraError] = useState('');

    const fetchMitraData = async (kategori = ['All'], sortByValue = 'Terbaik') => {
        setMitraLoading(true);
        setMitraError('');

        try {
            const response = await api.get('/v1/landing-page/laundry-express', {
                params: {
                    kategori: kategori,
                    sortBy: sortByValue,
                }
            });
            const { data } = response.data;
            const dataArray = Array.isArray(data) ? data : [];

            setMitraList(
                dataArray.map((mitra) => ({
                    id: mitra.id_mitra,
                    name: mitra.nama_mitra,
                    type: mitra.jenis_jasa,
                    location: mitra.lokasi_layanan,
                    distance: '0.5 KM', // Nanti bisa diambil dari API jika ada
                    rating: mitra.rating,
                    reviewCount: mitra.jumlah_ulasan,
                    description: `${mitra.jenis_jasa} terpercaya. ${mitra.layanan?.length || 0} jenis layanan tersedia.`,
                    price: (() => {
                        if (!mitra.layanan || mitra.layanan.length === 0) return 'Hubungi untuk info harga';
                        const prices = mitra.layanan.map(l => parseInt(l.harga_satuan)).filter(p => !isNaN(p) && p > 0);
                        return prices.length > 0 ? `Mulai dari Rp ${Math.min(...prices).toLocaleString('id-ID')}` : 'Hubungi untuk info harga';
                    })(),
                    image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(mitra.nama_mitra)}`,
                    layanan: mitra.layanan || [],
                    reviews: (mitra.sample_ulasan || []).map((ulasan) => ({
                        name: ulasan.nama_user,
                        rating: `${ulasan.rating}.0`,
                        text: ulasan.komentar,
                    })),
                    marqueeSpeed: '30s',
                }))
            );
        } catch (err) {
            console.error('Error fetching mitra data:', err);
            if (err.response) {
                setMitraError(err.response.data?.message || 'Gagal memuat data mitra');
            } else if (err.request) {
                setMitraError('Tidak dapat terhubung ke server.');
            } else {
                setMitraError('Terjadi kesalahan saat memuat data.');
            }
        } finally {
            setMitraLoading(false);
        }
    };

    useEffect(() => {
        const kategoriParam = selectedCategories.length > 0 ? selectedCategories : ['All'];
        fetchMitraData(kategoriParam, sortBy);
    }, [selectedCategories, sortBy]);

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
                                    onClick={() => setSelectedCategories(['All'])}
                                >
                                    Reset
                                </button>
                            </div>

                            {/* Filter Groups */}
                            <div>
                                <div className="dm-filter-group">
                                    <label className="dm-filter-label">Kategori</label>
                                    <div className="dm-filter-options">
                                        {['Pakaian', 'Sprei', 'BedCover', 'All'].map((cat) => (
                                            <label key={cat} className="dm-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    className="dm-checkbox-input"
                                                    checked={selectedCategories.includes(cat)}
                                                    onChange={() => handleCategoryChange(cat)}
                                                />
                                                <span className="dm-checkbox-text">
                                                    {cat === 'All' ? 'Semua' : cat}
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
                                        <option value="Terdekat">Terdekat</option>
                                        <option value="Terlaris">Terlaris</option>
                                        <option value="Terbaik">Terbaik</option>
                                        <option value="Harga Bersahabat">Harga Bersahabat</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Card List */}
                    <section className="dm-card-list">
                        {mitraLoading ? (
                            <div className="dmg-loading-container">
                                <div className="dmg-spinner"></div>
                                <p>Memuat data mitra...</p>
                            </div>
                        ) : mitraError ? (
                            <div className="dmg-error-container">
                                <span className="material-symbols-outlined">error_outline</span>
                                <p>{mitraError}</p>
                                <button
                                    onClick={() => fetchMitraData()}
                                    className="dmg-retry-btn"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        ) : mitraList.length === 0 ? (
                            <div className="dmg-empty-container">
                                <span className="material-symbols-outlined">inbox</span>
                                <p>Tidak ada data mitra tersedia</p>
                            </div>
                        ) : (
                            mitraList.map((mitra) => (
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
                            ))
                        )}
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
