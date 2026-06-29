import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import MitraLayout from '../../../components/MitraLayout/MitraLayout';
import './HelpSupportMitra.css';

const HelpSupportMitra = () => {
  const [loading, setLoading] = useState(true);
  const [supportData, setSupportData] = useState({
    stats: {
      tiketAktif: 2,
      waktuRespon: '< 30 Menit',
      faqPopuler: '15 Topik',
      statusLayanan: 'Normal'
    },
    topics: [
      {
        icon: 'receipt_long',
        title: 'Masalah Pesanan',
        description: 'Kendala pengiriman, pesanan dibatalkan, atau status pesanan.'
      },
      {
        icon: 'account_balance_wallet',
        title: 'Pencairan Saldo',
        description: 'Informasi penarikan dana, jadwal pencairan, dan riwayat transaksi.'
      },
      {
        icon: 'inventory_2',
        title: 'Manajemen Inventaris',
        description: 'Cara menambah produk, update stok, dan pengelolaan kategori.'
      },
      {
        icon: 'security',
        title: 'Keamanan Akun',
        description: 'Lupa kata sandi, verifikasi dua langkah, dan keamanan profil.'
      },
      {
        icon: 'menu_book',
        title: 'Panduan Layanan',
        description: 'Tutorial dasar penggunaan dashboard dan fitur-fitur baru.'
      }
    ]
  });

  useEffect(() => {
    const fetchSupportData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/v1/dashboard/mitra/help-support');
        if (response.data?.data) {
          setSupportData(response.data.data);
        }
      } catch (error) {
        console.warn('API /v1/dashboard/mitra/help-support belum tersedia, menggunakan fallback data dummy.');
        // Fallback data is already the default state
      } finally {
        setLoading(false);
      }
    };
    
    fetchSupportData();
  }, []);

  return (
    <MitraLayout activePage="support">
      {loading ? (
        <div className="help-support-mitra-loading-container">
          <span className="material-symbols-outlined help-support-mitra-spinner">progress_activity</span>
        </div>
      ) : (
        <>
          {/* Welcome Header */}
          <header className="help-support-mitra-header">
            <h1 className="help-support-mitra-title">Bantuan &amp; Dukungan</h1>
            <p className="help-support-mitra-description">Pusat bantuan dan dukungan teknis untuk mitra KostHub.</p>
          </header>

          {/* Stats Row */}
          <div className="help-support-mitra-stats-grid">
            <div className="help-support-mitra-stat-card">
              <p className="help-support-mitra-stat-label">Tiket Aktif</p>
              <p className="help-support-mitra-stat-value">{supportData.stats.tiketAktif}</p>
            </div>
            <div className="help-support-mitra-stat-card">
              <p className="help-support-mitra-stat-label">Waktu Respon Rata-rata</p>
              <p className="help-support-mitra-stat-value highlight-primary">{supportData.stats.waktuRespon}</p>
            </div>
            <div className="help-support-mitra-stat-card">
              <p className="help-support-mitra-stat-label">FAQ Populer</p>
              <p className="help-support-mitra-stat-value">{supportData.stats.faqPopuler}</p>
            </div>
            <div className="help-support-mitra-stat-card">
              <p className="help-support-mitra-stat-label">Status Layanan</p>
              <div className="help-support-mitra-status-inline">
                <span className={`help-support-mitra-status-dot ${supportData.stats.statusLayanan === 'Normal' ? 'normal' : 'issue'}`}></span>
                <p className={`help-support-mitra-stat-value ${supportData.stats.statusLayanan === 'Normal' ? 'highlight-success' : 'highlight-warning'}`}>
                  {supportData.stats.statusLayanan}
                </p>
              </div>
            </div>
          </div>

          <section className="help-support-mitra-content-section">
            {/* Search */}
            <div className="help-support-mitra-search-container">
              <span className="material-symbols-outlined help-support-mitra-search-icon">search</span>
              <input 
                className="help-support-mitra-search-input" 
                placeholder="Cari bantuan atau pertanyaan..." 
                type="text" 
              />
            </div>

            {/* Topics Grid */}
            <div className="help-support-mitra-topics-grid">
              {supportData.topics.map((topic, index) => (
                <div key={index} className="help-support-mitra-topic-card">
                  <span className="material-symbols-outlined help-support-mitra-topic-icon">{topic.icon}</span>
                  <h3 className="help-support-mitra-topic-title">{topic.title}</h3>
                  <p className="help-support-mitra-topic-desc">{topic.description}</p>
                </div>
              ))}
            </div>

            {/* Contact Support Block */}
            <div className="help-support-mitra-contact-block">
              <h2 className="help-support-mitra-contact-title">Butuh Bantuan Lebih Lanjut?</h2>
              <p className="help-support-mitra-contact-desc">Tim support kami siap membantu Anda 24/7.</p>
              <div className="help-support-mitra-contact-actions">
                <button className="help-support-mitra-btn-primary">
                  <span className="material-symbols-outlined">chat</span> Hubungi Support Admin
                </button>
                <button className="help-support-mitra-btn-secondary">
                  <span className="material-symbols-outlined">confirmation_number</span> Buka Tiket Baru
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </MitraLayout>
  );
};

export default HelpSupportMitra;
