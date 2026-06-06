import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DetailGasGalon.css';

const DetailGasGalon = () => {
    const navigate = useNavigate();
    
    // State management
    const [selectedProduct, setSelectedProduct] = useState('gas-3kg');
    const [serviceType, setServiceType] = useState('refill');
    const [quantity, setQuantity] = useState(1);
    
    // Form state
    const [formData, setFormData] = useState({
        namaLengkap: '',
        whatsapp: '',
        catatan: ''
    });

    const handleProductChange = (val) => setSelectedProduct(val);
    const handleServiceChange = (val) => setServiceType(val);
    
    const handleQuantityChange = (delta) => {
        setQuantity(prev => {
            const newVal = prev + delta;
            return newVal > 0 ? newVal : 1; // Minimum quantity is 1
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckout = () => {
        // In a real app, you would dispatch state to redux or context here
        navigate('/checkout');
    };

    // Calculate subtotal
    const getBasePrice = () => {
        if (selectedProduct === 'gas-3kg') {
            return serviceType === 'refill' ? 20000 : 180000;
        } else {
            return serviceType === 'refill' ? 22000 : 180000;
        }
    };
    
    const subtotal = getBasePrice() * quantity;
    const shippingFee = 5000;
    const total = subtotal + shippingFee;

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    return (
        <div className="dp-page">
            {/* TopNavBar */}
            <nav className="dp-navbar">
                <div className="dp-navbar__container">
                    <div className="dp-navbar__brand">
                        <a href="/" className="dp-navbar__logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                            KostHub<span className="dp-navbar__logo-dot">.</span>
                        </a>
                    </div>
                    
                    <ul className="dp-navbar__links">
                        <li><a className="dp-navbar__link" onClick={() => navigate('/')}>Home</a></li>
                        <li><a className="dp-navbar__link dp-navbar__link--active" onClick={() => navigate('/pesan/gas-galon')}>Gas &amp; Galon</a></li>
                        <li><a className="dp-navbar__link" onClick={() => navigate('/laundry')}>Laundry Express</a></li>
                        <li><a className="dp-navbar__link" onClick={() => navigate('/daily-cleaning')}>Daily Cleaning</a></li>
                        <li><a className="dp-navbar__link" onClick={() => navigate('/tentang-kami')}>Tentang Kami</a></li>
                    </ul>
                    
                    <div className="dp-navbar__actions">
                        <button className="dp-navbar__icon material-symbols-outlined">notifications</button>
                        <div className="dp-navbar__avatar">JD</div>
                    </div>
                </div>
            </nav>

            {/* Progress Stepper */}
            <div className="dp-stepper">
                <div className="dp-stepper__container">
                    <div className="dp-stepper__step dp-stepper__step--completed">
                        <span className="material-symbols-outlined dp-stepper__icon">check_circle</span>
                        <span>Pilih Mitra</span>
                    </div>
                    <div className="dp-stepper__line"></div>
                    <div className="dp-stepper__step dp-stepper__step--active">
                        <div className="dp-stepper__circle dp-stepper__circle--active">2</div>
                        <span>Detail Pesanan</span>
                    </div>
                    <div className="dp-stepper__line"></div>
                    <div className="dp-stepper__step">
                        <div className="dp-stepper__circle dp-stepper__circle--pending">3</div>
                        <span>Pembayaran</span>
                    </div>
                </div>
            </div>

            <main className="dp-main">
                {/* Header Title Section */}
                <div className="dp-header">
                    <h1 className="dp-header__title">Pesan Gas &amp; Galon</h1>
                    <p className="dp-header__subtitle">Mitra: <strong>Toko Makmur Jaya</strong></p>
                </div>

                {/* Left Column: Product Selection */}
                <div className="dp-left-col">
                    <section className="dp-section-box">
                        <p className="dp-section-desc">Pilih kebutuhan Anda untuk pengiriman langsung ke kos.</p>
                        
                        {/* Product Preview */}
                        <div className="dp-product-grid">
                            {/* Product 1 */}
                            <label className={`dp-card-select ${selectedProduct === 'gas-3kg' ? 'dp-card-select--active' : ''}`} onClick={() => handleProductChange('gas-3kg')}>
                                <input 
                                    type="radio" 
                                    name="product" 
                                    className="dp-card-select__input"
                                    checked={selectedProduct === 'gas-3kg'}
                                    onChange={() => handleProductChange('gas-3kg')}
                                />
                                <div className="dp-card-select__content">
                                    <div className="dp-card-select__icon-box">
                                        <span className="material-symbols-outlined dp-card-select__icon" style={{fontVariationSettings: "'FILL' 1"}}>propane</span>
                                    </div>
                                    <div>
                                        <h3 className="dp-card-select__title">Gas LPG 3kg</h3>
                                        <p className="dp-card-select__subtitle">Mulai dari Rp 20.000</p>
                                        <span className="dp-card-select__badge">Stok: 15</span>
                                    </div>
                                </div>
                            </label>

                            {/* Product 2 */}
                            <label className={`dp-card-select ${selectedProduct === 'galon-19l' ? 'dp-card-select--active' : ''}`} onClick={() => handleProductChange('galon-19l')}>
                                <input 
                                    type="radio" 
                                    name="product" 
                                    className="dp-card-select__input"
                                    checked={selectedProduct === 'galon-19l'}
                                    onChange={() => handleProductChange('galon-19l')}
                                />
                                <div className="dp-card-select__content">
                                    <div className="dp-card-select__icon-box">
                                        <span className="material-symbols-outlined dp-card-select__icon" style={{fontVariationSettings: "'FILL' 1"}}>water_drop</span>
                                    </div>
                                    <div>
                                        <h3 className="dp-card-select__title">Galon Aqua 19L</h3>
                                        <p className="dp-card-select__subtitle">Mulai dari Rp 22.000</p>
                                        <span className="dp-card-select__badge">Stok: Tersedia</span>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Quantity Selection */}
                        <div style={{ marginBottom: '24px' }}>
                            <h2 className="dp-section-title">Jumlah</h2>
                            <div className="dp-qty">
                                <button type="button" className="dp-qty__btn" onClick={() => handleQuantityChange(-1)}>
                                    <span className="material-symbols-outlined" style={{fontSize: '20px'}}>remove</span>
                                </button>
                                <span className="dp-qty__val">{quantity}</span>
                                <button type="button" className="dp-qty__btn" onClick={() => handleQuantityChange(1)}>
                                    <span className="material-symbols-outlined" style={{fontSize: '20px'}}>add</span>
                                </button>
                            </div>
                        </div>

                        {/* Asset Condition Selection */}
                        <h2 className="dp-section-title">Pilih Jenis Layanan</h2>
                        <div className="dp-service-options">
                            {/* Option A */}
                            <label className={`dp-card-select ${serviceType === 'refill' ? 'dp-card-select--active' : ''}`} onClick={() => handleServiceChange('refill')}>
                                <input 
                                    type="radio" 
                                    name="condition" 
                                    className="dp-card-select__input"
                                    value="refill"
                                    checked={serviceType === 'refill'}
                                    onChange={() => handleServiceChange('refill')}
                                />
                                <div>
                                    <h3 className="dp-card-select__title dp-card-select__title--small">Isi Ulang / Tukar Kosongan</h3>
                                    <p className="dp-card-select__subtitle dp-card-select__subtitle--large">Rp {selectedProduct === 'gas-3kg' ? '20.000' : '22.000'}</p>
                                </div>
                            </label>

                            {/* Warning Box for Option A */}
                            {serviceType === 'refill' && (
                                <div className="dp-warning-box">
                                    <span className="material-symbols-outlined dp-warning-box__icon" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                                    <p className="dp-warning-box__text"><strong>Penting!</strong> Anda wajib menyerahkan tabung/galon kosong yang layak pakai saat kurir tiba di lokasi kos.</p>
                                </div>
                            )}

                            {/* Option B */}
                            <label className={`dp-card-select ${serviceType === 'new' ? 'dp-card-select--active' : ''}`} onClick={() => handleServiceChange('new')}>
                                <input 
                                    type="radio" 
                                    name="condition" 
                                    className="dp-card-select__input"
                                    value="new"
                                    checked={serviceType === 'new'}
                                    onChange={() => handleServiceChange('new')}
                                />
                                <div>
                                    <h3 className="dp-card-select__title dp-card-select__title--small">Beli Baru + Tabung/Galon</h3>
                                    <p className="dp-card-select__subtitle dp-card-select__subtitle--large">Rp 180.000</p>
                                </div>
                            </label>
                        </div>

                        {/* Delivery Information Form */}
                        <h2 className="dp-section-title dp-section-title--bordered">Detail Pengiriman</h2>
                        <form className="dp-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="dp-form__group">
                                <label className="dp-form__label">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    name="namaLengkap"
                                    className="dp-form__input" 
                                    placeholder="Masukkan nama Anda"
                                    value={formData.namaLengkap}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="dp-form__group">
                                <label className="dp-form__label">Nomor WhatsApp</label>
                                <input 
                                    type="tel" 
                                    name="whatsapp"
                                    className="dp-form__input" 
                                    placeholder="08xxxxxxxxxx"
                                    value={formData.whatsapp}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="dp-form__group">
                                <label className="dp-form__label">Catatan Pengiriman</label>
                                <textarea 
                                    name="catatan"
                                    className="dp-form__input dp-form__input--textarea" 
                                    placeholder="Contoh: Titip di Bapak Kos" 
                                    rows="2"
                                    value={formData.catatan}
                                    onChange={handleFormChange}
                                ></textarea>
                            </div>
                        </form>
                    </section>
                </div>

                {/* Right Column: Sticky Billing Summary */}
                <div className="dp-right-col">
                    <div className="dp-summary-card">
                        <div className="dp-summary__header">
                            <span className="material-symbols-outlined dp-summary__icon" style={{fontVariationSettings: "'FILL' 1"}}>receipt_long</span>
                            <h2 className="dp-summary__title">Ringkasan Pembayaran</h2>
                        </div>
                        
                        <div className="dp-summary__rows">
                            <div className="dp-summary__row">
                                <span className="dp-summary__label">Subtotal ({quantity}x {selectedProduct === 'gas-3kg' ? 'Gas' : 'Galon'})</span>
                                <span className="dp-summary__value">{formatRupiah(subtotal)}</span>
                            </div>
                            <div className="dp-summary__row">
                                <span className="dp-summary__label">Biaya Pengiriman</span>
                                <span className="dp-summary__value">{formatRupiah(shippingFee)}</span>
                            </div>
                            <div className="dp-summary__total-row">
                                <span className="dp-summary__total-label">Total Pembayaran Sementara</span>
                                <span className="dp-summary__total-value">{formatRupiah(total)}</span>
                            </div>
                        </div>
                        
                        <div className="dp-summary__info">
                            <span className="material-symbols-outlined dp-summary__info-icon">info</span>
                            <p className="dp-summary__info-text">
                                Transaksi Anda dilindungi oleh Sistem Escrow KostHub. Dana akan diteruskan ke mitra hanya setelah layanan selesai sesuai pesanan Anda.
                            </p>
                        </div>
                        
                        <button type="button" className="dp-summary__btn" onClick={handleCheckout}>
                            Lanjutkan ke Pembayaran
                            <span className="material-symbols-outlined" style={{fontSize: '18px'}}>arrow_forward</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="dp-footer">
                <div className="dp-footer__container">
                    <div className="dp-footer__brand">
                        KostHub<span className="dp-footer__brand-dot">.</span>
                    </div>
                    <div className="dp-footer__links">
                        <a className="dp-footer__link">About Us</a>
                        <a className="dp-footer__link">Terms of Service</a>
                        <a className="dp-footer__link">Privacy Policy</a>
                        <a className="dp-footer__link">Contact</a>
                    </div>
                    <div className="dp-footer__copyright">
                        © 2024 KostHub. Hyperlocal Marketplace.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DetailGasGalon;
