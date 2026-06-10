import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DetailMitraLaundry.css';
import '../../landing/LandingPage/LandingPage.css';
import TransitionLink from '../../../components/ViewTransition/TransitionLink';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from '../../../context/LocationContext';
import api from '../../../services/api';

const DetailMitraLaundry = ({ onOrderClick }) => {
    const navigate = useNavigate();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortBy, setSortBy] = useState('terdekat');

    const navLinksRef = useRef(null);

    const { user, isAuthenticated, logout } = useAuth();
    const { location, openMap } = useLocation();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const updateIndicator = useCallback((targetEl) => {
        const ul = navLinksRef.current;
        if (!ul || !targetEl) return;
        const ulRect = ul.getBoundingClientRect();
        const linkRect = targetEl.getBoundingClientRect();
        ul.style.setProperty('--indicator-left', `${linkRect.left - ulRect.left}px`);
        ul.style.setProperty('--indicator-width', `${linkRect.width}px`);
    }, []);

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

    useEffect(() => {
        const kategoriParam = selectedCategories.length > 0 ? selectedCategories : ['All'];
        fetchMitraData(kategoriParam, sortBy);
    }, [selectedCategories, sortBy, location]);

    const handleOrderClick = (mitra) => {
        const token = localStorage.getItem('token');
        if (!token) {
            sessionStorage.setItem('redirectAfterLogin', `/laundry/${mitra.id}/pesan`);
            if (onOrderClick) {
                onOrderClick(mitra);
            }
        } else {
            navigate(`/laundry/${mitra.id}/pesan`);
        }
    };

    const [mitraList, setMitraList] = useState([]);
    const [mitraLoading, setMitraLoading] = useState(true);
    const [mitraError, setMitraError] = useState('');

    const fetchMitraData = async (kategori = ['All'], sortByValue = 'Terbaik') => {
        setMitraLoading(true);
        setMitraError('');

        try{
            const params = {
                kategori: kategori,
                sortBy: sortByValue,
            };

            if (location.isConfirmed && location.lat && location.lng) {
                params.lat = location.lat;
                params.lng = location.lng;
            }

            const response =  await api.get('/v1/landing-page/laundry-express', { params });
            const { data } = response.data;

            setMitraList(
                data.map((mitra) => ({
                    id: mitra.id_mitra,
                    name: mitra.nama_mitra,
                    image: mitra.profil_image,
                    type: mitra.jenis_jasa,
                    location: mitra.lokasi_layanan,
                    distance: mitra.jarak_km ? `${mitra.jarak_km.toFixed(1)} KM` : 'Jarak Tidak Diketahui',
                    rating: mitra.rating,
                    reviewCount: mitra.jumlah_ulasan,
                    description: `${mitra.jenis_jasa} terpercaya. ${mitra.layanan?.length || 0} jenis layanan tersedia.`,
                    price: mitra.layanan?.length > 0
                        ? `Mulai dari Rp ${parseInt(mitra.layanan[0].harga_satuan).toLocaleString('id-ID')}`
                        : 'Hubungi untuk info harga',
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
                            <TransitionLink className="dmc-nav-link dmc-nav-link--active" to="/laundry" onMouseEnter={handleNavHover} onClick={handleNavClick} aria-current="page">Laundry Express</TransitionLink>
                        </li>
                        <li className="dmc-nav-item">
                            <TransitionLink className="dmc-nav-link" to="/daily-cleaning" onMouseEnter={handleNavHover} onClick={handleNavClick}>Daily Cleaning</TransitionLink>
                        </li>
                        <li className="dmc-nav-item">
                            <TransitionLink className="dmc-nav-link" to="/tentang-kami" onMouseEnter={handleNavHover} onClick={handleNavClick}>Tentang Kami</TransitionLink>
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

            <main>
                <section className="dmc-subheader">
                    <div className="dmc-subheader-inner">
                        <nav className="dmc-breadcrumb">
                            <Link to="/">Layanan</Link>
                            <span className="material-symbols-outlined">chevron_right</span>
                            <span className="dmc-breadcrumb-current">Laundry</span>
                        </nav>
                        <div className="dmc-location">
                            <span className="material-symbols-outlined">location_on</span>
                            <h1 className="dmc-location-title">
                                Menampilkan mitra di dekat:{' '}
                                <span className="dmc-location-highlight">
                                    {location.isConfirmed ? location.address : 'Lokasi Belum Diatur'}
                                </span>
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
                                            { key: 'Pakaian', label: 'Pakaian' },
                                            { key: 'Sprei', label: 'Sprei' },
                                            { key: 'Bedcover', label: 'Bedcover' },
                                            { key: 'All', label: 'Semuanya' },
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
                            <div className="dmc-mitra-list">
                                {!location.isConfirmed ? (
                                    <div className="dmg-empty-container" style={{ gridColumn: '1 / -1', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#9ca3af' }}>location_off</span>
                                        <h4 style={{ margin: '1rem 0 0.5rem', color: '#1f2937', fontSize: '1.25rem', fontWeight: '600', textAlign: 'center' }}>Lokasi Pengiriman Belum Diatur</h4>
                                        <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '400px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>Silakan atur lokasi pengiriman terlebih dahulu di Beranda untuk melihat daftar mitra yang menjangkau areamu.</p>
                                        <button 
                                            onClick={() => navigate('/')}
                                            style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background-color 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>home</span>
                                            Kembali ke Beranda
                                        </button>
                                    </div>
                                ) : mitraList.length > 0 ? (
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
                                                        <button
                                                            className={`dmc-card-order-btn ${!location.isConfirmed ? 'dmc-card-order-btn-disabled' : ''}`}
                                                            onClick={() => location.isConfirmed && handleOrderClick(mitra)}
                                                            disabled={!location.isConfirmed}
                                                        >
                                                            {location.isConfirmed ? 'Pesan Sekarang' : 'Atur Lokasi'}
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
                                ) : null}
                            </div>
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

export default DetailMitraLaundry;
