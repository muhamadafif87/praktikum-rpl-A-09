import './LaundryDetail.css';
import '../features/landing/LandingPage/LandingPage.css';
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LaundryDetail = () => {
    const { id_mitra } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [selectedLayanan, setSelectedLayanan] = useState(null);
    const [selectedDurasi, setSelectedDurasi] = useState(null);
    const [selectedJadwal, setSelectedJadwal] = useState(null);
    const [catatan, setCatatan] = useState('');
    const [qty, setQty] = useState(1);
    const [jarakOngkir, setJarakOngkir] = useState(0);

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

                if (resData?.layanan?.length > 0) {
                    setSelectedLayanan(resData.layanan[0]);
                }

                if (resData?.durasi_pengerjaan) {
                    const dur = resData.durasi_pengerjaan;
                    setSelectedDurasi({
                        id: 'reguler',
                        name: 'Reguler (2-3 Hari)',
                        price: dur.reguler ?? 0,
                        isExpress: false,
                        additionalFee: 0
                    });
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
        if (!data || !selectedLayanan || !selectedDurasi || qty < 1) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setFeeLoading(true);
            setFeeError(null);
            try {
                const requestBody = {
                    idMitra: String(data.id_mitra),
                    typeLayanan: 'laundry',
                    items: [
                        {
                            idLayanan: String(selectedLayanan.id_layanan),
                            qty: Number(qty)
                        }
                    ],
                    jarakOngkir: Number(jarakOngkir),
                    biayaTambahan: {
                        durasi_pengerjaan: {
                            biaya: selectedDurasi.price, // Kirim harga per kg, bukan total
                            type: selectedDurasi.id
                        }
                    }
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

        return () => clearTimeout(debounceRef.current);
    }, [data, selectedLayanan, selectedDurasi, qty, jarakOngkir]);

    const fmt = (val) => (parseInt(val) || 0).toLocaleString('id-ID');

    if (loading || error || !data) {
        return (
            <div className="dp-fallback">
                <div className="dp-fallback-card">
                    <span className="material-symbols-outlined dp-fallback-icon" style={{fontVariationSettings: "'FILL' 1"}}>
                        {loading ? 'hourglass_empty' : 'error'}
                    </span>
                    <h2 className="dp-fallback-title">
                        {loading ? 'Memuat Data...' : 'Terjadi Kesalahan'}
                    </h2>
                    <p className="dp-fallback-text">
                        {loading ? 'Mohon tunggu sebentar.' : error || 'Data pesanan tidak ditemukan.'}
                    </p>
                    {!loading && (
                        <button
                            onClick={() => navigate(-1)}
                            className="dp-fallback-btn"
                        >
                            Kembali ke Halaman Sebelumnya
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const ringkasan = feeEstimate?.ringkasan ?? null;

    const handleSubmit = async () => {
        if (!feeEstimate || !isAuthenticated) {
            if (!isAuthenticated) navigate('/login');
            return;
        }

        if (!selectedLayanan) {
            setSubmitError('Pilih layanan terlebih dahulu');
            return;
        }

        const items = [
            {
                idLayanan: String(selectedLayanan.id_layanan),
                qty: Number(qty)
            }
        ];

        const jadwal_layanan = [
            {
                jam: selectedJadwal || null,
                tanggal: null
            }
        ];

        const subtotal = feeEstimate?.ringkasan?.subtotal ?? 0;

        const estimasiPayload = {
            subtotal,
            biaya_ongkir:           feeEstimate?.ringkasan?.biaya_ongkir ?? 0,
            biaya_tambahan_durasi:  feeEstimate?.ringkasan?.biaya_tambahan_durasi ?? 0,
            total_pembayaran:       feeEstimate?.ringkasan?.total_pembayaran ?? 0,
            beli_baru:              0,
        };

        const biayaTambahanPayload = {
            durasi_pengerjaan: {
                biaya: selectedDurasi?.price || 0,
                type:  selectedDurasi?.id || 'reguler'
            }
        };

        setSubmitLoading(true);
        setSubmitError(null);
        try {
            const res = await api.post('/v1/landing-page/pesanan/', {
                idMitra: String(data.id_mitra),
                typeLayanan: 'laundry',
                items,
                jarakOngkir,
                jadwal_layanan,
                biayaTambahan: biayaTambahanPayload,
                estimasi: estimasiPayload,
                catatanPengiriman: catatan || null,
            });
            navigate(`/pesanan/${res.data.data.id_unique_pesanan}/sukses`);
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
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/' === '/laundry' ? 'lp-nav-link--active' : ''}`} to="/" onMouseEnter={handleNavHover} onClick={handleNavClick}>Home</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/gas-galon' === '/laundry' ? 'lp-nav-link--active' : ''}`} to="/gas-galon" onMouseEnter={handleNavHover} onClick={handleNavClick}>Gas &amp; Galon</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/laundry' === '/laundry' ? 'lp-nav-link--active' : ''}`} to="/laundry" onMouseEnter={handleNavHover} onClick={handleNavClick}>Laundry Express</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/daily-cleaning' === '/laundry' ? 'lp-nav-link--active' : ''}`} to="/daily-cleaning" onMouseEnter={handleNavHover} onClick={handleNavClick}>Daily Cleaning</Link></li>
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
                    <section className="dp-section">
                        <div className="dp-section-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>local_laundry_service</span>
                            <h2 className="dp-section-title">Jenis Layanan</h2>
                        </div>
                        <div className="dp-grid-2">
                            {data.layanan.map((layanan) => {
                                const isChecked = selectedLayanan?.id_layanan === layanan.id_layanan;
                                return (
                                    <label key={layanan.id_layanan} className="dp-card-radio">
                                        <input
                                            className="dp-card-radio-input"
                                            name="layanan"
                                            type="radio"
                                            value={layanan.id_layanan}
                                            checked={isChecked}
                                            onChange={() => setSelectedLayanan(layanan)}
                                        />
                                        <div className="dp-card-radio-content">
                                            <div className="dp-card-title">{layanan.nama_layanan}</div>
                                            <div className="dp-card-price">Mulai dari Rp {parseInt(layanan.harga_layanan).toLocaleString('id-ID')} / kg</div>
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
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>schedule</span>
                            <h2 className="dp-section-title">Durasi Pengerjaan</h2>
                        </div>
                        <div className="dp-grid-3">
                            {[
                                { id: 'reguler', name: 'Reguler (2-3 Hari)', price: data.durasi_pengerjaan?.reguler ?? 0 },
                                { id: 'express', name: 'Express (24 Jam)', price: data.durasi_pengerjaan?.express ?? 0 },
                                { id: 'kilat', name: 'Kilat (12 Jam)', price: data.durasi_pengerjaan?.kilat ?? 0 }
                            ].map((dur) => {
                                const isChecked = selectedDurasi.id === dur.id;
                                return (
                                    <label key={dur.id} className="dp-card-radio">
                                        <input
                                            className="dp-card-radio-input"
                                            name="durasi"
                                            type="radio"
                                            value={dur.id}
                                            checked={isChecked}
                                            onChange={() => setSelectedDurasi(dur)}
                                        />
                                        <div className="dp-card-radio-content">
                                            <div className="dp-card-title">{dur.name}</div>
                                            <div className="dp-card-price">{dur.price === 0 ? 'Harga Standar' : `+ Rp ${dur.price.toLocaleString('id-ID')}`}</div>
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
                            <h2 className="dp-section-title">Layanan Laundry</h2>
                        </div>
                        <div className="dp-kain-grid">
                            {data.jenis_kain.map((kain) => {
                                return (
                                    <label key={kain} className={`dp-kain-card`}>
                                        <span className="dp-kain-name">{kain}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </section>

                    <section className="dp-section">
                        <div className="dp-section-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>calendar_clock</span>
                            <h2 className="dp-section-title">Jadwal Penjemputan</h2>
                        </div>
                        <p className="dp-section-desc" style={{marginBottom: 0}}>Pilih jam penjemputan yang tersedia</p>
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
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>scale</span>
                            <h2 className="dp-section-title">Estimasi Berat & Jarak</h2>
                        </div>
                        <div className="dp-grid-2">
                            <div className="dp-form-group">
                                <label className="dp-form-label">Estimasi Berat (kg)</label>
                                <input
                                    className="dp-input"
                                    type="number"
                                    min="1"
                                    value={qty}
                                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                                    placeholder="Contoh: 3"
                                />
                            </div>
                            <div className="dp-form-group">
                                <label className="dp-form-label">Jarak Penjemputan (km)</label>
                                <input
                                    className="dp-input"
                                    type="number"
                                    min="0"
                                    value={jarakOngkir}
                                    onChange={(e) => setJarakOngkir(Math.max(0, parseInt(e.target.value) || 0))}
                                    placeholder="Contoh: 2"
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
                            <div className="dp-fee-loading">
                                <span className="material-symbols-outlined dp-fee-loading-icon">sync</span>
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
                                {/* Using ringkasan structure from new API */}
                                <div className="dp-summary-item">
                                    <span className="dp-summary-item-label">
                                        Subtotal ({qty} kg × {selectedLayanan?.nama_layanan})
                                    </span>
                                    <span className="dp-summary-item-value">
                                        Rp {fmt(feeEstimate.ringkasan?.subtotal || feeEstimate.subtotal)}
                                    </span>
                                </div>
                                <div className="dp-summary-item">
                                    <span className="dp-summary-item-label">Biaya Ongkir</span>
                                    <span className="dp-summary-item-value">
                                        Rp {fmt(feeEstimate.ringkasan?.biaya_ongkir || feeEstimate.biaya_ongkir)}
                                    </span>
                                </div>
                                {((feeEstimate.ringkasan?.biaya_tambahan_durasi || feeEstimate.biaya_tambahan) > 0) && (
                                    <div className="dp-summary-item">
                                        <span className="dp-summary-item-label">
                                            Biaya Durasi ({selectedDurasi?.name})
                                        </span>
                                        <span className="dp-summary-item-value">
                                            + Rp {fmt(feeEstimate.ringkasan?.biaya_tambahan_durasi || feeEstimate.biaya_tambahan)}
                                        </span>
                                    </div>
                                )}
                                <div className="dp-summary-item">
                                    <span className="dp-summary-item-label">Biaya Layanan Aplikasi</span>
                                    <span className="dp-summary-item-value">
                                        Rp {fmt(feeEstimate.ringkasan?.biaya_layanan_aplikasi || feeEstimate.biaya_layanan)}
                                    </span>
                                </div>
                                <div className="dp-summary-total">
                                    <span className="dp-summary-total-label">Total Pembayaran</span>
                                    <span className="dp-summary-total-value">
                                        Rp {fmt(feeEstimate.ringkasan?.total_pembayaran || feeEstimate.total_pembayaran)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {!feeEstimate && !feeLoading && !feeError && (
                            <div className="dp-fee-placeholder">
                                <span className="material-symbols-outlined">calculate</span>
                                <p>Lengkapi form untuk melihat estimasi biaya</p>
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
                            disabled={!feeEstimate || submitLoading || !selectedLayanan}
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
