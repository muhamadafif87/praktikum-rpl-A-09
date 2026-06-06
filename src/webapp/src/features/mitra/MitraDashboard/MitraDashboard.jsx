import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import MitraOrders from '../MitraOrders/MitraOrders';
import './MitraDashboard.css';

/**
 * MitraDashboard — Komponen utama dashboard mitra
 * 
 * Data di-fetch dari backend API. Jika endpoint belum tersedia,
 * komponen menampilkan empty/zero state secara graceful.
 * 
 * API Endpoints:
 * - GET /api/v1/dashboard/mitra/stats
 * - GET /api/v1/dashboard/mitra/orders?status=incoming
 * - GET /api/v1/dashboard/mitra/inventory
 * - GET /api/v1/dashboard/mitra/performance
 */

const SIDEBAR_ITEMS = [
    { icon: 'dashboard', label: 'Overview', key: 'overview', active: true },
    { icon: 'receipt_long', label: 'Orders', key: 'orders' },
    { icon: 'inventory_2', label: 'Inventory', key: 'inventory' },
    { icon: 'chat', label: 'Chat', key: 'chat' },
    { icon: 'payments', label: 'Finance', key: 'finance' },
    { icon: 'star', label: 'Reviews & Performance', key: 'reviews' },
    { icon: 'support_agent', label: 'Help & Support', key: 'support' },
    { icon: 'settings', label: 'Settings', key: 'settings' },
];

const CHART_Y_LABELS = ['1M', '800k', '600k', '400k', '200k', '0'];
const CHART_X_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MitraDashboard = () => {
    const navigate = useNavigate();

    // ── Data State ──
    const [stats, setStats] = useState({ saldo: 0, pesananBaru: 0, prosesJemput: 0, siapKirim: 0 });
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [performance, setPerformance] = useState({
        avgRating: 0, responseTime: '-', completionRate: '-', topService: '-', repeatCustomerGrowth: '-'
    });
    const [loading, setLoading] = useState(true);
    const [activeSidebar, setActiveSidebar] = useState('overview');

    // ── User data from localStorage ──
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const mitraName = user.name || user.nama_usaha || 'Mitra';

    // ── Fetch dashboard data ──
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [statsRes, ordersRes, inventoryRes, perfRes] = await Promise.allSettled([
                    api.get('/v1/dashboard/mitra/stats'),
                    api.get('/v1/dashboard/mitra/orders', { params: { status: 'incoming' } }),
                    api.get('/v1/dashboard/mitra/inventory'),
                    api.get('/v1/dashboard/mitra/performance'),
                ]);

                if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data || statsRes.value.data);
                if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data.data?.orders || ordersRes.value.data.orders || []);
                if (inventoryRes.status === 'fulfilled') setInventory(inventoryRes.value.data.data?.items || inventoryRes.value.data.items || []);
                if (perfRes.status === 'fulfilled') setPerformance(perfRes.value.data.data || perfRes.value.data);
            } catch (err) {
                // Graceful: keep default empty/zero state
                console.log('Dashboard API not yet available:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/v1/auth/logout');
        } catch (err) {
            // Even if logout API fails, clear local state
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="mitra-dashboard-page">
            {/* ═══ Top Navbar ═══ */}
            <nav className="md-topbar">
                <div className="md-topbar-brand">
                    <Link to="/">KostHub<span className="md-topbar-brand-dot">.</span></Link>
                </div>
                <div className="md-topbar-actions">
                    <button className="md-topbar-icon-btn" title="Notifikasi">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="md-topbar-icon-btn" title="Bantuan">
                        <span className="material-symbols-outlined">help</span>
                    </button>
                    <div className="md-topbar-profile">
                        <img
                            className="md-topbar-avatar"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXDSLI8t_TddSXUzc0JpwmwLVgSFHMX7eykXqusfKy0xpTgzVWHyZW1sxVKCbB5ENVzD_r9CpRbEpQ9AVVnSKRu29mGBft182WoOAL9lcpDHutvijdU1kgKE-QppY99g72pWEm8auOcm3QNn4edGo_TbWxIWeA7uyk4rkk_JGL26XOZTcCUFLdl2N8fvNRrE5Lmt34Lo6brIfQOIug_NHBPg2AfBYBir8K8jG4d_yG8sZL7DTh-_RBnzNqASvypzzj-los_r-yEXA"
                            alt="Partner Profile"
                        />
                        <span className="md-topbar-name">{mitraName}</span>
                    </div>
                </div>
            </nav>

            {/* ═══ Sidebar ═══ */}
            <aside className="md-sidebar">
                <div className="md-sidebar-header">
                    <img
                        className="md-sidebar-avatar"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGYjeqX8fHQwiwWoGM55Tn_S265O77UcwSQ3I9oxzC6VEKAGOGmw5DlCMtPIJOrkS8hlluH2N6Qkd9h0nhOGuzQTCOngYr6OBPYGqHFog3-ALhupmVMNuC--NVRSQPHp8G-TJ-jLE02ulMXaS2ung3sH358WWxnDijTa7VKK4-dL2vI0n3-wrlT8unw7tsQcrAR7c_SPpSumAqsqPGAVMj9n0qzdPFCSJclO3iNv06yRgnW9bD94wiVS0wjKVWW3u-uJJ22gppitU"
                        alt="Admin Panel"
                    />
                    <h2 className="md-sidebar-title">Admin Panel</h2>
                    <p className="md-sidebar-subtitle">System Control</p>
                    <div className="md-sidebar-status">
                        <span className="md-sidebar-status-dot"></span>
                        <span className="md-sidebar-status-text">System Status: Operational</span>
                    </div>
                </div>

                <nav className="md-sidebar-nav">
                    {SIDEBAR_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            className={`md-sidebar-link ${activeSidebar === item.key ? 'md-sidebar-link--active' : ''}`}
                            onClick={() => {
                                setActiveSidebar(item.key);
                                if (item.key === 'chat') {
                                    navigate('/dashboard/mitra/chat');
                                } else if (item.key === 'reviews') {
                                    navigate('/dashboard/mitra/reviews');
                                }
                            }}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="md-sidebar-footer">
                    <button className="md-sidebar-support-btn">Quick Support</button>
                </div>
            </aside>

            {/* ═══ Main Content ═══ */}
            <main className="md-main">
                {activeSidebar === 'orders' ? (
                    <MitraOrders />
                ) : loading ? (
                    <div className="md-loading">
                        <span className="material-symbols-outlined md-spinner">progress_activity</span>
                    </div>
                ) : (
                    <>
                        {/* Welcome Header */}
                        <header className="md-welcome">
                            <h1>Halo, {mitraName}! 👋</h1>
                            <p>Here is a quick summary of today's performance.</p>
                        </header>

                        {/* Stats Grid */}
                        <div className="md-stats-grid">
                            {/* Saldo Card */}
                            <div className="md-stat-card md-stat-card--primary">
                                <div>
                                    <h3 className="md-stat-label">Saldo &amp; Pendapatan</h3>
                                    <p className="md-stat-sublabel">Saldo Tersedia</p>
                                    <p className="md-stat-value">{formatCurrency(stats.saldo)}</p>
                                </div>
                                <button className="md-withdraw-btn">
                                    <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>account_balance_wallet</span>
                                    Tarik Saldo
                                </button>
                            </div>

                            {/* Pesanan Baru */}
                            <div className="md-stat-card">
                                <div className="md-stat-icon-row">
                                    <span className="material-symbols-outlined md-stat-icon md-stat-icon--primary">shopping_cart</span>
                                    {stats.pesananBaru > 0 && <span className="md-stat-badge">+12%</span>}
                                </div>
                                <h3 className="md-stat-label">Pesanan Baru</h3>
                                <p className="md-stat-value">{stats.pesananBaru}</p>
                            </div>

                            {/* Proses Jemput */}
                            <div className="md-stat-card">
                                <div className="md-stat-icon-row">
                                    <span className="material-symbols-outlined md-stat-icon md-stat-icon--tertiary">local_shipping</span>
                                </div>
                                <h3 className="md-stat-label">Proses Jemput</h3>
                                <p className="md-stat-value">{stats.prosesJemput}</p>
                            </div>

                            {/* Siap Kirim */}
                            <div className="md-stat-card">
                                <div className="md-stat-icon-row">
                                    <span className="material-symbols-outlined md-stat-icon md-stat-icon--secondary">check_circle</span>
                                </div>
                                <h3 className="md-stat-label">Siap Kirim</h3>
                                <p className="md-stat-value">{stats.siapKirim}</p>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="md-content-grid">
                            {/* Left Column: Orders + Chart */}
                            <div>
                                {/* Orders Table */}
                                <div className="md-orders-panel">
                                    <div className="md-panel-header">
                                        <h2 className="md-panel-title">Incoming Orders</h2>
                                        <button className="md-panel-action" onClick={() => setActiveSidebar('orders')}>View All</button>
                                    </div>
                                    <div className="md-table-wrap">
                                        <table className="md-table">
                                            <thead>
                                                <tr>
                                                    <th>Customer</th>
                                                    <th>Service</th>
                                                    <th>Price</th>
                                                    <th>Time</th>
                                                    <th style={{ textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5">
                                                            <div className="md-table-empty">
                                                                <span className="material-symbols-outlined">inbox</span>
                                                                <p>Belum ada pesanan masuk saat ini.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    orders.map((order) => (
                                                        <tr key={order.id}>
                                                            <td>
                                                                <div className="md-table-customer-name">{order.customerName}</div>
                                                                <div className="md-table-customer-addr">{order.customerAddress}</div>
                                                            </td>
                                                            <td><span className="md-table-service-badge">{order.service}</span></td>
                                                            <td className="md-table-price">{formatCurrency(order.price)}</td>
                                                            <td className="md-table-time">{order.time}</td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <button className="md-table-action-btn">Ambil Pesanan</button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Revenue Chart */}
                                <div className="md-chart-panel">
                                    <div className="md-chart-header">
                                        <h2 className="md-chart-title">Tren Pendapatan</h2>
                                        <div className="md-chart-controls">
                                            <button className="md-chart-period">
                                                Weekly <span className="material-symbols-outlined" style={{ fontSize: '0.75rem' }}>expand_more</span>
                                            </button>
                                            <button className="md-topbar-icon-btn">
                                                <span className="material-symbols-outlined">more_vert</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="md-chart-area">
                                        <div className="md-chart-y-axis">
                                            {CHART_Y_LABELS.map((label) => (<span key={label}>{label}</span>))}
                                        </div>
                                        <div className="md-chart-canvas">
                                            <span className="material-symbols-outlined">show_chart</span>
                                            <p>Performance Chart</p>
                                        </div>
                                    </div>
                                    <div className="md-chart-x-axis">
                                        {CHART_X_LABELS.map((label) => (<span key={label}>{label}</span>))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Stock + Performance */}
                            <div className="md-right-panel">
                                {/* Stock Alerts */}
                                <div className="md-stock-panel">
                                    <div className="md-stock-header">
                                        <h2 className="md-stock-title">Peringatan Stok</h2>
                                        <span className="material-symbols-outlined" style={{ color: 'var(--md-on-surface-variant)' }}>inventory_2</span>
                                    </div>
                                    <div className="md-stock-list">
                                        {inventory.length === 0 ? (
                                            <div className="md-stock-empty">
                                                <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--md-outline-variant)', display: 'block', marginBottom: '0.5rem' }}>inventory_2</span>
                                                <p>Data inventaris belum tersedia.</p>
                                            </div>
                                        ) : (
                                            inventory.map((item) => (
                                                <div key={item.id} className={`md-stock-item ${item.isLow ? 'md-stock-item--alert' : 'md-stock-item--normal'}`}>
                                                    <div className="md-stock-item-info">
                                                        <span className="material-symbols-outlined" style={{ color: item.isLow ? 'var(--md-error)' : 'var(--md-on-surface-variant)' }}>
                                                            {item.isLow ? 'warning' : 'inventory_2'}
                                                        </span>
                                                        <div>
                                                            <h3 className="md-stock-item-name">{item.name}</h3>
                                                            <p className={`md-stock-item-count ${item.isLow ? 'md-stock-item-count--alert' : 'md-stock-item-count--normal'}`}>
                                                                {item.isLow ? `Tersisa ${item.stock} unit` : `${item.stock} unit tersedia`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {item.isLow ? (
                                                        <button className="md-stock-restock-btn">Restock</button>
                                                    ) : (
                                                        <button className="md-stock-more-btn">
                                                            <span className="material-symbols-outlined">more_vert</span>
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Performance Section */}
                                    <div className="md-perf-section">
                                        <h2 className="md-perf-title">Performance</h2>
                                        <div className="md-perf-rating-row">
                                            <span className="md-perf-rating-label">Average Rating</span>
                                            <div className="md-perf-rating-value">
                                                <span className="md-perf-rating-num">{performance.avgRating || '-'}</span>
                                                <div className="md-perf-stars">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className="material-symbols-outlined">star</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md-perf-metrics">
                                            <div className="md-perf-metric">
                                                <p className="md-perf-metric-label">Response Time</p>
                                                <p className="md-perf-metric-value">{performance.responseTime}</p>
                                            </div>
                                            <div className="md-perf-metric">
                                                <p className="md-perf-metric-label">Completion Rate</p>
                                                <p className="md-perf-metric-value">{performance.completionRate}</p>
                                            </div>
                                        </div>
                                        <div className="md-perf-highlights">
                                            <p className="md-perf-highlights-title">Quick Highlights</p>
                                            <ul className="md-perf-highlights-list">
                                                <li>
                                                    <span className="material-symbols-outlined">verified</span>
                                                    Top Rated Service: {performance.topService}
                                                </li>
                                                <li>
                                                    <span className="material-symbols-outlined">trending_up</span>
                                                    Repeat Customers: {performance.repeatCustomerGrowth}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* ═══ Footer ═══ */}
            <footer className="md-footer">
                <div>
                    <span className="md-footer-brand">KostHub<span className="md-footer-brand-dot">.</span></span>
                    <p className="md-footer-copy">© 2024 KostHub Hyperlocal Marketplace</p>
                </div>
                <div className="md-footer-links">
                    <a className="md-footer-link" href="#">Privacy Policy</a>
                    <a className="md-footer-link" href="#">Terms of Service</a>
                    <a className="md-footer-link" href="#">Partner Support</a>
                </div>
            </footer>
        </div>
    );
};

export default MitraDashboard;
