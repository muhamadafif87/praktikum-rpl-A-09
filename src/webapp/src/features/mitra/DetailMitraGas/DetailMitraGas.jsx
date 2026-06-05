import React, { useState, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TransitionLink from '../../../components/ViewTransition/TransitionLink';
import { useLocation } from '../../../context/LocationContext';
import { calculateDistance } from '../../../utils/distance';
import './DetailMitraGas.css';

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

    const [mitraList, setMitraList] = useState([]);
    const [mitraLoading, setMitraLoading] = useState(true);
    const [mitraError, setMitraError] = useState('');

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortBy, setSortBy] = useState('Terbaik');

    const fetchMitraData = async (kategori = 'All', sortByValue = 'Terbaik') => {
        setMitraLoading(true);
        setMitraError('');

        try {
            const response = await api.get('/v1/landing-page/galon-gas', {
                params: {
                    kategori: kategori,
                    sortBy: sortByValue,
                }
            });
            const { data } = response.data;

            const transformedData = data.map((mitra) => ({
                id: mitra.id_mitra,
                name: mitra.nama_mitra,
                type: mitra.jenis_jasa,
                location: mitra.lokasi_layanan,
                distance: '0.5 KM', // Nanti bisa diambil dari API jika ada
                rating: mitra.rating,
                reviewCount: mitra.jumlah_ulasan,
                description: `${mitra.jenis_jasa === 'gas' ? 'Agen gas LPG' : 'Layanan galon'} terpercaya. ${mitra.layanan?.length || 0} jenis layanan tersedia.`,
                price: mitra.layanan?.length > 0
                    ? `Mulai dari Rp ${parseInt(mitra.layanan[0].harga_satuan).toLocaleString('id-ID')}`
                    : 'Hubungi untuk info harga',
                image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(mitra.nama_mitra)}`,
                layanan: mitra.layanan || [],
                reviews: (mitra.sample_ulasan || []).map((ulasan) => ({
                    name: ulasan.nama_user,
                    rating: `${ulasan.rating}.0`,
                    text: ulasan.komentar,
                })),
                marqueeSpeed: '30s',
            }));

            setMitraList(transformedData);
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
        fetchMitraData(['All'], 'Terbaik');
    }, []);

    // Effect untuk listen perubahan filter (kategori dan sortBy)
    useEffect(() => {
        const kategoriParam = selectedCategories.length > 0 ? selectedCategories : ['All'];
        fetchMitraData(kategoriParam, sortBy);
    }, [selectedCategories, sortBy]);

    const handleCategoryChange = (category) => {
        setSelectedCategories((prev) => {
            let newCategories;
            if (prev.includes(category)) {
                newCategories = prev.filter((c) => c !== category);
            } else {
                newCategories = [...prev, category];
            }

            return newCategories;
        });
    };

    const handleOrderClick = (mitra) => {
        const token = localStorage.getItem('token');
        if (!token) {
            // User belum login → trigger auth interceptor
            if (onOrderClick) {
                onOrderClick(mitra);
            }
        } else {
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
                            <a className="dmg-nav-link" href="#" onMouseEnter={handleNavHover}>Tentang Kami</a>
                        </li>
                    </ul>

                    {/* Trailing Action */}
                    <div className="dmg-nav-actions">
                        {isAuthenticated ? (
                            <div className="dmg-profile-menu">
                                <button
                                    className="dmg-profile-btn"
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    title={user?.nama_lengkap || user?.nama_mitra || user?.nama || 'User'}
                                >
                                    <div className="dmg-profile-avatar">
                                        <span className="material-symbols-outlined">account_circle</span>
                                    </div>
                                </button>

                                {showProfileMenu && (
                                    <div className="dmg-profile-dropdown">
                                        <div className="dmg-profile-info">
                                            <p className="dmg-profile-name">
                                                {user?.nama_lengkap || user?.nama_mitra || user?.nama || 'User'}
                                            </p>
                                            <p className="dmg-profile-email">{user?.email}</p>
                                        </div>
                                        <hr className="dmg-profile-divider" />
                                        <button
                                            className="dmg-profile-link"
                                            onClick={() => {
                                                navigate('/profile');
                                                setShowProfileMenu(false);
                                            }}
                                        >
                                            <span className="material-symbols-outlined">person</span>
                                            Profil Saya
                                        </button>
                                        <button
                                            className="dmg-profile-link"
                                            onClick={() => {
                                                navigate('/settings');
                                                setShowProfileMenu(false);
                                            }}
                                        >
                                            <span className="material-symbols-outlined">settings</span>
                                            Pengaturan
                                        </button>
                                        <button
                                            className="dmg-profile-link dmg-profile-logout"
                                            onClick={() => {
                                                logout();
                                                setShowProfileMenu(false);
                                                navigate('/');
                                            }}
                                        >
                                            <span className="material-symbols-outlined">logout</span>
                                            Keluar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="dmg-btn-nav"
                            >
                                Masuk / Daftar
                            </button>
                        )}
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
                                Menampilkan mitra di dekat: <span className="dmg-location-highlight">Jl. Ir. Sutami, Jebres, Surakarta</span>
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
                                    onClick={() => setSelectedCategories([])}
                                >
                                    Reset
                                </button>
                            </div>

                            <div>
                                <div className="dmg-filter-group">
                                    <label className="dmg-filter-label">Kategori</label>
                                    <div className="dmg-filter-options">
                                        {[
                                            { key: 'Gas 3kg', label: 'Gas 3kg' },
                                            { key: 'Gas 5kg', label: 'Gas 5kg' },
                                            { key: 'Gas 10kg', label: 'Gas 10kg' },
                                            { key: 'Galon 5L', label: 'Galon 5L' },
                                            { key: 'Galon 15L', label: 'Galon 15L' },
                                            { key: 'All', label: 'Semua' },
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
                    <section className="dmg-card-list">
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
                                                        Berada dalam jangkauan ({mitra.distance})
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
                                    {mitra.reviews.length > 0 && (
                                        <div className="dmg-marquee-section">
                                            <div className="dmg-marquee-container">
                                                <div
                                                    className="dmg-marquee-content"
                                                    style={{ animationDuration: mitra.marqueeSpeed }}
                                                >
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
                                    )}
                                </article>
                            ))
                        )}
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
