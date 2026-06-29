import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import './HelpSupportMitra.css';
import '../MitraDashboard/MitraDashboard.css';

const HelpSupportMitra = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const mitraName = user.nama_mitra || user.nama_usaha || 'Mitra';
  const profilePictureUrl = user.foto_profil ? `http://localhost:8000/storage/${user.foto_profil}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(mitraName)}&background=004ac6&color=fff`;

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  useEffect(() => {
      const handleOutsideClick = () => setProfileMenuOpen(false);
      if (profileMenuOpen) {
          window.addEventListener('click', handleOutsideClick);
      }
      return () => window.removeEventListener('click', handleOutsideClick);
  }, [profileMenuOpen]);

  const handleLogout = async () => {
      try {
          await api.post('/v1/auth/logout');
      } catch (err) {}
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
  };

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
    <div className="help-support-mitra-container">
      {/* TopNavBar */}
      <nav className="help-support-mitra-navbar">
        <div className="help-support-mitra-brand">
          <a href="#" className="help-support-mitra-brand-link">
            KostHub<span className="help-support-mitra-brand-dot">.</span>
          </a>
        </div>
        <div className="help-support-mitra-nav-actions">
          <button className="help-support-mitra-icon-btn">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="help-support-mitra-icon-btn">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="md-topbar-profile-container" onClick={(e) => e.stopPropagation()}>
            <div className="md-topbar-profile" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
              <img
                className="md-topbar-avatar"
                src={profilePictureUrl}
                alt="Partner Profile"
              />
              <span className="md-topbar-name">{mitraName}</span>
              <span className="material-symbols-outlined md-profile-arrow">
                {profileMenuOpen ? 'expand_less' : 'expand_more'}
              </span>
            </div>

            {profileMenuOpen && (
              <div className="md-profile-dropdown">
                <div className="md-dropdown-info">
                  <img
                    className="md-dropdown-avatar"
                    src={profilePictureUrl}
                    alt="Partner Profile"
                  />
                  <div className="md-dropdown-meta">
                    <h4 className="md-dropdown-name">{mitraName}</h4>
                    <p className="md-dropdown-sub">{user.nomor_telepon || 'mitra@kosthub.com'}</p>
                    <span className="md-dropdown-badge">Mitra Aktif</span>
                  </div>
                </div>
                <div className="md-dropdown-actions">
                  <button className="md-dropdown-btn" onClick={() => { setPhotoModalOpen(true); setProfileMenuOpen(false); }}>
                    <span className="material-symbols-outlined">visibility</span>
                    Lihat Foto Profil
                  </button>
                  <button className="md-dropdown-btn md-btn-logout" onClick={handleLogout}>
                    <span className="material-symbols-outlined">logout</span>
                    Keluar / Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* SideNavBar */}
      <aside className="help-support-mitra-sidebar">
        <div className="help-support-mitra-sidebar-header">
          <div className="help-support-mitra-admin-info">
            <img 
              alt="KostHub Admin" 
              className="help-support-mitra-admin-avatar" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGYjeqX8fHQwiwWoGM55Tn_S265O77UcwSQ3I9oxzC6VEKAGOGmw5DlCMtPIJOrkS8hlluH2N6Qkd9h0nhOGuzQTCOngYr6OBPYGqHFog3-ALhupmVMNuC--NVRSQPHp8G-TJ-jLE02ulMXaS2ung3sH358WWxnDijTa7VKK4-dL2vI0n3-wrlT8unw7tsQcrAR7c_SPpSumAqsqPGAVMj9n0qzdPFCSJclO3iNv06yRgnW9bD94wiVS0wjKVWW3u-uJJ22gppitU" 
            />
            <div className="help-support-mitra-admin-text">
              <h2 className="help-support-mitra-admin-title">Admin Panel</h2>
              <p className="help-support-mitra-admin-subtitle">System Control</p>
              <div className="help-support-mitra-status-badge">
                <span className="help-support-mitra-status-dot"></span>
                <span className="help-support-mitra-status-text">System Status: Operational</span>
              </div>
            </div>
          </div>
        </div>
        <nav className="help-support-mitra-sidebar-nav">
          <Link className="help-support-mitra-nav-link" to="/dashboard/mitra">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Overview</span>
          </Link>
          <Link className="help-support-mitra-nav-link" to="/dashboard/mitra/orders">
            <span className="material-symbols-outlined">receipt_long</span>
            <span>Orders</span>
          </Link>
          <Link className="help-support-mitra-nav-link" to="/dashboard/mitra/inventory">
            <span className="material-symbols-outlined">inventory_2</span>
            <span>Inventory</span>
          </Link>
          <Link className="help-support-mitra-nav-link" to="/dashboard/mitra/chat">
            <span className="material-symbols-outlined">chat</span>
            <span>Chat</span>
          </Link>
          <Link className="help-support-mitra-nav-link" to="/dashboard/mitra/finance">
            <span className="material-symbols-outlined">payments</span>
            <span>Finance</span>
          </Link>
          <Link className="help-support-mitra-nav-link" to="/dashboard/mitra/reviews">
            <span className="material-symbols-outlined">star</span>
            <span>Reviews &amp; Performance</span>
          </Link>
          <Link className="help-support-mitra-nav-link active" to="/dashboard/mitra/support">
            <span className="material-symbols-outlined">support_agent</span>
            <span>Help &amp; Support</span>
          </Link>
          <Link className="help-support-mitra-nav-link" to="/dashboard/mitra/settings">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </nav>
        <div className="help-support-mitra-sidebar-footer">
          <button className="help-support-mitra-quick-support-btn">Quick Support</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="help-support-mitra-main-content">
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
      </main>

      {/* ═══ Detail Photo Modal ═══ */}
      {photoModalOpen && (
          <div className="md-photo-modal-overlay" onClick={() => setPhotoModalOpen(false)}>
              <div className="md-photo-modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="md-photo-modal-close" onClick={() => setPhotoModalOpen(false)}>
                      <span className="material-symbols-outlined">close</span>
                  </button>
                  <img
                      className="md-photo-modal-img"
                      src={profilePictureUrl}
                      alt="Partner Profile Detail"
                  />
                  <div className="md-photo-modal-footer">
                      <h3>{mitraName}</h3>
                      <p>{user.nomor_telepon || 'mitra@kosthub.com'}</p>
                  </div>
              </div>
          </div>
      )}

      {/* Footer */}
      <footer className="help-support-mitra-footer">
        <div className="help-support-mitra-footer-brand">
          <span className="help-support-mitra-brand-text">
            KostHub<span className="help-support-mitra-brand-dot">.</span>
          </span>
          <p className="help-support-mitra-copyright">© 2024 KostHub Hyperlocal Marketplace</p>
        </div>
        <div className="help-support-mitra-footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Partner Support</a>
        </div>
      </footer>
    </div>
  );
};

export default HelpSupportMitra;
