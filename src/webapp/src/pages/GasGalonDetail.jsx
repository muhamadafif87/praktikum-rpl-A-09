import './GasGalonDetail.css';
import React, { useState, useEffect } from 'react';
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
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [kondisi, setKondisi] = useState('refill'); // 'refill' or 'new'
    const [namaLengkap, setNamaLengkap] = useState('');
    const [noWa, setNoWa] = useState('');
    const [catatan, setCatatan] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Noted that backend uses 'galon-gas' for type_layanan
                const response = await api.get('/v1/landing-page/galon-gas/detail-pesanan', {
                    params: { id_mitra, type_layanan: 'galon-gas' }
                });
                setData(response.data.data);
                if (response.data.data?.layanan?.length > 0) {
                    setSelectedProduct(response.data.data.layanan[0]);
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

    const hargaBarang = selectedProduct ? (kondisi === 'refill' ? selectedProduct.harga_barang : selectedProduct.beli_baru || selectedProduct.harga_barang) : 0;
    const biayaPengiriman = 5000;
    const total = (parseInt(hargaBarang) || 0) + biayaPengiriman;

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
                        <li className="dp-nav-item"><Link className="dp-nav-link active" to="/gas-galon">Gas &amp; Galon</Link></li>
                        <li className="dp-nav-item"><Link className="dp-nav-link" to="/laundry">Laundry Express</Link></li>
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
                    <h1 className="dp-title">Pesan Gas &amp; Galon</h1>
                    <p className="dp-subtitle">Mitra: <span className="dp-subtitle-bold">{data.nama_mitra}</span></p>
                </div>

                <div className="dp-content-left">
                    <section className="dp-section">
                        <p className="dp-section-desc">Pilih kebutuhan Anda untuk pengiriman langsung ke kos.</p>
                        
                        <div className="dp-product-preview">
                            {data.layanan.map((product) => {
                                const isSelected = selectedProduct?.id_layanan === product.id_layanan;
                                return (
                                    <label key={product.id_layanan} className={`dp-product-card ${isSelected ? 'active' : ''}`}>
                                        <input 
                                            className="dp-product-radio" 
                                            name="product" 
                                            type="radio" 
                                            value={product.id_layanan}
                                            checked={isSelected}
                                            onChange={() => setSelectedProduct(product)}
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
                                    </label>
                                );
                            })}
                        </div>

                        <h2 className="dp-section-title-sm">Pilih Jenis Layanan</h2>
                        <div className="dp-vertical-radios">
                            <label className={`dp-vertical-card ${kondisi === 'refill' ? 'active' : ''}`}>
                                <input 
                                    className="dp-vertical-radio-input" 
                                    name="condition" 
                                    type="radio" 
                                    value="refill"
                                    checked={kondisi === 'refill'}
                                    onChange={() => setKondisi('refill')}
                                />
                                <div>
                                    <h3 className="dp-vertical-card-title">Isi Ulang / Tukar Kosongan</h3>
                                    <p className="dp-vertical-card-price">Rp {selectedProduct ? parseInt(selectedProduct.harga_barang).toLocaleString('id-ID') : 0}</p>
                                </div>
                            </label>

                            {kondisi === 'refill' && (
                                <div className="dp-alert-warning">
                                    <span className="material-symbols-outlined dp-alert-warning-icon" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                                    <p className="dp-alert-warning-text"><strong>Penting!</strong> Anda wajib menyerahkan tabung/galon kosong yang layak pakai saat kurir tiba di lokasi kos.</p>
                                </div>
                            )}

                            <label className={`dp-vertical-card ${kondisi === 'new' ? 'active' : ''}`}>
                                <input 
                                    className="dp-vertical-radio-input" 
                                    name="condition" 
                                    type="radio" 
                                    value="new"
                                    checked={kondisi === 'new'}
                                    onChange={() => setKondisi('new')}
                                />
                                <div>
                                    <h3 className="dp-vertical-card-title">Beli Baru + Tabung/Galon</h3>
                                    <p className="dp-vertical-card-price">Rp {selectedProduct ? (parseInt(selectedProduct.beli_baru) || 0).toLocaleString('id-ID') : 0}</p>
                                </div>
                            </label>
                        </div>

                        <h2 className="dp-section-title-sm">Detail Pengiriman</h2>
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
                        <div className="dp-summary-list">
                            <div className="dp-summary-item">
                                <span className="dp-summary-item-label">Subtotal</span>
                                <span className="dp-summary-item-value">Rp {parseInt(hargaBarang).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="dp-summary-item">
                                <span className="dp-summary-item-label">Biaya Pengiriman</span>
                                <span className="dp-summary-item-value">Rp {biayaPengiriman.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="dp-summary-total">
                                <span className="dp-summary-total-label">Total Sementara</span>
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
export default GasGalonDetail;
