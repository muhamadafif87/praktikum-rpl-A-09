import React, { useState, useMemo, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TransitionLink from '../../../components/ViewTransition/TransitionLink';
import { useLocation } from '../../../context/LocationContext';
import { calculateDistance } from '../../../utils/distance';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import './DetailMitraCleaning.css';

const DetailMitraCleaning = ({ onOrderClick }) => {
    const navigate = useNavigate();
    const { location } = useLocation();
    const navLinksRef = useRef(null);
    const { user, isAuthenticated, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

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

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortBy, setSortBy] = useState('Terbaik');

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

    useEffect(() => {
        const kategoriParam = selectedCategories.length > 0 ? selectedCategories : ['All'];
        fetchMitraData(kategoriParam, sortBy);
    }, [selectedCategories, sortBy]);

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

    const [mitraList, setMitraList] = useState([]);
    const [mitraLoading, setMitraLoading] = useState(true);
    const [mitraError, setMitraError] = useState('');

    const fetchMitraData = async (kategori = ['All'], sortByValue = 'Terbaik') => {
        setMitraLoading(true);
        setMitraError('');

        try{
            const response =  await api.get('/v1/landing-page/daily-cleaning/', {
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
                    price: mitra.layanan?.length > 0
                        ? `Mulai dari Rp ${parseInt(mitra.layanan[0].harga_satuan).toLocaleString('id-ID')}`
                        : 'Hubungi untuk info harga',
                    image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(mitra.nama_mitra)}`,
                    layanan: mitra.layanan || [],
                    reviews: (mitra.sample_ulasan || [])
                        .map((ulasan) => ({
                            name: ulasan.nama_user,
                            rating: `${ulasan.rating}.0`,
                            text: ulasan.komentar,
                    })),
                    marqueeSpeed: '30s',
                }))
            );
        }
        catch (err) {
            console.error('Error fetching mitra data:', err);
            if (err.response) {
                setMitraError(err.response.data?.message || 'Gagal memuat data mitra');
            } else if (err.request) {
                setMitraError('Tidak dapat terhubung ke server.');
            } else {
                setMitraError('Terjadi kesalahan saat memuat data.');
            }
        }
        finally {
            setMitraLoading(false);
        }
    }

    useEffect(() => {
        fetchMitraData(['All'], 'Terbaik');
    }, []);

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
                                Menampilkan mitra di dekat: <span className="dmc-location-highlight">Jl. Ir. Sutami, Jebres, Surakarta</span>
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
                                        <option value="Terdekat">Terdekat</option>
                                        <option value="Terlaris">Terlaris</option>
                                        <option value="Terbaik">Terbaik</option>
                                        <option value="Harga Bersahabat">Harga Bersahabat</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="dmc-card-list">
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
                                <article key={mitra.id} className="dmc-card">
                                    <div className="dmc-card-body">
                                        <div className="dmc-card-img-wrapper">
                                            <img className="dmc-card-img" src={mitra.image} alt={mitra.name} />
                                        </div>
                                        <div className="dmc-card-content">
                                            <div>
                                                <div className="dmc-card-header">
                                                    <h3 className="dmc-card-title">{mitra.name}</h3>
                                                    <span className="dmc-card-badge">Berada dalam jangkauan ({mitra.distance})</span>
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
