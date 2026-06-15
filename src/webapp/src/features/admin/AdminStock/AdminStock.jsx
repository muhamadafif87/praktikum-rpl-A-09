import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminStock.css';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

// ─────────────────────────────────────────────
// TopNavBar
// ─────────────────────────────────────────────
const TopNavBar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);

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

        <div className="admin-top-nav-profile-menu" ref={dropdownRef}>
          <button
            className="admin-top-nav-profile-btn"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            title={displayName}
          >
            <div className="admin-top-nav-avatar">{getInitials(displayName)}</div>
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

// ─────────────────────────────────────────────
// SideNavBar
// ─────────────────────────────────────────────
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
      <Link className="admin-side-nav-link" to="/dashboard/admin">
        <span className="material-symbols-outlined admin-side-nav-icon">dashboard</span>
        <span className="text-label-md">Overview</span>
      </Link>
      <Link className="admin-side-nav-link active" to="/dashboard/admin/stock">
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

// ─────────────────────────────────────────────
// LogoutConfirmModal
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// MitraDetailModal
// ─────────────────────────────────────────────
const MitraDetailModal = ({ mitraId, mitraName, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/v1/dashboard/admin/mitra/${mitraId}`);
        setDetail(res.data.data);
      } catch (err) {
        console.error('Failed to fetch mitra detail:', err);
        setError('Gagal memuat detail mitra.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [mitraId]);

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal-detail-header">
          <div>
            <h2 className="text-headline-sm admin-modal-title" style={{ margin: 0 }}>
              {mitraName}
            </h2>
            {detail && (
              <p className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
                {detail.nomor_telepon} · {detail.alamat_lengkap}
              </p>
            )}
          </div>
          <button className="admin-modal-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="admin-modal-detail-body">
          {loading ? (
            <div className="admin-loading-container" style={{ minHeight: 160 }}>
              <span className="material-symbols-outlined admin-spinner">progress_activity</span>
            </div>
          ) : error ? (
            <p className="text-body-sm" style={{ color: 'var(--color-error)', textAlign: 'center', padding: '2rem 0' }}>
              {error}
            </p>
          ) : detail ? (
            <table className="admin-table">
              <thead>
                <tr className="text-label-sm">
                  <th>Nama Layanan</th>
                  <th className="right">Pending</th>
                  <th className="right">Proses</th>
                  <th className="right">Selesai</th>
                  <th className="right">Dibatalkan</th>
                </tr>
              </thead>
              <tbody className="text-body-sm">
                {detail.list_layanan.map((layanan) => (
                  <tr key={layanan.id_layanan}>
                    <td>{layanan.nama_layanan}</td>
                    <td className="right">{layanan.jumlah_pesanan.pending}</td>
                    <td className="right">{layanan.jumlah_pesanan.proses}</td>
                    <td className="right" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                      {layanan.jumlah_pesanan.selesai}
                    </td>
                    <td className="right" style={{ color: 'var(--color-error)' }}>
                      {layanan.jumlah_pesanan.dibatalkan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// StatsCards
// ─────────────────────────────────────────────
const StatsCards = ({ summary }) => {
  if (!summary) return null;

  const lowCount = summary.layanan_stok_rendah?.length ?? 0;
  const outCount = summary.layanan_stok_habis?.length ?? 0;

  return (
    <div className="admin-stats-grid">
      <div className="admin-stat-card">
        <span className="text-label-md admin-stat-title">Total Layanan Aktif</span>
        <div className="text-headline-lg admin-stat-value">{summary.total_layanan}</div>
        <div className="text-label-sm admin-stat-desc">Di seluruh mitra aktif</div>
      </div>

      <div className={`admin-stat-card ${lowCount > 0 ? 'warning' : ''}`}>
        <div className="admin-stat-header">
          <span className="text-label-md admin-stat-title">Peringatan Stok Rendah</span>
          {lowCount > 0 && (
            <span className="material-symbols-outlined admin-stat-icon warning">warning</span>
          )}
        </div>
        <div className="text-headline-lg admin-stat-value">{lowCount}</div>
        <div className={`text-label-sm admin-stat-desc ${lowCount > 0 ? 'warning' : ''}`}>
          {lowCount > 0 ? 'Butuh perhatian' : 'Semua normal'}
        </div>
      </div>

      <div className={`admin-stat-card ${outCount > 0 ? 'critical' : ''}`}>
        <div className="admin-stat-header">
          <span className="text-label-md admin-stat-title">Stok Habis</span>
          {outCount > 0 && (
            <span className="material-symbols-outlined admin-stat-icon critical">error</span>
          )}
        </div>
        <div className={`text-headline-lg admin-stat-value ${outCount > 0 ? 'critical' : ''}`}>
          {outCount}
        </div>
        <div className={`text-label-sm admin-stat-desc ${outCount > 0 ? 'critical' : ''}`}>
          {outCount > 0 ? 'Peringatan Kritis' : 'Semua tersedia'}
        </div>
      </div>

      <div className="admin-stat-card">
        <span className="text-label-md admin-stat-title">Ketersediaan Layanan</span>
        <div className="text-headline-lg admin-stat-value">
          {Number(summary.persentase_ketersediaan).toFixed(2)}%
        </div>
        <div className="text-label-sm admin-stat-desc success">
          <span className="material-symbols-outlined admin-stat-icon-small">check_circle</span>
          Level Layanan Sehat
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────
const STATUS_MAP = {
  'In Stock':    { cls: 'available',   label: 'Tersedia' },
  'Stok Rendah': { cls: 'low-stock',   label: 'Stok Rendah' },
  'Stok Habis':  { cls: 'out-of-stock', label: 'Stok Habis' },
};

const stockValueClass = (status) => {
  if (status === 'Stok Habis') return 'critical';
  if (status === 'Stok Rendah') return 'warning';
  return '';
};

// ─────────────────────────────────────────────
// InventoryTable (grouped)
// ─────────────────────────────────────────────
const InventoryTable = ({ listMitra, mitraOptions, filterMitra, filterStatus, onFilterMitra, onFilterStatus, onDetail, pagination, onPageChange, loadingList }) => {
  return (
    <section className="admin-inventory-section">
      <div className="admin-inventory-header">
        <h2 className="text-headline-sm admin-inventory-title">Status Inventaris Lintas Mitra</h2>
        <div className="admin-inventory-filters">
          {/* Filter mitra — single select */}
          <select
            className="admin-select text-label-md"
            value={filterMitra}
            onChange={(e) => onFilterMitra(e.target.value)}
          >
            <option value="">All Partners</option>
            {mitraOptions.map((nama) => (
              <option key={nama} value={nama}>{nama}</option>
            ))}
          </select>

          {/* Filter status stok */}
          <select
            className="admin-select text-label-md"
            value={filterStatus}
            onChange={(e) => onFilterStatus(e.target.value)}
          >
            <option value="All">Stock Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        {loadingList ? (
          <div className="admin-loading-container" style={{ minHeight: 200 }}>
            <span className="material-symbols-outlined admin-spinner">progress_activity</span>
          </div>
        ) : listMitra.length === 0 ? (
          <div className="admin-empty-state">
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-outline)' }}>
              inventory_2
            </span>
            <p className="text-body-sm">Tidak ada data inventaris yang sesuai filter.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr className="text-label-sm">
                <th>Nama Mitra</th>
                <th>Nama Layanan</th>
                <th>Jumlah Stok</th>
                <th>Status</th>
                <th className="right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-body-sm">
              {listMitra.map((mitra) =>
                mitra.list_layanan.map((layanan, idx) => (
                  <tr key={layanan.id_layanan}>
                    {/* Nama mitra hanya tampil di baris pertama kelompok — rowspan visual pakai border trick */}
                    {idx === 0 ? (
                      <td
                        rowSpan={mitra.list_layanan.length}
                        className="admin-td-mitra-name"
                      >
                        <div className="admin-mitra-group-label">
                          <span className="material-symbols-outlined admin-mitra-group-icon">store</span>
                          {mitra.nama_mitra}
                        </div>
                      </td>
                    ) : null}
                    <td>{layanan.nama_layanan}</td>
                    <td className={`admin-td-value ${stockValueClass(layanan.status_stok)}`}>
                      {layanan.jumlah_stok !== null ? `${layanan.jumlah_stok} Unit` : '—'}
                    </td>
                    <td>
                      <span className={`admin-status-badge text-label-sm ${STATUS_MAP[layanan.status_stok]?.cls ?? 'available'}`}>
                        {STATUS_MAP[layanan.status_stok]?.label ?? layanan.status_stok}
                      </span>
                    </td>
                    <td className="right">
                      {idx === 0 && (
                        <button
                          className="admin-action-btn text-label-md"
                          onClick={() => onDetail(mitra.id_mitra, mitra.nama_mitra)}
                        >
                          Lihat Detail
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-pagination-btn"
            disabled={pagination.current_page <= 1}
            onClick={() => onPageChange(pagination.current_page - 1)}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <span className="text-label-sm admin-pagination-info">
            Halaman {pagination.current_page} / {pagination.last_page}
            <span style={{ color: 'var(--color-on-surface-variant)', marginLeft: 6 }}>
              ({pagination.total} mitra)
            </span>
          </span>

          <button
            className="admin-pagination-btn"
            disabled={pagination.current_page >= pagination.last_page}
            onClick={() => onPageChange(pagination.current_page + 1)}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const AdminStock = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ── summary ──
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // ── inventory list ──
  const [listMitra, setListMitra]     = useState([]);
  const [pagination, setPagination]   = useState(null);
  const [mitraOptions, setMitraOptions] = useState([]); // untuk opsi filter
  const [loadingList, setLoadingList] = useState(true);

  // ── filters ──
  const [filterMitra, setFilterMitra]   = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [page, setPage]                 = useState(1);

  // ── logout ──
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut]       = useState(false);
  const [logoutError, setLogoutError]         = useState(null);

  // ── detail modal ──
  const [detailModal, setDetailModal] = useState(null); // { mitraId, mitraName }

  // ── Fetch summary (sekali) ──
  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const res = await api.get('/v1/dashboard/admin/inventory/summary');
        setSummary(res.data);
      } catch (err) {
        console.error('Failed to fetch summary:', err);
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchSummary();
  }, []);

  // ── Fetch inventory list (re-fetch saat filter/page berubah) ──
  const fetchList = useCallback(async () => {
    setLoadingList(true);
    try {
      const payload = {
        filter_mitra: filterMitra ? [filterMitra] : null,
        filter_status_stok: filterStatus,
        page,
        per_page: 5,
      };
      const res = await api.get('/v1/dashboard/admin/inventory/list', payload);
      setListMitra(res.data.list_mitra ?? []);
      setPagination(res.data.pagination ?? null);

      // Ambil nama mitra unik untuk opsi filter (hanya saat page 1 & no filter — supaya dropdown penuh)
      if (page === 1 && !filterMitra && filterStatus === 'All') {
        setMitraOptions((res.data.list_mitra ?? []).map((m) => m.nama_mitra));
      }
    } catch (err) {
      console.error('Failed to fetch inventory list:', err);
      setListMitra([]);
    } finally {
      setLoadingList(false);
    }
  }, [filterMitra, filterStatus, page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Reset ke page 1 saat filter berubah
  const handleFilterMitra = (val) => { setFilterMitra(val); setPage(1); };
  const handleFilterStatus = (val) => { setFilterStatus(val); setPage(1); };

  // ── Logout handlers ──
  const handleLogoutClick   = () => { setLogoutError(null); setShowLogoutModal(true); };
  const handleLogoutCancel  = () => { if (!isLoggingOut) setShowLogoutModal(false); };
  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setIsLoggingOut(false);
      setLogoutError('Logout gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="admin-stock-page">
      <TopNavBar user={user} onLogout={handleLogoutClick} />
      <SideNavBar onLogout={handleLogoutClick} isLoggingOut={isLoggingOut} />

      {/* Logout modal */}
      {showLogoutModal && (
        <LogoutConfirmModal
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
          isLoggingOut={isLoggingOut}
        />
      )}

      {/* Mitra detail modal */}
      {detailModal && (
        <MitraDetailModal
          mitraId={detailModal.mitraId}
          mitraName={detailModal.mitraName}
          onClose={() => setDetailModal(null)}
        />
      )}

      {/* Toast error logout */}
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
          <section className="admin-header-section">
            <h1 className="text-headline-lg admin-header-title">Monitoring Stok Mitra</h1>
            <p className="text-body-md admin-header-desc">
              Pemantauan stok lintas mitra dan performa ketersediaan layanan.
            </p>
          </section>

          {loadingSummary ? (
            <div className="admin-loading-container">
              <span className="material-symbols-outlined admin-spinner">progress_activity</span>
            </div>
          ) : (
            <StatsCards summary={summary} />
          )}

          <InventoryTable
            listMitra={listMitra}
            mitraOptions={mitraOptions}
            filterMitra={filterMitra}
            filterStatus={filterStatus}
            onFilterMitra={handleFilterMitra}
            onFilterStatus={handleFilterStatus}
            onDetail={(id, nama) => setDetailModal({ mitraId: id, mitraName: nama })}
            pagination={pagination}
            onPageChange={setPage}
            loadingList={loadingList}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminStock;
