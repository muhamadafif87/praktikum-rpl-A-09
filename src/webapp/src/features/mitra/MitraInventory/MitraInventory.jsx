import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../services/api';
import './MitraInventory.css';

/**
 * MitraInventory — Halaman Manajemen Inventaris Mitra
 *
 * Menampilkan daftar inventaris/produk mitra dengan fitur:
 * - Stats overview (Total Produk, Stok Rendah, Stok Habis, Kategori Layanan)
 * - Search & filter
 * - Tabel inventaris dengan pagination
 * - Empty state jika belum ada data
 *
 * API Endpoint:
 * - GET /v1/mitra/inventory
 */

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
    { value: '', label: 'Semua Status' },
    { value: 'tersedia', label: 'TERSEDIA' },
    { value: 'stok_rendah', label: 'STOK RENDAH' },
    { value: 'habis', label: 'HABIS' },
];

/**
 * Maps a raw category string to a display label and CSS modifier.
 */
const getCategoryBadge = (category) => {
    const c = (category || '').toLowerCase();
    if (c.includes('gas') || c.includes('galon')) return { label: 'GAS & GALON', modifier: 'gas' };
    if (c.includes('laundry')) return { label: 'LAUNDRY', modifier: 'laundry' };
    if (c.includes('clean') || c.includes('cleaning')) return { label: 'DAILY CLEANING', modifier: 'cleaning' };
    return { label: category?.toUpperCase() || '-', modifier: 'laundry' };
};

/**
 * Determines stock status based on stock quantity.
 * Returns display label and CSS modifier.
 */
const getStockStatus = (stock, status) => {
    // If the API provides a status string, use it
    if (status) {
        const s = status.toLowerCase().replace(/\s+/g, '_');
        if (s === 'habis' || s === 'stok_habis') return { label: 'HABIS', modifier: 'habis' };
        if (s === 'stok_rendah' || s === 'rendah') return { label: 'STOK RENDAH', modifier: 'rendah' };
        if (s === 'tersedia') return { label: 'TERSEDIA', modifier: 'tersedia' };
    }
    // Fallback: derive from stock quantity
    const qty = parseInt(stock) || 0;
    if (qty <= 0) return { label: 'HABIS', modifier: 'habis' };
    if (qty <= 5) return { label: 'STOK RENDAH', modifier: 'rendah' };
    return { label: 'TERSEDIA', modifier: 'tersedia' };
};

/**
 * Returns the appropriate action button for a given stock status.
 */
const getActionButton = (statusModifier) => {
    if (statusModifier === 'habis' || statusModifier === 'rendah') {
        return <button className="mi-action-btn mi-action-btn--primary">Restock</button>;
    }
    return <button className="mi-action-btn mi-action-btn--outline">Update Stok</button>;
};

const MitraInventory = () => {
    // ── Data State ──
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── UI State ──
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // ── Fetch inventory from API ──
    useEffect(() => {
        const fetchInventory = async () => {
            setLoading(true);
            try {
                const response = await api.get('/v1/mitra/inventory');
                const data = response.data?.data?.items
                    || response.data?.data?.inventory
                    || response.data?.data
                    || response.data?.items
                    || response.data?.inventory
                    || [];
                setInventory(Array.isArray(data) ? data : []);
            } catch (err) {
                // Graceful: API belum tersedia → tetap empty state
                console.log('Inventory API not yet available:', err.message);
                setInventory([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    // ── Computed: filtered & paginated inventory ──
    const filteredInventory = useMemo(() => {
        return inventory.filter((item) => {
            // Search filter
            const query = searchQuery.toLowerCase();
            const matchesSearch = !query
                || (item.id && String(item.id).toLowerCase().includes(query))
                || (item.product_id && String(item.product_id).toLowerCase().includes(query))
                || (item.name && item.name.toLowerCase().includes(query))
                || (item.nama_produk && item.nama_produk.toLowerCase().includes(query));

            // Status filter
            const stockStatus = getStockStatus(item.stock || item.stok, item.status);
            const statusKey = stockStatus.modifier === 'rendah' ? 'stok_rendah' : stockStatus.modifier;
            const matchesStatus = !statusFilter || statusKey === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [inventory, searchQuery, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredInventory.length / ITEMS_PER_PAGE));
    const paginatedInventory = filteredInventory.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    // ── Computed: stats from inventory ──
    const stats = useMemo(() => {
        const categories = new Set();
        let stokRendah = 0;
        let stokHabis = 0;

        inventory.forEach((item) => {
            const cat = item.category || item.kategori || '';
            if (cat) categories.add(cat.toLowerCase());

            const status = getStockStatus(item.stock || item.stok, item.status);
            if (status.modifier === 'rendah') stokRendah++;
            if (status.modifier === 'habis') stokHabis++;
        });

        return {
            total: inventory.length,
            stokRendah,
            stokHabis,
            kategori: categories.size,
        };
    }, [inventory]);

    if (loading) {
        return (
            <div className="mi-loading">
                <span className="material-symbols-outlined mi-loading-spinner">progress_activity</span>
            </div>
        );
    }

    return (
        <>
            {/* ── Header ── */}
            <header className="mi-header">
                <h1>Manajemen Inventaris</h1>
                <p>Pantau dan kelola stok produk layanan Anda secara real-time.</p>
            </header>

            {/* ── Stats Row ── */}
            <div className="mi-stats-grid">
                <div className="mi-stat-card">
                    <p className="mi-stat-card-label">Total Produk</p>
                    <p className="mi-stat-card-value">{stats.total}</p>
                </div>
                <div className="mi-stat-card">
                    <p className="mi-stat-card-label">Stok Rendah</p>
                    <p className="mi-stat-card-value mi-stat-card-value--tertiary">{stats.stokRendah}</p>
                </div>
                <div className="mi-stat-card">
                    <p className="mi-stat-card-label">Stok Habis</p>
                    <p className="mi-stat-card-value mi-stat-card-value--error">{stats.stokHabis}</p>
                </div>
                <div className="mi-stat-card">
                    <p className="mi-stat-card-label">Kategori Layanan</p>
                    <p className="mi-stat-card-value mi-stat-card-value--secondary">{stats.kategori}</p>
                </div>
            </div>

            {/* ── Search & Filter Toolbar ── */}
            <div className="mi-toolbar">
                <div className="mi-toolbar-left">
                    <div className="mi-search-wrapper">
                        <span className="material-symbols-outlined mi-search-icon">search</span>
                        <input
                            className="mi-search-input"
                            type="text"
                            placeholder="Cari Nama Produk atau ID Inventaris"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="mi-filter-wrapper">
                        <select
                            className="mi-filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined mi-filter-icon">expand_more</span>
                    </div>
                </div>
                <button className="mi-export-btn">
                    <span className="material-symbols-outlined">download</span>
                    Export
                </button>
            </div>

            {/* ── Inventory Table ── */}
            <div className="mi-table-panel">
                <div className="mi-table-panel-header">
                    <h2 className="mi-table-panel-title">Daftar Inventaris</h2>
                </div>
                <div className="mi-table-wrap">
                    <table className="mi-table">
                        <thead>
                            <tr>
                                <th>ID Produk</th>
                                <th>Nama Produk</th>
                                <th>Kategori</th>
                                <th>Stok Saat Ini</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="mi-table-empty">
                                            <span className="material-symbols-outlined mi-table-empty-icon">inventory_2</span>
                                            <p className="mi-table-empty-title">Belum ada produk inventaris</p>
                                            <p className="mi-table-empty-text">
                                                Data inventaris produk layanan Anda akan muncul di sini.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedInventory.map((item) => {
                                    const productId = item.product_id || item.id || '-';
                                    const productName = item.name || item.nama_produk || '-';
                                    const productNote = item.note || item.catatan || '';
                                    const category = item.category || item.kategori || '';
                                    const stock = item.stock || item.stok || 0;
                                    const unit = item.unit || item.satuan || 'Units';
                                    const categoryBadge = getCategoryBadge(category);
                                    const stockStatus = getStockStatus(stock, item.status);

                                    return (
                                        <tr key={productId}>
                                            <td>
                                                <span className="mi-product-id">#{productId}</span>
                                            </td>
                                            <td>
                                                <div className="mi-product-name">{productName}</div>
                                                {productNote && (
                                                    <div className="mi-product-note">{productNote}</div>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`mi-category-badge mi-category-badge--${categoryBadge.modifier}`}>
                                                    {categoryBadge.label}
                                                </span>
                                            </td>
                                            <td className="mi-stock-text">{stock} {unit}</td>
                                            <td>
                                                <span className={`mi-status-badge mi-status-badge--${stockStatus.modifier}`}>
                                                    {stockStatus.label}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {getActionButton(stockStatus.modifier)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                <div className="mi-pagination">
                    <span className="mi-pagination-info">
                        {filteredInventory.length === 0
                            ? 'Showing 0 of 0 products'
                            : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredInventory.length)} of ${filteredInventory.length} products`
                        }
                    </span>
                    <div className="mi-pagination-btns">
                        <button
                            className="mi-pagination-btn"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </button>
                        <button
                            className="mi-pagination-btn"
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

export default MitraInventory;
