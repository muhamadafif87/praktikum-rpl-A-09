import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './MitraLayout.css';

/**
 * MitraLayout — Komponen layout yang dipakai semua halaman mitra.
 *
 * Mengandung: Top Navbar (dengan profile dropdown + logout),
 *             Sidebar (navigasi), Footer.
 *
 * Props:
 *   - children: konten utama halaman
 *   - activePage: key sidebar yang aktif (overview|orders|inventory|chat|finance|reviews|support|settings)
 */

const SIDEBAR_ITEMS = [
    { to: '/dashboard/mitra',           icon: 'dashboard',     label: 'Overview',              key: 'overview' },
    { to: '/dashboard/mitra/orders',    icon: 'receipt_long',  label: 'Orders',                key: 'orders' },
    { to: '/dashboard/mitra/inventory', icon: 'inventory_2',   label: 'Inventory',             key: 'inventory' },
    { to: '/dashboard/mitra/chat',      icon: 'chat',          label: 'Chat',                  key: 'chat' },
    { to: '/dashboard/mitra/finance',   icon: 'payments',      label: 'Finance',               key: 'finance' },
    { to: '/dashboard/mitra/reviews',   icon: 'star',          label: 'Reviews & Performance', key: 'reviews' },
    { to: '/dashboard/mitra/support',   icon: 'support_agent', label: 'Help & Support',        key: 'support' },
    { to: '/dashboard/mitra/settings',  icon: 'settings',      label: 'Settings',              key: 'settings' },
];

const MitraLayout = ({ children, activePage = 'overview' }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // ── User data from localStorage ──
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const mitraName = user.nama_mitra || user.nama_usaha || user.name || 'Mitra';
    const profilePictureUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(mitraName)}&background=004ac6&color=fff`;

    // ── State Dropdown Profil & Detail Foto ──
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [photoModalOpen, setPhotoModalOpen] = useState(false);

    const { logout } = useAuth();

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
        } catch (err) {
            // Ignore logout errors - still clear local data
        }
        logout(); // Pakai logout dari AuthContext supaya context ter-reset & halaman force reload
    };

    return (
        <div className="mitra-layout-page">

            {/* ═══ Top Navbar ═══ */}
            <nav className="ml-topbar">
                <div className="ml-topbar-brand">
                    <Link to="/dashboard/mitra">KostHub<span className="ml-topbar-brand-dot">.</span></Link>
                </div>
                <div className="ml-topbar-actions">
                    <button className="ml-topbar-icon-btn" title="Notifikasi">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="ml-topbar-icon-btn" title="Bantuan">
                        <span className="material-symbols-outlined">help</span>
                    </button>

                    {/* Profile dropdown */}
                    <div className="ml-topbar-profile-container" onClick={(e) => e.stopPropagation()}>
                        <div className="ml-topbar-profile" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
                            <img
                                className="ml-topbar-avatar"
                                src={profilePictureUrl}
                                alt="Partner Profile"
                            />
                            <span className="ml-topbar-name">{mitraName}</span>
                            <span className="material-symbols-outlined ml-profile-arrow">
                                {profileMenuOpen ? 'expand_less' : 'expand_more'}
                            </span>
                        </div>

                        {/* Dropdown Menu */}
                        {profileMenuOpen && (
                            <div className="ml-profile-dropdown">
                                <div className="ml-dropdown-info">
                                    <img
                                        className="ml-dropdown-avatar"
                                        src={profilePictureUrl}
                                        alt="Partner Profile"
                                    />
                                    <div className="ml-dropdown-meta">
                                        <h4 className="ml-dropdown-name">{mitraName}</h4>
                                        <p className="ml-dropdown-sub">{user.nomor_telepon || 'mitra@kosthub.com'}</p>
                                        <span className="ml-dropdown-badge">Mitra Aktif</span>
                                    </div>
                                </div>
                                <div className="ml-dropdown-actions">
                                    <button className="ml-dropdown-btn" onClick={() => { setPhotoModalOpen(true); setProfileMenuOpen(false); }}>
                                        <span className="material-symbols-outlined">visibility</span>
                                        Lihat Foto Profil
                                    </button>
                                    <button className="ml-dropdown-btn ml-btn-logout" onClick={handleLogout}>
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
            <aside className="ml-sidebar">
                <div className="ml-sidebar-header">
                    <img
                        className="ml-sidebar-avatar"
                        src={profilePictureUrl}
                        alt="Admin Panel"
                    />
                    <h2 className="ml-sidebar-title">Admin Panel</h2>
                    <p className="ml-sidebar-subtitle">System Control</p>
                    <div className="ml-sidebar-status">
                        <span className="ml-sidebar-status-dot"></span>
                        <span className="ml-sidebar-status-text">System Status: Operational</span>
                    </div>
                </div>

                <nav className="ml-sidebar-nav">
                    {SIDEBAR_ITEMS.map((item) => (
                        <Link
                            key={item.key}
                            to={item.to}
                            className={`ml-sidebar-link ${activePage === item.key ? 'ml-sidebar-link--active' : ''}`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="ml-sidebar-footer">
                    <button className="ml-sidebar-support-btn">Quick Support</button>
                </div>
            </aside>

            {/* ═══ Main Content ═══ */}
            <main className="ml-main">
                {children}
            </main>

            {/* ═══ Detail Photo Modal ═══ */}
            {photoModalOpen && (
                <div className="ml-photo-modal-overlay" onClick={() => setPhotoModalOpen(false)}>
                    <div className="ml-photo-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="ml-photo-modal-close" onClick={() => setPhotoModalOpen(false)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <img
                            className="ml-photo-modal-img"
                            src={profilePictureUrl}
                            alt="Partner Profile Detail"
                        />
                        <div className="ml-photo-modal-footer">
                            <h3>{mitraName}</h3>
                            <p>{user.nomor_telepon || 'mitra@kosthub.com'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Footer ═══ */}
            <footer className="ml-footer">
                <div>
                    <span className="ml-footer-brand">KostHub<span className="ml-footer-brand-dot">.</span></span>
                    <p className="ml-footer-copy">© 2026 KostHub Hyperlocal Marketplace</p>
                </div>
                <div className="ml-footer-links">
                    <a className="ml-footer-link" href="#">Privacy Policy</a>
                    <a className="ml-footer-link" href="#">Terms of Service</a>
                    <a className="ml-footer-link" href="#">Partner Support</a>
                </div>
            </footer>
        </div>
    );
};

export default MitraLayout;
