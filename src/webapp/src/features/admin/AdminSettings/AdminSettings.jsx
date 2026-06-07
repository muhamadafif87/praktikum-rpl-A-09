import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AdminSettings.css';

const TopNavBar = () => (
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
      <Link className="admin-side-nav-link" to="/dashboard/admin/maintenance"><span className="material-symbols-outlined admin-side-nav-icon">build</span><span className="text-label-md">Maintenance</span></Link>
      <Link className="admin-side-nav-link active" to="/dashboard/admin/settings"><span className="material-symbols-outlined admin-side-nav-icon">settings</span><span className="text-label-md">Settings</span></Link>
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

const AdminSettings = () => {
  const [platformFee, setPlatformFee] = useState(10);
  const [minWithdraw, setMinWithdraw] = useState(50000);
  const [logRetention, setLogRetention] = useState('90');
  const [twoFA, setTwoFA] = useState(true);
  const [helpUrl, setHelpUrl] = useState('https://help.kosthub.com');

  return (
    <div className="admin-settings-page">
      <TopNavBar />
      <SideNavBar />
      <main className="admin-main-content">
        <div className="admin-container">
          <section>
            <header className="admin-settings-header">
              <h1 className="text-headline-lg">Pengaturan Sistem</h1>
              <p className="text-body-md">Konfigurasi profil, preferensi platform, dan keamanan akun.</p>
            </header>

            <div className="admin-settings-grid">
              {/* Left: Forms */}
              <div className="admin-settings-left">
                {/* Manajemen Biaya Layanan */}
                <section className="admin-settings-card">
                  <h2 className="text-headline-sm admin-settings-card-title">Manajemen Biaya Layanan</h2>
                  <div className="admin-settings-field">
                    <label className="text-label-md admin-settings-field-label">Platform Fee (%)</label>
                    <div className="admin-settings-field-row">
                      <input className="admin-settings-input text-label-md" type="number" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} />
                      <span className="admin-settings-field-prefix text-label-md">%</span>
                    </div>
                  </div>
                  <div className="admin-settings-field">
                    <label className="text-label-md admin-settings-field-label">Minimum Penarikan Saldo (Rp)</label>
                    <div className="admin-settings-field-row">
                      <span className="admin-settings-field-prefix text-label-md">Rp</span>
                      <input className="admin-settings-input text-label-md" type="number" value={minWithdraw} onChange={(e) => setMinWithdraw(e.target.value)} />
                    </div>
                  </div>
                </section>

                {/* Keamanan & Data */}
                <section className="admin-settings-card">
                  <h2 className="text-headline-sm admin-settings-card-title">Keamanan &amp; Data</h2>
                  <div className="admin-settings-field">
                    <label className="text-label-md admin-settings-field-label">Retensi Log Audit</label>
                    <select className="admin-settings-select text-label-md" value={logRetention} onChange={(e) => setLogRetention(e.target.value)}>
                      <option value="30">30 Hari</option>
                      <option value="90">90 Hari</option>
                      <option value="180">180 Hari</option>
                    </select>
                  </div>
                  <div className="admin-settings-field">
                    <div className="admin-settings-toggle-row">
                      <div className="admin-settings-toggle-info">
                        <span className="text-label-md admin-settings-toggle-label">Two-Factor Authentication</span>
                        <span className="text-label-sm admin-settings-toggle-sub">Amankan login admin</span>
                      </div>
                      <label className="admin-settings-toggle-switch">
                        <input type="checkbox" className="admin-settings-toggle-input" checked={twoFA} onChange={() => setTwoFA(!twoFA)} />
                        <div className="admin-settings-toggle-track"><div className="admin-settings-toggle-thumb"></div></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Integrasi & Dukungan */}
                <section className="admin-settings-card full-width">
                  <h2 className="text-headline-sm admin-settings-card-title">Integrasi &amp; Dukungan</h2>
                  <div className="admin-settings-field">
                    <label className="text-label-md admin-settings-field-label">URL Pusat Bantuan</label>
                    <input className="admin-settings-input text-label-md" type="url" placeholder="https://example.com/support" value={helpUrl} onChange={(e) => setHelpUrl(e.target.value)} />
                  </div>
                </section>
              </div>

              {/* Right: Actions Sidebar */}
              <div className="admin-settings-right">
                <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button className="admin-settings-save-btn text-label-md">Simpan Perubahan</button>
                  <button className="admin-settings-reset-btn text-label-md">Reset ke Default</button>
                </section>
                <div className="admin-settings-status-box">
                  <h3 className="text-label-md admin-settings-status-title">
                    Status Sistem
                    <span className="material-symbols-outlined" title="Indikator real-time kesehatan infrastruktur platform.">info</span>
                  </h3>
                  <Link to="/dashboard/admin/maintenance" className="text-label-sm admin-settings-status-link">
                    <span className="admin-settings-status-dot"></span>
                    Semua sistem operasional
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminSettings;
