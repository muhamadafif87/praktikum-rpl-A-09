import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../services/api';
import './MitraOrders.css';

/**
 * MitraOrders — Halaman Manajemen Pesanan Mitra (Integrated)
 *
 * API Endpoints (semua di bawah auth:mitra guard):
 *   GET    /v1/mitra/pesanan?search=&status=&page=&limit=
 *   GET    /v1/mitra/pesanan/stats
 *   GET    /v1/mitra/pesanan/{id}
 *   PATCH  /v1/mitra/pesanan/{id}/status  { status_pesanan: string }
 */

// ─── Konstanta ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

// Query-param yang dikirim ke backend (sesuai STATUS_MAP di PesananService)
const STATUS_OPTIONS = [
    { value: '',           label: 'Semua Status' },
    { value: 'pending',    label: 'Baru' },
    { value: 'proses',     label: 'Proses' },
    { value: 'siap',       label: 'Siap Kirim' },
    { value: 'selesai',    label: 'Selesai' },
    { value: 'dibatalkan', label: 'Batal' },
];

const DB_STATUS_META = {
    pending:     { label: 'Baru',      modifier: 'baru',       displayName: 'Menunggu Konfirmasi' },
    diproses:    { label: 'Proses',    modifier: 'proses',     displayName: 'Sedang Diproses' },
    siap:        { label: 'Siap Kirim',modifier: 'siap',       displayName: 'Siap Dikirim' },
    selesai:     { label: 'Selesai',   modifier: 'selesai',    displayName: 'Selesai' },
    dibatalkan:  { label: 'Batal',     modifier: 'dibatalkan', displayName: 'Dibatalkan' },
};

const NEXT_STATUS = {
    pending:  'diproses',
    diproses: 'siap',
    siap:     'selesai',
};

const ACTION_LABEL = {
    pending:  'Ambil Pesanan',
    diproses: 'Selesaikan',
    siap:     'Kirim',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getServiceBadge = (service) => {
    const s = (service || '').toLowerCase();
    if (s.includes('laundry'))                      return { label: 'Laundry',    modifier: 'laundry' };
    if (s.includes('cleaning') || s.includes('clean')) return { label: 'Cleaning',   modifier: 'cleaning' };
    if (s.includes('gas') || s.includes('galon'))   return { label: 'Gas/Galon', modifier: 'gas' };
    return { label: service || '-', modifier: 'laundry' };
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const date = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        return `${time} · ${date}`;
    } catch {
        return dateStr;
    }
};

const formatCurrency = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val ?? 0);

// ─── Sub-komponen: Detail Modal ───────────────────────────────────────────────

const OrderDetailModal = ({ orderId, onClose, onStatusUpdate }) => {
    const [detail, setDetail]     = useState(null);
    const [loading, setLoading]   = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError]       = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        api.get(`/v1/mitra/pesanan/${orderId}`)
            .then((res) => {
                if (!cancelled) setDetail(res.data?.data ?? null);
            })
            .catch((err) => {
                if (!cancelled) setError(err.response?.data?.message || 'Gagal memuat detail pesanan.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [orderId]);

    const handleUpdateStatus = async (nextStatus) => {
        setUpdating(true);
        try {
            await api.patch(`/v1/mitra/pesanan/${orderId}/status`, { status_pesanan: nextStatus });
            onStatusUpdate(); // refresh parent list + stats
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal memperbarui status.');
        } finally {
            setUpdating(false);
        }
    };

    // Close on backdrop click
    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Peta status menggunakan key 'status' dari response baru
    const statusMeta  = detail ? (DB_STATUS_META[detail.status] ?? {}) : {};
    const nextStatus  = detail ? NEXT_STATUS[detail.status] : null;
    const actionLabel = detail ? ACTION_LABEL[detail.status] : null;

    return (
        <div className="mo-modal-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true">
            <div className="mo-modal">
                {/* Header */}
                <div className="mo-modal-header">
                    <div>
                        <h2 className="mo-modal-title">Detail Pesanan</h2>
                        {detail && (
                            <span className="mo-modal-subtitle">#{detail.id_unique_pesanan}</span>
                        )}
                    </div>
                    <button className="mo-modal-close" onClick={onClose} aria-label="Tutup">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="mo-modal-body">
                    {loading && (
                        <div className="mo-modal-loading">
                            <span className="material-symbols-outlined mo-loading-spinner">progress_activity</span>
                            <p>Memuat detail…</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="mo-modal-error">
                            <span className="material-symbols-outlined">error</span>
                            <p>{error}</p>
                        </div>
                    )}

                    {detail && !loading && (
                        <>
                            {/* Status Banner */}
                            <div className={`mo-detail-status-banner mo-detail-status-banner--${statusMeta.modifier}`}>
                                <span className={`mo-status-badge mo-status-badge--${statusMeta.modifier}`}>
                                    {statusMeta.label}
                                </span>
                                <span className="mo-detail-status-name">{statusMeta.displayName}</span>
                            </div>

                            {/* Info Grid */}
                            <div className="mo-detail-grid">
                                <div className="mo-detail-section">
                                    <h3 className="mo-detail-section-title">
                                        <span className="material-symbols-outlined">person</span>
                                        Info Pelanggan
                                    </h3>
                                    <dl className="mo-detail-list">
                                        <dt>Nama</dt>
                                        <dd>{detail.pelanggan?.nama_lengkap ?? '-'}</dd>
                                        <dt>Alamat</dt>
                                        <dd>{detail.pelanggan?.alamat_kost ?? '-'}</dd>
                                        <dt>Tanggal Pesan</dt>
                                        <dd>{formatDateTime(detail.pelanggan?.tanggal_pesan)}</dd>
                                        {detail.pelanggan?.catatan_pesanan && (
                                            <>
                                                <dt>Catatan</dt>
                                                <dd>{typeof detail.pelanggan.catatan_pesanan === 'object'
                                                    ? JSON.stringify(detail.pelanggan.catatan_pesanan)
                                                    : detail.pelanggan.catatan_pesanan}
                                                </dd>
                                            </>
                                        )}
                                    </dl>
                                </div>

                                <div className="mo-detail-section">
                                    <h3 className="mo-detail-section-title">
                                        <span className="material-symbols-outlined">inventory_2</span>
                                        Item Pesanan
                                    </h3>
                                    {detail.item_pesanan?.items?.length > 0 ? (
                                        <table className="mo-detail-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Layanan</th>
                                                    <th>Qty</th>
                                                    <th>Harga</th>
                                                    <th>Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detail.item_pesanan.items.map((item, i) => (
                                                    <tr key={i}>
                                                        <td>{item.layanan}</td>
                                                        <td>{item.qty ?? 1}</td>
                                                        <td>{formatCurrency(item.harga)}</td>
                                                        <td>{formatCurrency(item.subtotal)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="mo-detail-empty">Tidak ada item.</p>
                                    )}
                                </div>

                                {/* Pembayaran */}
                                {detail.item_pesanan && (
                                    <div className="mo-detail-section">
                                        <h3 className="mo-detail-section-title">
                                            <span className="material-symbols-outlined">payments</span>
                                            Pembayaran
                                        </h3>
                                        <dl className="mo-detail-list">
                                            <dt>Total</dt>
                                            <dd className="mo-detail-total">{formatCurrency(detail.item_pesanan.total_pembayaran)}</dd>
                                            <dt>Metode</dt>
                                            <dd>{detail.item_pesanan.metode_pembayaran ?? '-'}</dd>
                                            <dt>Status</dt>
                                            <dd>{detail.item_pesanan.status_pembayaran ?? '-'}</dd>
                                        </dl>
                                    </div>
                                )}

                                {/* Ulasan */}
                                {detail.ulasan && (
                                    <div className="mo-detail-section">
                                        <h3 className="mo-detail-section-title">
                                            <span className="material-symbols-outlined">star</span>
                                            Ulasan Pelanggan
                                        </h3>
                                        <div className="mo-detail-review">
                                            <div className="mo-detail-review-stars">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={`material-symbols-outlined mo-star ${i < (detail.ulasan.rating ?? 0) ? 'mo-star--filled' : ''}`}
                                                    >star</span>
                                                ))}
                                                <span className="mo-detail-review-score">{detail.ulasan.rating}/5</span>
                                            </div>
                                            {detail.ulasan.komentar && (
                                                <p className="mo-detail-review-comment">"{detail.ulasan.komentar}"</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Aksi */}
                {detail && !loading && (
                    <div className="mo-modal-footer">
                        <button className="mo-modal-btn-cancel" onClick={onClose}>
                            Tutup
                        </button>
                        {nextStatus && (
                            <button
                                className="mo-modal-btn-action"
                                disabled={updating}
                                onClick={() => handleUpdateStatus(nextStatus)}
                            >
                                {updating
                                    ? <span className="material-symbols-outlined mo-loading-spinner">progress_activity</span>
                                    : <span className="material-symbols-outlined">arrow_forward</span>
                                }
                                {updating ? 'Memproses…' : actionLabel}
                            </button>
                        )}
                        {!['selesai', 'dibatalkan'].includes(detail.status) && (
                            <button
                                className="mo-modal-btn-cancel-order"
                                disabled={updating}
                                onClick={() => handleUpdateStatus('dibatalkan')}
                            >
                                <span className="material-symbols-outlined">cancel</span>
                                Batalkan
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Komponen Utama ───────────────────────────────────────────────────────────

const MitraOrders = () => {
    // ── Data state ────────────────────────────────────────────────────────────
    const [orders, setOrders]   = useState([]);
    const [meta, setMeta]       = useState({ current_page: 1, per_page: ITEMS_PER_PAGE, total_items: 0, total_pages: 1 });
    const [stats, setStats]     = useState({ total: 0, pending: 0, aktif: 0, selesai: 0 , siap: 0, diproses: 0, dibatalkan: 0});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery]     = useState('');
    const [statusFilter, setStatusFilter]   = useState('');
    const [currentPage, setCurrentPage]     = useState(1);
    const [selectedOrderId, setSelectedOrderId] = useState(null); // untuk modal detail
    const [toast, setToast]                 = useState(null);     // { type: 'success'|'error', msg }

    // Debounce search input
    const searchTimeout = useRef(null);
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setCurrentPage(1);
        }, 400);
    };

    // ── Toast helper ──────────────────────────────────────────────────────────
    const showToast = useCallback((type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    }, []);

    // ── Fetch orders ──────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page:  currentPage,
                limit: ITEMS_PER_PAGE,
                ...(searchQuery  && { search: searchQuery }),
                ...(statusFilter && { status: statusFilter }),
            };
            const res = await api.get('/v1/mitra/pesanan', { params });

            /**
             * FIX: Struktur paginasi Laravel default:
             *   res.data.data      → array pesanan
             *   res.data.current_page, res.data.last_page, res.data.total, res.data.per_page
             * Sesuaikan sesuai transformasi resource Anda (atau pakai langsung).
             */
            const payload = res.data;
            setOrders(payload.data ?? []);
            setMeta({
                current_page: payload.current_page ?? payload.meta?.current_page ?? 1,
                per_page:     payload.per_page     ?? payload.meta?.per_page     ?? ITEMS_PER_PAGE,
                total_items:        payload.total_items        ?? payload.meta?.total_items        ?? 0,
                total_pages:    payload.total_pages    ?? payload.meta?.total_pages    ?? 1,
            });
        } catch (err) {
            console.error('Gagal memuat pesanan:', err);
            setOrders([]);
            showToast('error', 'Gagal memuat daftar pesanan.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, statusFilter, showToast]);

    // ── Fetch stats ───────────────────────────────────────────────────────────
    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/v1/mitra/pesanan/stats');
            setStats(res.data?.data ?? { total: 0, pending: 0, aktif: 0, selesai: 0 });
        } catch (err) {
            console.error('Gagal memuat stats:', err);
        }
    }, []);

    const refreshAll = useCallback(() => {
        return Promise.all([fetchOrders(), fetchStats()]);
    }, [fetchOrders, fetchStats]);

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);

    // ── Quick-action dari baris tabel (tanpa buka modal) ─────────────────────
    const handleQuickAction = async (e, order) => {
        e.stopPropagation(); // jangan trigger row click (buka modal)
        const nextStatus = NEXT_STATUS[order.status_pesanan];
        if (!nextStatus) return;

        setActionLoading(order.id_pesanan);
        try {
            await api.patch(`/v1/mitra/pesanan/${order.id_pesanan}/status`, {
                status_pesanan: nextStatus,
            });
            showToast('success', `Status pesanan #${order.id_unique_pesanan} berhasil diperbarui.`);
            await refreshAll();
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Gagal memperbarui status.');
        } finally {
            setActionLoading(null);
        }
    };

    // ── Render tombol aksi baris ──────────────────────────────────────────────
    const renderActionButton = (order) => {
        const isLoading = actionLoading === order.id_pesanan;
        const status    = order.status_pesanan;
        const nextStatus = NEXT_STATUS[status];

        if (isLoading) {
            return (
                <button className="mo-action-btn mo-action-btn--loading" disabled>
                    <span className="material-symbols-outlined mo-loading-spinner">progress_activity</span>
                </button>
            );
        }

        if (!nextStatus) {
            // Terminal state — hanya link ke detail
            return (
                <button
                    className="mo-action-btn mo-action-btn--detail"
                    onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order.id_pesanan); }}
                >
                    <span className="material-symbols-outlined">open_in_new</span>
                    Detail
                </button>
            );
        }

        const modifierMap = { pending: 'primary', diproses: 'outline', siap: 'secondary' };
        const modifier = modifierMap[status] ?? 'primary';

        return (
            <button
                className={`mo-action-btn mo-action-btn--${modifier}`}
                onClick={(e) => handleQuickAction(e, order)}
                title={ACTION_LABEL[status]}
            >
                {ACTION_LABEL[status]}
            </button>
        );
    };

    // ── Pagination info ───────────────────────────────────────────────────────
    const paginationInfo = () => {
        if (meta.total === 0) return 'Tidak ada pesanan';
        const from = (meta.current_page - 1) * meta.per_page + 1;
        const to   = Math.min(meta.current_page * meta.per_page, meta.total);
        return `Menampilkan ${from}–${to} dari ${meta.total} pesanan`;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <>
            {/* ── Toast Notification ── */}
            {toast && (
                <div className={`mo-toast mo-toast--${toast.type}`} role="alert">
                    <span className="material-symbols-outlined">
                        {toast.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <header className="mo-header">
                <div>
                    <h1>Manajemen Pesanan</h1>
                    <p>Kelola semua pesanan layanan Anda secara real-time.</p>
                </div>
                <button
                    className="mo-refresh-btn"
                    onClick={refreshAll}
                    disabled={loading}
                    title="Refresh data"
                >
                    <span className={`material-symbols-outlined ${loading ? 'mo-loading-spinner' : ''}`}>
                        refresh
                    </span>
                </button>
            </header>

            {/* ── Stats Row ── */}
            <div className="mo-stats-grid">
                {[
                    { label: 'Total Hari Ini',          value: stats.total,    mod: '',          icon: 'receipt_long' },
                    { label: 'Menunggu Konfirmasi',      value: stats.pending, mod: 'primary',   icon: 'hourglass_empty' },
                    { label: 'Pesanan Aktif',            value: stats.aktif,    mod: 'tertiary',  icon: 'local_shipping' },
                    { label: 'Selesai Hari Ini',         value: stats.selesai,  mod: 'secondary', icon: 'task_alt' },
                ].map(({ label, value, mod, icon }) => (
                    <div
                        key={label}
                        className={`mo-stat-card ${mod ? `mo-stat-card--${mod}` : ''}`}
                        // Klik stat card langsung filter tabel
                        onClick={() => {
                            const filterMap = {
                                'Menunggu Konfirmasi': 'pending',
                                'Pesanan Aktif':       'diproses',
                                'Selesai Hari Ini':    'selesai',
                            };
                            const f = filterMap[label];
                            if (f) setStatusFilter(f === statusFilter ? '' : f);
                        }}
                        style={{ cursor: ['Menunggu Konfirmasi','Pesanan Aktif','Selesai Hari Ini'].includes(label) ? 'pointer' : 'default' }}
                        title={['Menunggu Konfirmasi','Pesanan Aktif','Selesai Hari Ini'].includes(label) ? 'Klik untuk filter' : ''}
                    >
                        <span className="material-symbols-outlined mo-stat-card-icon">{icon}</span>
                        <div>
                            <p className="mo-stat-card-label">{label}</p>
                            <p className={`mo-stat-card-value ${mod ? `mo-stat-card-value--${mod}` : ''}`}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="mo-toolbar">
                <div className="mo-toolbar-left">
                    <div className="mo-search-wrapper">
                        <span className="material-symbols-outlined mo-search-icon">search</span>
                        <input
                            className="mo-search-input"
                            type="text"
                            placeholder="Cari ID atau nama pelanggan…"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        {searchQuery && (
                            <button className="mo-search-clear" onClick={() => { setSearchQuery(''); setCurrentPage(1); }}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </div>
                    <div className="mo-filter-wrapper">
                        <select
                            className="mo-filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined mo-filter-icon">expand_more</span>
                    </div>
                    {statusFilter && (
                        <button className="mo-filter-clear" onClick={() => setStatusFilter('')}>
                            <span className="material-symbols-outlined">filter_alt_off</span>
                            Hapus filter
                        </button>
                    )}
                </div>
                <button className="mo-export-btn" title="Export (coming soon)" disabled>
                    <span className="material-symbols-outlined">download</span>
                    Export
                </button>
            </div>

            {/* ── Tabel Pesanan ── */}
            <div className="mo-table-panel">
                <div className="mo-table-panel-header">
                    <h2 className="mo-table-panel-title">Daftar Pesanan</h2>
                    <span className="mo-table-panel-count">{meta.total_items} pesanan</span>
                </div>

                <div style={{ position: 'relative', opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                    {loading && (
                        <div className="mo-table-loading-overlay">
                            <span className="material-symbols-outlined mo-loading-spinner">progress_activity</span>
                        </div>
                    )}

                    <div className="mo-table-wrap">
                        <table className="mo-table">
                            <thead>
                                <tr>
                                    <th>ID Pesanan</th>
                                    <th>Pelanggan</th>
                                    <th>Layanan</th>
                                    <th>Waktu</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'center' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!loading && orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="mo-table-empty">
                                                <span className="material-symbols-outlined mo-table-empty-icon">inbox</span>
                                                <p className="mo-table-empty-title">
                                                    {searchQuery || statusFilter ? 'Tidak ada pesanan yang cocok' : 'Belum ada pesanan'}
                                                </p>
                                                <p className="mo-table-empty-text">
                                                    {searchQuery || statusFilter
                                                        ? 'Coba ubah kata kunci atau hapus filter.'
                                                        : 'Pesanan dari pelanggan akan muncul di sini.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => {
                                        const firstDetail  = order.detail_pesanan?.[0];
                                        const layananName  = firstDetail?.layanan?.nama_layanan ?? order.jenis_jasa ?? '-';
                                        const serviceBadge = getServiceBadge(layananName);
                                        const statusMeta   = DB_STATUS_META[order.status_pesanan]
                                            ?? { label: order.status_pesanan, modifier: 'baru' };

                                        return (
                                            <tr
                                                key={order.id_pesanan}
                                                className="mo-table-row"
                                                onClick={() => setSelectedOrderId(order.id_pesanan)}
                                                title="Klik untuk lihat detail"
                                            >
                                                <td>
                                                    <span className="mo-order-id">#{order.id_unique_pesanan}</span>
                                                </td>
                                                <td>
                                                    <div className="mo-customer-name">{order.user?.nama_lengkap ?? '-'}</div>
                                                    {order.alamat_kost && (
                                                        <div className="mo-customer-address">{order.user.alamat_kost}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`mo-service-badge mo-service-badge--${serviceBadge.modifier}`}>
                                                        {serviceBadge.label}
                                                    </span>
                                                </td>
                                                <td className="mo-order-time">
                                                    {formatDateTime(order.tgl_pesanan)}
                                                </td>
                                                <td>
                                                    <span className={`mo-status-badge mo-status-badge--${statusMeta.modifier}`}>
                                                        {statusMeta.label}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {renderActionButton(order)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    <div className="mo-pagination">
                        <span className="mo-pagination-info">{paginationInfo()}</span>
                        <div className="mo-pagination-btns">
                            <button
                                className="mo-pagination-btn"
                                disabled={currentPage <= 1 || loading}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                                Sebelumnya
                            </button>
                            <span className="mo-pagination-page">
                                {currentPage} / {meta.last_page}
                            </span>
                            <button
                                className="mo-pagination-btn"
                                disabled={currentPage >= meta.last_page || loading}
                                onClick={() => setCurrentPage((p) => Math.min(meta.last_page, p + 1))}
                            >
                                Berikutnya
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modal Detail Pesanan ── */}
            {selectedOrderId !== null && (
                <OrderDetailModal
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                    onStatusUpdate={refreshAll}
                />
            )}
        </>
    );
};

export default MitraOrders;
