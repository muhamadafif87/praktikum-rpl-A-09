import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import './ChatMitra.css';

const ChatMitra = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const mitraName = user.name || user.nama_usaha || 'Mitra';

  const [loading, setLoading] = useState(true);
  const [chatStats] = useState({
    totalPercakapan: 18,
    butuhFollowUp: 5,
    sudahDihubungi: 13,
    rataRataRespon: '12 Menit'
  });

  useEffect(() => {
    const fetchChatStats = async () => {
      setLoading(true);
      try {
        const response = await api.get('/v1/mitra/chat/stats');
        if (response.data?.data) {
          setChatStats(response.data.data);
        }
      } catch (error) {
        console.warn('API /v1/mitra/chat/stats belum tersedia, menggunakan fallback data dummy.');
        // Fallback data is already the default state or we can leave it as is
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatStats();
  }, []);

  return (
    <div className="chat-mitra-container">
      {/* TopNavBar */}
      <nav className="chat-mitra-navbar">
        <div className="chat-mitra-brand">
          <a href="#" className="chat-mitra-brand-link">
            KostHub<span className="chat-mitra-brand-dot">.</span>
          </a>
        </div>
        <div className="chat-mitra-nav-actions">
          <button className="chat-mitra-icon-btn">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="chat-mitra-icon-btn">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="chat-mitra-user-profile">
            <img 
              alt="Partner Profile" 
              className="chat-mitra-avatar" 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mitraName)}&background=004ac6&color=fff`} 
            />
            <span className="chat-mitra-user-name">{mitraName}</span>
          </div>
        </div>
      </nav>

      {/* SideNavBar */}
      <aside className="chat-mitra-sidebar">
        <div className="chat-mitra-sidebar-header">
          <div className="chat-mitra-admin-info">
            <img 
              alt="KostHub Admin" 
              className="chat-mitra-admin-avatar" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGYjeqX8fHQwiwWoGM55Tn_S265O77UcwSQ3I9oxzC6VEKAGOGmw5DlCMtPIJOrkS8hlluH2N6Qkd9h0nhOGuzQTCOngYr6OBPYGqHFog3-ALhupmVMNuC--NVRSQPHp8G-TJ-jLE02ulMXaS2ung3sH358WWxnDijTa7VKK4-dL2vI0n3-wrlT8unw7tsQcrAR7c_SPpSumAqsqPGAVMj9n0qzdPFCSJclO3iNv06yRgnW9bD94wiVS0wjKVWW3u-uJJ22gppitU" 
            />
            <div className="chat-mitra-admin-text">
              <h2 className="chat-mitra-admin-title">Admin Panel</h2>
              <p className="chat-mitra-admin-subtitle">System Control</p>
              <div className="chat-mitra-status-badge">
                <span className="chat-mitra-status-dot"></span>
                <span className="chat-mitra-status-text">System Status: Operational</span>
              </div>
            </div>
          </div>
        </div>
        <nav className="chat-mitra-sidebar-nav">
          <Link className="chat-mitra-nav-link" to="/dashboard/mitra">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Overview</span>
          </Link>
          <Link className="chat-mitra-nav-link" to="/dashboard/mitra/orders">
            <span className="material-symbols-outlined">receipt_long</span>
            <span>Orders</span>
          </Link>
          <Link className="chat-mitra-nav-link" to="/dashboard/mitra/inventory">
            <span className="material-symbols-outlined">inventory_2</span>
            <span>Inventory</span>
          </Link>
          <Link className="chat-mitra-nav-link active" to="/dashboard/mitra/chat">
            <span className="material-symbols-outlined">chat</span>
            <span>Chat</span>
          </Link>
          <Link className="chat-mitra-nav-link" to="/dashboard/mitra/finance">
            <span className="material-symbols-outlined">payments</span>
            <span>Finance</span>
          </Link>
          <Link className="chat-mitra-nav-link" to="/dashboard/mitra/reviews">
            <span className="material-symbols-outlined">star</span>
            <span>Reviews &amp; Performance</span>
          </Link>
          <Link className="chat-mitra-nav-link" to="/dashboard/mitra/support">
            <span className="material-symbols-outlined">support_agent</span>
            <span>Help &amp; Support</span>
          </Link>
          <Link className="chat-mitra-nav-link" to="/dashboard/mitra/settings">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </nav>
        <div className="chat-mitra-sidebar-footer">
          <button className="chat-mitra-quick-support-btn">Quick Support</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="chat-mitra-main-content">
        {loading ? (
          <div className="chat-mitra-loading-container">
            <span className="material-symbols-outlined chat-mitra-spinner">progress_activity</span>
          </div>
        ) : (
          <>
            <header className="chat-mitra-header">
          <h1 className="chat-mitra-title">Pusat Kontak Pelanggan</h1>
          <p className="chat-mitra-description">Hubungi pelanggan Anda secara langsung melalui WhatsApp untuk koordinasi layanan.</p>
        </header>
        
        {/* Stats Row */}
        <div className="chat-mitra-stats-grid">
          <div className="chat-mitra-stat-card">
            <p className="chat-mitra-stat-label">Total Percakapan</p>
            <p className="chat-mitra-stat-value">{chatStats.totalPercakapan}</p>
          </div>
          <div className="chat-mitra-stat-card">
            <p className="chat-mitra-stat-label">Butuh Follow-up</p>
            <p className="chat-mitra-stat-value highlight-warning">{chatStats.butuhFollowUp}</p>
          </div>
          <div className="chat-mitra-stat-card">
            <p className="chat-mitra-stat-label">Sudah Dihubungi</p>
            <p className="chat-mitra-stat-value highlight-primary">{chatStats.sudahDihubungi}</p>
          </div>
          <div className="chat-mitra-stat-card">
            <p className="chat-mitra-stat-label">Rata-rata Respon</p>
            <p className="chat-mitra-stat-value highlight-secondary">{chatStats.rataRataRespon}</p>
          </div>
        </div>
        
        {/* Quick Messages Template */}
        <div className="chat-mitra-templates-section">
          <p className="chat-mitra-templates-title">Template Pesan Cepat</p>
          <div className="chat-mitra-templates-list">
            <button className="chat-mitra-template-btn">Konfirmasi Jemput</button>
            <button className="chat-mitra-template-btn">Tagihan Siap</button>
            <button className="chat-mitra-template-btn">Update Status</button>
            <button className="chat-mitra-template-btn">Minta Review</button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="chat-mitra-filters-section">
          <div className="chat-mitra-filters-group">
            <div className="chat-mitra-search-box">
              <span className="material-symbols-outlined chat-mitra-search-icon">search</span>
              <input className="chat-mitra-search-input" placeholder="Cari Nama Produk atau ID Inventaris" type="text" />
            </div>
            <div className="chat-mitra-select-box">
              <select className="chat-mitra-select">
                <option>Semua Status</option>
                <option>BARU</option>
                <option>PROSES</option>
                <option>SELESAI</option>
              </select>
              <span className="material-symbols-outlined chat-mitra-select-icon">expand_more</span>
            </div>
          </div>
          <button className="chat-mitra-export-btn">
            <span className="material-symbols-outlined">download</span> Export
          </button>
        </div>

        {/* Contact List, masih data dummy belum dinamis sesuai database,  
          diubah nanti */}
        <div className="chat-mitra-table-container">
          <div className="chat-mitra-table-header">
            <h2 className="chat-mitra-table-title">Daftar Kontak</h2>
          </div>
          <div className="chat-mitra-table-wrapper">
            <table className="chat-mitra-table">
              <thead>
                <tr>
                  <th>Pelanggan</th>
                  <th>Layanan Aktif</th>
                  <th>Waktu Pesanan</th>
                  <th>No. WhatsApp</th>
                  <th>Status Kontak</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="chat-mitra-customer-info">
                      <span className="chat-mitra-customer-name">Budi Santoso</span>
                      <span className="chat-mitra-customer-room">Kost A, Kamar 12</span>
                    </div>
                  </td>
                  <td>Laundry</td>
                  <td>10:30 WIB</td>
                  <td className="text-primary">+62 812-3456-7890</td>
                  <td>
                    <span className="chat-mitra-status-badge-table pending">BELUM DIHUBUNGI</span>
                  </td>
                  <td className="text-center">
                    <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="chat-mitra-whatsapp-btn" style={{ textDecoration: 'none' }}>
                      <span className="material-symbols-outlined">message</span> Chat via WhatsApp
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="chat-mitra-customer-info">
                      <span className="chat-mitra-customer-name">Siti Aminah</span>
                      <span className="chat-mitra-customer-room">Kost B, Kamar 05</span>
                    </div>
                  </td>
                  <td>Daily Cleaning</td>
                  <td>09:15 WIB</td>
                  <td className="text-primary">+62 899-8877-6655</td>
                  <td>
                    <span className="chat-mitra-status-badge-table contacted">SUDAH DIHUBUNGI</span>
                  </td>
                  <td className="text-center">
                    <a href="https://wa.me/6289988776655" target="_blank" rel="noopener noreferrer" className="chat-mitra-whatsapp-btn" style={{ textDecoration: 'none' }}>
                      <span className="material-symbols-outlined">message</span> Chat via WhatsApp
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="chat-mitra-customer-info">
                      <span className="chat-mitra-customer-name">Agus Pratama</span>
                      <span className="chat-mitra-customer-room">Kost C, Kamar 22</span>
                    </div>
                  </td>
                  <td>Gas &amp; Galon</td>
                  <td>14:20 WIB</td>
                  <td className="text-primary">+62 813-1122-3344</td>
                  <td>
                    <span className="chat-mitra-status-badge-table pending">BELUM DIHUBUNGI</span>
                  </td>
                  <td className="text-center">
                    <a href="https://wa.me/6281311223344" target="_blank" rel="noopener noreferrer" className="chat-mitra-whatsapp-btn" style={{ textDecoration: 'none' }}>
                      <span className="material-symbols-outlined">message</span> Chat via WhatsApp
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="chat-mitra-table-footer">
            <span className="chat-mitra-pagination-info">Showing 3 of 25 products</span>
            <div className="chat-mitra-pagination-actions">
              <button className="chat-mitra-pagination-btn disabled">Previous</button>
              <button className="chat-mitra-pagination-btn">Next</button>
            </div>
          </div>
        </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="chat-mitra-footer">
        <div className="chat-mitra-footer-brand">
          <span className="chat-mitra-brand-text">
            KostHub<span className="chat-mitra-brand-dot">.</span>
          </span>
          <p className="chat-mitra-copyright">© 2024 KostHub Hyperlocal Marketplace</p>
        </div>
        <div className="chat-mitra-footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Partner Support</a>
        </div>
      </footer>
    </div>
  );
};

export default ChatMitra;
