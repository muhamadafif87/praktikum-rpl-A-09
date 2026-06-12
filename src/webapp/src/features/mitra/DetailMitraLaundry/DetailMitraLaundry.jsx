import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DetailMitraLaundry.css';
import '../../landing/LandingPage/LandingPage.css';
import '../skeleton.css';
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
    }, [selectedCategories, sortBy, location.lat, location.lng]);

    const handleOrderClick = (mitra) => {
        const token = localStorage.getItem('token');
        if (!token) {
            sessionStorage.setItem('redirectAfterLogin', `/laundry/${mitra.id}/pesan`);
            if (onOrderClick) {
                onOrderClick(mitra);
            }
        } else {
            navigate(`/laundry/${mitra.id}/pesan`, { state: { jarak_km: mitra.distance ? parseFloat(mitra.distance) : 1 } });
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
                    image: mitra.profil_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(mitra.nama_mitra)}&background=random&color=fff&size=300`,
                    type: mitra.jenis_jasa,
                    location: mitra.lokasi_layanan,
                    distance: mitra.jarak_km ? `${mitra.jarak_km.toFixed(1)} KM` : 'Jarak Tidak Diketahui',
                    isDalamJangkauan: mitra.is_dalam_jangkauan !== false,
                    rating: mitra.rating,
                    reviewCount: mitra.jumlah_ulasan,
                    description: mitra.deskripsi || `${mitra.jenis_jasa} terpercaya. ${mitra.layanan?.length || 0} jenis layanan tersedia.`,
                    price: (() => {
                        if (!mitra.layanan || mitra.layanan.length === 0) return 'Hubungi untuk info harga';
                        const prices = mitra.layanan.map(l => parseInt(l.harga_satuan)).filter(p => !isNaN(p) && p > 0);
                        return prices.length > 0 ? `Mulai dari Rp ${Math.min(...prices).toLocaleString('id-ID')}` : 'Hubungi untuk info harga';
                    })(),
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

    return (
        <div className="detail-mitra-cleaning-page">
            <nav className="dm-navbar">
                <div className="dm-navbar-inner">
                    <div className="dm-brand">
                        <Link to="/" className="dm-brand-link">
                            KostHub<span className="dm-brand-dot">.</span>
                        </Link>
                    </div>

                    <ul className="dm-nav-links" ref={navLinksRef} onMouseLeave={handleNavLeave}>
                        <li className="dm-nav-item">
                            <TransitionLink className="dm-nav-link" to="/" onMouseEnter={handleNavHover} onClick={handleNavClick}>Home</TransitionLink>
                        </li>
                        <li className="dm-nav-item">
                            <TransitionLink className="dm-nav-link" to="/gas-galon" onMouseEnter={handleNavHover} onClick={handleNavClick}>Gas &amp; Galon</TransitionLink>
                        </li>
                        <li className="dm-nav-item">
                            <TransitionLink className="dm-nav-link dmc-nav-link--active" to="/laundry" onMouseEnter={handleNavHover} onClick={handleNavClick} aria-current="page">Laundry Express</TransitionLink>
                        </li>
                        <li className="dm-nav-item">
                            <TransitionLink className="dm-nav-link" to="/daily-cleaning" onMouseEnter={handleNavHover} onClick={handleNavClick}>Daily Cleaning</TransitionLink>
                        </li>
                        <li className="dm-nav-item">
                            <TransitionLink className="dm-nav-link" to="/tentang-kami" onMouseEnter={handleNavHover} onClick={handleNavClick}>Tentang Kami</TransitionLink>
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
                                Menampilkan mitra di dekat:{' '}
                                <span className="dm-location-highlight">
                                    {location.isConfirmed ? location.address : 'Lokasi Belum Diatur'}
                                </span>
                            </h1>
                        </div>
                    </div>
                </section>

                <div className="dm-main-layout">
                    <aside className="dm-sidebar">
                        <div className="dm-sidebar-inner">
                            <div className="dm-filter-header">
                                <h2 className="dm-filter-title">Filter</h2>
                                <button className="dm-filter-reset" onClick={() => setSelectedCategories([])}>
                                    Reset
                                </button>
                            </div>

                            <div>
                                <div className="dm-filter-group">
                                    <label className="dm-filter-label">Kategori</label>
                                    <div className="dm-filter-options">
                                        {[
                                            { key: 'Laundry Kiloan Reguler', label: 'Kiloan Reguler' },
                                            { key: 'Laundry Kiloan Express', label: 'Kiloan Express' },
                                            { key: 'Kemeja', label: 'Satuan' },
                                            { key: 'All', label: 'Semuanya' },
                                        ].map((cat) => (
                                            <label key={cat.key} className="dm-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    className="dm-checkbox-input"
                                                    checked={selectedCategories.includes(cat.key)}
                                                    onChange={() => handleCategoryChange(cat.key)}
                                                />
                                                <span className="dm-checkbox-text">{cat.label}</span>
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

                    <section className="dm-card-list">
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
                            <div className="dm-error-container">
                                <span className="material-symbols-outlined">error_outline</span>
                                <p>{mitraError}</p>
                                <button
                                    onClick={() => fetchMitraData()}
                                    className="dm-retry-btn"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        ) : mitraList.length === 0 ? (
                            <div className="dm-empty-container" style={{ gridColumn: '1 / -1', padding: '5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
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
                                    <div className="dm-empty-container" style={{ gridColumn: '1 / -1', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#9ca3af' }}>location_off</span>
                                        <h4 style={{ margin: '1rem 0 0.5rem', color: '#1f2937', fontSize: '1.25rem', fontWeight: '600', textAlign: 'center' }}>Lokasi Pengiriman Belum Diatur</h4>
                                        <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '400px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>Silakan atur lokasi pengiriman terlebih dahulu di Beranda untuk melihat daftar mitra yang menjangkau areamu.</p>
                                        <button 
                                            onClick={() => navigate('/')}
                                            style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background-color 0.2s' }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>home</span>
                                            Kembali ke Beranda
                                        </button>
                                    </div>
                                ) : mitraList.map((mitra) => (
                                    <article 
                                        key={mitra.id} 
                                        className={`dm-card ${(location.isConfirmed && mitra.isDalamJangkauan) ? 'dm-card-clickable' : ''}`}
                                        onClick={() => location.isConfirmed && mitra.isDalamJangkauan && handleOrderClick(mitra)}
                                        style={{ cursor: (location.isConfirmed && mitra.isDalamJangkauan) ? 'pointer' : 'default' }}
                                    >
                                        <div className="dm-card-body">
                                            <div className="dm-card-img-wrapper">
                                                <img className="dm-card-img" src={mitra.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(mitra.name)}&background=random&color=fff&size=300`} alt={mitra.name} />
                                            </div>
                                            <div className="dm-card-content">
                                                <div>
                                                    <div className="dm-card-header">
                                                        <h3 className="dm-card-title">{mitra.name}</h3>
                                                        <span 
                                                            className="dm-card-badge"
                                                            style={!mitra.isDalamJangkauan ? { backgroundColor: '#fee2e2', color: '#ef4444' } : {}}
                                                        >
                                                            {mitra.isDalamJangkauan ? `Berada dalam jangkauan (${mitra.distance})` : `Di luar jangkauan (${mitra.distance})`}
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
                                                        className={`dmc-card-order-btn ${(!location.isConfirmed || !mitra.isDalamJangkauan) ? 'dmc-card-order-btn-disabled' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (location.isConfirmed && mitra.isDalamJangkauan) handleOrderClick(mitra);
                                                        }}
                                                        disabled={!location.isConfirmed || !mitra.isDalamJangkauan}
                                                        style={{ opacity: (!location.isConfirmed || !mitra.isDalamJangkauan) ? 0.5 : 1, cursor: (!location.isConfirmed || !mitra.isDalamJangkauan) ? 'not-allowed' : 'pointer' }}
                                                    >
                                                        {!location.isConfirmed ? 'Atur Lokasi' : (!mitra.isDalamJangkauan ? 'Di Luar Jangkauan' : 'Pesan Sekarang')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="dm-card-marquee">
                                            {mitra.reviews.length > 0 && (
                                                <div className="dm-marquee-section">
                                                    <div className="dm-marquee-container">
                                                        <div className="dm-marquee-content" style={{ animationDuration: mitra.marqueeSpeed }}>
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
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </>
                        )}
                    </section>
                </div>
            </main>

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
                    <p className="dm-footer-copy">© 2024 KostHub. Seluruh hak cipta dilindungi.</p>
                </div>
            </footer>
        </div>
    );
};

export default DetailMitraLaundry;
