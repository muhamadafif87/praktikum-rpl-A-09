import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DetailMitraCleaning.css';

// Data mitra daily cleaning (static data - nanti bisa diganti dari API backend Laravel + Supabase)
const mitraData = [
    {
        id: 1,
        name: 'KostBersih Solo',
        distance: '0.9 KM',
        rating: 4.8,
        reviewCount: 156,
        description: 'Jasa bersih-bersih kamar kos profesional. Melayani sapu, pel, lap debu, hingga cuci piring. Staff terlatih dan menggunakan alat kebersihan berkualitas.',
        price: 'Mulai dari Rp 35.000/sesi',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBahTHHcsbnLrH2d1sYgl2LFaA_tYi3UBqcn0fMpk2ktaL-UTY9JikZaMr_UmYexLZKQYWGAYEq6XmBHUevi1G4Yra1sLbnyeQtPYh9464mRPv0OSOrdvMvKCe9kHzBTNItQVoFZ3CfWmOs56h3M97i-pqEgmBco2D-pE51ezyAN297xjp07ulfd2hFoCxAmYFY7PfmcvfwUmZqb_qfHFANXaz4as-TdnbVU4k0xz6vcIXSdxbDU7Rgfh0mhVJnsIVQH-aiYR7JkmU',
        reviews: [
            { name: 'Ade', rating: '5.0', text: 'Kamar jadi kinclong, mantap!' },
            { name: 'Afif', rating: '4.8', text: 'Bersih dan rapi, recommended' },
            { name: 'Aerio', rating: '5.0', text: 'Langganan tiap minggu' },
        ],
        marqueeSpeed: '30s',
    },
    {
        id: 2,
        name: 'Sparkling Clean UNS',
        distance: '1.3 KM',
        rating: 4.9,
        reviewCount: 198,
        description: 'Layanan cleaning premium khusus area kos mahasiswa UNS. Tersedia paket lengkap termasuk rapikan kamar, ganti sprei, dan pembersihan kamar mandi.',
        price: 'Mulai dari Rp 40.000/sesi',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLoMsMeQDJox5uHwi7g8W9LOMW0uI-_WBzencNuurllWzxLeyOKBxyUd3et-XUK27wMgmHR8JDyQ057CTdrU40vtsNbGwcAt8_GBiuMR_Clv_cE1zOiwv82VwfUYDaFITtplTOvrCvi5V_m9F4yY9N2iEaLClVFAnGSlocM9ay3pZvU67AH-fS2E-yIcingNhSLIXXiMOj7U56tCnplrEgjFSqkNkJ5FH4PbjiMGnrtBRsIYap0ZLagvUNCXlLQh-aD9SMIQbGlu8',
        reviews: [
            { name: 'Ade', rating: '5.0', text: 'Paket lengkap worth it!' },
            { name: 'Afif', rating: '4.9', text: 'Staff ramah dan teliti' },
            { name: 'Aerio', rating: '5.0', text: 'Kamar mandi jadi wangi' },
        ],
        marqueeSpeed: '25s',
    },
    {
        id: 3,
        name: 'Rapih Kos Jebres',
        distance: '2.0 KM',
        rating: 4.5,
        reviewCount: 73,
        description: 'Jasa cleaning murah untuk anak kos area Jebres. Cocok buat yang sibuk kuliah dan butuh bantuan bersih-bersih mingguan dengan harga terjangkau.',
        price: 'Mulai dari Rp 30.000/sesi',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2sTHRoVQPgOtt6O544pQtG5gy0gwW77ECi_DR6gJcfYUyBoeh4GV1M9FVuRYvUAxV6PJ6jjz8BSllW57EQacjxGmxQpnaliiO0qXxGpx0crhe_Q6j_S-3ae73kgKbMaMsK6R2yzqCerV-vpG3MerFJiCq8ARvLSULYu0d5r3jWWiloa7malq4nVW2JiqQnMy6mRAmEuqTvSzNxI2Ak4b6-sU1dLLtuGkcQ928wVxI25BaL_j1Ny6e6lM5hxRFDqmWUEv5qSnR4s8',
        reviews: [
            { name: 'Ade', rating: '4.5', text: 'Murah tapi tetap bersih' },
            { name: 'Afif', rating: '4.8', text: 'Harga mahasiswa banget' },
            { name: 'Aerio', rating: '4.5', text: 'Jadwal fleksibel, oke!' },
        ],
        marqueeSpeed: '35s',
    },
];

const DetailMitraCleaning = ({ onOrderClick }) => {
    const navigate = useNavigate();
    const [selectedCategories, setSelectedCategories] = useState(['sapu_pel']);
    const [sortBy, setSortBy] = useState('terdekat');

    const handleCategoryChange = (category) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const handleOrderClick = (mitra) => {
        const token = localStorage.getItem('token');
        if (!token) {
            if (onOrderClick) {
                onOrderClick(mitra);
            }
        } else {
            console.log('Melanjutkan pemesanan untuk:', mitra.name);
        }
    };

    return (
        <div className="detail-mitra-cleaning-page">
            {/* TopNavBar */}
            <nav className="dmc-navbar">
                <div className="dmc-navbar-inner">
                    <div className="dmc-brand">
                        <Link to="/" className="dmc-brand-link">
                            KostHub<span className="dmc-brand-dot">.</span>
                        </Link>
                    </div>

                    <ul className="dmc-nav-links">
                        <li className="dmc-nav-item">
                            <Link className="dmc-nav-link" to="/">Home</Link>
                        </li>
                        <li className="dmc-nav-item">
                            <Link className="dmc-nav-link" to="/gas-galon">Gas &amp; Galon</Link>
                        </li>
                        <li className="dmc-nav-item">
                            <Link className="dmc-nav-link" to="/laundry">Laundry Express</Link>
                        </li>
                        <li className="dmc-nav-item">
                            <Link className="dmc-nav-link dmc-nav-link--active" to="/daily-cleaning">Daily Cleaning</Link>
                        </li>
                        <li className="dmc-nav-item">
                            <a className="dmc-nav-link" href="#">Tentang Kami</a>
                        </li>
                    </ul>

                    <div className="dmc-nav-actions">
                        <button onClick={() => navigate('/login')} className="dmc-btn-nav">
                            Masuk / Daftar
                        </button>
                    </div>
                </div>
            </nav>

            <main>
                <section className="dmc-subheader">
                    <div className="dmc-subheader-inner">
                        <nav className="dmc-breadcrumb">
                            <Link to="/">Layanan</Link>
                            <span className="material-symbols-outlined">chevron_right</span>
                            <span className="dmc-breadcrumb-current">Daily Cleaning</span>
                        </nav>
                        <div className="dmc-location">
                            <span className="material-symbols-outlined">location_on</span>
                            <h1 className="dmc-location-title">
                                Menampilkan mitra di dekat: <span className="dmc-location-highlight">Jl. Ir. Sutami, Jebres, Surakarta</span>
                            </h1>
                        </div>
                    </div>
                </section>

                <div className="dmc-main-layout">
                    <aside className="dmc-sidebar">
                        <div className="dmc-sidebar-inner">
                            <div className="dmc-filter-header">
                                <h2 className="dmc-filter-title">Filter</h2>
                                <button className="dmc-filter-reset" onClick={() => setSelectedCategories(['sapu_pel'])}>
                                    Reset
                                </button>
                            </div>

                            <div>
                                <div className="dmc-filter-group">
                                    <label className="dmc-filter-label">Kategori</label>
                                    <div className="dmc-filter-options">
                                        {[
                                            { key: 'sapu_pel', label: 'Sapu & Pel' },
                                            { key: 'cuci_piring', label: 'Cuci Piring' },
                                            { key: 'rapikan_kamar', label: 'Rapikan Kamar' },
                                            { key: 'paket_lengkap', label: 'Paket Lengkap' },
                                        ].map((cat) => (
                                            <label key={cat.key} className="dmc-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    className="dmc-checkbox-input"
                                                    checked={selectedCategories.includes(cat.key)}
                                                    onChange={() => handleCategoryChange(cat.key)}
                                                />
                                                <span className="dmc-checkbox-text">{cat.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="dmc-filter-group">
                                    <label className="dmc-filter-label">Urutkan</label>
                                    <select
                                        className="dmc-filter-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="terdekat">Terdekat</option>
                                        <option value="harga">Harga Terendah</option>
                                        <option value="rating">Rating Tertinggi</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="dmc-card-list">
                        {mitraData.map((mitra) => (
                            <article key={mitra.id} className="dmc-card">
                                <div className="dmc-card-body">
                                    <div className="dmc-card-img-wrapper">
                                        <img className="dmc-card-img" src={mitra.image} alt={mitra.name} />
                                    </div>
                                    <div className="dmc-card-content">
                                        <div>
                                            <div className="dmc-card-header">
                                                <h3 className="dmc-card-title">{mitra.name}</h3>
                                                <span className="dmc-card-badge">Berada dalam jangkauan ({mitra.distance})</span>
                                            </div>
                                            <div className="dmc-card-rating">
                                                <span className="material-symbols-outlined">star</span>
                                                <span className="dmc-card-rating-value">{mitra.rating}</span>
                                                <span className="dmc-card-rating-count">({mitra.reviewCount} Ulasan)</span>
                                            </div>
                                            <p className="dmc-card-desc">{mitra.description}</p>
                                        </div>
                                        <div className="dmc-card-footer">
                                            <div className="dmc-card-price">{mitra.price}</div>
                                            <button className="dmc-card-order-btn" onClick={() => handleOrderClick(mitra)}>
                                                Pesan Sekarang
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="dmc-marquee-section">
                                    <div className="dmc-marquee-container">
                                        <div className="dmc-marquee-content" style={{ animationDuration: mitra.marqueeSpeed }}>
                                            {[...mitra.reviews, ...mitra.reviews].map((review, idx) => (
                                                <div key={idx} className="dmc-review-chip">
                                                    <span className="dmc-review-name">{review.name}</span>
                                                    <span className="dmc-review-rating">{review.rating}★</span>
                                                    <span className="dmc-review-text">"{review.text}"</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            </main>

            <footer className="dmc-footer">
                <div className="dmc-footer-inner">
                    <div className="dmc-footer-brand">
                        <Link to="/" className="dmc-brand-link">
                            KostHub<span className="dmc-brand-dot">.</span>
                        </Link>
                    </div>
                    <div className="dmc-footer-links">
                        <a className="dmc-footer-link" href="#">Syarat &amp; Ketentuan</a>
                        <a className="dmc-footer-link" href="#">Kebijakan Privasi</a>
                        <a className="dmc-footer-link" href="#">Hubungi Kami</a>
                    </div>
                    <p className="dmc-footer-copy">© 2024 KostHub. Seluruh hak cipta dilindungi.</p>
                </div>
            </footer>
        </div>
    );
};

export default DetailMitraCleaning;
