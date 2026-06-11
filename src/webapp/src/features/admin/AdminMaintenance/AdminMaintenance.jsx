import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminMaintenance.css';

const TopNavBar = ({ onLogout }) => (
  <nav className="admin-top-nav">
    <div className="flex items-center space-x-4">
      <Link className="admin-top-nav-logo" to="/dashboard/admin">KostHub<span>.</span></Link>
    </div>
    <div className="admin-top-nav-actions">
      <button className="admin-top-nav-icon-btn"><span className="material-symbols-outlined">notifications</span></button>
      <button className="admin-top-nav-icon-btn"><span className="material-symbols-outlined">help</span></button>
      <div className="admin-top-nav-profile">
        <img alt="Partner Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT0AdV5Z5MUcPbHK72cL-plOTymvr7uuBk_yFfOKmFw6N8eFX5bLkJvVmL36BnchaNyQQvKniLE6v3dRpZ9fGAII4TxeHz_SQr9qp5-Ozy-EvMWWxwAVJlQJjVI8PgAwxi4iKwYgjuIwrgOIF89jQag9GTQwZNhx50L8lKH2qCyr_AKiZ9sxJ3Mw2dzts4Glv4-kKTMPrDGQJMBGYptN6XAlTDbWX7y2MPHrMDHiI4Vq573jjkeF_4shWpCCn2_9J1WE7UPgVAHOw" />
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
      <img alt="KostHub Admin" className="admin-side-nav-profile-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGYjeqX8fHQwiwWoGM55Tn_S265O77UcwSQ3I9oxzC6VEKAGOGmw5DlCMtPIJOrkS8hlluH2N6Qkd9h0nhOGuzQTCOngYr6OBPYGqHFog3-ALhupmVMNuC--NVRSQPHp8G-TJ-jLE02ulMXaS2ung3sH358WWxnDijTa7VKK4-dL2vI0n3-wrlT8unw7tsQcrAR7c_SPpSumAqsqPGAVMj9n0qzdPFCSJclO3iNv06yRgnW9bD94wiVS0wjKVWW3u-uJJ22gppitU" />
      <div className="admin-side-nav-title text-label-md">Admin Panel</div>
      <div className="admin-side-nav-subtitle text-label-sm">System Control</div>
    </div>
    <nav className="admin-side-nav-menu">
      <Link className="admin-side-nav-link" to="/dashboard/admin"><span className="material-symbols-outlined admin-side-nav-icon">dashboard</span><span className="text-label-md">Overview</span></Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/stock"><span className="material-symbols-outlined admin-side-nav-icon">inventory_2</span><span className="text-label-md">Inventory</span></Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/partners"><span className="material-symbols-outlined admin-side-nav-icon">group</span><span className="text-label-md">Partners List</span></Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/security"><span className="material-symbols-outlined admin-side-nav-icon">security</span><span className="text-label-md">Security</span></Link>
      <Link className="admin-side-nav-link active" to="/dashboard/admin/maintenance"><span className="material-symbols-outlined admin-side-nav-icon">build</span><span className="text-label-md">Maintenance</span></Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/settings"><span className="material-symbols-outlined admin-side-nav-icon">settings</span><span className="text-label-md">Settings</span></Link>
    </nav>
    <div className="admin-side-nav-footer"><button className="admin-support-btn text-label-md">Quick Support</button></div>
  </aside>
);

const Footer = () => (
  <footer className="admin-footer">
    <div className="admin-footer-left"><span className="admin-footer-logo">KostHub<span>.</span></span><p className="admin-footer-copyright text-label-sm">© 2024 KostHub Hyperlocal Marketplace</p></div>
    <div className="admin-footer-links"><a className="admin-footer-link text-label-sm" href="#">Privacy Policy</a><a className="admin-footer-link text-label-sm" href="#">Terms of Service</a><a className="admin-footer-link text-label-sm" href="#">Partner Support</a></div>
  </footer>
);

const AdminMaintenance = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

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
        const response = await axios.get('/v1/dashboard/admin/maintenance');
        if (typeof response.data === 'string' || !response.data || !response.data.stats) throw new Error("Invalid data");
        setData(response.data);
      } catch (error) {
        console.warn('Failed to fetch from backend, using dummy data', error);
        setData({
          stats: {
            serverStatus: { value: 'Optimal', note: 'Semua sistem berjalan normal' },
            lastBackup: { value: '2 Jam Lalu', note: 'Otomatis ke Cloud Storage' },
            systemVersion: { value: 'v2.4.1', note: 'Pembaruan tersedia (v2.5.0)', isTertiary: true },
            nextMaintenance: { value: '15 Jan, 02:00', note: 'Estimasi durasi: 30 menit' },
          },
          logs: [
            { time: '10:45:22', category: 'Database', desc: 'Optimasi indeks tabel transaksi', officer: 'Sistem', status: 'Berhasil' },
            { time: 'Yesterday', category: 'Security', desc: 'Pembaruan Patch Keamanan Mingguan', officer: 'Admin Central', status: 'Selesai' },
            { time: '05 Jan 2024', category: 'Backup', desc: 'Full System Backup - Data Marketplace', officer: 'Cloud Bot', status: 'Berhasil' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="admin-maintenance-page">
      <TopNavBar onLogout={handleLogout} />
      <SideNavBar />
      <main className="admin-main-content">
        <div className="admin-container">
          {loading ? (
            <div className="admin-maint-loading"><span className="material-symbols-outlined admin-maint-spinner">progress_activity</span></div>
          ) : data ? (
            <>
              <section>
                <header className="admin-maint-header">
                  <h1 className="text-headline-lg">Pemeliharaan Sistem</h1>
                  <p className="text-body-md">Manajemen jadwal pemeliharaan, cadangan data, dan pembaruan sistem.</p>
                </header>
                <div className="admin-maint-stats">
                  <div className="admin-maint-stat">
                    <div className="admin-maint-stat-top">
                      <span className="text-label-md admin-maint-stat-label">Status Server</span>
                      <span className="material-symbols-outlined admin-maint-stat-icon">cloud_done</span>
                    </div>
                    <div className="text-headline-lg admin-maint-stat-value">{data.stats.serverStatus.value}</div>
                    <div className="text-label-sm admin-maint-stat-note">{data.stats.serverStatus.note}</div>
                  </div>
                  <div className="admin-maint-stat">
                    <div className="admin-maint-stat-top">
                      <span className="text-label-md admin-maint-stat-label">Cadangan Terakhir</span>
                      <span className="material-symbols-outlined admin-maint-stat-icon">backup</span>
                    </div>
                    <div className="text-headline-lg admin-maint-stat-value">{data.stats.lastBackup.value}</div>
                    <div className="text-label-sm admin-maint-stat-note">{data.stats.lastBackup.note}</div>
                  </div>
                  <div className="admin-maint-stat">
                    <div className="admin-maint-stat-top">
                      <span className="text-label-md admin-maint-stat-label">Versi Sistem</span>
                      <span className="material-symbols-outlined admin-maint-stat-icon">update</span>
                    </div>
                    <div className="text-headline-lg admin-maint-stat-value">{data.stats.systemVersion.value}</div>
                    <div className="text-label-sm admin-maint-stat-note tertiary">{data.stats.systemVersion.note}</div>
                  </div>
                  <div className="admin-maint-stat">
                    <div className="admin-maint-stat-top">
                      <span className="text-label-md admin-maint-stat-label">Jadwal MT Berikutnya</span>
                      <span className="material-symbols-outlined admin-maint-stat-icon">event_repeat</span>
                    </div>
                    <div className="text-headline-lg admin-maint-stat-value">{data.stats.nextMaintenance.value}</div>
                    <div className="text-label-sm admin-maint-stat-note">{data.stats.nextMaintenance.note}</div>
                  </div>
                </div>
              </section>

              {/* Riwayat Pemeliharaan & Update */}
              <section className="admin-maint-section">
                <div className="admin-maint-section-header">
                  <h2 className="text-headline-sm admin-maint-section-title">Riwayat Pemeliharaan &amp; Update</h2>
                  <div className="admin-maint-section-tools">
                    <div className="admin-maint-search">
                      <span className="material-symbols-outlined admin-maint-search-icon">search</span>
                      <input className="admin-maint-search-input text-label-md" placeholder="Cari log..." type="text" />
                    </div>
                    <button className="admin-maint-date-btn text-label-md">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                      Rentang Waktu
                    </button>
                  </div>
                </div>
                <div className="admin-maint-table-wrap">
                  <table className="admin-maint-table">
                    <thead><tr className="text-label-sm"><th>Waktu</th><th>Kategori</th><th>Deskripsi Aktivitas</th><th>Petugas</th><th className="right">Status</th></tr></thead>
                    <tbody className="text-body-sm">
                      {data.logs.map((log, i) => (
                        <tr key={i}>
                          <td>{log.time}</td>
                          <td className="bold">{log.category}</td>
                          <td>{log.desc}</td>
                          <td className="muted">{log.officer}</td>
                          <td className="right"><span className="admin-maint-badge text-label-sm">{log.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Pusat Kontrol Pemeliharaan */}
              <section className="admin-maint-section">
                <div className="admin-maint-section-header">
                  <h2 className="text-headline-sm admin-maint-section-title">Pusat Kontrol Pemeliharaan</h2>
                </div>
                <div className="admin-maint-control-body">
                  <div className="admin-maint-toggle-row">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="admin-maint-toggle-label">Mode Pemeliharaan (Maintenance Mode)</span>
                      <span className="text-label-sm admin-maint-toggle-sub">Tampilkan halaman 'Sedang Perbaikan' ke pengguna</span>
                    </div>
                    <label className="admin-maint-toggle-switch">
                      <input type="checkbox" className="admin-maint-toggle-input" checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
                      <div className="admin-maint-toggle-track"><div className="admin-maint-toggle-thumb"></div></div>
                    </label>
                  </div>
                  <div className="admin-maint-actions-grid">
                    <button className="admin-maint-action-btn text-label-md">
                      <span className="material-symbols-outlined">cloud_upload</span> Jalankan Backup Sekarang
                    </button>
                    <button className="admin-maint-action-btn primary text-label-md">
                      <span className="material-symbols-outlined">system_update_alt</span> Cek Pembaruan
                    </button>
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminMaintenance;
