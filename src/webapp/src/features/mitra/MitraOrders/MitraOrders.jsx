import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../services/api';
import './MitraOrders.css';

/**
 * MitraOrders — Halaman Manajemen Pesanan Mitra
 *
 * Menampilkan daftar pesanan mitra dengan fitur:
 * - Stats overview (Total, Menunggu Konfirmasi, Aktif, Selesai)
 * - Search & filter
 * - Tabel pesanan dengan pagination
 * - Empty state jika belum ada data
 *
 * API Endpoint:
 * - GET /v1/dashboard/mitra/orders
 */

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
    { value: '', label: 'Semua Status' },
    { value: 'baru', label: 'BARU' },
    { value: 'proses', label: 'PROSES' },
    { value: 'siap_kirim', label: 'SIAP KIRIM' },
    { value: 'selesai', label: 'SELESAI' },
    { value: 'batal', label: 'BATAL' },
];

/**
 * Maps a raw service type string to a display label and CSS modifier.
 */
const getServiceBadge = (service) => {
    const s = (service || '').toLowerCase();
    if (s.includes('laundry')) return { label: 'LAUNDRY', modifier: 'laundry' };
    if (s.includes('cleaning') || s.includes('clean')) return { label: 'CLEANING', modifier: 'cleaning' };
    if (s.includes('gas') || s.includes('galon')) return { label: 'GAS/GALON', modifier: 'gas' };
    return { label: service?.toUpperCase() || '-', modifier: 'laundry' };
};

/**
 * Maps a raw status string to a display label and CSS modifier.
 */
const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase().replace(/\s+/g, '_');
    switch (s) {
        case 'baru': return { label: 'BARU', modifier: 'baru' };
        case 'proses': return { label: 'PROSES', modifier: 'proses' };
        case 'siap_kirim': return { label: 'SIAP KIRIM', modifier: 'siap-kirim' };
        case 'selesai': return { label: 'SELESAI', modifier: 'selesai' };
        case 'batal': return { label: 'BATAL', modifier: 'batal' };
        default: return { label: status?.toUpperCase() || '-', modifier: 'baru' };
    }
};

/**
 * Returns the appropriate action button(s) for a given order status.
 */
const getActionButton = (status) => {
    const s = (status || '').toLowerCase().replace(/\s+/g, '_');
    switch (s) {
        case 'baru':
            return <button className="mo-action-btn mo-action-btn--primary">Ambil Pesanan</button>;
        case 'proses':
            return <button className="mo-action-btn mo-action-btn--outline">Selesaikan</button>;
        case 'siap_kirim':
            return <button className="mo-action-btn mo-action-btn--secondary">Kirim</button>;
        case 'selesai':
            return <span className="mo-action-detail">Detail</span>;
        case 'batal':
            return <span className="mo-action-detail">Detail</span>;
        default:
            return <span className="mo-action-detail">Detail</span>;
    }
};

const MitraOrders = () => {
    // ── Data State ──
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── UI State ──
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // ── Fetch orders from API ──
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await api.get('/v1/mitra/orders');
                const data = response.data?.data?.orders
                    || response.data?.data
                    || response.data?.orders
                    || [];
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                // Graceful: API belum tersedia → tetap empty state
                console.log('Orders API not yet available:', err.message);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // ── Computed: filtered & paginated orders ──
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            // Search filter
            const query = searchQuery.toLowerCase();
            const matchesSearch = !query
                || (order.id && String(order.id).toLowerCase().includes(query))
                || (order.order_id && String(order.order_id).toLowerCase().includes(query))
                || (order.customerName && order.customerName.toLowerCase().includes(query))
                || (order.pelanggan && order.pelanggan.toLowerCase().includes(query));

            // Status filter
            const orderStatus = (order.status || '').toLowerCase().replace(/\s+/g, '_');
            const matchesStatus = !statusFilter || orderStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    // ── Computed: stats from orders ──
    const stats = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        const todayOrders = orders.filter((o) => {
            const d = o.created_at || o.waktu || o.tanggal || '';
            return d.startsWith(today);
        });

        // If no date matching possible, count all orders
        const base = todayOrders.length > 0 ? todayOrders : orders;

        return {
            total: base.length,
            menunggu: base.filter((o) => (o.status || '').toLowerCase() === 'baru').length,
            aktif: base.filter((o) => {
                const s = (o.status || '').toLowerCase().replace(/\s+/g, '_');
                return s === 'proses' || s === 'siap_kirim';
            }).length,
            selesai: base.filter((o) => (o.status || '').toLowerCase() === 'selesai').length,
        };
    }, [orders]);

    // ── Format date helper ──
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

    if (loading) {
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
                            {paginatedOrders.length === 0 ? (
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
                                paginatedOrders.map((order) => {
                                    const serviceBadge = getServiceBadge(order.service || order.layanan);
                                    const statusBadge = getStatusBadge(order.status);
                                    const orderId = order.order_id || order.id || '-';
                                    const customerName = order.customerName || order.pelanggan || order.nama_pelanggan || '-';
                                    const customerAddr = order.customerAddress || order.alamat || '';
                                    const orderTime = formatDateTime(order.created_at || order.waktu || order.tanggal);

                                    return (
                                        <tr key={orderId}>
                                            <td>
                                                <span className="mo-order-id">#{orderId}</span>
                                            </td>
                                            <td>
                                                <div className="mo-customer-name">{customerName}</div>
                                                {customerAddr && (
                                                    <div className="mo-customer-address">{customerAddr}</div>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`mo-service-badge mo-service-badge--${serviceBadge.modifier}`}>
                                                    {serviceBadge.label}
                                                </span>
                                            </td>
                                            <td className="mo-order-time">{orderTime}</td>
                                            <td>
                                                <span className={`mo-status-badge mo-status-badge--${statusBadge.modifier}`}>
                                                    {statusBadge.label}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {getActionButton(order.status)}
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
                        {filteredOrders.length === 0
                            ? 'Showing 0 of 0 orders'
                            : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of ${filteredOrders.length} orders`
                        }
                    </span>
                    <div className="mo-pagination-btns">
                        <button
                            className="mo-pagination-btn"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </button>
                        <button
                            className="mo-pagination-btn"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MitraOrders;
