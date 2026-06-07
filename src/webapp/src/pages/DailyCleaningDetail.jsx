import './DailyCleaningDetail.css';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DailyCleaningDetail = () => {
    const { id_mitra } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [sewaAlat, setSewaAlat] = useState(false);
    const [tanggal, setTanggal] = useState('');
    const [jam, setJam] = useState('');
    const [catatan, setCatatan] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/v1/landing-page/daily-cleaning/detail-pesanan', {
                    params: { id_mitra, type_layanan: 'daily-cleaning' }
                });
                setData(response.data.data);
                if (response.data.data?.layanan?.length > 0) {
                    setSelectedDuration(response.data.data.layanan[0]);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Terjadi kesalahan saat memuat data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id_mitra]);

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

    const hargaPaket = selectedDuration ? selectedDuration.harga_layanan : 0;
    const biayaAlat = sewaAlat ? 15000 : 0; // Example static
    const biayaTransport = 10000;
    const total = (parseInt(hargaPaket) || 0) + biayaAlat + biayaTransport;

    return (
        <div className="dp-page">
            <nav className="dp-nav">
                <div className="dp-nav-inner">
                    <div className="dp-nav-brand">
                        <Link className="dp-nav-brand-link" to="/">
                            KostHub<span className="dp-nav-brand-dot">.</span>
                        </Link>
                    </div>
                    <ul className="dp-nav-links">
                        <li className="dp-nav-item"><Link className="dp-nav-link" to="/">Home</Link></li>
                        <li className="dp-nav-item"><Link className="dp-nav-link" to="/gas-galon">Gas &amp; Galon</Link></li>
                        <li className="dp-nav-item"><Link className="dp-nav-link" to="/laundry">Laundry Express</Link></li>
                        <li className="dp-nav-item"><Link className="dp-nav-link active" to="/daily-cleaning">Daily Cleaning</Link></li>
                        <li className="dp-nav-item"><Link className="dp-nav-link" to="/tentang-kami">Tentang Kami</Link></li>
                    </ul>
                    <div className="dp-nav-actions">
                        <div className="dp-nav-actions-inner">
                            <button className="material-symbols-outlined dp-btn-icon">notifications</button>
                            <div className="dp-avatar">JD</div>
                        </div>
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
                        <div className="dp-grid-3">
                            {data.layanan.map((layanan) => {
                                const isChecked = selectedDuration?.id_layanan === layanan.id_layanan;
                                return (
                                    <label key={layanan.id_layanan} className="dp-card-radio">
                                        <input 
                                            className="dp-card-radio-input" 
                                            name="duration" 
                                            type="radio" 
                                            value={layanan.id_layanan} 
                                            checked={isChecked}
                                            onChange={() => setSelectedDuration(layanan)}
                                        />
                                        <div className="dp-card-radio-content">
                                            <div className="dp-card-title">{layanan.nama_layanan}</div>
                                            <div className="dp-card-price">Rp {parseInt(layanan.harga_layanan).toLocaleString('id-ID')}</div>
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
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>cleaning_services</span>
                            <h2 className="dp-section-title">Alat Pembersih</h2>
                        </div>
                        <div className="dp-checkbox-wrap">
                            <label className="dp-checkbox-label">
                                <input 
                                    className="dp-checkbox-input" 
                                    type="checkbox" 
                                    checked={sewaAlat}
                                    onChange={(e) => setSewaAlat(e.target.checked)}
                                />
                                <div>
                                    <div className="dp-checkbox-title">Sewa Alat Pembersih Tambahan dari Mitra</div>
                                    <div className="dp-checkbox-subtitle">+ Rp 15.000</div>
                                </div>
                            </label>
                        </div>
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
                                    {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'].map((time) => {
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
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>note_alt</span>
                            <h2 className="dp-section-title">Catatan untuk Mitra (Opsional)</h2>
                        </div>
                        <div className="dp-form-group">
                            <textarea 
                                className="dp-textarea" 
                                placeholder="Contoh: Tolong fokus bersihkan area kamar mandi..."
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
                            <h2 className="dp-summary-title">Ringkasan Pembayaran</h2>
                        </div>
                        <div className="dp-summary-list">
                            <div className="dp-summary-item">
                                <span className="dp-summary-item-label">Harga Paket</span>
                                <span className="dp-summary-item-value">Rp {parseInt(hargaPaket).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="dp-summary-item">
                                <span className="dp-summary-item-label">Biaya Tambahan Alat</span>
                                <span className="dp-summary-item-value">{biayaAlat > 0 ? `Rp ${biayaAlat.toLocaleString('id-ID')}` : '-'}</span>
                            </div>
                            <div className="dp-summary-item">
                                <span className="dp-summary-item-label">Biaya Transportasi</span>
                                <span className="dp-summary-item-value">Rp {biayaTransport.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="dp-summary-total">
                                <span className="dp-summary-total-label">Total Pembayaran</span>
                                <span className="dp-summary-total-value">Rp {total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                        <div className="dp-info-box">
                            <span className="material-symbols-outlined dp-info-icon">info</span>
                            <p className="dp-info-text">
                                Transaksi Anda dilindungi oleh Sistem Escrow KostHub. Dana akan diteruskan ke mitra hanya setelah layanan selesai sesuai pesanan Anda.
                            </p>
                        </div>
                        <button className="dp-btn-primary">
                            Lanjutkan ke Pembayaran
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </main>

            <footer className="dp-footer">
                <div className="dp-footer-inner">
                    <div className="dp-footer-brand">KostHub<span className="dp-footer-brand-dot">.</span></div>
                    <div className="dp-footer-links">
                        <a className="dp-footer-link" href="#">About Us</a>
                        <a className="dp-footer-link" href="#">Terms of Service</a>
                        <a className="dp-footer-link" href="#">Privacy Policy</a>
                        <a className="dp-footer-link" href="#">Contact</a>
                    </div>
                    <div className="dp-footer-copy">
                        © 2024 KostHub. Hyperlocal Marketplace.
                    </div>
                </div>
            </footer>
        </div>
    );
};
export default DailyCleaningDetail;
