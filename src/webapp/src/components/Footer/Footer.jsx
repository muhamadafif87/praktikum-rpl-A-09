import React, { useState } from 'react';
import './Footer.css';

const LegalModal = ({ type, onClose }) => {
    let title = '';
    let content = null;

    if (type === 'terms') {
        title = 'Syarat & Ketentuan';
        content = (
            <div className="kh-legal-body">
                <h4>1. Penggunaan Layanan KostHub</h4>
                <p>Selamat datang di KostHub. Dengan mengakses dan menggunakan layanan kami, Anda menyetujui seluruh syarat dan ketentuan yang berlaku. Layanan ini diperuntukkan bagi mahasiswa dan masyarakat umum di area Solo dan sekitarnya.</p>
                
                <h4>2. Pemesanan & Pembayaran</h4>
                <p>Semua transaksi yang dilakukan melalui platform KostHub dilindungi oleh sistem keamanan <strong>Escrow</strong>. Dana Anda akan ditahan dengan aman dan hanya diteruskan ke Mitra KostHub setelah layanan selesai atau barang diterima dengan baik.</p>
                <ul>
                    <li>Pembayaran dapat dilakukan melalui metode transfer yang tersedia.</li>
                    <li>KostHub berhak membatalkan pesanan apabila terindikasi adanya kecurangan.</li>
                </ul>

                <h4>3. Pembatalan & Pengembalian Dana (Refund)</h4>
                <p>Pembatalan hanya dapat dilakukan sebelum status pesanan berubah menjadi "Diproses" oleh Mitra. Pengembalian dana akan diproses maksimal 2x24 jam kerja ke rekening atau metode pembayaran asal Anda.</p>

                <h4>4. Tanggung Jawab Mitra</h4>
                <p>Setiap layanan (Laundry, Daily Cleaning, Gas & Galon) disediakan oleh Mitra KostHub independen. KostHub bertindak sebagai perantara dan menjamin keamanan transaksi Anda.</p>
            </div>
        );
    } else if (type === 'privacy') {
        title = 'Kebijakan Privasi';
        content = (
            <div className="kh-legal-body">
                <h4>1. Pengumpulan Data Informasi</h4>
                <p>KostHub mengumpulkan informasi pribadi yang Anda berikan secara langsung saat mendaftar atau memesan layanan, seperti Nama, Nomor Telepon, Alamat Kos/Apartemen, dan Titik Koordinat Pengiriman.</p>

                <h4>2. Penggunaan Data</h4>
                <p>Data yang kami kumpulkan semata-mata digunakan untuk:</p>
                <ul>
                    <li>Memastikan Mitra KostHub dapat menemukan lokasi pengiriman Anda dengan akurat.</li>
                    <li>Mempercepat proses *checkout* di masa mendatang.</li>
                    <li>Meningkatkan kualitas layanan KostHub secara keseluruhan.</li>
                </ul>

                <h4>3. Keamanan Data Pengguna</h4>
                <p>KostHub berkomitmen untuk melindungi privasi Anda. Kami tidak akan menjual, menyewakan, atau mendistribusikan data pribadi dan riwayat pesanan Anda ke pihak ketiga manapun tanpa izin eksplisit dari Anda, kecuali jika diwajibkan oleh hukum yang berlaku.</p>
            </div>
        );
    } else if (type === 'contact') {
        title = 'Hubungi Kami';
        content = (
            <div className="kh-legal-body">
                <p style={{ textAlign: 'center', fontSize: '1.05rem' }}>
                    Punya pertanyaan, kendala pesanan, atau butuh bantuan lebih lanjut?<br/>Tim Customer Service KostHub siap sedia membantu Anda!
                </p>

                <div className="kh-contact-box">
                    <span className="material-symbols-outlined">support_agent</span>
                    <div>Kirim Email ke:</div>
                    <span className="kh-contact-email">support@kosthub.id</span>
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#15803d' }}>
                        Waktu Operasional CS:<br/>
                        Senin - Minggu (08:00 - 22:00 WIB)
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="kh-legal-overlay" onClick={onClose}>
            <div className="kh-legal-modal" onClick={(e) => e.stopPropagation()}>
                <div className="kh-legal-header">
                    <h3>{title}</h3>
                    <button className="kh-legal-close" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                {content}
            </div>
        </div>
    );
};

const Footer = () => {
    const [activeModal, setActiveModal] = useState(null);

    return (
        <>
            <footer className="kh-footer-container">
                <div className="kh-footer-logo">
                    KostHub<span>.</span>
                </div>
                
                <div className="kh-footer-links">
                    <button className="kh-footer-link" onClick={() => setActiveModal('terms')}>
                        Syarat & Ketentuan
                    </button>
                    <button className="kh-footer-link" onClick={() => setActiveModal('privacy')}>
                        Kebijakan Privasi
                    </button>
                    <button className="kh-footer-link" onClick={() => setActiveModal('contact')}>
                        Hubungi Kami
                    </button>
                </div>

                <div className="kh-footer-copy">
                    © {new Date().getFullYear()} KostHub. Seluruh hak cipta dilindungi.
                </div>
            </footer>

            {/* Render Modal if active */}
            {activeModal && (
                <LegalModal 
                    type={activeModal} 
                    onClose={() => setActiveModal(null)} 
                />
            )}
        </>
    );
};

export default Footer;
