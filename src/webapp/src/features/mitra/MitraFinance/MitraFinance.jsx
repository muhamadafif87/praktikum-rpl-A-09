import React, { useState, useEffect, useMemo } from 'react';
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
    { value: '', label: 'Semua Status' },
    { value: 'baru', label: 'BARU' },
    { value: 'proses', label: 'PROSES' },
    { value: 'selesai', label: 'SELESAI' },
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
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // ── Fetch finance data ──
    useEffect(() => {
        const fetchFinanceData = async () => {
            setLoading(true);
            try {
                const response = await api.get('/v1/mitra/keuangan/ringkasan');
                // response.data merujuk pada root JSON, response.data.data merujuk pada object isi data
                const data = response.data?.data || response.data;

                // Perbaikan: Mengubah responseData menjadi data agar sesuai dengan variabel yang di-declare
                if (data && data.total_pendapatan !== undefined) {
                    setStats({
                        totalPendapatan: data.total_pendapatan || 0,
                        saldoTersedia: data.saldo_tersedia || 0,
                        pesananSelesai: data.pesanan_selesai || 0,
                        saldoTertahan: data.saldo_tertahan || 0,
                    });
                } else if (data && data.stats) {
                    setStats({
                        totalPendapatan: data.stats.total_pendapatan || 0,
                        saldoTersedia: data.stats.saldo_tersedia || 0,
                        pesananSelesai: data.stats.pesanan_selesai || 0,
                        saldoTertahan: data.stats.saldo_tertahan || 0,
                    });
                }

                // Ambil data transaksi secara aman dari properti potensial atau fallback ke array kosong
                const txList = data?.transactions || data?.items || response.data?.transactions || [];
                setTransactions(Array.isArray(txList) ? txList : []);
            } catch (err) {
                console.log('Finance API not yet available:', err.message);
                // Set empty state jika endpoint tidak ditemukan atau error
                setTransactions([]);
                setStats({
                    totalPendapatan: 0,
                    saldoTersedia: 0,
                    pesananSelesai: 0,
                    saldoTertahan: 0,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchFinanceData();
    }, []);

    // ── Computed: Filtered & Paginated Transactions ──
    const filteredTransactions = useMemo(() => {
        return transactions.filter((tx) => {
            // Search logic (ID or Customer Name)
            const query = searchQuery.toLowerCase();
            const txId = String(tx.id || tx.transaction_id || '').toLowerCase();
            const customerName = String(tx.customer || tx.pelanggan || '').toLowerCase();
            const matchesSearch = !query || txId.includes(query) || customerName.includes(query);

            // Status filter logic
            const statusKey = String(tx.status || '').toLowerCase();
            const matchesStatus = !statusFilter || statusKey === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [transactions, searchQuery, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page to 1 on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    if (loading) {
        return (
            <div className="mf-loading">
                <span className="material-symbols-outlined mf-loading-spinner">progress_activity</span>
            </div>
        );
    }

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
                            {paginatedTransactions.length === 0 ? (
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
                                paginatedTransactions.map((tx) => {
                                    const txId = tx.id || tx.transaction_id || '-';
                                    const date = tx.date || tx.tanggal || '-';
                                    const service = tx.service || tx.layanan || '-';
                                    const customer = tx.customer || tx.pelanggan || '-';
                                    const amount = tx.amount || tx.jumlah || 0;
                                    const status = String(tx.status || '').toLowerCase();

                                    // Map status to badge modifier class
                                    let badgeModifier = 'proses';
                                    if (status === 'selesai' || status === 'success') badgeModifier = 'selesai';
                                    if (status === 'baru') badgeModifier = 'baru';

                                    const displayStatus = tx.status ? tx.status.toUpperCase() : 'PROSES';

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
                        {filteredTransactions.length === 0
                            ? 'Showing 0 of 0 transactions'
                            : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of ${filteredTransactions.length} transactions`
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
