import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from '../../../context/LocationContext';
import '../skeleton.css';
import api from '../../../services/api';
import './DetailMitraGas.css';
import '../../landing/LandingPage/LandingPage.css';
import TransitionLink from '../../../components/ViewTransition/TransitionLink';
import Footer from '../../../components/Footer/Footer';

const DetailMitraGas = ({ onOrderClick }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const { location, openMap } = useLocation();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const navLinksRef = useRef(null);

    const handleNavLeave = () => {
        const ul = navLinksRef.current;
        if (!ul) return;
        const activeLink = ul.querySelector('.dmc-nav-link--active');
        if (activeLink) {
            updateIndicator(activeLink);
        }
    };

    const updateIndicator = useCallback((targetEl) => {
        const ul = navLinksRef.current;
        if (!ul || !targetEl) return;
        const ulRect = ul.getBoundingClientRect();
        const linkRect = targetEl.getBoundingClientRect();
        ul.style.setProperty('--indicator-left', `${linkRect.left - ulRect.left}px`);
        ul.style.setProperty('--indicator-width', `${linkRect.width}px`);
    }, []);

    const handleNavHover = (e) => {
        updateIndicator(e.currentTarget);
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
            const params = {
                kategori: kategori,
                sortBy: sortByValue,
            };

            if (location.isConfirmed && location.lat && location.lng) {
                params.lat = location.lat;
                params.lng = location.lng;
            }

            const response = await api.get('/v1/landing-page/galon-gas', { params });
            const { data } = response.data;
            const dataArray = Array.isArray(data) ? data : [];

            const transformedData = dataArray.map((mitra) => ({
                id: mitra.id_mitra,
                name: mitra.nama_mitra,
                image: mitra.profil_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(mitra.nama_mitra)}&background=random&color=fff&size=300`,
                type: mitra.jenis_jasa,
                location: mitra.lokasi_layanan,
                distance: mitra.jarak_km ? `${mitra.jarak_km.toFixed(1)} KM` : 'Jarak Tidak Diketahui',
                isDalamJangkauan: mitra.is_dalam_jangkauan !== false,
                rating: mitra.rating,
                reviewCount: mitra.jumlah_ulasan,
                description: mitra.deskripsi || `${mitra.jenis_jasa === 'gas' ? 'Agen gas LPG' : mitra.jenis_jasa === 'galon' ? 'Agen air galon' : 'Agen Gas & Galon'} terpercaya. ${mitra.layanan?.length || 0} jenis layanan tersedia.`,
                price: (() => {
                    if (!mitra.layanan || mitra.layanan.length === 0) return 'Hubungi untuk info harga';
                    const prices = mitra.layanan.map(l => parseInt(l.harga_satuan)).filter(p => !isNaN(p) && p > 0);
                    return prices.length > 0 ? `Mulai dari Rp ${Math.min(...prices).toLocaleString('id-ID')}` : 'Hubungi untuk info harga';
                })(),
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

    useEffect(() => {
        const kategoriParam = selectedCategories.length > 0 ? selectedCategories : ['All'];
        fetchMitraData(kategoriParam, sortBy);
    }, [selectedCategories, sortBy, location.lat, location.lng]);

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
            sessionStorage.setItem('redirectAfterLogin', `/gas-galon/${mitra.id}/pesan`);
            if (onOrderClick) {
                onOrderClick(mitra);
            }
        } else {
            navigate(`/gas-galon/${mitra.id}/pesan`, { state: { jarak_km: mitra.distance ? parseFloat(mitra.distance) : 1 } });
        }
    };

    return (
        <div className="detail-mitra-gas-page">
            {/* TopNavBar */}
            <nav className="dmg-navbar">
                <div className="dmg-navbar-inner">
                    <div className="dmg-brand">
                        <Link to="/" className="dmg-brand-link">
                            KostHub<span className="dmg-brand-dot">.</span>
                        </Link>
                    </div>

                    <ul className="dmc-nav-links" ref={navLinksRef} onMouseLeave={handleNavLeave}>
                        <li className="dmc-nav-item">
                            <TransitionLink className="dmc-nav-link" to="/" onMouseEnter={handleNavHover} onClick={handleNavClick}>Home</TransitionLink>
                        </li>
                        <li className="dmc-nav-item">
                            <TransitionLink className="dmc-nav-link dmc-nav-link--active" to="/gas-galon" onMouseEnter={handleNavHover} onClick={handleNavClick} aria-current="page">Gas &amp; Galon</TransitionLink>
                        </li>
                        <li className="dmc-nav-item">
                            <TransitionLink className="dmc-nav-link" to="/laundry" onMouseEnter={handleNavHover} onClick={handleNavClick}>Laundry Express</TransitionLink>
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
                                        <button className="lp-profile-link" onClick={() => { navigate('/pesanan-saya'); setShowProfileMenu(false); }}>
                                            <span className="material-symbols-outlined">receipt_long</span> Pesanan Saya
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
                                Menampilkan mitra di dekat:{' '}
                                <span className="dmg-location-highlight">
                                    {location.isConfirmed ? location.address : 'Lokasi Belum Diatur'}
                                </span>
                            </h1>
                        </div>
                    </div>
                </section>

                <div className="dmg-main-layout">
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
                                            { key: 'Gas 5.5kg', label: 'Gas 5.5kg' },
                                            { key: 'Gas 12kg', label: 'Gas 12kg' },
                                            { key: 'Galon 19L', label: 'Galon 19L' },
                                            { key: 'Galon 15L', label: 'Galon 15L' },
                                            { key: 'Galon 5L', label: 'Galon 5L' },
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

                    <section className="dmg-card-list">
                        {mitraLoading ? (
                            <>
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="skeleton-card">
                                        <div className="skeleton-img-wrapper skeleton"></div>
                                        <div className="skeleton-content">
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <div className="skeleton-title skeleton"></div>
                                                    <div className="skeleton-badge skeleton"></div>
                                                </div>
                                                <div className="skeleton-rating skeleton"></div>
                                                <div className="skeleton-desc skeleton"></div>
                                            </div>
                                            <div className="skeleton-footer">
                                                <div className="skeleton-price skeleton"></div>
                                                <div className="skeleton-btn skeleton"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
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
                            <div className="dmg-empty-container" style={{ gridColumn: '1 / -1', padding: '5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
                                <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#3b82f6' }}>search_off</span>
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontSize: '1.5rem', fontWeight: '700', textAlign: 'center', letterSpacing: '-0.025em' }}>Mitra Tidak Ditemukan</h4>
                                <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '450px', margin: '0 auto 2rem', lineHeight: '1.6' }}>Maaf, kami tidak dapat menemukan mitra yang sesuai dengan filter pencarianmu. Coba sesuaikan filter untuk melihat hasil lainnya.</p>
                                <button 
                                    onClick={() => setSelectedCategories([])}
                                    style={{ padding: '0.875rem 1.5rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>restart_alt</span>
                                    Reset Filter
                                </button>
                            </div>
                        ) : (
                            <>
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
                                        <article key={mitra.id} className="dmg-card">
                                            <div className="dmg-card-body">
                                                <div className="dmg-card-img-wrapper">
                                                    <img 
                                                        className="dmg-card-img" 
                                                        src={mitra.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(mitra.name)}&background=random&color=fff&size=300`}
                                                        alt={mitra.name} 
                                                    />
                                                </div>
                                                <div className="dmg-card-content">
                                                    <div>
                                                        <div className="dmg-card-header">
                                                            <h3 className="dmg-card-title">{mitra.name}</h3>
                                                            <span 
                                                                className="dmg-card-badge"
                                                                style={!mitra.isDalamJangkauan ? { backgroundColor: '#fee2e2', color: '#ef4444' } : {}}
                                                            >
                                                                {mitra.isDalamJangkauan ? `Berada dalam jangkauan (${mitra.distance})` : `Di luar jangkauan (${mitra.distance})`}
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
                                                            className={`dmg-card-order-btn ${(!location.isConfirmed || !mitra.isDalamJangkauan) ? 'dmg-card-order-btn-disabled' : ''}`}
                                                            onClick={() => location.isConfirmed && mitra.isDalamJangkauan && handleOrderClick(mitra)}
                                                            disabled={!location.isConfirmed || !mitra.isDalamJangkauan}
                                                            style={{ opacity: (!location.isConfirmed || !mitra.isDalamJangkauan) ? 0.5 : 1, cursor: (!location.isConfirmed || !mitra.isDalamJangkauan) ? 'not-allowed' : 'pointer' }}
                                                        >
                                                            {!location.isConfirmed ? 'Atur Lokasi' : (!mitra.isDalamJangkauan ? 'Di Luar Jangkauan' : 'Pesan Sekarang')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="dmg-card-marquee">
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
                                            </div>
                                        </article>
                                    ))
                                ) : null}
                            </>
                        )}
                    </section>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default DetailMitraGas;
