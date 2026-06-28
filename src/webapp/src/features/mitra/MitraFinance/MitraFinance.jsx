import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import './MitraFinance.css';

/**
 * MitraFinance — Halaman Manajemen Keuangan Mitra
 *
 * Menampilkan:
 * - Stats overview: Total Pendapatan, Saldo Tersedia, Pesanan Selesai, Saldo Tertahan
 * - Search & Filter transaksi
 * - Tabel Riwayat Transaksi dengan pagination
 * - Empty state jika data transaksi kosong
 *
 * API Endpoint:
 * - GET /v1/dashboard/mitra/finance
 */

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
    { value: 'all', label: 'Semua Status' },
    { value: 'tersedia', label: 'Tersedia' },
    { value: 'tertahan', label: 'Tertahan' },
];

/**
 * Format number as IDR currency
 */
const formatIDR = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number || 0);
};

const MitraFinance = () => {
    // ── Data State ──
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        totalPendapatan: 0,
        saldoTersedia: 0,
        pesananSelesai: 0,
        saldoTertahan: 0,
    });
    const [loading, setLoading] = useState(true);

    // ── UI State ──
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // ── Fetch finance data ──
    const fetchFinanceData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Ringkasan
            const summaryRes = await api.get('/v1/mitra/keuangan/ringkasan');
            const summaryData = summaryRes.data?.data || summaryRes.data;

            if (summaryData) {
                setStats({
                    totalPendapatan: summaryData.total_pendapatan || 0,
                    saldoTersedia: summaryData.saldo_tersedia || 0,
                    pesananSelesai: summaryData.pesanan_selesai || 0,
                    saldoTertahan: summaryData.saldo_tertahan || 0,
                });
            }

            // Fetch Transaksi
            const params = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                ...(searchQuery && { search: searchQuery }),
                ...(statusFilter && statusFilter !== 'all' && { status_dana: statusFilter }),
            };
            const txRes = await api.get('/v1/mitra/keuangan/transaksi', { params });
            const txData = txRes.data;

            setTransactions(txData.data || []);
            setTotalPages(txData.last_page || txData.meta?.last_page || txData.meta?.total_pages || 1);
            setTotalItems(txData.total || txData.meta?.total || txData.meta?.total_items || 0);

        } catch (err) {
            console.log('Finance API error:', err.message);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, statusFilter]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchFinanceData();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchFinanceData]);

    // Reset page to 1 on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);



    return (
        <>
            {/* ── Header ── */}
            <header className="mf-header">
                <h1>Manajemen Keuangan</h1>
                <p>Pantau pendapatan, saldo, dan riwayat transaksi Anda secara real-time.</p>
            </header>

            {/* ── Stats Row ── */}
            <div className="mf-stats-grid">
                <div className="mf-stat-card">
                    <div>
                        <p className="mf-stat-card-label">Total Pendapatan</p>
                        <p className="mf-stat-card-value">{formatIDR(stats.totalPendapatan)}</p>
                    </div>
                    <p className="mf-stat-card-note mf-stat-card-note--positive">
                        <span className="material-symbols-outlined mf-stat-card-note-icon">trending_up</span>
                        {stats.totalPendapatan > 0 ? '+12% dari bulan lalu' : '+0% dari bulan lalu'}
                    </p>
                </div>

                <div className="mf-stat-card">
                    <div>
                        <p className="mf-stat-card-label">Saldo Tersedia</p>
                        <p className="mf-stat-card-value">{formatIDR(stats.saldoTersedia)}</p>
                    </div>
                    <button className="mf-btn-primary">Tarik Saldo</button>
                </div>

                <div className="mf-stat-card">
                    <div>
                        <p className="mf-stat-card-label">Pesanan Selesai</p>
                        <p className="mf-stat-card-value">{stats.pesananSelesai}</p>
                    </div>
                    <p className="mf-stat-card-note">Bulan ini</p>
                </div>

                <div className="mf-stat-card">
                    <div className="mf-stat-card-top-accent"></div>
                    <div>
                        <div className="mf-stat-card-header">
                            <p className="mf-stat-card-label">Saldo Tertahan (Escrow)</p>
                            <span className="material-symbols-outlined mf-stat-card-icon">lock</span>
                        </div>
                        <p className="mf-stat-card-value">{formatIDR(stats.saldoTertahan)}</p>
                    </div>
                    <p className="mf-stat-card-note mf-stat-card-note--tertiary">
                        <span className="material-symbols-outlined mf-stat-card-note-icon">info</span>
                        Menunggu penyelesaian
                    </p>
                </div>
            </div>

            {/* ── Search & Filter Toolbar ── */}
            <div className="mf-toolbar">
                <div className="mf-toolbar-left">
                    <div className="mf-search-wrapper">
                        <span className="material-symbols-outlined mf-search-icon">search</span>
                        <input
                            className="mf-search-input"
                            type="text"
                            placeholder="Cari ID Transaksi atau Nama Pelanggan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="mf-filter-wrapper">
                        <select
                            className="mf-filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined mf-filter-icon">expand_more</span>
                    </div>
                </div>
                <button className="mf-export-btn">
                    <span className="material-symbols-outlined">download</span>
                    Export
                </button>
            </div>

            {/* ── Transaction Table Panel ── */}
            <div className="mf-table-panel">
                <div className="mf-table-panel-header">
                    <h2 className="mf-table-panel-title">Riwayat Transaksi</h2>
                </div>
                <div className="mf-table-wrap">
                    <table className="mf-table">
                        <thead>
                            <tr>
                                <th>ID Transaksi</th>
                                <th>Tanggal</th>
                                <th>Layanan</th>
                                <th>Pelanggan</th>
                                <th>Jumlah (Rp)</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="mf-table-empty">
                                            <span className="material-symbols-outlined mf-loading-spinner">progress_activity</span>
                                            <p className="mf-table-empty-title">Memuat data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="mf-table-empty">
                                            <span className="material-symbols-outlined mf-table-empty-icon">receipt_long</span>
                                            <p className="mf-table-empty-title">Belum ada riwayat transaksi</p>
                                            <p className="mf-table-empty-text">
                                                Data transaksi pembayaran Anda akan muncul di sini.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => {
                                    const txId = tx.id_transaksi || tx.id || tx.transaction_id || '-';
                                    const dateStr = tx.tanggal_transaksi || tx.date || tx.tanggal;
                                    const date = dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                                    const service = tx.service || tx.layanan || '-';
                                    const customer = tx.nama_pelanggan || tx.customer || tx.pelanggan || '-';
                                    const amount = tx.jumlah || tx.amount || 0;
                                    const status = String(tx.status_dana || tx.status || '').toLowerCase();

                                    // Map status to badge modifier class
                                    let badgeModifier = 'proses';
                                    if (status.includes('tersedia') || status === 'success') badgeModifier = 'selesai';
                                    if (status.includes('tertahan')) badgeModifier = 'baru';

                                    const displayStatus = tx.status_dana ? tx.status_dana : 'PROSES';

                                    return (
                                        <tr key={txId}>
                                            <td className="mf-tx-id">#{txId}</td>
                                            <td className="mf-tx-date">{date}</td>
                                            <td className="mf-tx-service">{service}</td>
                                            <td className="mf-tx-customer">{customer}</td>
                                            <td className="mf-tx-amount">{formatIDR(amount)}</td>
                                            <td>
                                                <span className={`mf-status-badge mf-status-badge--${badgeModifier}`}>
                                                    {displayStatus}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button className="mf-action-link">Detail</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                <div className="mf-pagination">
                    <span className="mf-pagination-info">
                        {totalItems === 0
                            ? 'Showing 0 of 0 transactions'
                            : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of ${totalItems} transactions`
                        }
                    </span>
                    <div className="mf-pagination-btns">
                        <button
                            className="mf-pagination-btn"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </button>
                        <button
                            className="mf-pagination-btn"
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

export default MitraFinance;
