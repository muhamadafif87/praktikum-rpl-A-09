import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation as useGlobalLocation } from '../context/LocationContext';
import { calculateDistance } from '../utils/distance';
import FullScreenLoader from '../components/FullScreenLoader/FullScreenLoader';
import './LaundryDetail.css';
import '../features/landing/LandingPage/LandingPage.css';

const LaundryDetail = () => {
    const { id_mitra } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { location } = useGlobalLocation();
    const { user, isAuthenticated, logout } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [selectedKiloanIds, setSelectedKiloanIds] = useState(new Set());
    const [kiloanQty, setKiloanQty] = useState(1);
    
    const [satuanQtyMap, setSatuanQtyMap] = useState({});
    
    const [selectedJenisKain, setSelectedJenisKain] = useState([]);

    const [selectedJadwal, setSelectedJadwal] = useState(null);
    const [catatan, setCatatan] = useState('');
    const [jarakOngkir, setJarakOngkir] = useState(state?.jarak_km ? parseFloat(state.jarak_km) : 1);
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

    // Fee estimate state
    const [feeEstimate, setFeeEstimate] = useState(null);
    const [feeLoading, setFeeLoading] = useState(false);
    const [feeError, setFeeError] = useState(null);
    const debounceRef = useRef(null);

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
                const response = await api.get('/v1/landing-page/laundry-express/detail-pesanan', {
                    params: { id_mitra, type_layanan: 'laundry' }
                });
                const resData = response.data.data;
                setData(resData);

                if (resData?.layanan && resData.layanan.length > 0) {
                    const kiloan = resData.layanan.find(l => l.satuan === 'kg');
                    if (kiloan) setSelectedKiloanIds(new Set([kiloan.id_layanan]));
                }

                if (resData?.jadwal_penjemputan?.length > 0) {
                    setSelectedJadwal(resData.jadwal_penjemputan[0]);
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

        const items = [];
        if (selectedKiloanIds.size > 0 && kiloanQty > 0) {
            [...selectedKiloanIds].forEach(id => {
                items.push({ idLayanan: String(id), qty: Number(kiloanQty) });
            });
        }
        Object.entries(satuanQtyMap).forEach(([id, qty]) => {
            if (qty > 0) {
                items.push({ idLayanan: String(id), qty: Number(qty) });
            }
        });

        if (items.length === 0) {
            setFeeEstimate(null);
            setFeeLoading(false);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        setFeeLoading(true);
        debounceRef.current = setTimeout(async () => {
            setFeeError(null);
            try {
                const requestBody = {
                    idMitra: String(data.id_mitra),
                    typeLayanan: 'laundry',
                    items,
                    jarakOngkir: Number(jarakOngkir),
                    biayaTambahan: { durasi_pengerjaan: { biaya: 0, type: 'reguler' } }
                };

                const response = await api.post('/v1/landing-page/generate-fee-pesanan', requestBody);

                if (response.data.success && response.data.data) {
                    setFeeEstimate({
                        type_layanan: response.data.data.type_layanan,
                        detail_layanan: response.data.data.detail_layanan,
                        ringkasan: response.data.data.ringkasan,
                        subtotal: response.data.data.ringkasan.subtotal,
                        biaya_ongkir: response.data.data.ringkasan.biaya_ongkir,
                        biaya_tambahan: response.data.data.ringkasan.biaya_tambahan_durasi || 0,
                        biaya_layanan: response.data.data.ringkasan.biaya_layanan_aplikasi,
                        total_pembayaran: response.data.data.ringkasan.total_pembayaran
                    });
                } else {
                    throw new Error(response.data.message || 'Gagal menghitung estimasi');
                }
            } catch (err) {
                setFeeError(err.response?.data?.message || err.message || 'Gagal menghitung estimasi biaya');
                setFeeEstimate(null);
            } finally {
                setFeeLoading(false);
            }
        }, 500);

    }, [data, selectedKiloanIds, kiloanQty, satuanQtyMap, jarakOngkir]);

    const fmt = (val) => (parseInt(val) || 0).toLocaleString('id-ID');

    if (loading) {
        return (
            <FullScreenLoader 
                messages={[
                    "Mempersiapkan halaman pemesanan...",
                    "Mengambil layanan mitra...",
                    "Menyiapkan preferensi..."
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

    const handleSubmit = async () => {
        if (!feeEstimate || !isAuthenticated) {
            if (!isAuthenticated) navigate('/login');
            return;
        }

        const items = [];
        if (selectedKiloanIds.size > 0 && kiloanQty > 0) {
            [...selectedKiloanIds].forEach(id => {
                items.push({ idLayanan: String(id), qty: Number(kiloanQty) });
            });
        }
        Object.entries(satuanQtyMap).forEach(([id, qty]) => {
            if (qty > 0) items.push({ idLayanan: String(id), qty: Number(qty) });
        });

        if (items.length === 0) {
            setSubmitError('Pilih setidaknya satu layanan');
            return;
        }

        const jadwal_layanan = [{ jam: selectedJadwal || null, tanggal: null }];

        const subtotal = feeEstimate?.ringkasan?.subtotal ?? 0;

        const estimasiPayload = {
            subtotal,
            biaya_ongkir:           feeEstimate?.ringkasan?.biaya_ongkir ?? 0,
            biaya_tambahan_durasi:  feeEstimate?.ringkasan?.biaya_tambahan_durasi ?? 0,
            total_pembayaran:       feeEstimate?.ringkasan?.total_pembayaran ?? 0,
            beli_baru:              0,
        };

        const finalCatatan = selectedJenisKain.length > 0 
            ? `[Jenis Kain: ${selectedJenisKain.join(', ')}] ${catatan}` 
            : catatan;

        setSubmitLoading(true);
        setSubmitError(null);
        try {
            const res = await api.post('/v1/landing-page/pesanan/', {
                idMitra: String(data.id_mitra),
                typeLayanan: 'laundry',
                items,
                jarakOngkir,
                jadwal_layanan,
                biayaTambahan: { durasi_pengerjaan: { biaya: 0, type: 'reguler' } },
                estimasi: estimasiPayload,
                catatanPengiriman: finalCatatan || null,
            });
            sessionStorage.setItem('checkoutContact', JSON.stringify({ nama: namaLengkap, phone: noWa }));
            navigate(`/checkout/${res.data.data.id_unique_pesanan}`);
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Gagal membuat pesanan. Silakan coba lagi.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const layananKiloan = data.layanan.filter(l => l.satuan === 'kg');
    const layananSatuan = data.layanan.filter(l => l.satuan === 'pcs');

    const toggleJenisKain = (kain) => {
        setSelectedJenisKain(prev => 
            prev.includes(kain) ? prev.filter(k => k !== kain) : [...prev, kain]
        );
    };

    const updateSatuanQty = (id, delta) => {
        setSatuanQtyMap(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            return { ...prev, [id]: next };
        });
    };

    return (
        <div className="dp-page">
            <nav className="lp-navbar">
                <div className="lp-container lp-navbar-inner">
                    <div className="lp-brand">
                        <Link to="/" className="lp-brand-link">KostHub<span className="lp-brand-dot">.</span></Link>
                    </div>
                    <ul className="lp-nav-links" ref={navLinksRef} onMouseLeave={handleNavLeave}>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/' === '/laundry' ? 'lp-nav-link--active' : ''}`} to="/" onMouseEnter={handleNavHover} onClick={handleNavClick}>Home</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/gas-galon' === '/laundry' ? 'lp-nav-link--active' : ''}`} to="/gas-galon" onMouseEnter={handleNavHover} onClick={handleNavClick}>Gas &amp; Galon</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/laundry' === '/laundry' ? 'lp-nav-link--active' : ''}`} to="/laundry" onMouseEnter={handleNavHover} onClick={handleNavClick}>Laundry Express</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/daily-cleaning' === '/laundry' ? 'lp-nav-link--active' : ''}`} to="/daily-cleaning" onMouseEnter={handleNavHover} onClick={handleNavClick}>Daily Cleaning</Link></li>
                        <li className="lp-nav-item"><Link className="lp-nav-link" to="/tentang-kami" onMouseEnter={handleNavHover} onClick={handleNavClick}>Tentang Kami</Link></li>
                    </ul>
                    <div className="lp-nav-actions">
                        {isAuthenticated ? (
                            <div className="lp-profile-menu">
                                <button className="lp-profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
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
                    <h1 className="dp-title">Konfigurasi Pesanan Laundry</h1>
                    <p className="dp-subtitle">Mitra: <span className="dp-subtitle-bold">{data.nama_mitra}</span></p>
                </div>

                <div className="dp-content-left">
                    
                    {layananKiloan.length > 0 && (
                        <section className="dp-section">
                            <div className="dp-section-header">
                                <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>local_laundry_service</span>
                                <h2 className="dp-section-title">Layanan Kiloan</h2>
                            </div>
                            <div className="dp-grid-2 mb-2">
                                {layananKiloan.map((layanan) => {
                                    const isChecked = selectedKiloanIds.has(layanan.id_layanan);
                                    return (
                                        <label key={layanan.id_layanan} className={`dp-card-radio ${isChecked ? 'active' : ''}`}>
                                            <input
                                                className="dp-card-radio-input"
                                                name="layanan-kiloan"
                                                type="checkbox"
                                                value={layanan.id_layanan}
                                                checked={isChecked}
                                                onChange={() => {
                                                    setSelectedKiloanIds(prev => {
                                                        const next = new Set(prev);
                                                        if (next.has(layanan.id_layanan)) next.delete(layanan.id_layanan);
                                                        else next.add(layanan.id_layanan);
                                                        return next;
                                                    });
                                                }}
                                            />
                                            <div className="dp-card-radio-content">
                                                <div className="dp-card-title">{layanan.nama_layanan}</div>
                                                <div className="dp-card-price">Rp {parseInt(layanan.harga_layanan).toLocaleString('id-ID')} / {layanan.satuan || 'kg'}</div>
                                                {isChecked && (
                                                    <div className="dp-card-check">
                                                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                            
                            {selectedKiloanIds.size > 0 && (
                                <div className="dp-form-group" style={{marginTop: '1rem'}}>
                                    <label className="dp-form-label">Estimasi Berat (kg)</label>
                                    <input
                                        className="dp-input"
                                        type="number"
                                        min="0"
                                        value={kiloanQty}
                                        onChange={(e) => setKiloanQty(Math.max(0, parseInt(e.target.value) || 0))}
                                        placeholder="Contoh: 3"
                                        style={{maxWidth: '200px'}}
                                    />
                                </div>
                            )}
                        </section>
                    )}

                    {layananSatuan.length > 0 && (
                        <section className="dp-section">
                            <div className="dp-section-header">
                                <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>checkroom</span>
                                <h2 className="dp-section-title">Layanan Satuan</h2>
                            </div>
                            <div className="dp-list">
                                {layananSatuan.map((layanan) => {
                                    const qty = satuanQtyMap[layanan.id_layanan] || 0;
                                    return (
                                        <div key={layanan.id_layanan} className="dp-list-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', marginBottom: '0.5rem'}}>
                                            <div>
                                                <div className="dp-card-title">{layanan.nama_layanan}</div>
                                                <div className="dp-card-price">Rp {parseInt(layanan.harga_layanan).toLocaleString('id-ID')} / {layanan.satuan || 'pcs'}</div>
                                            </div>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                                <button onClick={() => updateSatuanQty(layanan.id_layanan, -1)} style={{width: '2rem', height: '2rem', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>-</button>
                                                <span style={{fontWeight: '600', minWidth: '1.5rem', textAlign: 'center'}}>{qty}</span>
                                                <button onClick={() => updateSatuanQty(layanan.id_layanan, 1)} style={{width: '2rem', height: '2rem', borderRadius: '50%', border: '1px solid #2563eb', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>+</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    <section className="dp-section">
                        <div className="dp-section-header">
                            <h2 className="dp-section-title">Informasi Pakaian (Opsional)</h2>
                        </div>
                        <p className="dp-section-desc">Pilih kategori pakaian yang ada di dalam cucianmu</p>
                        <div className="dp-kain-grid" style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                            {data.jenis_kain.map((kain) => {
                                const isSelected = selectedJenisKain.includes(kain);
                                return (
                                    <button 
                                        key={kain} 
                                        onClick={() => toggleJenisKain(kain)}
                                        style={{
                                            padding: '0.5rem 1rem', 
                                            borderRadius: '9999px', 
                                            border: `1px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                                            color: isSelected ? '#1e40af' : '#475569',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        {isSelected && <span className="material-symbols-outlined" style={{fontSize: '16px'}}>check</span>}
                                        {kain}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="dp-section">
                        <div className="dp-section-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>calendar_clock</span>
                            <h2 className="dp-section-title">Jadwal Penjemputan</h2>
                        </div>
                        <p className="dp-section-desc" style={{marginBottom: '1rem'}}>Pilih jam penjemputan yang tersedia</p>
                        <div className="dp-grid-3">
                            {data.jadwal_penjemputan.map((jam) => {
                                const isChecked = selectedJadwal === jam;
                                return (
                                    <label key={jam} className="dp-card-radio">
                                        <input
                                            className="dp-card-radio-input"
                                            name="jadwal"
                                            type="radio"
                                            value={jam}
                                            checked={isChecked}
                                            onChange={() => setSelectedJadwal(jam)}
                                        />
                                        <div className="dp-card-radio-content">
                                            <div className="dp-card-title">{jam}</div>
                                            {isChecked && (
                                                <div className="dp-card-check">
                                                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
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
                            <h2 className="dp-section-title">Catatan Tambahan (Opsional)</h2>
                        </div>
                        <div className="dp-form-group">
                            <textarea
                                className="dp-textarea"
                                placeholder="Contoh: Pisahkan baju putih dan luntur, pewangi aroma lavender..."
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                            ></textarea>
                        </div>
                    </section>
                </div>

                <div className="dp-content-right">
                    <div className="dp-summary-sticky">
                        <div className="dp-summary-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>receipt_long</span>
                            <h2 className="dp-summary-title">Estimasi Biaya</h2>
                        </div>

                        {feeLoading && (
                            <div className="dp-summary-loading" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', color: '#475569', fontSize: '0.875rem'}}>
                                <span className="material-symbols-outlined dp-summary-loading-icon" style={{fontSize: '1.5rem', color: '#2563eb', animation: 'spin 2s linear infinite'}}>hourglass_empty</span>
                                <span>Menghitung estimasi...</span>
                            </div>
                        )}

                        {feeError && !feeLoading && (
                            <div className="dp-fee-error">
                                <span className="material-symbols-outlined">error_outline</span>
                                <span>{feeError}</span>
                            </div>
                        )}

                        {feeEstimate && !feeLoading && (
                            <div className="dp-summary-list mb-1">
                                {/* Ringkasan Items */}
                                {feeEstimate.detail_layanan?.map((item, idx) => (
                                    <div key={idx} className="dp-summary-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem'}}>
                                        <span className="dp-summary-item-label" style={{fontSize: '1rem', color: '#475569'}}>
                                            {item.nama_layanan} ({item.qty} {item.satuan})
                                        </span>
                                        <span className="dp-summary-item-value" style={{fontSize: '1rem', color: '#0f172a', fontWeight: '600'}}>
                                            Rp {fmt(item.subtotal)}
                                        </span>
                                    </div>
                                ))}

                                <div className="dp-summary-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem'}}>
                                    <span className="dp-summary-item-label" style={{fontSize: '1rem', color: '#475569'}}>Biaya Ongkir</span>
                                    <span className="dp-summary-item-value" style={{fontSize: '1rem', color: '#0f172a', fontWeight: '600'}}>
                                        Rp {fmt(feeEstimate.ringkasan?.biaya_ongkir || feeEstimate.biaya_ongkir)}
                                    </span>
                                </div>

                                <div className="dp-summary-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem'}}>
                                    <span className="dp-summary-item-label" style={{fontSize: '1rem', color: '#475569'}}>Biaya Layanan Aplikasi</span>
                                    <span className="dp-summary-item-value" style={{fontSize: '1rem', color: '#0f172a', fontWeight: '600'}}>
                                        Rp {fmt(feeEstimate.ringkasan?.biaya_layanan_aplikasi || feeEstimate.biaya_layanan)}
                                    </span>
                                </div>
                                <div className="dp-summary-total" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem'}}>
                                    <span className="dp-summary-total-label" style={{fontSize: '1.125rem', color: '#0f172a', fontWeight: '700'}}>Total Pembayaran</span>
                                    <span className="dp-summary-total-value" style={{fontSize: '1.125rem', color: '#2563eb', fontWeight: '700'}}>
                                        Rp {fmt(feeEstimate.ringkasan?.total_pembayaran || feeEstimate.total_pembayaran)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {!feeEstimate && !feeLoading && !feeError && (
                            <div className="dp-fee-placeholder">
                                <span className="material-symbols-outlined">calculate</span>
                                <p>Pilih layanan untuk melihat estimasi biaya</p>
                            </div>
                        )}

                        <div className="dp-info-box mt-2">
                            <span className="material-symbols-outlined dp-info-icon">info</span>
                            <p className="dp-info-text">
                                *Ini adalah estimasi biaya. Harga final akan ditentukan setelah mitra menimbang dan memeriksa pesanan Anda.
                            </p>
                        </div>
                        <button
                            className="dp-btn-primary"
                            disabled={!feeEstimate || submitLoading}
                            onClick={handleSubmit}
                        >
                            {submitLoading ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
                            {!submitLoading && <span className="material-symbols-outlined">arrow_forward</span>}
                        </button>
                    </div>
                </div>
            </main>

            <footer className="lp-footer">
                <div className="lp-container lp-footer-inner">
                    <div className="lp-footer-brand">
                        <Link to="/" className="lp-footer-logo">KostHub<span className="lp-footer-dot">.</span></Link>
                        <p className="lp-footer-desc">Solusi praktis anak kos di Solo.</p>
                    </div>
                    <div className="lp-footer-links">
                        <a className="lp-footer-link" href="#">Syarat &amp; Ketentuan</a>
                        <a className="lp-footer-link" href="#">Kebijakan Privasi</a>
                        <a className="lp-footer-link" href="#">Hubungi Kami</a>
                    </div>
                    <p className="lp-footer-copy">© 2024 KostHub. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};
export default LaundryDetail;
