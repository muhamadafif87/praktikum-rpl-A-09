import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../services/api';
import './MitraInventory.css';

/**
 * MitraInventory — Halaman Manajemen Inventaris Mitra
 *
 * Menampilkan daftar inventaris/produk mitra dengan fitur:
 * - Stats overview
 * - Search & filter
 * - Tabel inventaris dengan pagination
 * - Fitur Update Stok (Popup Modal)
 */

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
    { value: '', label: 'Semua Status' },
    { value: 'tersedia', label: 'TERSEDIA' },
    { value: 'stok_rendah', label: 'STOK RENDAH' },
    { value: 'habis', label: 'HABIS' },
];

const getCategoryBadge = (category) => {
    const c = (category || '').toLowerCase();
    if (c.includes('gas') || c.includes('galon')) return { label: 'GAS & GALON', modifier: 'gas' };
    if (c.includes('laundry')) return { label: 'LAUNDRY', modifier: 'laundry' };
    if (c.includes('clean') || c.includes('cleaning')) return { label: 'DAILY CLEANING', modifier: 'cleaning' };
    return { label: category?.toUpperCase() || '-', modifier: 'laundry' };
};

const getStockStatus = (stock, status) => {
    if (status) {
        const s = status.toLowerCase().replace(/\s+/g, '_');
        if (s === 'habis' || s === 'stok_habis') return { label: 'HABIS', modifier: 'habis' };
        if (s === 'stok_rendah' || s === 'rendah') return { label: 'STOK RENDAH', modifier: 'rendah' };
        if (s === 'tersedia') return { label: 'TERSEDIA', modifier: 'tersedia' };
    }
    const qty = parseInt(stock) || 0;
    if (qty <= 0) return { label: 'HABIS', modifier: 'habis' };
    if (qty <= 5) return { label: 'STOK RENDAH', modifier: 'rendah' };
    return { label: 'TERSEDIA', modifier: 'tersedia' };
};

const MitraInventory = () => {
    // ── Data State ──
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── UI State ──
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // ── Modal State (Update Stok) ──
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [newStock, setNewStock] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // ── Fetch inventory from API ──
    useEffect(() => {
        const fetchInventory = async () => {
            setLoading(true);
            try {
                // Sesuaikan endpoint get kamu
                const response = await api.get('/v1/mitra/layanan/inventory');
                const data = response.data?.data?.items || response.data?.data || [];
                setInventory(Array.isArray(data) ? data : []);
            } catch (err) {
                console.log('Inventory API not yet available:', err.message);
                setInventory([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    // ── Handlers for Modal Update Stok ──
    const openUpdateModal = (item) => {
        setSelectedItem(item);
        const currentStock = item.stock !== undefined ? item.stock : item.stok;
        setNewStock(currentStock || 0);
        setIsModalOpen(true);
    };

    const closeUpdateModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setNewStock('');
    };

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;

        setIsUpdating(true);
        try {
            const productId = selectedItem.id || selectedItem.product_id;

            await api.put(`/v1/mitra/layanan/update-stok/${productId}`, {
                stok: parseInt(newStock)
            });

            setInventory((prev) =>
                prev.map((item) => {
                    const id = item.id || item.product_id;
                    if (id === productId) {
                        return { ...item, stok: parseInt(newStock), stock: parseInt(newStock) };
                    }
                    return item;
                })
            );

            closeUpdateModal();
        } catch (err) {
            alert('Gagal memperbarui stok: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsUpdating(false);
        }
    };

    // ── Computed: filtered & paginated inventory ──
    const filteredInventory = useMemo(() => {
        return inventory.filter((item) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = !query
                || (item.id && String(item.id).toLowerCase().includes(query))
                || (item.nama_produk && item.nama_produk.toLowerCase().includes(query));

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
                            placeholder="Cari Nama Produk atau ID"
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
                                            <p className="mi-table-empty-title">Belum ada produk</p>
                                            <p className="mi-table-empty-text">Data inventaris produk akan muncul di sini.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedInventory.map((item) => {
                                    const productId = item.id || item.product_id || '-';
                                    const productName = item.nama_produk || item.name || '-';
                                    const category = item.kategori || item.category || '';
                                    const stock = item.stok !== undefined ? item.stok : item.stock;
                                    const unit = item.satuan || item.unit || '';

                                    const categoryBadge = getCategoryBadge(category);
                                    const stockStatus = getStockStatus(stock, item.status);

                                    return (
                                        <tr key={productId}>
                                            <td><span className="mi-product-id">#{productId}</span></td>
                                            <td>
                                                <div className="mi-product-name">{productName}</div>
                                                {item.catatan && <div className="mi-product-note">{item.catatan}</div>}
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
                                                <button
                                                    className={`mi-action-btn ${stockStatus.modifier === 'habis' || stockStatus.modifier === 'rendah' ? 'mi-action-btn--primary' : 'mi-action-btn--outline'}`}
                                                    onClick={() => openUpdateModal(item)}
                                                >
                                                    {(stockStatus.modifier === 'habis' || stockStatus.modifier === 'rendah') ? 'Restock' : 'Update Stok'}
                                                </button>
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
                            ? 'Showing 0 products'
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

            {/* ── Modal Popup Update Stok ── */}
            {isModalOpen && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.container}>
                        <h3 style={modalStyles.title}>Update Stok Produk</h3>
                        <p style={modalStyles.subtitle}>
                            {selectedItem?.nama_produk || selectedItem?.name}
                            <strong style={{marginLeft: '4px', color: 'var(--md-primary)'}}>
                                (#{selectedItem?.id || selectedItem?.product_id})
                            </strong>
                        </p>

                        <form onSubmit={handleUpdateStock}>
                            <div style={modalStyles.inputGroup}>
                                <label style={modalStyles.label}>Jumlah Stok Tersedia</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newStock}
                                    onChange={(e) => setNewStock(e.target.value)}
                                    style={modalStyles.input}
                                    required
                                />
                            </div>
                            <div style={modalStyles.actions}>
                                <button type="button" onClick={closeUpdateModal} style={modalStyles.btnCancel} disabled={isUpdating}>
                                    Batal
                                </button>
                                <button type="submit" style={modalStyles.btnSave} disabled={isUpdating}>
                                    {isUpdating ? 'Menyimpan...' : 'Simpan Stok'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

// Inline styles untuk Modal agar tidak perlu merombak CSS luar
const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(2px)'
    },
    container: {
        background: 'var(--md-surface-container-lowest, #fff)',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    },
    title: { margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: 'var(--md-on-surface, #1f2937)' },
    subtitle: { margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: 'var(--md-on-surface-variant, #4b5563)' },
    inputGroup: { marginBottom: '1.5rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 },
    input: {
        width: '100%', padding: '0.5rem 1rem', borderRadius: '0.5rem',
        border: '1px solid var(--md-outline-variant, #d1d5db)',
        fontSize: '1rem', boxSizing: 'border-box', outline: 'none'
    },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' },
    btnCancel: {
        padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'transparent',
        border: '1px solid var(--md-outline-variant, #d1d5db)', cursor: 'pointer', fontWeight: 600
    },
    btnSave: {
        padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'var(--md-primary, #0d6efd)',
        color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600
    }
};

export default MitraInventory;
