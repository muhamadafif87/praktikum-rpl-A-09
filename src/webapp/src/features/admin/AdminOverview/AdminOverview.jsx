import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminOverview.css';
import { useAuth } from '../../../context/AuthContext';

// --- Sub-components ---

const TopNavBar = () => (
  <nav className="admin-top-nav">
    <div className="flex items-center space-x-4">
      <a className="admin-top-nav-logo" href="#">
        KostHub<span>.</span>
      </a>
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
    </div>
  </nav>
);

const SideNavBar = ({ onLogout, isLoggingOut }) => (
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
      <Link className="admin-side-nav-link active" to="/dashboard/admin">
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
      <button
        className="admin-support-btn text-label-md"
        onClick={onLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <>
            <span className="material-symbols-outlined admin-logout-spinner">progress_activity</span>
            Logging out...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined admin-side-nav-icon">logout</span>
            Logout
          </>
        )}
      </button>
    </div>
  </aside>
);

const LogoutConfirmModal = ({ onConfirm, onCancel, isLoggingOut }) => (
  <div className="admin-modal-overlay" onClick={onCancel}>
    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
      <div className="admin-modal-icon">
        <span className="material-symbols-outlined">logout</span>
      </div>
      <h2 className="text-headline-sm admin-modal-title">Konfirmasi Logout</h2>
      <p className="text-body-sm admin-modal-desc">
        Apakah Anda yakin ingin keluar dari sesi admin ini?
      </p>
      <div className="admin-modal-actions">
        <button
          className="admin-modal-btn-cancel text-label-md"
          onClick={onCancel}
          disabled={isLoggingOut}
        >
          Batal
        </button>
        <button
          className="admin-modal-btn-confirm text-label-md"
          onClick={onConfirm}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <span className="material-symbols-outlined admin-logout-spinner">progress_activity</span>
              Keluar...
            </>
          ) : (
            'Ya, Logout'
          )}
        </button>
      </div>
    </div>
  </div>
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

// --- Overview Components ---

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  return (
    <section>
      <header className="admin-header-section">
        <h1 className="text-headline-lg admin-header-title">Overview</h1>
      </header>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="text-label-md admin-stat-title">Total Transaksi</span>
          <div className="text-headline-lg admin-stat-value">{stats.totalTransactions.value}</div>
          <div className="text-label-sm admin-stat-desc success">
            <span className="material-symbols-outlined admin-stat-icon-small">trending_up</span>
            {stats.totalTransactions.trend}
          </div>
        </div>

        <div className="admin-stat-card">
          <span className="text-label-md admin-stat-title">Total Mitra Aktif</span>
          <div className="text-headline-lg admin-stat-value">{stats.totalMitra.value}</div>
          <div className="text-label-sm admin-stat-desc success">
            <span className="material-symbols-outlined admin-stat-icon-small">trending_up</span>
            {stats.totalMitra.trend}
          </div>
        </div>

        <div className="admin-stat-card primary-accent">
          <div className="admin-stat-card-bg-icon">
            <span className="material-symbols-outlined">lock</span>
          </div>
          <span className="text-label-md admin-stat-title font-bold">Saldo Escrow (Held)</span>
          <div className="text-headline-lg admin-stat-value font-bold">{stats.saldoEscrow.value}</div>
          <div className="text-label-sm admin-stat-desc">{stats.saldoEscrow.label}</div>
        </div>

        <div className="admin-stat-card">
          <span className="text-label-md admin-stat-title">Total Pencairan Dana</span>
          <div className="text-headline-lg admin-stat-value">{stats.totalPencairan.value}</div>
          <div className="text-label-sm admin-stat-desc">{stats.totalPencairan.label}</div>
        </div>
      </div>
    </section>
  );
};

const FinanceEscrowTable = ({ transactions }) => {
  if (!transactions) return null;

  return (
    <section className="admin-section-container admin-col-span-2">
      <div className="admin-section-header">
        <h2 className="text-headline-sm">Finance Escrow</h2>
        <button className="text-label-md admin-view-all-btn">View All</button>
      </div>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr className="text-label-sm">
              <th>Transaction ID</th>
              <th>Mitra Name</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="right">Action</th>
            </tr>
          </thead>
          <tbody className="text-body-sm">
            {transactions.map((trx, index) => (
              <tr key={index}>
                <td className="admin-trx-id">{trx.id}</td>
                <td style={{ fontWeight: 500 }}>{trx.mitraName}</td>
                <td>{trx.amount}</td>
                <td>
                  <span className={`admin-status-badge text-label-sm ${trx.status.toLowerCase()}`}>
                    {trx.status}
                  </span>
                </td>
                <td className="right">
                  {trx.status === 'Hold' ? (
                    <button className="admin-btn-primary">Release Funds</button>
                  ) : (
                    <span className="text-label-sm admin-td-action-text">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const ActivePartnersList = ({ partners }) => {
  if (!partners) return null;

  return (
    <section className="admin-section-container">
      <div className="admin-section-header">
        <h2 className="text-headline-sm">Active Partners</h2>
      </div>
      <ul className="admin-partner-list">
        {partners.map((partner, index) => (
          <li className="admin-partner-item" key={index}>
            <div className="admin-partner-info">
              <div className={`admin-partner-avatar text-label-md ${partner.avatarType}`}>
                {partner.initials}
              </div>
              <div>
                <div className="text-label-md admin-partner-name">{partner.name}</div>
                <div className="text-label-sm admin-partner-rating">
                  <span className="material-symbols-outlined admin-partner-rating-icon">star</span>
                  {partner.rating} Rating
                </div>
              </div>
            </div>
            <div className="admin-partner-stats">
              <div className={`text-label-sm admin-partner-orders ${partner.isHighLoad ? 'high' : ''}`}>
                {partner.orders} Orders
              </div>
              <div className="admin-partner-load">{partner.loadStatus}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

const SystemStatus = ({ logs }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  if (!logs) return null;

  return (
    <section className="admin-section-container admin-system-grid">
      <div className="admin-system-controls">
        <h2 className="text-headline-sm mb-2" style={{ color: 'var(--color-on-surface)' }}>System Status</h2>
        <p className="text-body-sm admin-system-desc">Control platform accessibility and view critical system events.</p>

        <div className="admin-maintenance-box">
          <div className="admin-maintenance-header">
            <span className="text-label-md admin-maintenance-title">Maintenance Mode</span>
            <label className="admin-toggle-switch">
              <input
                type="checkbox"
                className="admin-toggle-input"
                checked={maintenanceMode}
                onChange={() => setMaintenanceMode(!maintenanceMode)}
              />
              <div className="admin-toggle-track">
                <div className="admin-toggle-thumb"></div>
              </div>
            </label>
          </div>
          <p className="text-label-sm admin-maintenance-warning">
            Warning: Activating this mode will lock out all users and partners except administrators.
          </p>
        </div>
      </div>

      <div className="admin-system-logs">
        <div className="admin-logs-header">
          <h3 className="text-label-md admin-logs-title">Recent System Logs</h3>
          <button className="text-label-sm admin-logs-export">Export Logs</button>
        </div>
        <div className="text-label-sm admin-logs-list">
          {logs.map((log, index) => (
            <div className={`admin-log-item ${log.type}`} key={index}>
              <span className="admin-log-time">{log.time}</span>
              <span className="admin-log-message">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main Component ---

const AdminOverview = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Using useAuth context like LandingPage
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/v1/dashboard/admin/overview');
        if (!response.data || !response.data.stats || !response.data.escrowTransactions) {
          throw new Error("Invalid data structure received");
        }
        setData(response.data);
      } catch (error) {
        console.warn('Failed to fetch from backend, using dummy data', error);

        setData({
          stats: {
            totalTransactions: { value: "14,205", trend: "+12% this month" },
            totalMitra: { value: "342", trend: "+5 new today" },
            saldoEscrow: { value: "Rp 45.2M", label: "Awaiting clearance" },
            totalPencairan: { value: "Rp 128.5M", label: "Last 30 days" }
          },
          escrowTransactions: [
            { id: "#TRX-8921", mitraName: "Kost Sejahtera Raya", amount: "Rp 1.500.000", status: "Hold" },
            { id: "#TRX-8920", mitraName: "Laundry Bersih Selalu", amount: "Rp 450.000", status: "Hold" },
            { id: "#TRX-8915", mitraName: "Catering Ibu Budi", amount: "Rp 800.000", status: "Released" },
            { id: "#TRX-8912", mitraName: "Kost Amanah", amount: "Rp 2.100.000", status: "Released" }
          ],
          activePartners: [
            { initials: "KS", name: "Kost Sejahtera Raya", rating: 4.8, orders: 12, loadStatus: "Current Load", avatarType: "primary", isHighLoad: false },
            { initials: "LB", name: "Laundry Bersih Selalu", rating: 4.9, orders: 28, loadStatus: "High Load", avatarType: "default", isHighLoad: true },
            { initials: "CB", name: "Catering Ibu Budi", rating: 4.5, orders: 5, loadStatus: "Current Load", avatarType: "default", isHighLoad: false },
            { initials: "KA", name: "Kost Amanah", rating: 4.7, orders: 2, loadStatus: "Current Load", avatarType: "default", isHighLoad: false }
          ],
          systemLogs: [
            { time: "10:42 AM", message: "System backup completed successfully. (Size: 4.2GB)", type: "success" },
            { time: "09:15 AM", message: "High API latency detected on /api/v1/search (Avg: 850ms). Autoscaling triggered.", type: "warning" },
            { time: "08:00 AM", message: "Admin 'admin_central' logged in from IP 192.168.1.105.", type: "info" },
            { time: "02:30 AM", message: "Scheduled database optimization completed.", type: "default" }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogoutClick = () => {
    setLogoutError(null);
    setShowLogoutModal(true);
  };

  const handleLogoutCancel = () => {
    if (!isLoggingOut) {
      setShowLogoutModal(false);
    }
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await logout(); // Using the logout function from AuthContext like LandingPage
      navigate('/login'); // Navigate to login page after logout
    } catch (err) {
      setIsLoggingOut(false);
      setLogoutError('Logout gagal. Silakan coba lagi.');
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="admin-overview-page">
      <TopNavBar />
      <SideNavBar onLogout={handleLogoutClick} isLoggingOut={isLoggingOut} />

      {showLogoutModal && (
        <LogoutConfirmModal
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
          isLoggingOut={isLoggingOut}
        />
      )}

      {logoutError && (
        <div className="admin-toast admin-toast-error text-label-sm">
          <span className="material-symbols-outlined">error</span>
          {logoutError}
          <button onClick={() => setLogoutError(null)} className="admin-toast-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      <main className="admin-main-content">
        <div className="admin-container">
          {loading ? (
            <div className="admin-loading-container">
              <span className="material-symbols-outlined admin-spinner">progress_activity</span>
            </div>
          ) : data ? (
            <>
              <StatsCards stats={data.stats} />

              <div className="admin-layout-split">
                <FinanceEscrowTable transactions={data.escrowTransactions} />
                <ActivePartnersList partners={data.activePartners} />
              </div>

              <SystemStatus logs={data.systemLogs} />
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminOverview;
