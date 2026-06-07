import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DetailDailyCleaning.css';

const DetailDailyCleaning = () => {
    const navigate = useNavigate();
    
    // State management
    const [duration, setDuration] = useState('2jam');
    const [addEquipment, setAddEquipment] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('10:00');
    const [notes, setNotes] = useState('');

    const timeSlots = [
        { time: '09:00', status: 'available' },
        { time: '10:00', status: 'available' },
        { time: '11:00', status: 'available' },
        { time: '13:00', status: 'available' },
        { time: '14:00', status: 'available' },
        { time: '15:00', status: 'full' }
    ];

    const getDurationLabel = () => {
        if (duration === '1jam') return '1 Jam (Ringan)';
        if (duration === '2jam') return '2 Jam (Sedang)';
        return '3 Jam (Berat)';
    };

    const getBasePrice = () => {
        if (duration === '1jam') return 35000;
        if (duration === '2jam') return 65000;
        return 90000;
    };

    const equipmentFee = addEquipment ? 15000 : 0;
    const transportFee = 10000;
    
    const total = getBasePrice() + equipmentFee + transportFee;

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    return (
        <div className="ddc-page">
            {/* TopNavBar */}
            <nav className="ddc-navbar">
                <div className="ddc-navbar__container">
                    <div className="ddc-navbar__brand">
                        <a href="/" className="ddc-navbar__logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                            KostHub<span className="ddc-navbar__logo-dot">.</span>
                        </a>
                    </div>
                    
                    <ul className="ddc-navbar__links">
                        <li><a className="ddc-navbar__link" onClick={() => navigate('/')}>Home</a></li>
                        <li><a className="ddc-navbar__link" onClick={() => navigate('/pesan/gas-galon')}>Gas &amp; Galon</a></li>
                        <li><a className="ddc-navbar__link" onClick={() => navigate('/laundry')}>Laundry Express</a></li>
                        <li><a className="ddc-navbar__link ddc-navbar__link--active" onClick={() => navigate('/pesan/daily-cleaning')}>Daily Cleaning</a></li>
                        <li><a className="ddc-navbar__link" onClick={() => navigate('/tentang-kami')}>Tentang Kami</a></li>
                    </ul>
                    
                    <div className="ddc-navbar__actions">
                        <button className="ddc-navbar__icon material-symbols-outlined">notifications</button>
                        <div className="ddc-navbar__avatar">JD</div>
                    </div>
                </div>
            </nav>

            {/* Progress Stepper */}
            <div className="ddc-stepper">
                <div className="ddc-stepper__container">
                    <div className="ddc-stepper__step ddc-stepper__step--completed">
                        <span className="material-symbols-outlined ddc-stepper__icon">check_circle</span>
                        <span>Pilih Mitra</span>
                    </div>
                    <div className="ddc-stepper__line"></div>
                    <div className="ddc-stepper__step ddc-stepper__step--active">
                        <div className="ddc-stepper__circle ddc-stepper__circle--active">2</div>
                        <span>Detail Pesanan</span>
                    </div>
                    <div className="ddc-stepper__line"></div>
                    <div className="ddc-stepper__step">
                        <div className="ddc-stepper__circle ddc-stepper__circle--pending">3</div>
                        <span>Pembayaran</span>
                    </div>
                </div>
            </div>

            <main className="ddc-main">
                {/* Header Title Section */}
                <div className="ddc-header">
                    <h1 className="ddc-header__title">Konfigurasi Pesanan Daily Cleaning</h1>
                    <p className="ddc-header__subtitle">Mitra: <strong className="ddc-header__strong">KlinKlin Bandung</strong></p>
                </div>

                {/* Left Panel: Configuration */}
                <div className="ddc-left-col">
                    {/* Paket Durasi */}
                    <section className="ddc-section">
                        <div className="ddc-section__header">
                            <span className="material-symbols-outlined ddc-section__icon" style={{fontVariationSettings: "'FILL' 1"}}>timer</span>
                            <h2 className="ddc-section__title">Pilih Paket Durasi</h2>
                        </div>
                        
                        <div className="ddc-duration-grid">
                            <label className={`ddc-duration-card ${duration === '1jam' ? 'ddc-duration-card--active' : ''}`} onClick={() => setDuration('1jam')}>
                                <input type="radio" name="duration" value="1jam" className="ddc-duration-card__input" checked={duration === '1jam'} onChange={() => setDuration('1jam')} />
                                <div className="ddc-duration-card__content">
                                    <div className="ddc-duration-card__title">1 Jam (Ringan)</div>
                                    <div className="ddc-duration-card__price">Rp 35.000</div>
                                    {duration === '1jam' && <span className="material-symbols-outlined ddc-duration-card__check" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>}
                                </div>
                            </label>

                            <label className={`ddc-duration-card ${duration === '2jam' ? 'ddc-duration-card--active' : ''}`} onClick={() => setDuration('2jam')}>
                                <input type="radio" name="duration" value="2jam" className="ddc-duration-card__input" checked={duration === '2jam'} onChange={() => setDuration('2jam')} />
                                <div className="ddc-duration-card__content">
                                    <div className="ddc-duration-card__title">2 Jam (Sedang)</div>
                                    <div className="ddc-duration-card__price">Rp 65.000</div>
                                    {duration === '2jam' && <span className="material-symbols-outlined ddc-duration-card__check" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>}
                                </div>
                            </label>

                            <label className={`ddc-duration-card ${duration === '3jam' ? 'ddc-duration-card--active' : ''}`} onClick={() => setDuration('3jam')}>
                                <input type="radio" name="duration" value="3jam" className="ddc-duration-card__input" checked={duration === '3jam'} onChange={() => setDuration('3jam')} />
                                <div className="ddc-duration-card__content">
                                    <div className="ddc-duration-card__title">3 Jam (Berat)</div>
                                    <div className="ddc-duration-card__price">Rp 90.000</div>
                                    {duration === '3jam' && <span className="material-symbols-outlined ddc-duration-card__check" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>}
                                </div>
                            </label>
                        </div>
                    </section>

                    {/* Alat Pembersih */}
                    <section className="ddc-section">
                        <div className="ddc-section__header">
                            <span className="material-symbols-outlined ddc-section__icon" style={{fontVariationSettings: "'FILL' 1"}}>cleaning_services</span>
                            <h2 className="ddc-section__title">Alat Pembersih</h2>
                        </div>
                        
                        <label className={`ddc-checkbox-card ${addEquipment ? 'ddc-checkbox-card--active' : ''}`} onClick={() => setAddEquipment(!addEquipment)}>
                            <input 
                                type="checkbox" 
                                className="ddc-checkbox-card__input" 
                                checked={addEquipment} 
                                onChange={() => setAddEquipment(!addEquipment)}
                            />
                            <div className="ddc-checkbox-card__content">
                                <div className="ddc-checkbox-card__title">Sewa Alat Pembersih Tambahan dari Mitra</div>
                                <div className="ddc-checkbox-card__price">+ Rp 15.000</div>
                            </div>
                        </label>
                    </section>

                    {/* Pilih Tanggal & Jam */}
                    <section className="ddc-section">
                        <div className="ddc-section__header">
                            <span className="material-symbols-outlined ddc-section__icon" style={{fontVariationSettings: "'FILL' 1"}}>event</span>
                            <h2 className="ddc-section__title">Pilih Tanggal &amp; Jam Pembersihan</h2>
                        </div>

                        <div className="ddc-datetime-container">
                            <div className="ddc-form-group">
                                <label className="ddc-form-label">Tanggal</label>
                                <input 
                                    type="date" 
                                    className="ddc-date-input" 
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                />
                            </div>
                            
                            <div className="ddc-form-group">
                                <label className="ddc-form-label">Pilih Jam</label>
                                <div className="ddc-time-grid">
                                    {timeSlots.map((slot) => {
                                        if (slot.status === 'full') {
                                            return (
                                                <div key={slot.time} className="ddc-time-btn--disabled-wrapper">
                                                    <div className="ddc-time-btn--disabled">{slot.time}</div>
                                                    <span className="ddc-time-btn__badge">Penuh</span>
                                                </div>
                                            );
                                        }
                                        
                                        const isActive = bookingTime === slot.time;
                                        return (
                                            <button 
                                                key={slot.time} 
                                                type="button"
                                                className={`ddc-time-btn ${isActive ? 'ddc-time-btn--active' : ''}`}
                                                onClick={() => setBookingTime(slot.time)}
                                            >
                                                {slot.time}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Catatan */}
                    <section className="ddc-section">
                        <div className="ddc-section__header">
                            <span className="material-symbols-outlined ddc-section__icon" style={{fontVariationSettings: "'FILL' 1"}}>note_alt</span>
                            <h2 className="ddc-section__title">Catatan untuk Mitra (Opsional)</h2>
                        </div>
                        
                        <textarea 
                            className="ddc-notes-input" 
                            placeholder="Contoh: Tolong fokus bersihkan area kamar mandi dan bawa cairan pembersih kerak..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                    </section>
                </div>

                {/* Right Panel: Sticky Billing Summary */}
                <div className="ddc-right-col">
                    <div className="ddc-summary-card">
                        <div className="ddc-summary__header">
                            <span className="material-symbols-outlined ddc-summary__icon" style={{fontVariationSettings: "'FILL' 1"}}>receipt_long</span>
                            <h2 className="ddc-summary__title">Ringkasan Pembayaran</h2>
                        </div>
                        
                        <div className="ddc-summary__rows">
                            <div className="ddc-summary__row">
                                <span className="ddc-summary__label">Harga Paket ({getDurationLabel()})</span>
                                <span className="ddc-summary__value">{formatRupiah(getBasePrice())}</span>
                            </div>
                            <div className="ddc-summary__row">
                                <span className="ddc-summary__label">Biaya Tambahan Alat</span>
                                <span className="ddc-summary__value">{addEquipment ? formatRupiah(equipmentFee) : '-'}</span>
                            </div>
                            <div className="ddc-summary__row">
                                <span className="ddc-summary__label">Biaya Transportasi</span>
                                <span className="ddc-summary__value">{formatRupiah(transportFee)}</span>
                            </div>
                            <div className="ddc-summary__total-row">
                                <span className="ddc-summary__total-label">Total Pembayaran Sementara</span>
                                <span className="ddc-summary__total-value">{formatRupiah(total)}</span>
                            </div>
                        </div>
                        
                        <div className="ddc-summary__info">
                            <span className="material-symbols-outlined ddc-summary__info-icon">info</span>
                            <p className="ddc-summary__info-text">
                                Transaksi Anda dilindungi oleh Sistem Escrow KostHub. Dana akan diteruskan ke mitra hanya setelah layanan selesai sesuai pesanan Anda.
                            </p>
                        </div>
                        
                        <button type="button" className="ddc-summary__btn" onClick={handleCheckout}>
                            Lanjutkan ke Pembayaran
                            <span className="material-symbols-outlined" style={{fontSize: '18px'}}>arrow_forward</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="ddc-footer">
                <div className="ddc-footer__container">
                    <div className="ddc-footer__brand">
                        KostHub<span className="ddc-footer__brand-dot">.</span>
                    </div>
                    <div className="ddc-footer__links">
                        <a className="ddc-footer__link">About Us</a>
                        <a className="ddc-footer__link">Terms of Service</a>
                        <a className="ddc-footer__link">Privacy Policy</a>
                        <a className="ddc-footer__link">Contact</a>
                    </div>
                    <div className="ddc-footer__copyright">
                        © 2024 KostHub. Hyperlocal Marketplace.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DetailDailyCleaning;
