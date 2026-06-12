import './DailyCleaningDetail.css';
import '../features/landing/LandingPage/LandingPage.css';
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation as useGlobalLocation } from '../context/LocationContext';
import { calculateDistance } from '../utils/distance';
import FullScreenLoader from '../components/FullScreenLoader/FullScreenLoader';
import Footer from '../components/Footer/Footer';

const DailyCleaningDetail = () => {
    const { id_mitra } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { location } = useGlobalLocation();
    const { user, isAuthenticated, logout } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [selectedLayananIds, setSelectedLayananIds] = useState(new Set()); // multi-select
    const [qtyLayanan, setQtyLayanan] = useState({});         // { id_layanan: qty }
    const [selectedAlat, setSelectedAlat] = useState(new Set());
    
    const [jarakOngkir, setJarakOngkir] = useState(state?.jarak_km ? parseFloat(state.jarak_km) : 1);
    const [tanggal, setTanggal] = useState('');
    const [jam, setJam] = useState('');
    const [catatan, setCatatan] = useState('');
    const [namaLengkap, setNamaLengkap] = useState('');
    const [noWa, setNoWa] = useState('');
    const [useProfileData, setUseProfileData] = useState(false);

    useEffect(() => {
        if (useProfileData && user) {
            setNamaLengkap(user.nama_lengkap || user.nama || '');
            setNoWa(user.nomor_telepon || user.no_telp || '');
        } else if (useProfileData && !user) {
            setUseProfileData(false);
        } else {
            setNamaLengkap('');
            setNoWa('');
        }
    }, [useProfileData, user]);

    // Estimate fee state
    const [estimate, setEstimate] = useState(null);
    const [estimateLoading, setEstimateLoading] = useState(false);
    const [estimateError, setEstimateError] = useState(null);

    // Submit state
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const navLinksRef = useRef(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

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

    const handleNavHover = (e) => updateIndicator(e.currentTarget);
    const handleNavLeave = () => {
        const ul = navLinksRef.current;
        if (!ul) return;
        const activeLink = ul.querySelector('.lp-nav-link--active');
        if (activeLink) updateIndicator(activeLink);
    };
    const handleNavClick = () => {
        const ul = navLinksRef.current;
        if (!ul) return;
        const left = ul.style.getPropertyValue('--indicator-left');
        const width = ul.style.getPropertyValue('--indicator-width');
        if (left && width) sessionStorage.setItem('nav-indicator', JSON.stringify({ left, width }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/v1/landing-page/daily-cleaning/detail-pesanan', {
                    params: { id_mitra, type_layanan: 'daily_cleaning' }
                });
                const resData = response.data.data;
                setData(resData);
                if (resData?.layanan?.length > 0) {
                    const first = resData.layanan[0];
                    const firstId = String(first.id_layanan);
                    setSelectedLayananIds(new Set([firstId]));
                    setQtyLayanan({ [firstId]: 1 });
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Terjadi kesalahan saat memuat data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id_mitra]);

    useEffect(() => {
        if (data && location?.isConfirmed && data.latitude && data.longitude) {
            const dist = calculateDistance(location.lat, location.lng, parseFloat(data.latitude), parseFloat(data.longitude));
            if (!isNaN(dist)) setJarakOngkir(dist);
        }
    }, [data, location]);

    useEffect(() => {
        if (!data) return;

        if (selectedLayananIds.size === 0) {
            setEstimate(null);
            setEstimateLoading(false);
            return;
        }

        const layananPayload = [...selectedLayananIds].map(id => ({
            idLayanan: String(id),
            qty: qtyLayanan[String(id)] || 1,
        }));

        const biayaTambahanAlat = {};
        if (data.alat_pembersih_tambahan) {
            Object.entries(data.alat_pembersih_tambahan).forEach(([nama, detail]) => {
                const harga = typeof detail === 'object' ? detail.harga : detail;
                if (selectedAlat.has(nama)) biayaTambahanAlat[nama] = harga;
            });
        }

        setEstimateLoading(true);
        const timer = setTimeout(async () => {
            setEstimateError(null);
            try {
                const res = await api.post('/v1/landing-page/generate-fee-pesanan', {
                    idMitra: String(id_mitra),
                    typeLayanan: 'daily_cleaning',
                    items: layananPayload,
                    jarakOngkir,
                    ...(Object.keys(biayaTambahanAlat).length > 0 && { biayaTambahanAlat }),
                });
                setEstimate(res.data.data);
            } catch (err) {
                setEstimateError(err.response?.data?.message || 'Gagal menghitung estimasi');
            } finally {
                setEstimateLoading(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [data, selectedLayananIds, qtyLayanan, selectedAlat, jarakOngkir, id_mitra]);

    if (loading) {
        return (
            <FullScreenLoader 
                messages={[
                    "Mempersiapkan halaman pemesanan...",
                    "Menyiapkan preferensi...",
                    "Menghitung ketersediaan jadwal..."
                ]} 
            />
        );
    }

    if (error || !data) {
        return (
            <div className="dp-fallback">
                <div className="dp-fallback-card">
                    <span className="material-symbols-outlined dp-fallback-icon" style={{fontVariationSettings: "'FILL' 1"}}>
                        error
                    </span>
                    <h2 className="dp-fallback-title">
                        Terjadi Kesalahan
                    </h2>
                    <p className="dp-fallback-text">
                        {error || 'Data pesanan tidak ditemukan.'}
                    </p>
                    <button onClick={() => window.location.reload()} className="dp-btn-primary">
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    const ringkasan = estimate?.ringkasan ?? null;

    const biayaAlat = data?.alat_pembersih_tambahan
        ? Object.entries(data.alat_pembersih_tambahan)
            .filter(([nama]) => selectedAlat.has(nama))
            .reduce((sum, [, detail]) => sum + (typeof detail === 'object' ? detail.harga : detail), 0)
        : 0;

    const handleSubmit = async () => {
        if (!estimate || !isAuthenticated) {
            if (!isAuthenticated) navigate('/login');
            return;
        }

        if (!useProfileData && (!namaLengkap.trim() || !noWa.trim())) {
            setSubmitError('Nama Lengkap dan Nomor WhatsApp pengirim wajib diisi.');
            return;
        }

        const biayaTambahanAlat = {};
        if (data.alat_pembersih_tambahan) {
            Object.entries(data.alat_pembersih_tambahan).forEach(([nama, detail]) => {
                const harga = typeof detail === 'object' ? detail.harga : detail;
                if (selectedAlat.has(nama)) biayaTambahanAlat[nama] = harga;
            });
        }

        const items = [...selectedLayananIds].map(id => ({
            idLayanan: String(id),
            qty: qtyLayanan[String(id)] || 1,
        }));

        const jadwal_layanan = [
            { jam: jam || null, tanggal: tanggal || null }
        ];

        const subtotal = estimate?.detail_layanan?.reduce(
            (sum, item) => sum + (item.subtotal || 0), 0
        ) || 0;

        const estimasiPayload = {
            subtotal,
            biaya_ongkir: 0,
            biaya_transportasi: estimate?.ringkasan?.biaya_transportasi ?? 0,
            biaya_tambahan_alat: estimate?.ringkasan?.biaya_tambahan_alat ?? 0,
            total_pembayaran: estimate?.ringkasan?.total_pembayaran ?? 0,
            beli_baru: 0,
        };

        setSubmitLoading(true);
        setSubmitError(null);
        try {
            const res = await api.post('/v1/landing-page/pesanan/', {
                idMitra: String(data.id_mitra),
                typeLayanan: 'daily_cleaning',
                items,
                jarakOngkir,
                jadwal_layanan,
                ...(Object.keys(biayaTambahanAlat).length > 0 && { biayaTambahan: biayaTambahanAlat }),
                estimasi: estimasiPayload,
                catatanPengiriman: catatan || null,
                namaPengirim:      !useProfileData ? namaLengkap : null,
                nomorWhatsAppPengirim: !useProfileData ? noWa : null,
            });
            sessionStorage.setItem('checkoutContact', JSON.stringify({ nama: namaLengkap, phone: noWa }));
            navigate(`/checkout/${res.data.data.id_unique_pesanan}`);
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Gagal membuat pesanan. Silakan coba lagi.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="dp-page">
                        <nav className="lp-navbar">
                <div className="lp-container lp-navbar-inner">
                    <div className="lp-brand">
                        <Link to="/" className="lp-brand-link">KostHub<span className="lp-brand-dot">.</span></Link>
                    </div>
                    <ul className="lp-nav-links" ref={navLinksRef} onMouseLeave={handleNavLeave}>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/' === '/daily-cleaning' ? 'lp-nav-link--active' : ''}`} to="/" onMouseEnter={handleNavHover} onClick={handleNavClick}>Home</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/gas-galon' === '/daily-cleaning' ? 'lp-nav-link--active' : ''}`} to="/gas-galon" onMouseEnter={handleNavHover} onClick={handleNavClick}>Gas &amp; Galon</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/laundry' === '/daily-cleaning' ? 'lp-nav-link--active' : ''}`} to="/laundry" onMouseEnter={handleNavHover} onClick={handleNavClick}>Laundry Express</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/daily-cleaning' === '/daily-cleaning' ? 'lp-nav-link--active' : ''}`} to="/daily-cleaning" onMouseEnter={handleNavHover} onClick={handleNavClick}>Daily Cleaning</Link></li>
                        <li className="lp-nav-item"><Link className="lp-nav-link" to="/tentang-kami" onMouseEnter={handleNavHover} onClick={handleNavClick}>Tentang Kami</Link></li>
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

            <div className="dp-stepper">
                <div className="dp-stepper-inner">
                    <div className="dp-step dp-step-completed">
                        <span className="material-symbols-outlined dp-step-icon">check_circle</span>
                        <span>Pilih Mitra</span>
                    </div>
                    <div className="dp-step-line"></div>
                    <div className="dp-step dp-step-current">
                        <div className="dp-step-number">2</div>
                        <span>Detail Pesanan</span>
                    </div>
                    <div className="dp-step-line"></div>
                    <div className="dp-step dp-step-upcoming">
                        <div className="dp-step-number">3</div>
                        <span>Pembayaran</span>
                    </div>
                </div>
            </div>

            <main className="dp-main">
                <div className="dp-header">
                    <h1 className="dp-title">Konfigurasi Pesanan Daily Cleaning</h1>
                    <p className="dp-subtitle">Mitra: <span className="dp-subtitle-bold">{data.nama_mitra}</span></p>
                </div>

                <div className="dp-content-left">
                    <section className="dp-section">
                        <div className="dp-section-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>timer</span>
                            <h2 className="dp-section-title">Pilih Paket Durasi</h2>
                        </div>
                        <p className="dp-section-desc" style={{marginBottom: 0}}>Pilih satu atau lebih paket durasi sesuai kebutuhan</p>
                        <div className="dp-grid-3">
                            {data.layanan.map((layanan) => {
                                const sid = String(layanan.id_layanan);
                                const isChecked = selectedLayananIds.has(sid);
                                const qty = qtyLayanan[sid] || 1;
                                return (
                                    <label key={layanan.id_layanan} className={`dp-card-radio ${isChecked ? 'checked' : ''}`}>
                                        <input
                                            className="dp-card-radio-input"
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                                const sid = String(layanan.id_layanan);
                                                setSelectedLayananIds(prev => {
                                                    const next = new Set(prev);
                                                    if (next.has(sid)) {
                                                        next.delete(sid);
                                                        // Bug 4: hapus qty saat uncheck supaya tidak stale
                                                        setQtyLayanan(q => {
                                                            const copy = { ...q };
                                                            delete copy[sid];
                                                            return copy;
                                                        });
                                                    } else {
                                                        next.add(sid);
                                                        // Bug 6: key pakai String
                                                        setQtyLayanan(q => ({ ...q, [sid]: q[sid] || 1 }));
                                                    }
                                                    return next;
                                                });
                                            }}
                                        />
                                        <div className="dp-card-radio-content">
                                            <div className="dp-card-title">{layanan.nama_layanan}</div>
                                            <div className="dp-card-price">Rp {parseInt(layanan.harga_layanan).toLocaleString('id-ID')} / {layanan.satuan || 'jam'}</div>
                                            {isChecked && (
                                                <>
                                                    <div className="dp-qty-row" onClick={e => e.preventDefault()}>
                                                        <span className="dp-qty-label">Durasi (jam):</span>
                                                        <div className="dp-qty-stepper">
                                                            <button
                                                                className="dp-qty-btn"
                                                                onClick={e => { e.preventDefault(); setQtyLayanan(prev => ({ ...prev, [String(layanan.id_layanan)]: Math.max(1, (prev[String(layanan.id_layanan)] || 1) - 1) })); }}
                                                            >−</button>
                                                            <span className="dp-qty-value">{qty}</span>
                                                            <button
                                                                className="dp-qty-btn"
                                                                onClick={e => { e.preventDefault(); setQtyLayanan(prev => ({ ...prev, [String(layanan.id_layanan)]: (prev[String(layanan.id_layanan)] || 1) + 1 })); }}
                                                            >+</button>
                                                        </div>
                                                    </div>
                                                    <div className="dp-card-check">
                                                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </section>

                    <section className="dp-section">
                        <div className="dp-section-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>cleaning_services</span>
                            <h2 className="dp-section-title">Alat Pembersih Tambahan</h2>
                        </div>
                        <div className="dp-alat-grid">
                            {data?.alat_pembersih_tambahan && Object.entries(data.alat_pembersih_tambahan).map(([nama, detail]) => {
                                const isChecked = selectedAlat.has(nama);
                                const harga = typeof detail === 'object' ? detail.harga : detail;
                                const stok = typeof detail === 'object' ? detail.stok : null;
                                const outOfStock = stok !== null && stok <= 0;

                                return (
                                    <label key={nama} className={`dp-alat-item ${isChecked ? 'dp-alat-item--selected' : ''} ${outOfStock ? 'dp-alat-item--disabled' : ''}`}>
                                        <input
                                            className="dp-alat-input"
                                            type="checkbox"
                                            checked={isChecked}
                                            disabled={outOfStock}
                                            onChange={() => {
                                                if (outOfStock) return;
                                                setSelectedAlat(prev => {
                                                    const next = new Set(prev);
                                                    next.has(nama) ? next.delete(nama) : next.add(nama);
                                                    return next;
                                                });
                                            }}
                                        />
                                        <span className="material-symbols-outlined dp-alat-icon" style={{fontVariationSettings: "'FILL' 1"}}>
                                            cleaning_services
                                        </span>
                                        <div className="dp-alat-info">
                                            <div className="dp-alat-name">{nama}</div>
                                            <div className="dp-alat-price">+ Rp {harga.toLocaleString('id-ID')}</div>
                                            {stok !== null && (
                                                <div className="dp-alat-stock" style={{fontSize: '0.75rem', color: outOfStock ? 'var(--dp-error)' : 'var(--dp-on-surface-variant)', marginTop: '2px'}}>
                                                    {outOfStock ? 'Stok Habis' : `Sisa Stok: ${stok}`}
                                                </div>
                                            )}
                                        </div>
                                        {isChecked && (
                                            <span className="material-symbols-outlined dp-alat-check" style={{fontVariationSettings: "'FILL' 1"}}>
                                                check_circle
                                            </span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                        {selectedAlat.size > 0 && (
                            <div className="dp-alat-summary">
                                <span className="dp-alat-summary-label">{selectedAlat.size} alat dipilih</span>
                                <span className="dp-alat-summary-value">+ Rp {biayaAlat.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                    </section>

                    <section className="dp-section">
                        <div className="dp-section-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>event</span>
                            <h2 className="dp-section-title">Pilih Tanggal &amp; Jam Pembersihan</h2>
                        </div>
                        <div className="dp-grid-2">
                            <div className="dp-form-group">
                                <label className="dp-form-label">Tanggal</label>
                                <input
                                    className="dp-input"
                                    type="date"
                                    value={tanggal}
                                    onChange={(e) => setTanggal(e.target.value)}
                                />
                            </div>
                            <div className="dp-form-group">
                                <label className="dp-form-label">Pilih Jam</label>
                                <div className="dp-time-grid">
                                    {(data?.jadwal_pembersihan || []).map((time) => {
                                        const isSelected = jam === time;
                                        return (
                                            <button
                                                key={time}
                                                className={`dp-time-btn ${isSelected ? 'active' : ''}`}
                                                onClick={() => setJam(time)}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="dp-section">
                        <div className="dp-section-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
                            <h2 className="dp-section-title">Detail Pengiriman</h2>
                        </div>
                        
                        {user && (
                            <div
                                className={`dp-profile-toggle-card ${useProfileData ? 'active' : ''}`}
                                onClick={() => setUseProfileData(!useProfileData)}
                            >
                                <div className="dp-profile-toggle-icon">
                                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>
                                        {useProfileData ? 'check_circle' : 'person'}
                                    </span>
                                </div>
                                <div className="dp-profile-toggle-content">
                                    <span className="dp-profile-toggle-title">Gunakan Data Profil Saya</span>
                                    <span className="dp-profile-toggle-desc">Isi otomatis nama dan nomor telepon Anda</span>
                                </div>
                                <div className="dp-profile-toggle-switch">
                                    <div className="dp-switch-knob"></div>
                                </div>
                            </div>
                        )}

                        <div className="dp-form-group-flex">
                            <div>
                                <label className="dp-form-label">Nama Lengkap</label>
                                <input
                                    className="dp-input"
                                    placeholder="Masukkan nama Anda"
                                    type="text"
                                    value={namaLengkap}
                                    onChange={(e) => setNamaLengkap(e.target.value)}
                                    disabled={useProfileData}
                                />
                            </div>
                            <div>
                                <label className="dp-form-label">Nomor WhatsApp</label>
                                <input
                                    className="dp-input"
                                    placeholder="08xxxxxxxxxx"
                                    type="tel"
                                    value={noWa}
                                    onChange={(e) => setNoWa(e.target.value)}
                                    disabled={useProfileData}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="dp-section">
                        <div className="dp-section-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>note_alt</span>
                            <h2 className="dp-section-title">Catatan untuk Mitra (Opsional)</h2>
                        </div>
                        <div className="dp-form-group">
                            <textarea
                                className="dp-textarea"
                                placeholder="Contoh: Tolong fokus bersihkan area kamar mandi..."
                                value={catatan}
                                maxLength={200}
                                onChange={(e) => setCatatan(e.target.value)}
                            ></textarea>
                            <div style={{fontSize: '12px', textAlign: 'right', color: 'var(--dp-on-surface-variant)', marginTop: '4px'}}>
                                {catatan.length}/200
                            </div>
                        </div>
                    </section>
                </div>

                <div className="dp-content-right">
                    <div className="dp-summary-sticky">
                        <div className="dp-summary-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>receipt_long</span>
                            <h2 className="dp-summary-title">Ringkasan Pembayaran</h2>
                        </div>
                        {estimateLoading ? (
                            <div className="dp-summary-loading">
                                <span className="material-symbols-outlined dp-summary-loading-icon">hourglass_empty</span>
                                <span>Menghitung estimasi...</span>
                            </div>
                        ) : estimateError ? (
                            <div className="dp-summary-error">
                                <span className="material-symbols-outlined">error</span>
                                <span>{estimateError}</span>
                            </div>
                        ) : (
                            <div className="dp-summary-list">
                                {estimate?.detail_layanan?.map((item, i) => (
                                    <div key={item.id_layanan ?? i} className="dp-summary-item">
                                        <span className="dp-summary-item-label">{item.nama_layanan} ({item.qty} {item.satuan})</span>
                                        <span className="dp-summary-item-value">Rp {(item.subtotal ?? 0).toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                                    {(ringkasan?.biaya_tambahan_alat ?? 0) > 0 && (
                                        <div className="dp-summary-item">
                                            <span className="dp-summary-item-label">Biaya Tambahan Alat</span>
                                            <span className="dp-summary-item-value">Rp {ringkasan.biaya_tambahan_alat.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                <div className="dp-summary-item">
                                    <span className="dp-summary-item-label">Biaya Transportasi</span>
                                    <span className="dp-summary-item-value">
                                        {ringkasan ? `Rp ${ringkasan.biaya_transportasi.toLocaleString('id-ID')}` : '-'}
                                    </span>
                                </div>
                                <div className="dp-summary-item">
                                    <span className="dp-summary-item-label">Biaya Layanan Aplikasi</span>
                                    <span className="dp-summary-item-value">
                                        {ringkasan ? `Rp ${ringkasan.biaya_layanan_aplikasi.toLocaleString('id-ID')}` : '-'}
                                    </span>
                                </div>
                                <div className="dp-summary-total">
                                    <span className="dp-summary-total-label">Total Pembayaran</span>
                                    <span className="dp-summary-total-value">
                                        {ringkasan ? `Rp ${ringkasan.total_pembayaran.toLocaleString('id-ID')}` : 'Rp -'}
                                    </span>
                                </div>
                            </div>
                        )}
                        {submitError && (
                            <div className="dp-summary-error" >
                                <span className="material-symbols-outlined">error</span>
                                <span>{submitError}</span>
                            </div>
                        )}
                        <div className="dp-info-box">
                            <span className="material-symbols-outlined dp-info-icon">info</span>
                            <p className="dp-info-text">
                                Transaksi Anda dilindungi oleh Sistem Escrow KostHub. Dana akan diteruskan ke mitra hanya setelah layanan selesai sesuai pesanan Anda.
                            </p>
                        </div>
                        <button
                            className="dp-btn-primary"
                            disabled={!ringkasan || submitLoading || selectedLayananIds.size === 0}
                            onClick={handleSubmit}
                        >
                            {submitLoading ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
                            {!submitLoading && <span className="material-symbols-outlined">arrow_forward</span>}
                        </button>
                    </div>
                </div>
            </main>

                        <Footer />
        </div>
    );
};
export default DailyCleaningDetail;
