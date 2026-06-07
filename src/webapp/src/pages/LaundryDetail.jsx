import './LaundryDetail.css';
import React, { useState, useEffect } from 'react';
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
    const [selectedDurasi, setSelectedDurasi] = useState({ id: 'reguler', name: 'Reguler (2-3 Hari)', price: 0 });
    const [selectedKain, setSelectedKain] = useState([]);
    const [catatan, setCatatan] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/v1/landing-page/laundry-express/detail-pesanan', {
                    params: { id_mitra, type_layanan: 'laundry-express' }
                });
                setData(response.data.data);
                if (response.data.data?.layanan?.length > 0) {
                    setSelectedLayanan(response.data.data.layanan[0]);
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

    const handleKainChange = (kain) => {
        if (selectedKain.includes(kain)) {
            setSelectedKain(selectedKain.filter(item => item !== kain));
        } else {
            setSelectedKain([...selectedKain, kain]);
        }
    };

    const hargaLayanan = selectedLayanan ? selectedLayanan.harga_layanan : 0;
    const biayaDurasi = selectedDurasi.price;
    const estimasiAwal = (parseInt(hargaLayanan) || 0) + biayaDurasi;

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
                        <li className="dp-nav-item"><Link className="dp-nav-link active" to="/laundry">Laundry Express</Link></li>
                        <li className="dp-nav-item"><Link className="dp-nav-link" to="/daily-cleaning">Daily Cleaning</Link></li>
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
                                { id: 'reguler', name: 'Reguler (2-3 Hari)', price: 0 },
                                { id: 'express', name: 'Express (24 Jam)', price: 15000 },
                                { id: 'kilat', name: 'Kilat (12 Jam)', price: 25000 }
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
                            <span className="material-symbols-outlined dp-section-icon" style={{fontVariationSettings: "'FILL' 1"}}>checkroom</span>
                            <h2 className="dp-section-title">Jenis Pakaian / Item Tambahan</h2>
                        </div>
                        <p className="dp-section-desc" style={{marginBottom: 0}}>Pilih jika ada item khusus (Harga dihitung satuan)</p>
                        <div className="dp-kain-grid">
                            {[
                                { id: 'sprei', name: 'Sprei', icon: 'bed' },
                                { id: 'selimut', name: 'Selimut', icon: 'blanket' },
                                { id: 'jaket', name: 'Jaket / Mantel', icon: 'dry_cleaning' },
                                { id: 'boneka', name: 'Boneka', icon: 'toys' },
                                { id: 'sepatu', name: 'Sepatu', icon: 'steps' }
                            ].map((item) => {
                                const isChecked = selectedKain.includes(item.id);
                                return (
                                    <label key={item.id} className={`dp-kain-card ${isChecked ? 'active' : ''}`}>
                                        <input 
                                            className="dp-kain-checkbox" 
                                            type="checkbox" 
                                            checked={isChecked}
                                            onChange={() => handleKainChange(item.id)}
                                        />
                                        <span className="material-symbols-outlined dp-kain-icon" style={{fontVariationSettings: "'FILL' 1"}}>{item.icon}</span>
                                        <span className="dp-kain-name">{item.name}</span>
                                    </label>
                                );
                            })}
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
                        <div className="dp-summary-list">
                            <div className="dp-summary-item">
                                <span className="dp-summary-item-label">Layanan {selectedLayanan?.nama_layanan || ''}</span>
                                <span className="dp-summary-item-value">Rp {parseInt(hargaLayanan).toLocaleString('id-ID')} /kg</span>
                            </div>
                            <div className="dp-summary-item">
                                <span className="dp-summary-item-label">Durasi ({selectedDurasi.name})</span>
                                <span className="dp-summary-item-value">{biayaDurasi > 0 ? `+ Rp ${biayaDurasi.toLocaleString('id-ID')}` : 'Rp 0'}</span>
                            </div>
                            {selectedKain.length > 0 && (
                                <div className="dp-summary-item">
                                    <span className="dp-summary-item-label">Item Khusus ({selectedKain.length})</span>
                                    <span className="dp-summary-item-value">Harga menyesuaikan</span>
                                </div>
                            )}
                            <div className="dp-summary-total">
                                <span className="dp-summary-total-label">Estimasi Harga*</span>
                                <span className="dp-summary-total-value">Mulai Rp {estimasiAwal.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                        <div className="dp-info-box">
                            <span className="material-symbols-outlined dp-info-icon">info</span>
                            <p className="dp-info-text">
                                *Ini adalah estimasi biaya. Harga final akan ditentukan setelah mitra menimbang dan memeriksa pesanan Anda.
                            </p>
                        </div>
                        <button className="dp-btn-primary">
                            Buat Pesanan Laundry
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
export default LaundryDetail;
