import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../../services/api';
import MitraOrders from '../MitraOrders/MitraOrders';
import MitraInventory from '../MitraInventory/MitraInventory';
import MitraFinance from '../MitraFinance/MitraFinance';
import './MitraDashboard.css';

/**
 * MitraDashboard — Komponen utama dashboard mitra
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

const FALLBACK_CHART_X_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MitraDashboard = ({ initialTab = 'overview' }) => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({ saldo: 0, pesananBaru: 0, prosesJemput: 0, siapKirim: 0 });
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [performance, setPerformance] = useState({
        rata_rata_rating: 0, total_ulasan: 0, persentase_bintang5: 0
    });
    const [chartData, setChartData] = useState({ x_labels: [], series: [] });
    const [loading, setLoading] = useState(true);
    const [activeSidebar, setActiveSidebar] = useState(initialTab);

    // ── State Baru untuk Dropdown Profil & Detail Foto ──
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [photoModalOpen, setPhotoModalOpen] = useState(false);

    useEffect(() => {
        setActiveSidebar(initialTab);
    }, [initialTab]);

    const handleTakeOrder = () => {
        setActiveSidebar('orders');
    };

    // ── User data from localStorage ──
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const mitraName = user.nama_mitra || user.nama_usaha || 'Mitra';
    const profilePictureUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBXDSLI8t_TddSXUzc0JpwmwLVgSFHMX7eykXqusfKy0xpTgzVWHyZW1sxVKCbB5ENVzD_r9CpRbEpQ9AVVnSKRu29mGBft182WoOAL9lcpDHutvijdU1kgKE-QppY99g72pWEm8auOcm3QNn4edGo_TbWxIWeA7uyk4rkk_JGL26XOZTcCUFLdl2N8fvNRrE5Lmt34Lo6brIfQOIug_NHBPg2AfBYBir8K8jG4d_yG8sZL7DTh-_RBnzNqASvypzzj-los_r-yEXA";

    // ── Fetch dashboard data ──
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [statsRes, ordersRes, inventoryRes, perfRes, financeRes] = await Promise.allSettled([
                    api.get('/v1/mitra/pesanan/stats'),
                    api.get('/v1/mitra/pesanan/', { params: { status: 'pending' } }),
                    api.get('/v1/mitra/layanan/informasi-stok/'),
                    api.get('/v1/mitra/ulasan/statistik/'),
                    api.get('/v1/mitra/keuangan/pendapatan/'),
                ]);

                // Stats
                if (statsRes.status === 'fulfilled') {
                    setStats(statsRes.value.data?.data || statsRes.value.data || stats);
                }

                // Orders
                if (ordersRes.status === 'fulfilled') {
                    setOrders(ordersRes.value.data?.data || []);
                }

                // Inventory
                if (inventoryRes.status === 'fulfilled') {
                    setInventory(inventoryRes.value.data?.data || []);
                }

                // Performance / Ulasan
                if (perfRes.status === 'fulfilled') {
                    setPerformance(perfRes.value.data?.data || performance);
                }

                // Finance / Chart Pendapatan
                if (financeRes.status === 'fulfilled') {
                    const fetchedFinanceData = financeRes.value.data?.data || {};
                    setChartData(fetchedFinanceData);

                    if (fetchedFinanceData.saldo !== undefined && !stats.saldo) {
                        setStats(prev => ({ ...prev, saldo: fetchedFinanceData.saldo }));
                    }
                }

            } catch (err) {
                console.log('Dashboard API not yet fully available:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Menutup dropdown otomatis jika user mengklik bagian luar layar
    useEffect(() => {
        const handleOutsideClick = () => setProfileMenuOpen(false);
        if (profileMenuOpen) {
            window.addEventListener('click', handleOutsideClick);
        }
        return () => window.removeEventListener('click', handleOutsideClick);
    }, [profileMenuOpen]);

    const handleLogout = async () => {
        try {
            await api.post('/v1/auth/logout');
        } catch (err) {}
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ', ' +
               date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    // Format data khusus untuk Recharts
    const formattedRechartsData = (chartData.x_labels?.length > 0 ? chartData.x_labels : FALLBACK_CHART_X_LABELS).map((label, index) => ({
        name: label,
        pendapatan: chartData.series?.[index] || 0
    }));

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

                    {/* Wadah interaktif untuk avatar profil */}
                    <div className="md-topbar-profile-container" onClick={(e) => e.stopPropagation()}>
                        <div className="md-topbar-profile" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
                            <img
                                className="md-topbar-avatar"
                                src={profilePictureUrl}
                                alt="Partner Profile"
                            />
                            <span className="md-topbar-name">{mitraName}</span>
                            <span className="material-symbols-outlined md-profile-arrow">
                                {profileMenuOpen ? 'expand_less' : 'expand_more'}
                            </span>
                        </div>

                        {/* Dropdown Menu Popup */}
                        {profileMenuOpen && (
                            <div className="md-profile-dropdown">
                                <div className="md-dropdown-info">
                                    <img
                                        className="md-dropdown-avatar"
                                        src={profilePictureUrl}
                                        alt="Partner Profile"
                                    />
                                    <div className="md-dropdown-meta">
                                        <h4 className="md-dropdown-name">{mitraName}</h4>
                                        <p className="md-dropdown-sub">{user.nomor_telepon || 'mitra@kosthub.com'}</p>
                                        <span className="md-dropdown-badge">Mitra Aktif</span>
                                    </div>
                                </div>
                                <div className="md-dropdown-actions">
                                    <button className="md-dropdown-btn" onClick={() => { setPhotoModalOpen(true); setProfileMenuOpen(false); }}>
                                        <span className="material-symbols-outlined">visibility</span>
                                        Lihat Foto Profil
                                    </button>
                                    <button className="md-dropdown-btn md-btn-logout" onClick={handleLogout}>
                                        <span className="material-symbols-outlined">logout</span>
                                        Keluar / Logout
                                    </button>
                                </div>
                            </div>
                        )}
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
                                } else if (item.key === 'support') {
                                    navigate('/dashboard/mitra/support');
                                } else if (item.key === 'settings') {
                                    navigate('/dashboard/mitra/settings');
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
                ) : activeSidebar === 'inventory' ? (
                    <MitraInventory />
                ) : activeSidebar === 'finance' ? (
                    <MitraFinance />
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
                                    <h3 className="md-stat-label">Saldo & Pendapatan</h3>
                                    <p className="md-stat-sublabel">Saldo Tersedia</p>
                                    <p className="md-stat-value">{formatCurrency(stats.saldo || 0)}</p>
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
                                <p className="md-stat-value">{stats.pesananBaru || orders.length || 0}</p>
                            </div>

                            {/* Proses Jemput */}
                            <div className="md-stat-card">
                                <div className="md-stat-icon-row">
                                    <span className="material-symbols-outlined md-stat-icon md-stat-icon--tertiary">local_shipping</span>
                                </div>
                                <h3 className="md-stat-label">Proses Jemput</h3>
                                <p className="md-stat-value">{stats.prosesJemput || 0}</p>
                            </div>

                            {/* Siap Kirim */}
                            <div className="md-stat-card">
                                <div className="md-stat-icon-row">
                                    <span className="material-symbols-outlined md-stat-icon md-stat-icon--secondary">check_circle</span>
                                </div>
                                <h3 className="md-stat-label">Siap Kirim</h3>
                                <p className="md-stat-value">{stats.siapKirim || 0}</p>
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
                                                    orders.map((order) => {
                                                        const customerName = order.user?.nama_lengkap || '-';
                                                        const customerAddress = order.user?.alamat_kost || '-';
                                                        const serviceName = order.detail_pesanan?.[0]?.layanan?.nama_layanan || 'Layanan';
                                                        const totalPrice = order.catatan?.total_pembayaran || 0;

                                                        return (
                                                            <tr key={order.id_pesanan}>
                                                                <td>
                                                                    <div className="md-table-customer-name">{customerName}</div>
                                                                    <div className="md-table-customer-addr">{customerAddress}</div>
                                                                </td>
                                                                <td><span className="md-table-service-badge">{serviceName}</span></td>
                                                                <td className="md-table-price">{formatCurrency(totalPrice)}</td>
                                                                <td className="md-table-time">{formatDate(order.tgl_pesanan)}</td>
                                                                <td style={{ textAlign: 'right' }}>
                                                                    <button
                                                                        className="md-table-action-btn"
                                                                        onClick={() => {setActiveSidebar('orders');}}
                                                                    >Ambil Pesanan
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
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
                                    <div className="md-chart-area" style={{ height: '18rem', paddingRight: '1rem', paddingTop: '1rem' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={formattedRechartsData}
                                                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                                            >
                                                <defs>
                                                    <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--md-primary)" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="var(--md-primary)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: 'var(--md-on-surface-variant)' }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fill: 'var(--md-on-surface-variant)' }}
                                                    tickFormatter={(value) => `Rp ${value / 1000}k`}
                                                />
                                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--md-outline-variant)" />
                                                <Tooltip
                                                    formatter={(value) => [formatCurrency(value), "Pendapatan"]}
                                                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="pendapatan"
                                                    stroke="var(--md-primary)"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorPendapatan)"
                                                    activeDot={{ r: 6 }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
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
                                            inventory.map((item, index) => {
                                                const itemName = item.nama_layanan || `Produk ${index + 1}`;
                                                const stock = item.stok_tersedia ?? 0;
                                                const isLow = stock < 10;

                                                return (
                                                    <div key={index} className={`md-stock-item ${isLow ? 'md-stock-item--alert' : 'md-stock-item--normal'}`}>
                                                        <div className="md-stock-item-info">
                                                            <span className="material-symbols-outlined" style={{ color: isLow ? 'var(--md-error)' : 'var(--md-on-surface-variant)' }}>
                                                                {isLow ? 'warning' : 'inventory_2'}
                                                            </span>
                                                            <div>
                                                                <h3 className="md-stock-item-name">{itemName}</h3>
                                                                <p className={`md-stock-item-count ${isLow ? 'md-stock-item-count--alert' : 'md-stock-item-count--normal'}`}>
                                                                    {isLow ? `Tersisa ${stock} unit` : `${stock} unit tersedia`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {isLow ? (
                                                            <button className="md-stock-restock-btn">Restock</button>
                                                        ) : (
                                                            <button className="md-stock-more-btn">
                                                                <span className="material-symbols-outlined">more_vert</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Performance Section */}
                                    <div className="md-perf-section">
                                        <h2 className="md-perf-title">Performance</h2>
                                        <div className="md-perf-rating-row">
                                            <span className="md-perf-rating-label">Average Rating</span>
                                            <div className="md-perf-rating-value">
                                                <span className="md-perf-rating-num">{performance.rata_rata_rating || '0'}</span>
                                                <div className="md-perf-stars">
                                                    {[...Array(5)].map((_, i) => {
                                                        const rating = Math.floor(performance.rata_rata_rating || 0);
                                                        return (
                                                            <span key={i} className="material-symbols-outlined" style={{ color: i < rating ? 'var(--md-tertiary)' : 'var(--md-outline-variant)' }}>star</span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md-perf-metrics">
                                            <div className="md-perf-metric">
                                                <p className="md-perf-metric-label">Total Ulasan</p>
                                                <p className="md-perf-metric-value">{performance.total_ulasan || 0}</p>
                                            </div>
                                            <div className="md-perf-metric">
                                                <p className="md-perf-metric-label">% Bintang 5</p>
                                                <p className="md-perf-metric-value">{performance.persentase_bintang5 ? `${performance.persentase_bintang5}%` : '-'}</p>
                                            </div>
                                        </div>
                                        <div className="md-perf-highlights">
                                            <p className="md-perf-highlights-title">Quick Highlights</p>
                                            <ul className="md-perf-highlights-list">
                                                <li>
                                                    <span className="material-symbols-outlined">thumb_up</span>
                                                    Kualitas layanan berjalan cukup baik!
                                                </li>
                                                <li>
                                                    <span className="material-symbols-outlined">forum</span>
                                                    Cek ulasan pelanggan secara berkala.
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

            {/* ═══ Detail Photo Modal ═══ */}
            {photoModalOpen && (
                <div className="md-photo-modal-overlay" onClick={() => setPhotoModalOpen(false)}>
                    <div className="md-photo-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="md-photo-modal-close" onClick={() => setPhotoModalOpen(false)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <img
                            className="md-photo-modal-img"
                            src={profilePictureUrl}
                            alt="Partner Profile Detail"
                        />
                        <div className="md-photo-modal-footer">
                            <h3>{mitraName}</h3>
                            <p>{user.nomor_telepon || 'mitra@kosthub.com'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Footer ═══ */}
            <footer className="md-footer">
                <div>
                    <span className="md-footer-brand">KostHub<span className="md-footer-brand-dot">.</span></span>
                    <p className="md-footer-copy">© 2026 KostHub Hyperlocal Marketplace</p>
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
