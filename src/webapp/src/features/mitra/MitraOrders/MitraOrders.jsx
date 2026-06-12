import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import './MitraOrders.css';

/**
 * MitraOrders — Halaman Manajemen Pesanan Mitra
 *
 * API Endpoints (semua di bawah auth:mitra guard):
 *   GET /v1/mitra/pesanan?search=&status=&page=&limit=
 *   GET /v1/mitra/pesanan/stats          ← stats hari ini
 *   PATCH /v1/mitra/pesanan/{id}/status  ← update status dari tombol aksi
 */

// ─── Konstanta ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

// Query-param value yang dikirim ke backend
const STATUS_OPTIONS = [
    { value: '',                    label: 'Semua Status' },
    { value: 'pending', label: 'BARU' },
    { value: 'proses',       label: 'PROSES' },
    { value: 'siap',          label: 'SIAP KIRIM' },
    { value: 'selesai',             label: 'SELESAI' },
    { value: 'dibatalkan',          label: 'BATAL' },
];

// Map status enum DB → slug lokal untuk badge & tombol aksi
const DB_STATUS_TO_SLUG = {
    'Menunggu Konfirmasi': 'baru',
    'Proses Jemput':       'proses',
    'Siap Kirim':          'siap',
    'Selesai':             'selesai',
    'Dibatalkan':          'dibatalkan',
};

// Status enum DB yang dikirim saat tombol aksi ditekan
const NEXT_STATUS = {
    'pending': 'diproses',
    'diproses': 'siap',
    'siap': 'selesai',
};

// ─── Helper: badge & tombol ───────────────────────────────────────────────────

const getServiceBadge = (service) => {
    const s = (service || '').toLowerCase();
    if (s.includes('laundry')) return { label: 'LAUNDRY',    modifier: 'laundry' };
    if (s.includes('cleaning') || s.includes('clean')) return { label: 'CLEANING', modifier: 'cleaning' };
    if (s.includes('gas') || s.includes('galon'))      return { label: 'GAS/GALON', modifier: 'gas' };
    return { label: service?.toUpperCase() || '-', modifier: 'laundry' };
};

const getStatusBadge = (dbStatus) => {
    const slug = DB_STATUS_TO_SLUG[dbStatus] || 'baru';
    const labels = {
        baru:      { label: 'BARU',      modifier: 'baru' },
        proses:    { label: 'PROSES',    modifier: 'proses' },
        siap:{ label: 'SIAP KIRIM',modifier: 'siap' },
        selesai:   { label: 'SELESAI',   modifier: 'selesai' },
        dibatalkan:     { label: 'BATAL',     modifier: 'dibatalkan' },
    };
    return labels[slug] || { label: dbStatus?.toUpperCase() || '-', modifier: 'baru' };
};

// ─── Komponen Utama ───────────────────────────────────────────────────────────

const MitraOrders = () => {
    // ── Data state ────────────────────────────────────────────────────────────
    const [orders, setOrders]   = useState([]);
    const [meta, setMeta]       = useState({ current_page: 1, per_page: ITEMS_PER_PAGE, total_items: 0, total_pages: 1 });
    const [stats, setStats]     = useState({ total: 0, menunggu: 0, aktif: 0, selesai: 0 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // id_pesanan yang sedang diproses

    // ── UI state ──────────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery]   = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage]   = useState(1);

    // ── Fetch orders: server-side filter + pagination ─────────────────────────
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page:  currentPage,
                limit: ITEMS_PER_PAGE,
                ...(searchQuery   && { search: searchQuery }),
                ...(statusFilter  && { status: statusFilter }),
            };

            const res = await api.get('/v1/mitra/pesanan', { params });

            // Struktur response: { status, meta, data: [...] }
            setOrders(res.data?.data ?? []);
            setMeta(res.data?.meta ?? meta);

        } catch (err) {
            console.error('Gagal memuat pesanan:', err.message);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, statusFilter]);

    // ── Fetch stats hari ini ──────────────────────────────────────────────────
    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/v1/mitra/pesanan/stats');
            setStats(res.data?.data ?? { total: 0, menunggu: 0, aktif: 0, selesai: 0 });
        } catch (err) {
            console.error('Gagal memuat stats:', err.message);
        }
    }, []);

    // Jalankan kedua fetch saat pertama load
    useEffect(() => {
        fetchOrders();
        fetchStats();
    }, [fetchOrders, fetchStats]);

    // Reset ke halaman 1 saat filter berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    // ── Handler: tombol aksi (Ambil / Selesaikan / Kirim) ────────────────────
    const handleAction = async (order) => {
        const nextStatus = NEXT_STATUS[order.status_pesanan];
        if (!nextStatus) return;

        setActionLoading(order.id_pesanan);
        try {
            await api.patch(`/v1/mitra/pesanan/${order.id_pesanan}/status`, {
                status_pesanan: nextStatus,
            });
            // Refresh tabel dan stats setelah update berhasil
            await Promise.all([fetchOrders(), fetchStats()]);
        } catch (err) {
            console.error('Gagal update status:', err.message);
            alert(err.response?.data?.message || 'Gagal memperbarui status pesanan.');
        } finally {
            setActionLoading(null);
        }
    };

    // ── Format waktu ──────────────────────────────────────────────────────────
    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const date = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            return `${time}, ${date}`;
        } catch {
            return dateStr;
        }
    };

    // ── Render tombol aksi per baris ──────────────────────────────────────────
    const getActionButton = (order) => {
        const isThisLoading = actionLoading === order.id_pesanan;
        const slug = DB_STATUS_TO_SLUG[order.status_pesanan];

        const btnProps = {
            disabled: isThisLoading,
            onClick:  () => handleAction(order),
        };

        if (isThisLoading) {
            return <button className="mo-action-btn mo-action-btn--primary" disabled>...</button>;
        }

        switch (slug) {
            case 'baru':
                return <button className="mo-action-btn mo-action-btn--primary" {...btnProps}>Ambil Pesanan</button>;
            case 'proses':
                return <button className="mo-action-btn mo-action-btn--outline" {...btnProps}>Selesaikan</button>;
            case 'siap_kirim':
                return <button className="mo-action-btn mo-action-btn--secondary" {...btnProps}>Kirim</button>;
            default:
                return <span className="mo-action-detail">Detail</span>;
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    if (loading && orders.length === 0) {
        return (
            <div className="mo-loading">
                <span className="material-symbols-outlined mo-loading-spinner">progress_activity</span>
            </div>
        );
    }

    return (
        <>
            {/* ── Header ── */}
            <header className="mo-header">
                <h1>Manajemen Pesanan</h1>
                <p>Kelola semua pesanan layanan Anda secara real-time.</p>
            </header>

            {/* ── Stats Row ── */}
            <div className="mo-stats-grid">
                <div className="mo-stat-card">
                    <p className="mo-stat-card-label">Total Pesanan Hari Ini</p>
                    <p className="mo-stat-card-value">{stats.total}</p>
                </div>
                <div className="mo-stat-card">
                    <p className="mo-stat-card-label">Menunggu Konfirmasi</p>
                    <p className="mo-stat-card-value mo-stat-card-value--primary">{stats.menunggu}</p>
                </div>
                <div className="mo-stat-card">
                    <p className="mo-stat-card-label">Pesanan Aktif</p>
                    <p className="mo-stat-card-value mo-stat-card-value--tertiary">{stats.aktif}</p>
                </div>
                <div className="mo-stat-card">
                    <p className="mo-stat-card-label">Selesai Hari Ini</p>
                    <p className="mo-stat-card-value mo-stat-card-value--secondary">{stats.selesai}</p>
                </div>
            </div>

            {/* ── Search & Filter Toolbar ── */}
            <div className="mo-toolbar">
                <div className="mo-toolbar-left">
                    <div className="mo-search-wrapper">
                        <span className="material-symbols-outlined mo-search-icon">search</span>
                        <input
                            className="mo-search-input"
                            type="text"
                            placeholder="Cari ID atau Nama Pelanggan"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                </div>
                <button className="mo-export-btn">
                    <span className="material-symbols-outlined">download</span>
                    Export
                </button>
            </div>

            {/* ── Orders Table ── */}
            <div className="mo-table-panel">
                <div className="mo-table-panel-header">
                    <h2 className="mo-table-panel-title">Daftar Pesanan</h2>
                </div>

                {/* Overlay loading saat filter/page berubah (bukan initial load) */}
                <div style={{ position: 'relative', opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                    <div className="mo-table-wrap">
                        <table className="mo-table">
                            <thead>
                                <tr>
                                    <th>ID Pesanan</th>
                                    <th>Pelanggan</th>
                                    <th>Layanan</th>
                                    <th>Waktu/Tanggal</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'center' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="mo-table-empty">
                                                <span className="material-symbols-outlined mo-table-empty-icon">inbox</span>
                                                <p className="mo-table-empty-title">Belum ada pesanan</p>
                                                <p className="mo-table-empty-text">
                                                    Pesanan dari pelanggan akan muncul di sini secara real-time.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => {
                                        // Ambil nama layanan dari relasi detail_pesanan pertama
                                        const firstDetail  = order.detail_pesanan?.[0];
                                        const layananName  = firstDetail?.layanan?.nama_layanan ?? order.jenis_jasa ?? '-';
                                        const serviceBadge = getServiceBadge(layananName);
                                        const statusBadge  = getStatusBadge(order.status_pesanan);

                                        return (
                                            <tr key={order.id_pesanan}>
                                                <td>
                                                    <span className="mo-order-id">#{order.id_unique_pesanan}</span>
                                                </td>
                                                <td>
                                                    <div className="mo-customer-name">{order.nama_pelanggan}</div>
                                                    {order.detail_kost && (
                                                        <div className="mo-customer-address">{order.detail_kost}</div>
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
                                                    <span className={`mo-status-badge mo-status-badge--${statusBadge.modifier}`}>
                                                        {statusBadge.label}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {getActionButton(order)}
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
                        <span className="mo-pagination-info">
                            {meta.total_items === 0
                                ? 'Showing 0 of 0 orders'
                                : `Showing ${(meta.current_page - 1) * meta.per_page + 1}–${Math.min(meta.current_page * meta.per_page, meta.total_items)} of ${meta.total_items} orders`
                            }
                        </span>
                        <div className="mo-pagination-btns">
                            <button
                                className="mo-pagination-btn"
                                disabled={currentPage <= 1 || loading}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                Previous
                            </button>
                            <button
                                className="mo-pagination-btn"
                                disabled={currentPage >= meta.total_pages || loading}
                                onClick={() => setCurrentPage((p) => Math.min(meta.total_pages, p + 1))}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MitraOrders;
