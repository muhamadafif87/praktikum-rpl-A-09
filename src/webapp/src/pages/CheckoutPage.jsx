import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import useWarnIfUnsavedChanges from '../hooks/useWarnIfUnsavedChanges';
import FullScreenLoader from '../components/FullScreenLoader/FullScreenLoader';
import './LaundryDetail.css'; // Reusing dp-* ecosystem
import '../features/landing/LandingPage/LandingPage.css';
import './CheckoutPage.css';
import Footer from '../components/Footer/Footer';

const fmt = (num) => {
    return parseInt(num || 0).toLocaleString('id-ID');
};

const CheckoutPage = () => {
    const { id_pesanan } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const { location } = useLocation();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const { addToast } = useToast();

    const [paymentMethod, setPaymentMethod] = useState('qris'); // qris, va, cash
    const [isSimulating, setIsSimulating] = useState(false);
    
    // Prevent leaving if payment isn't simulated yet
    useWarnIfUnsavedChanges(!paymentLoading && data && data.status_pesanan === 'pending');

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
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchOrder = async () => {
            try {
                // Adjust if backend endpoint is different
                const res = await api.get(`/v1/landing-page/pesanan/${id_pesanan}`);
                setData(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Gagal memuat detail pesanan.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id_pesanan, isAuthenticated, navigate]);

    const handlePayment = async () => {
        setPaymentLoading(true);
        try {
            await api.patch(`/v1/landing-page/pesanan/${id_pesanan}/mock-payment`);
            addToast('Pembayaran berhasil dikonfirmasi!', 'success');
            navigate(`/pesanan/${id_pesanan}/sukses`);
        } catch (err) {
            addToast(err.response?.data?.message || 'Terjadi kesalahan saat memproses pembayaran mock.', 'error');
        } finally {
            setPaymentLoading(false);
        }
    };

    if (loading) {
        return (
            <FullScreenLoader 
                messages={[
                    "Menyiapkan halaman pembayaran...",
                    "Mengamankan sesi transaksi...",
                    "Memuat detail pesanan Anda..."
                ]} 
            />
        );
    }

    if (error || !data) {
        return (
            <div className="dp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }}>error_outline</span>
                <p style={{ color: '#1f2937', fontWeight: '500' }}>{error || 'Pesanan tidak ditemukan'}</p>
                <button onClick={() => navigate('/')} className="dp-btn-primary" style={{ marginTop: '16px', width: 'auto', padding: '8px 24px' }}>Kembali ke Beranda</button>
            </div>
        );
    }

    // Determine icons and descriptions based on service type
    const isLaundry = data.type_layanan === 'laundry';
    let serviceIcon = 'local_laundry_service';
    let serviceName = 'Layanan';
    if (data?.mitra?.jenis_jasa === 'laundry') { serviceName = 'Laundry Express'; serviceIcon = 'local_laundry_service'; }
    else if (data?.mitra?.jenis_jasa === 'daily_cleaning') { serviceName = 'Daily Cleaning'; serviceIcon = 'cleaning_services'; }
    else if (data?.mitra?.jenis_jasa === 'gas_galon') { serviceName = 'Gas & Galon'; serviceIcon = 'propane'; }

    return (
        <div className="dp-page">
            <nav className="lp-navbar">
                <div className="lp-container lp-navbar-inner">
                    <div className="lp-brand">
                        <Link to="/" className="lp-brand-link">KostHub<span className="lp-brand-dot">.</span></Link>
                    </div>
                    <ul className="lp-nav-links" ref={navLinksRef} onMouseLeave={handleNavLeave}>
                        <li className="lp-nav-item"><Link className={`lp-nav-link ${'/' === '/checkout' ? 'lp-nav-link--active' : ''}`} to="/" onMouseEnter={handleNavHover} onClick={handleNavClick}>Home</Link></li>
                        <li className="lp-nav-item"><Link className="lp-nav-link" to="/gas-galon" onMouseEnter={handleNavHover} onClick={handleNavClick}>Gas &amp; Galon</Link></li>
                        <li className="lp-nav-item"><Link className="lp-nav-link" to="/laundry" onMouseEnter={handleNavHover} onClick={handleNavClick}>Laundry Express</Link></li>
                        <li className="lp-nav-item"><Link className="lp-nav-link" to="/daily-cleaning" onMouseEnter={handleNavHover} onClick={handleNavClick}>Daily Cleaning</Link></li>
                        <li className="lp-nav-item"><Link className="lp-nav-link" to="/tentang-kami" onMouseEnter={handleNavHover} onClick={handleNavClick}>Tentang Kami</Link></li>
                    </ul>
                    <div className="lp-nav-actions">
                        {isAuthenticated && user ? (
                            <div className="lp-profile-menu">
                                <button
                                    className="lp-profile-btn"
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                >
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
                                            <p className="lp-profile-name">{user?.nama_lengkap || 'User'}</p>
                                            <p className="lp-profile-email">{user?.email || ''}</p>
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
                    <div className="dp-step dp-step-completed">
                        <span className="material-symbols-outlined dp-step-icon">check_circle</span>
                        <span>Detail Pesanan</span>
                    </div>
                    <div className="dp-step-line"></div>
                    <div className="dp-step dp-step-current">
                        <div className="dp-step-number">3</div>
                        <span>Pembayaran</span>
                    </div>
                </div>
            </div>

            <main className="dp-main">
                <div className="dp-header">
                    <h1 className="dp-title">Pembayaran</h1>
                    <p className="dp-subtitle">Selesaikan transaksi Anda dengan memilih metode pembayaran di bawah ini.</p>
                </div>

                <div className="dp-content-left">
                    <div className="dp-order-small-card">
                        <div className="dp-order-small-card-icon">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>{serviceIcon}</span>
                        </div>
                        <div className="dp-order-small-card-content">
                            <h3>{serviceName} - Mitra: {data.mitra?.nama_mitra || 'Mitra'}</h3>
                            <p>Pesanan Anda telah dicatat dan siap diproses.</p>
                        </div>
                    </div>

                    <section className="dp-section">
                        <div className="dp-section-header">
                            <h2 className="dp-section-title">Data Pelanggan</h2>
                        </div>
                        <div className="dp-user-data">
                            <div className="dp-user-data-item">
                                <span className="material-symbols-outlined dp-user-data-icon">person</span>
                                <div className="dp-user-data-content">
                                    <p className="dp-user-data-label">Nama Lengkap</p>
                                    <p className="dp-user-data-value">{sessionStorage.getItem('checkoutContact') ? JSON.parse(sessionStorage.getItem('checkoutContact')).nama : (data.user?.nama_lengkap || user?.nama_lengkap)}</p>
                                </div>
                            </div>
                            <div className="dp-user-data-item">
                                <span className="material-symbols-outlined dp-user-data-icon">call</span>
                                <div className="dp-user-data-content">
                                    <p className="dp-user-data-label">Nomor WhatsApp</p>
                                    <p className="dp-user-data-value">{sessionStorage.getItem('checkoutContact') ? JSON.parse(sessionStorage.getItem('checkoutContact')).phone : (data.user?.nomor_telepon || user?.nomor_telepon || '-')}</p>
                                </div>
                            </div>
                            <div className="dp-user-data-item">
                                <span className="material-symbols-outlined dp-user-data-icon">location_on</span>
                                <div className="dp-user-data-content">
                                    <p className="dp-user-data-label">Alamat Pengiriman</p>
                                    <p className="dp-user-data-value">{location?.isConfirmed && location?.address ? location.address : (data.user?.address?.alamat_lengkap || user?.address?.alamat_lengkap || 'Alamat tidak ditemukan')}</p>
                                </div>
                            </div>
                            <div className="dp-user-data-item">
                                <span className="material-symbols-outlined dp-user-data-icon">schedule</span>
                                <div className="dp-user-data-content">
                                    <p className="dp-user-data-label">Jadwal Pesanan</p>
                                    <p className="dp-user-data-value">
                                        {(() => {
                                            if (data.jadwal_layanan && data.jadwal_layanan.length > 0) {
                                                const jadwal = data.jadwal_layanan[0];
                                                const tanggalStr = jadwal.tanggal ? new Date(jadwal.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Hari ini';
                                                const jamStr = jadwal.jam ? ` pukul ${jadwal.jam}` : '';
                                                return `${tanggalStr}${jamStr}`;
                                            } else if (data.catatan_pengiriman?.tanggal) {
                                                return `${data.catatan_pengiriman.tanggal} ${data.catatan_pengiriman.waktu ? `pukul ${data.catatan_pengiriman.waktu}` : ''}`;
                                            }
                                            return 'Hari ini';
                                        })()}
                                    </p>
                                </div>
                            </div>
                            {typeof data.catatan_pengiriman === 'string' && data.catatan_pengiriman.trim() && (
                                <div className="dp-user-data-item">
                                    <span className="material-symbols-outlined dp-user-data-icon">note</span>
                                    <div className="dp-user-data-content">
                                        <p className="dp-user-data-label">Catatan Tambahan</p>
                                        <p className="dp-user-data-value" style={{ whiteSpace: 'pre-wrap' }}>{data.catatan_pengiriman}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="dp-section">
                        <div className="dp-section-header">
                            <h2 className="dp-section-title">Pilih Metode Pembayaran</h2>
                        </div>
                        
                        {/* QRIS */}
                        <label className={`dp-payment-card ${paymentMethod === 'qris' ? 'dp-payment-card--active' : ''}`}>
                            <input 
                                type="radio" 
                                name="payment" 
                                value="qris" 
                                className="dp-payment-card-radio"
                                checked={paymentMethod === 'qris'}
                                onChange={() => setPaymentMethod('qris')}
                            />
                            <div className="dp-payment-icon">
                                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>qr_code_scanner</span>
                            </div>
                            <div className="dp-payment-content">
                                <h4 className="dp-payment-title">QRIS</h4>
                                <p className="dp-payment-desc">Bayar instan dengan aplikasi bank atau e-wallet.</p>
                                <div className="dp-payment-brands">
                                    <span className="dp-payment-brand-badge">GoPay</span>
                                    <span className="dp-payment-brand-badge">OVO</span>
                                    <span className="dp-payment-brand-badge">Shopee</span>
                                </div>
                                {paymentMethod === 'qris' && (
                                    <div className="dp-simulation-box" onClick={(e) => e.preventDefault()}>
                                        <p className="dp-simulation-title">Mockup QRIS (Testing)</p>
                                        <div className="dp-qr-mockup">
                                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PembayaranKostHub" alt="QRIS Mockup" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                                            <span className="material-symbols-outlined" style={{position: 'absolute', backgroundColor: 'white', padding: '2px', borderRadius: '4px', fontSize: '20px'}}>qr_code_2</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </label>

                        {/* Virtual Account */}
                        <label className={`dp-payment-card ${paymentMethod === 'va' ? 'dp-payment-card--active' : ''}`}>
                            <input 
                                type="radio" 
                                name="payment" 
                                value="va" 
                                className="dp-payment-card-radio"
                                checked={paymentMethod === 'va'}
                                onChange={() => setPaymentMethod('va')}
                            />
                            <div className="dp-payment-icon">
                                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>account_balance</span>
                            </div>
                            <div className="dp-payment-content">
                                <h4 className="dp-payment-title">Virtual Account (Transfer Bank)</h4>
                                <p className="dp-payment-desc">BCA, Mandiri, BNI, BRI, dll.</p>
                                {paymentMethod === 'va' && (
                                    <div className="dp-simulation-box" onClick={(e) => e.preventDefault()}>
                                        <p className="dp-simulation-title">Mockup VA (Testing)</p>
                                        <div className="dp-va-mockup">
                                            <p style={{margin: '0 0 4px', fontSize: '12px', color: 'var(--dp-on-surface-variant)'}}>BCA Virtual Account</p>
                                            <div className="dp-va-number">88000 1234 5678</div>
                                            <p style={{margin: '4px 0 0', fontSize: '12px', color: 'var(--dp-primary)', cursor: 'pointer', fontWeight: '600'}}>Salin Nomor</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </label>

                        {/* Cash */}
                        <label className={`dp-payment-card ${paymentMethod === 'cash' ? 'dp-payment-card--active' : ''}`}>
                            <input 
                                type="radio" 
                                name="payment" 
                                value="cash" 
                                className="dp-payment-card-radio"
                                checked={paymentMethod === 'cash'}
                                onChange={() => setPaymentMethod('cash')}
                            />
                            <div className="dp-payment-icon">
                                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>payments</span>
                            </div>
                            <div className="dp-payment-content">
                                <h4 className="dp-payment-title">Cash (Tunai)</h4>
                                <p className="dp-payment-desc">Bayar langsung ke kurir saat pesanan tiba atau diambil.</p>
                                <span className="dp-payment-badge">
                                    <span className="material-symbols-outlined" style={{fontSize: '14px'}}>info</span>
                                    Mohon siapkan uang pas
                                </span>
                            </div>
                        </label>
                    </section>
                </div>

                <div className="dp-content-right">
                    <div className="dp-summary-sticky">
                        <div className="dp-summary-header">
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>receipt_long</span>
                            <h2 className="dp-summary-title">Ringkasan Pembayaran</h2>
                        </div>

                        <div className="dp-summary-list mb-1">
                            {data.detail_layanan && data.detail_layanan.length > 0 ? (
                                data.detail_layanan.map((item, idx) => (
                                    <div className="dp-summary-item" key={idx}>
                                        <span className="dp-summary-item-label">
                                            {item.nama_layanan} {item.jumlah > 1 ? `(x${item.jumlah})` : ''}
                                        </span>
                                        <span className="dp-summary-item-value">
                                            Rp {fmt(item.subtotal)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="dp-summary-item">
                                    <span className="dp-summary-item-label">Subtotal</span>
                                    <span className="dp-summary-item-value">
                                        Rp {fmt(data.ringkasan_biaya?.subtotal || 0)}
                                    </span>
                                </div>
                            )}
                            {(data.ringkasan_biaya?.biaya_ongkir > 0 || data.ringkasan_biaya?.biaya_transportasi > 0) && (
                                <div className="dp-summary-item">
                                    <span className="dp-summary-item-label">Biaya Transportasi/Ongkir</span>
                                    <span className="dp-summary-item-value">
                                        Rp {fmt(data.ringkasan_biaya?.biaya_ongkir || data.ringkasan_biaya?.biaya_transportasi || 0)}
                                    </span>
                                </div>
                            )}
                            {(data.ringkasan_biaya?.biaya_tambahan > 0 || data.ringkasan_biaya?.biaya_tambahan_alat > 0) && (
                                <div className="dp-summary-item">
                                    <span className="dp-summary-item-label">Biaya Tambahan</span>
                                    <span className="dp-summary-item-value">
                                        + Rp {fmt(data.ringkasan_biaya?.biaya_tambahan || data.ringkasan_biaya?.biaya_tambahan_alat || 0)}
                                    </span>
                                </div>
                            )}
                            <div className="dp-summary-item">
                                <span className="dp-summary-item-label">Biaya Layanan Aplikasi</span>
                                <span className="dp-summary-item-value">
                                    Rp {fmt(data.ringkasan_biaya?.biaya_aplikasi || 2000)}
                                </span>
                            </div>
                            <div className="dp-summary-total">
                                <span className="dp-summary-total-label">Total Pembayaran</span>
                                <span className="dp-summary-total-value" style={{color: 'var(--dp-primary)'}}>
                                    Rp {fmt(data.ringkasan_biaya?.total_pembayaran || 0)}
                                </span>
                            </div>
                        </div>

                        <div className="dp-info-box">
                            <span className="material-symbols-outlined dp-info-icon">info</span>
                            <p className="dp-info-text">Transaksi Anda dilindungi oleh Sistem Escrow KostHub. Dana akan diteruskan ke mitra hanya setelah layanan selesai sesuai pesanan Anda.</p>
                        </div>

                        {paymentMethod === 'cash' ? (
                            <button
                                className="dp-btn-primary"
                                onClick={handlePayment}
                                style={{width: '100%'}}
                                disabled={paymentLoading}
                            >
                                {paymentLoading ? 'Memproses...' : 'Proses Pesanan Sekarang'}
                                {!paymentLoading && <span className="material-symbols-outlined">arrow_forward</span>}
                            </button>
                        ) : (
                            <button
                                className="dp-btn-primary"
                                onClick={handlePayment}
                                style={{width: '100%'}}
                                disabled={paymentLoading}
                            >
                                {paymentLoading ? 'Memproses...' : `Selesaikan di Mockup ${paymentMethod === 'qris' ? 'QRIS' : 'VA'}`}
                                {!paymentLoading && <span className="material-symbols-outlined">arrow_forward</span>}
                            </button>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CheckoutPage;
