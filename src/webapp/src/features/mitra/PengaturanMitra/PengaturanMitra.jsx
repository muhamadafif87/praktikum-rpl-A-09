import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import './PengaturanMitra.css';

const PengaturanMitra = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const mitraName = user.name || user.nama_usaha || 'Mitra';

  const [loading, setLoading] = useState(true);

  const [profilBisnis, setProfilBisnis] = useState({
    namaMitra: '',
    contactPerson: '',
    whatsapp: '',
    alamat: ''
  });

  const [jamOperasional, setJamOperasional] = useState({
    Senin: { start: '08:00', end: '20:00', active: true },
    Selasa: { start: '08:00', end: '20:00', active: true },
    Rabu: { start: '08:00', end: '20:00', active: true },
    Kamis: { start: '08:00', end: '20:00', active: true },
    Jumat: { start: '08:00', end: '20:00', active: true },
    Sabtu: { start: '08:00', end: '20:00', active: true },
    Minggu: { start: '08:00', end: '20:00', active: false }
  });

  const [layanan, setLayanan] = useState([
    { id: 'express', name: 'Laundry Express', desc: 'Selesai dalam 6 jam', price: 15000, active: true },
    { id: 'kering', name: 'Cuci Kering', desc: 'Reguler 2 hari', price: 8000, active: true }
  ]);

  const [keamanan, setKeamanan] = useState({
    twoFactor: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await api.get('/v1/dashboard/mitra/settings');
        if (response.data?.data) {
          if (response.data.data.profilBisnis) setProfilBisnis(response.data.data.profilBisnis);
          if (response.data.data.jamOperasional) setJamOperasional(response.data.data.jamOperasional);
          if (response.data.data.layanan) setLayanan(response.data.data.layanan);
          if (response.data.data.keamanan) setKeamanan(response.data.data.keamanan);
        }
      } catch (error) {
        console.warn('API /v1/mitra/settings belum tersedia, menggunakan fallback data dummy.');
        // Fallback data
        setProfilBisnis({
          namaMitra: 'Laundry Wangi Jaya',
          contactPerson: 'Budi Santoso',
          whatsapp: '+62 812-3456-7890',
          alamat: 'Jl. Merdeka No. 123, Jakarta Selatan'
        });
        setJamOperasional({
          Senin: { start: '08:00', end: '20:00', active: true },
          Selasa: { start: '08:00', end: '20:00', active: true },
          Rabu: { start: '08:00', end: '20:00', active: true },
          Kamis: { start: '08:00', end: '20:00', active: true },
          Jumat: { start: '08:00', end: '20:00', active: true },
          Sabtu: { start: '08:00', end: '20:00', active: true },
          Minggu: { start: '08:00', end: '20:00', active: false }
        });
        setLayanan([
          { id: 'express', name: 'Laundry Express', desc: 'Selesai dalam 6 jam', price: 15000, active: true },
          { id: 'kering', name: 'Cuci Kering', desc: 'Reguler 2 hari', price: 8000, active: true }
        ]);
        setKeamanan({
          twoFactor: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleProfilChange = (field, value) => {
    setProfilBisnis(prev => ({ ...prev, [field]: value }));
  };

  const handleJamChange = (day, field, value) => {
    setJamOperasional(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleLayananChange = (index, field, value) => {
    const newLayanan = [...layanan];
    newLayanan[index][field] = value;
    setLayanan(newLayanan);
  };

  return (
    <div className="pengaturan-mitra-container">
      {/* TopNavBar */}
      <nav className="pengaturan-mitra-navbar">
        <div className="pengaturan-mitra-brand">
          <Link to="/dashboard/mitra" className="pengaturan-mitra-brand-link">
            KostHub<span className="pengaturan-mitra-brand-dot">.</span>
          </Link>
        </div>
        <div className="pengaturan-mitra-nav-actions">
          <button className="pengaturan-mitra-icon-btn">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="pengaturan-mitra-icon-btn">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="pengaturan-mitra-user-profile">
            <img 
              alt="Partner Profile" 
              className="pengaturan-mitra-avatar" 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mitraName)}&background=004ac6&color=fff`} 
            />
            <span className="pengaturan-mitra-user-name">{mitraName}</span>
          </div>
        </div>
      </nav>

      {/* SideNavBar */}
      <aside className="pengaturan-mitra-sidebar">
        <div className="pengaturan-mitra-sidebar-header">
          <div className="pengaturan-mitra-admin-info">
            <img 
              alt="KostHub Admin" 
              className="pengaturan-mitra-admin-avatar" 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mitraName)}&background=004ac6&color=fff`} 
            />
            <div style={{ textAlign: 'center' }}>
              <h2 className="pengaturan-mitra-admin-title">Admin Panel</h2>
              <p className="pengaturan-mitra-admin-subtitle">System Control</p>
              <div className="pengaturan-mitra-status-badge">
                <span className="pengaturan-mitra-status-dot"></span>
                <span className="pengaturan-mitra-status-text">System Status: Operational</span>
              </div>
            </div>
          </div>
        </div>
        <nav className="pengaturan-mitra-sidebar-nav">
          <Link to="/dashboard/mitra" className={`pengaturan-mitra-nav-link ${location.pathname === '/dashboard/mitra' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span>Overview</span>
          </Link>
          <Link to="/dashboard/mitra/orders" className={`pengaturan-mitra-nav-link ${location.pathname === '/dashboard/mitra/orders' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">receipt_long</span>
            <span>Orders</span>
          </Link>
          <Link to="/dashboard/mitra/inventory" className={`pengaturan-mitra-nav-link ${location.pathname === '/dashboard/mitra/inventory' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">inventory_2</span>
            <span>Inventory</span>
          </Link>
          <Link to="/dashboard/mitra/chat" className={`pengaturan-mitra-nav-link ${location.pathname === '/dashboard/mitra/chat' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">chat</span>
            <span>Chat</span>
          </Link>
          <Link to="/dashboard/mitra/finance" className={`pengaturan-mitra-nav-link ${location.pathname === '/dashboard/mitra/finance' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">payments</span>
            <span>Finance</span>
          </Link>
          <Link to="/dashboard/mitra/reviews" className={`pengaturan-mitra-nav-link ${location.pathname === '/dashboard/mitra/reviews' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">star</span>
            <span>Reviews & Performance</span>
          </Link>
          <Link to="/dashboard/mitra/support" className={`pengaturan-mitra-nav-link ${location.pathname === '/dashboard/mitra/support' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">support_agent</span>
            <span>Help & Support</span>
          </Link>
          <Link to="/dashboard/mitra/settings" className={`pengaturan-mitra-nav-link ${location.pathname === '/dashboard/mitra/settings' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </nav>
        <div className="pengaturan-mitra-sidebar-footer">
          <button className="pengaturan-mitra-quick-support-btn">Quick Support</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pengaturan-mitra-main-content">
        {loading ? (
          <div className="pengaturan-mitra-loading-container">
            <span className="material-symbols-outlined pengaturan-mitra-spinner">progress_activity</span>
          </div>
        ) : (
          <>
            {/* Welcome Header */}
            <header className="pengaturan-mitra-header">
              <h1 className="pengaturan-mitra-title">Pengaturan Mitra</h1>
              <p className="pengaturan-mitra-description">Kelola profil bisnis, jam operasional, dan preferensi akun Anda.</p>
            </header>

            {/* Sections */}
            <div className="pengaturan-mitra-sections">
              
              {/* Profil Bisnis */}
              <section className="pengaturan-mitra-section-card">
                <h2 className="pengaturan-mitra-section-title">Profil Bisnis</h2>
                <div className="pengaturan-mitra-grid-2">
                  <div className="pengaturan-mitra-form-group">
                    <label>Nama Mitra</label>
                    <input 
                      type="text" 
                      value={profilBisnis.namaMitra} 
                      onChange={(e) => handleProfilChange('namaMitra', e.target.value)} 
                    />
                  </div>
                  <div className="pengaturan-mitra-form-group">
                    <label>Contact Person</label>
                    <input 
                      type="text" 
                      value={profilBisnis.contactPerson} 
                      onChange={(e) => handleProfilChange('contactPerson', e.target.value)} 
                    />
                  </div>
                  <div className="pengaturan-mitra-form-group">
                    <label>Nomor WhatsApp</label>
                    <input 
                      type="text" 
                      value={profilBisnis.whatsapp} 
                      onChange={(e) => handleProfilChange('whatsapp', e.target.value)} 
                    />
                  </div>
                  <div className="pengaturan-mitra-form-group">
                    <label>Alamat</label>
                    <input 
                      type="text" 
                      value={profilBisnis.alamat} 
                      onChange={(e) => handleProfilChange('alamat', e.target.value)} 
                    />
                  </div>
                </div>
                <button className="pengaturan-mitra-primary-btn" style={{ marginTop: '1rem' }}>Unggah Logo Baru</button>
              </section>

              {/* Jam Operasional */}
              <section className="pengaturan-mitra-section-card">
                <h2 className="pengaturan-mitra-section-title">Jam Operasional</h2>
                <div className="pengaturan-mitra-jam-list">
                  {Object.keys(jamOperasional).map(day => (
                    <div key={day} className="pengaturan-mitra-jam-item">
                      <span className="pengaturan-mitra-day-label">{day}</span>
                      <div className="pengaturan-mitra-jam-controls">
                        <div className="pengaturan-mitra-time-inputs">
                          <input 
                            type="time" 
                            value={jamOperasional[day].start} 
                            onChange={(e) => handleJamChange(day, 'start', e.target.value)}
                            disabled={!jamOperasional[day].active}
                          />
                          <span>-</span>
                          <input 
                            type="time" 
                            value={jamOperasional[day].end} 
                            onChange={(e) => handleJamChange(day, 'end', e.target.value)}
                            disabled={!jamOperasional[day].active}
                          />
                        </div>
                        <label className="pengaturan-mitra-toggle">
                          <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={jamOperasional[day].active}
                            onChange={(e) => handleJamChange(day, 'active', e.target.checked)}
                          />
                          <div className="pengaturan-mitra-toggle-bg"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Manajemen Layanan */}
              <section className="pengaturan-mitra-section-card">
                <h2 className="pengaturan-mitra-section-title">Manajemen Layanan</h2>
                <div className="pengaturan-mitra-layanan-list">
                  {layanan.map((item, index) => (
                    <div key={item.id} className="pengaturan-mitra-layanan-item">
                      <div>
                        <p className="pengaturan-mitra-layanan-name">{item.name}</p>
                        <p className="pengaturan-mitra-layanan-desc">{item.desc}</p>
                      </div>
                      <div className="pengaturan-mitra-layanan-controls">
                        <div className="pengaturan-mitra-price-input">
                          <span>Rp</span>
                          <input 
                            type="number" 
                            value={item.price} 
                            onChange={(e) => handleLayananChange(index, 'price', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <label className="pengaturan-mitra-toggle">
                          <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={item.active}
                            onChange={(e) => handleLayananChange(index, 'active', e.target.checked)}
                          />
                          <div className="pengaturan-mitra-toggle-bg"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Keamanan & Akun */}
              <section className="pengaturan-mitra-section-card">
                <h2 className="pengaturan-mitra-section-title">Keamanan & Akun</h2>
                <div className="pengaturan-mitra-security-list">
                  <button className="pengaturan-mitra-change-pwd-btn">
                    <div className="pengaturan-mitra-flex-center">
                      <span className="material-symbols-outlined">lock</span>
                      <span>Ubah Kata Sandi</span>
                    </div>
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                  
                  <div className="pengaturan-mitra-2fa-item">
                    <div className="pengaturan-mitra-flex-center">
                      <span className="material-symbols-outlined">verified_user</span>
                      <div>
                        <p className="pengaturan-mitra-2fa-name">Two-Factor Authentication (2FA)</p>
                        <p className="pengaturan-mitra-2fa-desc">Tingkatkan keamanan akun Anda</p>
                      </div>
                    </div>
                    <label className="pengaturan-mitra-toggle">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={keamanan.twoFactor}
                        onChange={(e) => setKeamanan({ ...keamanan, twoFactor: e.target.checked })}
                      />
                      <div className="pengaturan-mitra-toggle-bg"></div>
                    </label>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="pengaturan-mitra-action-buttons">
                <button className="pengaturan-mitra-btn-secondary">Batal</button>
                <button className="pengaturan-mitra-btn-primary">Simpan Perubahan</button>
              </div>

            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="pengaturan-mitra-footer">
        <div className="pengaturan-mitra-footer-brand">
          <span className="pengaturan-mitra-brand-text">
            KostHub<span className="pengaturan-mitra-brand-dot">.</span>
          </span>
          <p className="pengaturan-mitra-copyright">© 2024 KostHub Hyperlocal Marketplace</p>
        </div>
        <div className="pengaturan-mitra-footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Partner Support</a>
        </div>
      </footer>
    </div>
  );
};

export default PengaturanMitra;
