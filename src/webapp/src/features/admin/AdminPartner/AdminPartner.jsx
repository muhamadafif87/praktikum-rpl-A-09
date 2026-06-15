import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AdminPartner.css';

// --- Sub-components ---

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
        <img
          alt="Partner Profile"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT0AdV5Z5MUcPbHK72cL-plOTymvr7uuBk_yFfOKmFw6N8eFX5bLkJvVmL36BnchaNyQQvKniLE6v3dRpZ9fGAII4TxeHz_SQr9qp5-Ozy-EvMWWxwAVJlQJjVI8PgAwxi4iKwYgjuIwrgOIF89jQag9GTQwZNhx50L8lKH2qCyr_AKiZ9sxJ3Mw2dzts4Glv4-kKTMPrDGQJMBGYptN6XAlTDbWX7y2MPHrMDHiI4Vq573jjkeF_4shWpCCn2_9J1WE7UPgVAHOw"
        />
        <span className="text-label-md admin-top-nav-profile-name">Admin Central</span>
      </div>
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

// --- Helper ---

const SERVICE_TYPE_LABEL = {
  galon_gas: 'Gas & Galon',
  laundry: 'Laundry',
  daily_cleaning: 'Daily Cleaning',
};

// --- Detail Modal ---

const DetailModal = ({ mitraId, onClose, onActionSuccess }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/v1/dashboard/admin/mitra/${mitraId}`);
        setDetail(response.data.data);
      } catch (err) {
        setError('Gagal memuat detail mitra.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [mitraId]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAction = async (action) => {
    try {
      setActionLoading(true);
      const response = await axios.patch('v1/dashboard/admin/mitra/action', {
        id_mitra: mitraId,
        action,
      });
      alert(response.data.message);
      onActionSuccess();
      onClose();
    } catch (err) {
      alert('Gagal melakukan aksi. Silakan coba lagi.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container" role="dialog" aria-modal="true">
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="text-headline-sm modal-title">Detail Mitra</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {loading && (
            <div className="modal-loading">
              <span className="material-symbols-outlined admin-spinner">progress_activity</span>
            </div>
          )}

          {error && !loading && (
            <div className="modal-error">
              <span className="material-symbols-outlined modal-error-icon">error</span>
              <p className="text-body-sm">{error}</p>
            </div>
          )}

          {detail && !loading && (
            <>
              {/* Mitra Info */}
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <span className="text-label-sm modal-info-label">Nama Mitra</span>
                  <span className="text-body-md modal-info-value">{detail.nama_mitra}</span>
                </div>
                <div className="modal-info-item">
                  <span className="text-label-sm modal-info-label">Nomor Telepon</span>
                  <span className="text-body-md modal-info-value">{detail.nomor_telepon}</span>
                </div>
                <div className="modal-info-item modal-info-full">
                  <span className="text-label-sm modal-info-label">Alamat</span>
                  <span className="text-body-md modal-info-value">{detail.alamat_lengkap}</span>
                </div>
              </div>

              {/* Layanan */}
              <div className="modal-services">
                <h3 className="text-label-md modal-services-title">Daftar Layanan</h3>
                <div className="modal-services-list">
                  {detail.list_layanan?.map((layanan) => (
                    <div key={layanan.id_layanan} className="modal-service-card">
                      <div className="modal-service-header">
                        <span className="text-body-sm modal-service-name">{layanan.nama_layanan}</span>
                      </div>
                      <div className="modal-order-stats">
                        <div className="modal-order-stat">
                          <span className="text-label-sm modal-order-label">Pending</span>
                          <span className="text-body-sm modal-order-value">{layanan.jumlah_pesanan.pending}</span>
                        </div>
                        <div className="modal-order-stat">
                          <span className="text-label-sm modal-order-label">Proses</span>
                          <span className="text-body-sm modal-order-value">{layanan.jumlah_pesanan.proses}</span>
                        </div>
                        <div className="modal-order-stat success">
                          <span className="text-label-sm modal-order-label">Selesai</span>
                          <span className="text-body-sm modal-order-value success">{layanan.jumlah_pesanan.selesai}</span>
                        </div>
                        <div className="modal-order-stat danger">
                          <span className="text-label-sm modal-order-label">Dibatalkan</span>
                          <span className="text-body-sm modal-order-value danger">{layanan.jumlah_pesanan.dibatalkan}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {detail && !loading && (
          <div className="modal-footer">
            <button className="modal-btn modal-btn-secondary text-label-md" onClick={onClose}>
              Tutup
            </button>
            <div className="modal-footer-actions">
              <button
                className="modal-btn modal-btn-danger text-label-md"
                onClick={() => handleAction('suspend')}
                disabled={actionLoading}
              >
                {actionLoading ? 'Memproses...' : 'Suspend Mitra'}
              </button>
              <button
                className="modal-btn modal-btn-primary text-label-md"
                onClick={() => handleAction('activate')}
                disabled={actionLoading}
              >
                {actionLoading ? 'Memproses...' : 'Aktifkan Mitra'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Stats Cards ---

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="admin-stats-grid">
      <div className="admin-stat-card">
        <span className="text-label-md admin-stat-title">Total Mitra</span>
        <div className="text-headline-lg admin-stat-value">{stats.total_mitra}</div>
        <div className="text-label-sm admin-stat-desc">Terdaftar di sistem</div>
      </div>
      <div className="admin-stat-card warning">
        <div className="admin-stat-header">
          <span className="text-label-md admin-stat-title">Mitra Aktif</span>
          <span className="material-symbols-outlined admin-stat-icon primary">verified_user</span>
        </div>
        <div className="text-headline-lg admin-stat-value">{stats.total_mitra_aktif}</div>
        <div className="text-label-sm admin-stat-desc success" style={{ color: 'var(--color-primary)' }}>
          Beroperasi normal
        </div>
      </div>
      <div className="admin-stat-card critical">
        <div className="admin-stat-header">
          <span className="text-label-md admin-stat-title">Pendaftaran Baru</span>
          <span className="material-symbols-outlined admin-stat-icon warning">person_add</span>
        </div>
        <div className="text-headline-lg admin-stat-value">{stats.jumlah_mitra_baru}</div>
        <div className="text-label-sm admin-stat-desc warning">Minggu ini</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-header">
          <span className="text-label-md admin-stat-title">Mitra Di-Suspend</span>
          <span className="material-symbols-outlined admin-stat-icon critical">block</span>
        </div>
        <div className="text-headline-lg admin-stat-value critical">{stats.mitra_disuspend}</div>
        <div className="text-label-sm admin-stat-desc critical">Tindakan diperlukan</div>
      </div>
    </div>
  );
};

// --- Partners Table ---

const PartnersTable = ({ data, pagination, filters, onFilterChange, onPageChange, onViewDetail, onAction }) => {
  if (!data) return null;

  const { search, jenis_layanan, status } = filters;

  return (
    <section className="admin-table-section">
      <div className="admin-table-header">
        <h2 className="text-headline-sm admin-table-title">Status Kemitraan</h2>
        <div className="admin-table-actions">
          {/* Search */}
          <div className="admin-search-wrapper">
            <span className="material-symbols-outlined admin-search-icon">search</span>
            <input
              className="admin-search-input text-label-md"
              placeholder="Cari mitra..."
              type="text"
              value={search}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            />
          </div>

          {/* Filter: Jenis Layanan */}
          <select
            className="admin-filter-btn text-label-md"
            value={jenis_layanan || ''}
            onChange={(e) => onFilterChange({ jenis_layanan: e.target.value || null, page: 1 })}
          >
            <option value="">Semua Layanan</option>
            <option value="galon_gas">Gas &amp; Galon</option>
            <option value="laundry">Laundry</option>
            <option value="daily_cleaning">Daily Cleaning</option>
          </select>

          {/* Filter: Status */}
          <select
            className="admin-filter-btn text-label-md"
            value={status || ''}
            onChange={(e) => onFilterChange({ status: e.target.value || null, page: 1 })}
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="suspend">Suspend</option>
          </select>
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
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-on-surface-variant)' }}>
                  Tidak ada data mitra ditemukan.
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const isActive = item.status === true;
                return (
                  <tr key={item.id_mitra}>
                    <td className={`admin-td-font-medium ${!isActive ? 'admin-td-muted' : ''}`}>
                      {item.nama_mitra}
                    </td>
                    <td>{SERVICE_TYPE_LABEL[item.jenis_layanan] ?? item.jenis_layanan}</td>
                    <td className="admin-td-muted">{item.alamat_lengkap}</td>
                    <td>
                      <span className={`admin-status-badge text-label-sm ${isActive ? 'active' : 'suspend'}`}>
                        {isActive ? 'Aktif' : 'Suspend'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-rating-cell">
                        <span className="material-symbols-outlined admin-star-icon">star</span>
                        {item.avg_rating}
                      </div>
                    </td>
                    <td className="right">
                      <div className="admin-actions-group">
                        <button
                          className="admin-action-btn text-label-md"
                          onClick={() => onViewDetail(item.id_mitra)}
                        >
                          Lihat Detail
                        </button>
                        {isActive ? (
                          <button
                            className="admin-action-btn text-label-md"
                            style={{ color: 'var(--color-error)' }}
                            onClick={() => onAction(item.id_mitra, 'suspend')}
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            className="admin-action-btn text-label-md"
                            onClick={() => onAction(item.id_mitra, 'activate')}
                          >
                            Aktifkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="admin-pagination">
          <span className="text-label-sm admin-pagination-info">
            Halaman {pagination.current_page} dari {pagination.last_page} &nbsp;·&nbsp; Total {pagination.total} mitra
          </span>
          <div className="admin-pagination-btns">
            <button
              className="admin-pagination-btn text-label-md"
              disabled={pagination.current_page === 1}
              onClick={() => onPageChange(pagination.current_page - 1)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
              Sebelumnya
            </button>
            <button
              className="admin-pagination-btn text-label-md"
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => onPageChange(pagination.current_page + 1)}
            >
              Selanjutnya
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

// --- Main Component ---

const AdminPartner = () => {
  const [statsData, setStatsData] = useState(null);
  const [partnersData, setPartnersData] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedMitraId, setSelectedMitraId] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    jenis_layanan: null,
    status: null,
    rating: null,
    page: 1,
    per_page: 5,
  });

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get('/v1/dashboard/admin/statistic/mitra-summary');
      setStatsData(response.data);
    } catch (err) {
      console.warn('Stats fetch failed, using dummy data', err);
      setStatsData({
        total_mitra: 342,
        total_mitra_aktif: 328,
        jumlah_mitra_baru: 5,
        mitra_disuspend: 9,
      });
    }
  }, []);

  const fetchPartners = useCallback(async (currentFilters) => {
    setTableLoading(true);
    try {
      const params = {
        search: currentFilters.search || null,
        jenis_layanan: currentFilters.jenis_layanan || null,
        status: currentFilters.status || null,
        rating: currentFilters.rating || null,
        page: currentFilters.page,
        per_page: currentFilters.per_page,
      };
      const response = await axios.get('/v1/dashboard/admin/mitra/list', { params });
      setPartnersData(response.data.list_mitra);
      setPagination(response.data.pagination);
    } catch (err) {
      console.warn('Partners fetch failed, using dummy data', err);
      setPartnersData([
        { id_mitra: 1, nama_mitra: 'Kost Sejahtera Raya', jenis_layanan: 'galon_gas', alamat_lengkap: 'Sukabirus', status: true, avg_rating: 4.8 },
        { id_mitra: 2, nama_mitra: 'Laundry Bersih Selalu', jenis_layanan: 'laundry', alamat_lengkap: 'PGA', status: true, avg_rating: 4.9 },
        { id_mitra: 3, nama_mitra: 'Kost Amanah', jenis_layanan: 'daily_cleaning', alamat_lengkap: 'Sukapura', status: false, avg_rating: 3.2 },
        { id_mitra: 4, nama_mitra: 'Galon Cepat Budi', jenis_layanan: 'galon_gas', alamat_lengkap: 'Cikoneng', status: true, avg_rating: 4.5 },
      ]);
      setPagination(null);
    } finally {
      setTableLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchPartners(filters)]);
      setLoading(false);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch on filter change (skip first render)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    fetchPartners(filters);
  }, [filters, fetchPartners]);

  const handleFilterChange = (newFilter) => {
    setFilters((prev) => ({ ...prev, ...newFilter }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleAction = async (id, action) => {
    try {
      const response = await axios.patch('v1/dashboard/admin/mitra/action', { id_mitra: id, action });
      alert(response.data.message);
      fetchStats();
      fetchPartners(filters);
    } catch (err) {
      alert('Gagal melakukan aksi. Silakan coba lagi.');
    }
  };

  const handleModalActionSuccess = () => {
    fetchStats();
    fetchPartners(filters);
  };

  return (
    <div className="admin-partner-page">
      <TopNavBar />
      <SideNavBar />

      <main className="admin-main-content">
        <div className="admin-container">
          <section className="admin-header-section">
            <h1 className="text-headline-lg admin-header-title">Daftar Mitra</h1>
            <p className="text-body-md admin-header-desc">
              Manajemen dan pengawasan seluruh mitra layanan KostHub.
            </p>
          </section>

          {loading ? (
            <div className="admin-loading-container">
              <span className="material-symbols-outlined admin-spinner">progress_activity</span>
            </div>
          ) : (
            <>
              <StatsCards stats={statsData} />
              <div style={{ position: 'relative' }}>
                {tableLoading && (
                  <div className="admin-table-overlay">
                    <span className="material-symbols-outlined admin-spinner" style={{ fontSize: 32 }}>
                      progress_activity
                    </span>
                  </div>
                )}
                <PartnersTable
                  data={partnersData}
                  pagination={pagination}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onPageChange={handlePageChange}
                  onViewDetail={setSelectedMitraId}
                  onAction={handleAction}
                />
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      {selectedMitraId !== null && (
        <DetailModal
          mitraId={selectedMitraId}
          onClose={() => setSelectedMitraId(null)}
          onActionSuccess={handleModalActionSuccess}
        />
      )}
    </div>
  );
};

export default AdminPartner;
