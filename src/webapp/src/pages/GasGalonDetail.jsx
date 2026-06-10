import './GasGalonDetail.css';
import '../features/landing/LandingPage/LandingPage.css';
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const GasGalonDetail = () => {
    const { id_mitra } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [selectedProductIds, setSelectedProductIds] = useState(new Set()); // multi-select
    const [qtyProduct, setQtyProduct] = useState({});           // { id_layanan: qty }
    const [kondisiPerProduk, setKondisiPerProduk] = useState({}); // { id_layanan: 'refill' | 'new' }
    const [jarakOngkir, setJarakOngkir] = useState(1);
    const [jam, setJam] = useState('');
    const [namaLengkap, setNamaLengkap] = useState('');
    const [noWa, setNoWa] = useState('');
    const [catatan, setCatatan] = useState('');

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
                const response = await api.get('/v1/landing-page/galon-gas/detail-pesanan', {
                    params: { id_mitra, type_layanan: 'galon_gas' }
                });
                const resData = response.data.data;
                setData(resData);
                if (resData?.layanan?.length > 0) {
                    const first = resData.layanan[0];
                    setSelectedProductIds(new Set([first.id_layanan]));
                    setQtyProduct({ [first.id_layanan]: 1 });
                    setKondisiPerProduk({ [first.id_layanan]: 'refill' });
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
        if (!data || selectedProductIds.size === 0) return;

        const layananPayload = [...selectedProductIds].map(id => ({
            idLayanan: String(id),
            qty: qtyProduct[id] || 1,
        }));

        const biayaTambahan = [...selectedProductIds].map(id => {
            const produk = data.layanan.find(l => l.id_layanan === id);
            const isNew = kondisiPerProduk[id] === 'new';
            return {
                idLayanan: String(id),
                beli_baru: isNew ? (parseInt(produk?.beli_baru) || 0) : 0,
            };
        });

        const timer = setTimeout(async () => {
            setEstimateLoading(true);
            setEstimateError(null);
            try {
                const res = await api.post('/v1/landing-page/generate-fee-pesanan', {
                    idMitra:      String(id_mitra),
                    typeLayanan:  'galon_gas',
                    items:      layananPayload,
                    jarakOngkir,
                    biayaTambahan,
                });
                setEstimate({
                        type_layanan: res.data.data.type_layanan,
                        detail_layanan: res.data.data.detail_layanan,
                        ringkasan: res.data.data.ringkasan,
                        subtotal: res.data.data.ringkasan.subtotal,
                        biaya_ongkir: res.data.data.ringkasan.biaya_ongkir,
                        biaya_tambahan: res.data.data.ringkasan.biaya_tambahan_durasi || 0,
                        biaya_layanan: res.data.data.ringkasan.biaya_layanan_aplikasi,
                        total_pembayaran: res.data.data.ringkasan.total_pembayaran
                    });
            } catch (err) {
                setEstimateError(err.response?.data?.message || 'Gagal menghitung estimasi');
            } finally {
                setEstimateLoading(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [data, selectedProductIds, qtyProduct, kondisiPerProduk, jarakOngkir, id_mitra]);

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

    const ringkasan = estimate?.ringkasan ?? null;

    const handleSubmit = async () => {
        if (!estimate || !isAuthenticated) {
            if (!isAuthenticated) navigate('/login');
            return;
        }

        const biayaTambahan = [...selectedProductIds].map(id => {
            const produk = data.layanan.find(l => l.id_layanan === id);
            const isNew = kondisiPerProduk[id] === 'new';
            return {
                idLayanan: String(id),
                beli_baru: isNew ? (parseInt(produk?.beli_baru) || 0) : 0,
            };
        });

        const items = [...selectedProductIds].map(id => ({
            idLayanan: String(id),
            qty: qtyProduct[id] || 1,
        }));

        const jadwal_layanan = [
            {
                jam: jam || null,
                tanggal: null
            }
        ]

        setSubmitLoading(true);
        setSubmitError(null);
        try {
            const res = await api.post('/v1/landing-page/pesanan/', {
                idMitra:           String(data.id_mitra),
                typeLayanan:       'galon_gas',
                items,
                jarakOngkir,
                jadwal_layanan,
                estimasi:          estimate,
                biayaTambahan,
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
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/' === '/gas-galon' ? 'lp-nav-link--active' : ''}`} to="/" onMouseEnter={handleNavHover} onClick={handleNavClick}>Home</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/gas-galon' === '/gas-galon' ? 'lp-nav-link--active' : ''}`} to="/gas-galon" onMouseEnter={handleNavHover} onClick={handleNavClick}>Gas &amp; Galon</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/laundry' === '/gas-galon' ? 'lp-nav-link--active' : ''}`} to="/laundry" onMouseEnter={handleNavHover} onClick={handleNavClick}>Laundry Express</Link></li>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/daily-cleaning' === '/gas-galon' ? 'lp-nav-link--active' : ''}`} to="/daily-cleaning" onMouseEnter={handleNavHover} onClick={handleNavClick}>Daily Cleaning</Link></li>
                        <li className="lp-nav-item"><Link className="lp-nav-link" to="/tentang-kami" onMouseEnter={handleNavHover} onClick={handleNavClick}>Tentang Kami</Link></li>
                    </ul>
                    <div className="lp-nav-actions">
                        {isAuthenticated ? (
                            <div className="lp-profile-menu">
                                <button className="lp-profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)} title={user?.nama_lengkap || user?.nama_mitra || user?.nama || 'User'}>
                                    <div className="lp-profile-avatar"><span className="material-symbols-outlined">account_circle</span></div>
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
                                        <button className="lp-profile-link" onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}>
                                            <span className="material-symbols-outlined">settings</span> Pengaturan
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
                    <h1 className="dp-title">Pesan Gas &amp; Galon</h1>
                    <p className="dp-subtitle">Mitra: <span className="dp-subtitle-bold">{data.nama_mitra}</span></p>
                </div>

                <div className="dp-content-left">
                    <section className="dp-section">
                        <p className="dp-section-desc">Pilih satu atau lebih produk untuk pengiriman langsung ke kos.</p>

                        <div className="dp-product-preview">
                            {data.layanan.map((product) => {
                                const isSelected = selectedProductIds.has(product.id_layanan);
                                const qty = qtyProduct[product.id_layanan] || 1;
                                const kondisi = kondisiPerProduk[product.id_layanan] || 'refill';
                                return (
                                    <label key={product.id_layanan} className={`dp-product-card ${isSelected ? 'active' : ''}`}>
                                        <input
                                            className="dp-product-radio"
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {
                                                setSelectedProductIds(prev => {
                                                    const next = new Set(prev);
                                                    if (next.has(product.id_layanan)) {
                                                        next.delete(product.id_layanan);
                                                    } else {
                                                        next.add(product.id_layanan);
                                                        setQtyProduct(q => ({ ...q, [product.id_layanan]: q[product.id_layanan] || 1 }));
                                                        setKondisiPerProduk(k => ({ ...k, [product.id_layanan]: k[product.id_layanan] || 'refill' }));
                                                    }
                                                    return next;
                                                });
                                            }}
                                        />
                                        <div className="dp-product-icon-wrap">
                                            {product.nama_layanan.toLowerCase().includes('gas') ?
                                                <span className="material-symbols-outlined dp-product-icon" style={{fontVariationSettings: "'FILL' 1"}}>propane</span> :
                                                <span className="material-symbols-outlined dp-product-icon-outline" style={{fontVariationSettings: "'FILL' 1"}}>water_drop</span>
                                            }
                                        </div>
                                        <div className="dp-product-info">
                                            <h3 className="dp-product-name">{product.nama_layanan}</h3>
                                            <p className="dp-product-price">Mulai dari Rp {parseInt(product.harga_barang).toLocaleString('id-ID')}</p>
                                            <span className="dp-product-badge">Tersedia</span>
                                        </div>
                                        {isSelected && (
                                            <div className="dp-product-controls" onClick={e => e.preventDefault()}>
                                                <div className="dp-qty-row">
                                                    <div className="dp-qty-stepper">
                                                        <button
                                                            className="dp-qty-btn"
                                                            onClick={e => { e.preventDefault(); setQtyProduct(prev => ({ ...prev, [product.id_layanan]: Math.max(1, (prev[product.id_layanan] || 1) - 1) })); }}
                                                        >−</button>
                                                        <span className="dp-qty-value">{qty}</span>
                                                        <button
                                                            className="dp-qty-btn"
                                                            onClick={e => { e.preventDefault(); setQtyProduct(prev => ({ ...prev, [product.id_layanan]: (prev[product.id_layanan] || 1) + 1 })); }}
                                                        >+</button>
                                                    </div>
                                                </div>
                                                <div className="dp-kondisi-toggle">
                                                    <button
                                                        className={`dp-kondisi-btn ${kondisi === 'refill' ? 'active' : ''}`}
                                                        onClick={e => { e.preventDefault(); setKondisiPerProduk(prev => ({ ...prev, [product.id_layanan]: 'refill' })); }}
                                                    >
                                                        <span className="material-symbols-outlined">autorenew</span>
                                                        Isi Ulang
                                                    </button>
                                                    <button
                                                        className={`dp-kondisi-btn ${kondisi === 'new' ? 'active' : ''}`}
                                                        onClick={e => { e.preventDefault(); setKondisiPerProduk(prev => ({ ...prev, [product.id_layanan]: 'new' })); }}
                                                    >
                                                        <span className="material-symbols-outlined">add_shopping_cart</span>
                                                        Beli Baru
                                                        {product.beli_baru && (
                                                            <span className="dp-kondisi-price">+Rp {parseInt(product.beli_baru).toLocaleString('id-ID')}</span>
                                                        )}
                                                    </button>
                                                </div>
                                                {kondisi === 'refill' && (
                                                    <div className="dp-alert-warning-sm">
                                                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1", fontSize: '14px'}}>warning</span>
                                                        <span>Siapkan tabung/galon kosong saat kurir tiba</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </label>
                                );
                            })}
                        </div>

                        <h2 className="dp-section-title-sm">Pilih Jam Pengiriman</h2>
                        <div className="dp-time-grid">
                            {(data?.jadwal_pengiriman || []).map((time) => (
                                <button
                                    key={time}
                                    className={`dp-time-btn ${jam === time ? 'active' : ''}`}
                                    onClick={() => setJam(time)}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>

                        <h2 className="dp-section-title-sm" style={{marginTop: '20px'}}>Detail Pengiriman</h2>
                        <div className="dp-form-group-flex">
                            <div>
                                <label className="dp-form-label">Nama Lengkap</label>
                                <input
                                    className="dp-input"
                                    placeholder="Masukkan nama Anda"
                                    type="text"
                                    value={namaLengkap}
                                    onChange={(e) => setNamaLengkap(e.target.value)}
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
                                />
                            </div>
                            <div>
                                <label className="dp-form-label">Jarak ke Lokasi (km)</label>
                                <input
                                    className="dp-input"
                                    type="number"
                                    min="1"
                                    value={jarakOngkir}
                                    onChange={(e) => setJarakOngkir(Math.max(1, parseInt(e.target.value) || 1))}
                                    style={{maxWidth: '160px'}}
                                />
                            </div>
                            <div>
                                <label className="dp-form-label">Catatan Pengiriman</label>
                                <textarea
                                    className="dp-textarea"
                                    placeholder="Contoh: Titip di Bapak Kos"
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    style={{height: '6rem'}}
                                ></textarea>
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
                                        <span className="dp-summary-item-label">
                                            {item.nama_layanan} x{item.qty}
                                            {item.total_beli_baru > 0 && (
                                                <span className="dp-summary-badge-new">Beli Baru</span>
                                            )}
                                        </span>
                                        <span className="dp-summary-item-value">Rp {(item.subtotal ?? 0).toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                                {(ringkasan?.total_beli_baru ?? 0) > 0 && (
                                    <div className="dp-summary-item">
                                        <span className="dp-summary-item-label">Biaya Beli Baru (Tabung/Galon)</span>
                                        <span className="dp-summary-item-value">Rp {ringkasan.total_beli_baru.toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                <div className="dp-summary-item">
                                    <span className="dp-summary-item-label">Biaya Ongkir</span>
                                    <span className="dp-summary-item-value">
                                        {ringkasan ? `Rp ${ringkasan.biaya_ongkir.toLocaleString('id-ID')}` : '-'}
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
                            <div className="dp-summary-error" style={{marginTop: '10px'}}>
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
                            disabled={!ringkasan || submitLoading || selectedProductIds.size === 0}
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
export default GasGalonDetail;
