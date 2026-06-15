import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminOverview.css';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

// --- Sub-components ---

const TopNavBar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.nama_lengkap || user?.nama || 'Admin';
  const displayEmail = user?.email || '';

  return (
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

        {/* Profile dropdown — pola sama seperti LandingPage */}
        <div className="admin-top-nav-profile-menu" ref={dropdownRef}>
          <button
            className="admin-top-nav-profile-btn"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            title={displayName}
          >
            <div className="admin-top-nav-avatar">
              {getInitials(displayName)}
            </div>
            <span className="text-label-md admin-top-nav-profile-name">{displayName}</span>
            <span className="material-symbols-outlined admin-top-nav-chevron">
              {showProfileMenu ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showProfileMenu && (
            <div className="admin-top-nav-dropdown">
              <div className="admin-top-nav-dropdown-info">
                <p className="admin-top-nav-dropdown-name">{displayName}</p>
                <p className="admin-top-nav-dropdown-email">{displayEmail}</p>
              </div>
              <hr className="admin-top-nav-dropdown-divider" />
              <button
                className="admin-top-nav-dropdown-link"
                onClick={() => {
                  navigate('/dashboard/admin/settings');
                  setShowProfileMenu(false);
                }}
              >
                <span className="material-symbols-outlined">manage_accounts</span>
                Pengaturan Akun
              </button>
              <button
                className="admin-top-nav-dropdown-link admin-top-nav-dropdown-logout"
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
              >
                <span className="material-symbols-outlined">logout</span>
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const SideNavBar = ({ onLogout, isLoggingOut }) => (
  <aside className="admin-side-nav">
    <div className="admin-side-nav-header">
      <div className="admin-side-nav-avatar-placeholder">
        <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--color-primary)' }}>
          admin_panel_settings
        </span>
      </div>
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

const StatsCards = ({ summary }) => {
  if (!summary) return null;

  const { total_transaksi, mitra } = summary;

  return (
    <section>
      <header className="admin-header-section">
        <h1 className="text-headline-lg admin-header-title">Overview</h1>
      </header>
      <div className="admin-stats-grid">
        {/* Hanya 2 kartu dari API — escrow & pencairan diabaikan */}
        <div className="admin-stat-card">
          <span className="text-label-md admin-stat-title">Total Transaksi</span>
          <div className="text-headline-lg admin-stat-value">{total_transaksi.toLocaleString('id-ID')}</div>
          <div className="text-label-sm admin-stat-desc success">
            <span className="material-symbols-outlined admin-stat-icon-small">trending_up</span>
            Semua transaksi tercatat
          </div>
        </div>

        <div className="admin-stat-card">
          <span className="text-label-md admin-stat-title">Total Mitra Aktif</span>
          <div className="text-headline-lg admin-stat-value">{mitra.total_mitra_aktif}</div>
          <div className="text-label-sm admin-stat-desc success">
            <span className="material-symbols-outlined admin-stat-icon-small">trending_up</span>
            +{mitra.penambahan_mitra} mitra baru
          </div>
        </div>
      </div>
    </section>
  );
};

const ActivePartnersList = ({ partners }) => {
  if (!partners || partners.length === 0) return null;

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <section className="admin-section-container">
      <div className="admin-section-header">
        <h2 className="text-headline-sm admin-section-title">Mitra Aktif</h2>
      </div>
      <ul className="admin-partner-list">
        {partners.map((partner) => (
          <li className="admin-partner-item" key={partner.id_mitra}>
            <div className="admin-partner-info">
              <div className="admin-partner-avatar default">
                {getInitials(partner.nama_mitra)}
              </div>
              <div>
                <div className="text-label-md admin-partner-name">{partner.nama_mitra}</div>
                <div className="text-label-sm admin-partner-rating">
                  <span className="material-symbols-outlined admin-partner-rating-icon">star</span>
                  {partner.average_rate} Rating
                </div>
              </div>
            </div>
            <div className="admin-partner-stats">
              <div className={`text-label-sm admin-partner-orders ${partner.order_count >= 10 ? 'high' : ''}`}>
                {partner.order_count} Orders
              </div>
              <div className="admin-partner-load">{partner.load_status}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

// --- Main Component ---

const AdminOverview = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [summary, setSummary] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  // ── Fetch summary & active partners secara paralel ──
  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, partnersRes] = await Promise.all([
          api.get('/v1/dashboard/admin/statistic/summary'),
          api.get('/v1/dashboard/admin/mitra/active-mitra'),
        ]);

        setSummary({
          total_transaksi: summaryRes.data.total_transaksi,
          mitra: summaryRes.data.mitra,
        });
        setPartners(partnersRes.data.list_mitra ?? []);
      } catch (err) {
        console.error('Failed to fetch overview data:', err);
        setError('Gagal memuat data. Silakan refresh halaman.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  // ── Logout handlers — pola sama seperti LandingPage ──
  const handleLogoutClick = () => {
    setLogoutError(null);
    setShowLogoutModal(true);
  };

  const handleLogoutCancel = () => {
    if (!isLoggingOut) setShowLogoutModal(false);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setIsLoggingOut(false);
      setLogoutError('Logout gagal. Silakan coba lagi.');
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="admin-overview-page">
      <TopNavBar user={user} onLogout={handleLogoutClick} />
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
          ) : error ? (
            <div className="admin-error-state">
              <span className="material-symbols-outlined admin-error-icon">error_outline</span>
              <p className="text-body-sm">{error}</p>
              <button
                className="admin-btn-primary text-label-md"
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <>
              <StatsCards summary={summary} />

              <div className="admin-layout-split" style={{ gridTemplateColumns: '1fr' }}>
                <ActivePartnersList partners={partners} />
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminOverview;
