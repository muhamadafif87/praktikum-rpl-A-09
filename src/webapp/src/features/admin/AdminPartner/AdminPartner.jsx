import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminPartner.css';

// --- Sub-components ---

const TopNavBar = ({ onLogout }) => (
  <nav className="admin-top-nav">
    <div className="flex items-center space-x-4">
      <Link className="admin-top-nav-logo" to="/dashboard/admin">
        KostHub<span>.</span>
      </Link>
    </div>
    <div className="admin-top-nav-actions">
      <button className="admin-top-nav-icon-btn">
        <span className="material-symbols-outlined">notifications</span>
      </button>
      <button className="admin-top-nav-icon-btn">
        <span className="material-symbols-outlined">help</span>
      </button>
      <div className="admin-top-nav-profile">
        <img
          alt="Partner Profile"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT0AdV5Z5MUcPbHK72cL-plOTymvr7uuBk_yFfOKmFw6N8eFX5bLkJvVmL36BnchaNyQQvKniLE6v3dRpZ9fGAII4TxeHz_SQr9qp5-Ozy-EvMWWxwAVJlQJjVI8PgAwxi4iKwYgjuIwrgOIF89jQag9GTQwZNhx50L8lKH2qCyr_AKiZ9sxJ3Mw2dzts4Glv4-kKTMPrDGQJMBGYptN6XAlTDbWX7y2MPHrMDHiI4Vq573jjkeF_4shWpCCn2_9J1WE7UPgVAHOw"
        />
        <span className="text-label-md admin-top-nav-profile-name">Admin Central</span>
      </div>
      <button className="admin-logout-btn" onClick={onLogout} title="Logout">
        <span className="material-symbols-outlined">logout</span>
      </button>
    </div>
  </nav>
);

const SideNavBar = () => (
  <aside className="admin-side-nav">
    <div className="admin-side-nav-header">
      <img
        alt="KostHub Admin"
        className="admin-side-nav-profile-img"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGYjeqX8fHQwiwWoGM55Tn_S265O77UcwSQ3I9oxzC6VEKAGOGmw5DlCMtPIJOrkS8hlluH2N6Qkd9h0nhOGuzQTCOngYr6OBPYGqHFog3-ALhupmVMNuC--NVRSQPHp8G-TJ-jLE02ulMXaS2ung3sH358WWxnDijTa7VKK4-dL2vI0n3-wrlT8unw7tsQcrAR7c_SPpSumAqsqPGAVMj9n0qzdPFCSJclO3iNv06yRgnW9bD94wiVS0wjKVWW3u-uJJ22gppitU"
      />
      <div className="admin-side-nav-title text-label-md">Admin Panel</div>
      <div className="admin-side-nav-subtitle text-label-sm">System Control</div>
    </div>
    <nav className="admin-side-nav-menu">
      <Link className="admin-side-nav-link" to="/dashboard/admin">
        <span className="material-symbols-outlined admin-side-nav-icon">dashboard</span>
        <span className="text-label-md">Overview</span>
      </Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/stock">
        <span className="material-symbols-outlined admin-side-nav-icon">inventory_2</span>
        <span className="text-label-md">Inventory</span>
      </Link>
      <Link className="admin-side-nav-link active" to="/dashboard/admin/partners">
        <span className="material-symbols-outlined admin-side-nav-icon">group</span>
        <span className="text-label-md">Partners List</span>
      </Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/security">
        <span className="material-symbols-outlined admin-side-nav-icon">security</span>
        <span className="text-label-md">Security</span>
      </Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/maintenance">
        <span className="material-symbols-outlined admin-side-nav-icon">build</span>
        <span className="text-label-md">Maintenance</span>
      </Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/settings">
        <span className="material-symbols-outlined admin-side-nav-icon">settings</span>
        <span className="text-label-md">Settings</span>
      </Link>
    </nav>
    <div className="admin-side-nav-footer">
      <button className="admin-support-btn text-label-md">Quick Support</button>
    </div>
  </aside>
);

const Footer = () => (
  <footer className="admin-footer">
    <div className="admin-footer-left">
      <span className="admin-footer-logo">
        KostHub<span>.</span>
      </span>
      <p className="admin-footer-copyright text-label-sm">© 2024 KostHub Hyperlocal Marketplace</p>
    </div>
    <div className="admin-footer-links">
      <a className="admin-footer-link text-label-sm" href="#">Privacy Policy</a>
      <a className="admin-footer-link text-label-sm" href="#">Terms of Service</a>
      <a className="admin-footer-link text-label-sm" href="#">Partner Support</a>
    </div>
  </footer>
);

// --- Partner Components ---

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="admin-stats-grid">
      <div className="admin-stat-card">
        <span className="text-label-md admin-stat-title">Total Mitra</span>
        <div className="text-headline-lg admin-stat-value">{stats.totalMitra}</div>
        <div className="text-label-sm admin-stat-desc">Terdaftar di sistem</div>
      </div>
      <div className="admin-stat-card warning">
        <div className="admin-stat-header">
          <span className="text-label-md admin-stat-title">Mitra Aktif</span>
          <span className="material-symbols-outlined admin-stat-icon primary">verified_user</span>
        </div>
        <div className="text-headline-lg admin-stat-value">{stats.mitraAktif}</div>
        <div className="text-label-sm admin-stat-desc success" style={{color: 'var(--color-primary)'}}>Beroperasi normal</div>
      </div>
      <div className="admin-stat-card critical">
        <div className="admin-stat-header">
          <span className="text-label-md admin-stat-title">Pendaftaran Baru</span>
          <span className="material-symbols-outlined admin-stat-icon warning">person_add</span>
        </div>
        <div className="text-headline-lg admin-stat-value">{stats.pendaftaranBaru}</div>
        <div className="text-label-sm admin-stat-desc warning">Minggu ini</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-header">
          <span className="text-label-md admin-stat-title">Mitra Di-Suspend</span>
          <span className="material-symbols-outlined admin-stat-icon critical">block</span>
        </div>
        <div className="text-headline-lg admin-stat-value critical">{stats.mitraSuspend}</div>
        <div className="text-label-sm admin-stat-desc critical">
          Tindakan diperlukan
        </div>
      </div>
    </div>
  );
};

const PartnersTable = ({ data }) => {
  if (!data) return null;

  return (
    <section className="admin-table-section">
      <div className="admin-table-header">
        <h2 className="text-headline-sm admin-table-title">Status Kemitraan</h2>
        <div className="admin-table-actions">
          <div className="admin-search-wrapper">
            <span className="material-symbols-outlined admin-search-icon">search</span>
            <input 
              className="admin-search-input text-label-md" 
              placeholder="Cari mitra..." 
              type="text" 
            />
          </div>
          <button className="admin-filter-btn text-label-md">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>filter_list</span> 
            Filter
          </button>
        </div>
      </div>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr className="text-label-sm">
              <th>Nama Mitra</th>
              <th>Jenis Layanan</th>
              <th>Lokasi</th>
              <th>Status</th>
              <th>Rating</th>
              <th className="right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-body-sm">
            {data.map((item, index) => {
              const isActive = item.status === 'Aktif';
              
              return (
                <tr key={index}>
                  <td className={`admin-td-font-medium ${!isActive ? 'admin-td-muted' : ''}`}>
                    {item.name}
                  </td>
                  <td>{item.type}</td>
                  <td className="admin-td-muted">{item.location}</td>
                  <td>
                    <span className={`admin-status-badge text-label-sm ${isActive ? 'active' : 'suspend'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-rating-cell">
                      <span className="material-symbols-outlined admin-star-icon">star</span>
                      {item.rating}
                    </div>
                  </td>
                  <td className="right">
                    {isActive ? (
                      <button className="admin-action-btn text-label-md">Lihat Detail</button>
                    ) : (
                      <div className="admin-actions-group">
                        <button className="admin-action-btn text-label-md">Lihat Detail</button>
                        <button className="admin-action-btn text-label-md">Activate</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// --- Main Component ---

const AdminPartner = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [partnersData, setPartnersData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try { await axios.post('/api/v1/auth/logout', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); } catch (err) { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Attempt to fetch from backend
        const response = await axios.get('/v1/dashboard/admin/partners');
        
        if (!response.data || !response.data.stats || !response.data.partners) {
          throw new Error("Invalid data structure received");
        }
        
        setStatsData(response.data.stats);
        setPartnersData(response.data.partners);
      } catch (error) {
        console.warn('Failed to fetch from backend, using dummy data', error);
        
        // Fallback to dummy data exactly as in the HTML
        setStatsData({
          totalMitra: "342",
          mitraAktif: "328",
          pendaftaranBaru: "5",
          mitraSuspend: "9"
        });
        
        setPartnersData([
          { name: "Kost Sejahtera Raya", type: "Gas & Galon", location: "Sukabirus", status: "Aktif", rating: "4.8" },
          { name: "Laundry Bersih Selalu", type: "Laundry", location: "PGA", status: "Aktif", rating: "4.9" },
          { name: "Kost Amanah", type: "Daily Cleaning", location: "Sukapura", status: "Suspend", rating: "3.2" },
          { name: "Galon Cepat Budi", type: "Gas & Galon", location: "Cikoneng", status: "Aktif", rating: "4.5" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-partner-page">
      <TopNavBar onLogout={handleLogout} />
      <SideNavBar />
      
      <main className="admin-main-content">
        <div className="admin-container">
          <section className="admin-header-section">
            <h1 className="text-headline-lg admin-header-title">Daftar Mitra</h1>
            <p className="text-body-md admin-header-desc">Manajemen dan pengawasan seluruh mitra layanan KostHub.</p>
          </section>

          {loading ? (
            <div className="admin-loading-container">
              <span className="material-symbols-outlined admin-spinner">progress_activity</span>
            </div>
          ) : (
            <>
              <StatsCards stats={statsData} />
              <PartnersTable data={partnersData} />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPartner;
