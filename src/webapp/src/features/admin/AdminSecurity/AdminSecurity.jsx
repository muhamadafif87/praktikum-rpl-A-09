import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AdminSecurity.css';

// --- Sub-components (same pattern as AdminOverview) ---

const TopNavBar = () => (
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
        <img alt="Partner Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT0AdV5Z5MUcPbHK72cL-plOTymvr7uuBk_yFfOKmFw6N8eFX5bLkJvVmL36BnchaNyQQvKniLE6v3dRpZ9fGAII4TxeHz_SQr9qp5-Ozy-EvMWWxwAVJlQJjVI8PgAwxi4iKwYgjuIwrgOIF89jQag9GTQwZNhx50L8lKH2qCyr_AKiZ9sxJ3Mw2dzts4Glv4-kKTMPrDGQJMBGYptN6XAlTDbWX7y2MPHrMDHiI4Vq573jjkeF_4shWpCCn2_9J1WE7UPgVAHOw" />
        <span className="text-label-md admin-top-nav-profile-name">Admin Central</span>
      </div>
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
      <Link className="admin-side-nav-link" to="/dashboard/admin">
        <span className="material-symbols-outlined admin-side-nav-icon">dashboard</span>
        <span className="text-label-md">Overview</span>
      </Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/stock">
        <span className="material-symbols-outlined admin-side-nav-icon">inventory_2</span>
        <span className="text-label-md">Inventory</span>
      </Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/partners">
        <span className="material-symbols-outlined admin-side-nav-icon">group</span>
        <span className="text-label-md">Partners List</span>
      </Link>
      <Link className="admin-side-nav-link active" to="/dashboard/admin/security">
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
      <span className="admin-footer-logo">KostHub<span>.</span></span>
      <p className="admin-footer-copyright text-label-sm">© 2024 KostHub Hyperlocal Marketplace</p>
    </div>
    <div className="admin-footer-links">
      <a className="admin-footer-link text-label-sm" href="#">Privacy Policy</a>
      <a className="admin-footer-link text-label-sm" href="#">Terms of Service</a>
      <a className="admin-footer-link text-label-sm" href="#">Partner Support</a>
    </div>
  </footer>
);

// --- Main Component ---

const AdminSecurity = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/v1/dashboard/admin/security');
        if (!response.data) throw new Error("Invalid data");
        setData(response.data);
      } catch (error) {
        console.warn('Failed to fetch from backend, using dummy data', error);
        setData({
          stats: {
            uptime: { value: '99.9%', note: 'Operasional normal' },
            failedLogins: { value: '12', note: '24 jam terakhir' },
            securityWarnings: { value: '0', note: 'Sistem aman' },
            sslCert: { value: 'Aktif', note: 'Expired dlm 120 hari' },
          },
          activityLogs: [
            { time: '10:45:22', user: 'Admin Central', activity: 'Sistem Login Sukses', ip: '192.168.1.45', status: 'Berhasil' },
            { time: '10:30:15', user: 'System Admin', activity: 'Update Partner Status (Kost Amanah)', ip: '192.168.1.12', status: 'Berhasil' },
            { time: '09:12:05', user: 'Security Bot', activity: 'Deteksi Login Gagal (3x)', ip: '103.25.11.2', status: 'Terblokir' },
            { time: '08:45:10', user: 'Manager HQ', activity: 'Password Change Requested', ip: '192.168.1.88', status: 'Menunggu' },
          ],
          roles: [
            { role: 'Super Admin', sub: 'Root Access', perms: ['Full Access', 'System Config'], lastActive: 'Sekarang' },
            { role: 'Finance Manager', sub: 'Financial Dept', perms: ['View Reports', 'Manage Payments'], lastActive: '2 jam yang lalu' },
            { role: 'Security Auditor', sub: 'Compliance Team', perms: ['View Only', 'Audit Logs'], lastActive: 'Kemarin, 14:20' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusClass = (status) => {
    if (status === 'Terblokir') return 'blocked';
    if (status === 'Menunggu') return 'pending';
    return 'success';
  };

  return (
    <div className="admin-security-page">
      <TopNavBar />
      <SideNavBar />

      <main className="admin-main-content">
        <div className="admin-container">
          {loading ? (
            <div className="admin-security-loading">
              <span className="material-symbols-outlined admin-security-spinner">progress_activity</span>
            </div>
          ) : data ? (
            <>
              <section>
                <header className="admin-security-header">
                  <h1 className="text-headline-lg">Keamanan &amp; Log Akses</h1>
                  <p className="text-body-md">Pemantauan aktivitas sistem dan audit keamanan real-time.</p>
                </header>
                <div className="admin-security-stats">
                  <div className="admin-security-stat">
                    <div className="admin-security-stat-top">
                      <span className="text-label-md admin-security-stat-label">Up-time Sistem</span>
                      <span className="material-symbols-outlined admin-security-stat-icon">timer</span>
                    </div>
                    <div className="text-headline-lg admin-security-stat-value">{data.stats.uptime.value}</div>
                    <div className="text-label-sm admin-security-stat-note">{data.stats.uptime.note}</div>
                  </div>
                  <div className="admin-security-stat hover-error">
                    <div className="admin-security-stat-top">
                      <span className="text-label-md admin-security-stat-label">Upaya Login Gagal</span>
                      <span className="material-symbols-outlined admin-security-stat-icon error">login</span>
                    </div>
                    <div className="text-headline-lg admin-security-stat-value">{data.stats.failedLogins.value}</div>
                    <div className="text-label-sm admin-security-stat-note error">{data.stats.failedLogins.note}</div>
                  </div>
                  <div className="admin-security-stat">
                    <div className="admin-security-stat-top">
                      <span className="text-label-md admin-security-stat-label">Peringatan Keamanan</span>
                      <span className="material-symbols-outlined admin-security-stat-icon">gpp_good</span>
                    </div>
                    <div className="text-headline-lg admin-security-stat-value">{data.stats.securityWarnings.value}</div>
                    <div className="text-label-sm admin-security-stat-note primary">{data.stats.securityWarnings.note}</div>
                  </div>
                  <div className="admin-security-stat">
                    <div className="admin-security-stat-top">
                      <span className="text-label-md admin-security-stat-label">Sertifikat SSL</span>
                      <span className="material-symbols-outlined admin-security-stat-icon tertiary">workspace_premium</span>
                    </div>
                    <div className="text-headline-lg admin-security-stat-value">{data.stats.sslCert.value}</div>
                    <div className="text-label-sm admin-security-stat-note tertiary">{data.stats.sslCert.note}</div>
                  </div>
                </div>
              </section>

              {/* Log Aktivitas Keamanan */}
              <section className="admin-security-section">
                <div className="admin-security-section-header">
                  <h2 className="text-headline-sm admin-security-section-title">Log Aktivitas Keamanan</h2>
                  <div className="admin-security-section-tools">
                    <div className="admin-security-search">
                      <span className="material-symbols-outlined admin-security-search-icon">search</span>
                      <input className="admin-security-search-input text-label-md" placeholder="Cari log..." type="text" />
                    </div>
                    <button className="admin-security-date-btn text-label-md">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                      Rentang Waktu
                    </button>
                  </div>
                </div>
                <div className="admin-security-table-wrap">
                  <table className="admin-security-table">
                    <thead>
                      <tr className="text-label-sm">
                        <th>Waktu</th>
                        <th>Pengguna</th>
                        <th>Aktivitas</th>
                        <th>Alamat IP</th>
                        <th className="right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-sm">
                      {data.activityLogs.map((log, i) => (
                        <tr key={i}>
                          <td>{log.time}</td>
                          <td className="bold">{log.user}</td>
                          <td>{log.activity}</td>
                          <td className="muted">{log.ip}</td>
                          <td className="right">
                            <span className={`admin-security-badge text-label-sm ${getStatusClass(log.status)}`}>{log.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Manajemen Role & Izin Akses */}
              <section className="admin-security-section">
                <div className="admin-security-section-header">
                  <h2 className="text-headline-sm admin-security-section-title">Manajemen Role &amp; Izin Akses</h2>
                  <button className="admin-security-add-btn text-label-md">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                    Tambah Role Baru
                  </button>
                </div>
                <div className="admin-security-table-wrap">
                  <table className="admin-security-table">
                    <thead>
                      <tr className="text-label-sm">
                        <th>User/Role</th>
                        <th>Izin Akses (Permissions)</th>
                        <th>Terakhir Aktif</th>
                        <th className="right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-sm">
                      {data.roles.map((role, i) => (
                        <tr key={i}>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 500 }}>{role.role}</span>
                              <span className="text-label-sm admin-security-role-sub">{role.sub}</span>
                            </div>
                          </td>
                          <td>
                            <div className="admin-security-perms">
                              {role.perms.map((p, j) => (
                                <span key={j} className="admin-security-perm-badge">{p}</span>
                              ))}
                            </div>
                          </td>
                          <td className="muted">{role.lastActive}</td>
                          <td className="right">
                            <button className="admin-security-edit-btn text-label-sm">Edit Permissions</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default AdminSecurity;
