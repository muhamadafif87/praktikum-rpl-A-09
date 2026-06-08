import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import './ReviewMitra.css';

const ReviewMitra = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const mitraName = user.name || user.nama_usaha || 'Mitra';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: '4.9/5.0',
    totalReviews: 128,
    responseTime: '8 Menit (Rata-rata)',
    completionRate: '98% Pesanan Selesai'
  });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviewData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/v1/dashboard/mitra/reviews');
        if (response.data?.data) {
          if (response.data.data.stats) setStats(response.data.data.stats);
          if (response.data.data.reviews) setReviews(response.data.data.reviews);
        }
      } catch (error) {
        console.warn('API /v1/mitra/reviews belum tersedia, menggunakan fallback data dummy.');
        // Fallback data
        setReviews([
          {
            id: 1,
            name: 'Rina Gunawan',
            role: 'Mahasiswa',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH0YtOq8N4VpIUBpYQ8uUe882u4lO5hOQe0X2mX-0822606626600O0w20y64Y7q9K00eA66aA_8S11U66S04Q0o6eYQ',
            service: 'Cuci Lipat',
            rating: 5,
            comment: 'Pakaian selalu wangi dan rapi. Penjemputan tepat waktu.',
            date: '12 Okt 2023'
          },
          {
            id: 2,
            name: 'Kevin Wijaya',
            role: 'Mahasiswa',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6iS-lO2R1Yq11Yk9yUuV6k2x0_v_iZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZkZk',
            service: 'Cuci Kering',
            rating: 4,
            comment: 'Lumayan cepat, tapi ada satu kaos yang sedikit kusut.',
            date: '10 Okt 2023'
          },
          {
            id: 3,
            name: 'Diana Putri',
            role: 'Pekerja Kantoran',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3_kQ9R9X8w7zZ228vUuUv22v2_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k_k',
            service: 'Setrika Saja',
            rating: 5,
            comment: 'Sangat membantu! Setrikaan rapi banget kaya baru.',
            date: '08 Okt 2023'
          },
          {
            id: 4,
            name: 'Ahmad Faizal',
            role: 'Mahasiswa',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4_jP8R8X7w6zZ117uUuUu11u1_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j',
            service: 'Cuci Selimut',
            rating: 5,
            comment: 'Selimut jadi bersih dan lembut. Wanginya tahan lama.',
            date: '05 Okt 2023'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className="material-symbols-outlined review-mitra-star" style={i < rating ? { fontVariationSettings: '"FILL" 1' } : {}}>
          star
        </span>
      );
    }
    return <div className="review-mitra-stars-container">{stars}</div>;
  };

  return (
    <div className="review-mitra-container">
      {/* TopNavBar */}
      <nav className="review-mitra-navbar">
        <div className="review-mitra-brand">
          <Link to="/dashboard/mitra" className="review-mitra-brand-link">
            KostHub<span className="review-mitra-brand-dot">.</span>
          </Link>
        </div>
        <div className="review-mitra-nav-actions">
          <button className="review-mitra-icon-btn">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="review-mitra-icon-btn">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="review-mitra-user-profile">
            <img 
              alt="Partner Profile" 
              className="review-mitra-avatar" 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mitraName)}&background=004ac6&color=fff`} 
            />
            <span className="review-mitra-user-name">{mitraName}</span>
          </div>
        </div>
      </nav>

      {/* SideNavBar */}
      <aside className="review-mitra-sidebar">
        <div className="review-mitra-sidebar-header">
          <div className="review-mitra-admin-info">
            <img 
              alt="KostHub Admin" 
              className="review-mitra-admin-avatar" 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mitraName)}&background=004ac6&color=fff`} 
            />
            <div style={{ textAlign: 'center' }}>
              <h2 className="review-mitra-admin-title">Admin Panel</h2>
              <p className="review-mitra-admin-subtitle">System Control</p>
              <div className="review-mitra-status-badge">
                <span className="review-mitra-status-dot"></span>
                <span className="review-mitra-status-text">System Status: Operational</span>
              </div>
            </div>
          </div>
        </div>
        <nav className="review-mitra-sidebar-nav">
          <Link to="/dashboard/mitra" className={`review-mitra-nav-link ${location.pathname === '/dashboard/mitra' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span>Overview</span>
          </Link>
          <Link to="/dashboard/mitra/orders" className={`review-mitra-nav-link ${location.pathname === '/dashboard/mitra/orders' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">receipt_long</span>
            <span>Orders</span>
          </Link>
          <Link to="/dashboard/mitra/inventory" className={`review-mitra-nav-link ${location.pathname === '/dashboard/mitra/inventory' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">inventory_2</span>
            <span>Inventory</span>
          </Link>
          <Link to="/dashboard/mitra/chat" className={`review-mitra-nav-link ${location.pathname === '/dashboard/mitra/chat' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">chat</span>
            <span>Chat</span>
          </Link>
          <Link to="/dashboard/mitra/finance" className={`review-mitra-nav-link ${location.pathname === '/dashboard/mitra/finance' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">payments</span>
            <span>Finance</span>
          </Link>
          <Link to="/dashboard/mitra/reviews" className={`review-mitra-nav-link ${location.pathname === '/dashboard/mitra/reviews' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">star</span>
            <span>Reviews & Performance</span>
          </Link>
          <Link to="/dashboard/mitra/support" className={`review-mitra-nav-link ${location.pathname === '/dashboard/mitra/support' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">support_agent</span>
            <span>Help & Support</span>
          </Link>
          <Link to="/dashboard/mitra/settings" className={`review-mitra-nav-link ${location.pathname === '/dashboard/mitra/settings' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </nav>
        <div className="review-mitra-sidebar-footer">
          <button className="review-mitra-quick-support-btn">Quick Support</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="review-mitra-main-content">
        {loading ? (
          <div className="review-mitra-loading-container">
            <span className="material-symbols-outlined review-mitra-spinner">progress_activity</span>
          </div>
        ) : (
          <>
            <header className="review-mitra-header">
              <h1 className="review-mitra-title">Ulasan & Performa</h1>
              <p className="review-mitra-description">Pantau feedback pelanggan dan metrik performa layanan Anda.</p>
            </header>

            {/* Stats Row */}
            <div className="review-mitra-stats-grid">
              <div className="review-mitra-stat-card">
                <p className="review-mitra-stat-label">Average Rating</p>
                <div className="review-mitra-stat-rating-wrapper">
                  <p className="review-mitra-stat-value">{stats.averageRating}</p>
                  {renderStars(5)}
                </div>
              </div>
              <div className="review-mitra-stat-card">
                <p className="review-mitra-stat-label">Total Reviews</p>
                <p className="review-mitra-stat-value">{stats.totalReviews} Ulasan</p>
              </div>
              <div className="review-mitra-stat-card">
                <p className="review-mitra-stat-label">Response Time</p>
                <p className="review-mitra-stat-value highlight-primary">{stats.responseTime}</p>
              </div>
              <div className="review-mitra-stat-card">
                <p className="review-mitra-stat-label">Completion Rate</p>
                <p className="review-mitra-stat-value highlight-success">{stats.completionRate}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="review-mitra-filters-section">
              <div className="review-mitra-filters-group">
                <div className="review-mitra-search-box">
                  <span className="material-symbols-outlined review-mitra-search-icon">search</span>
                  <input className="review-mitra-search-input" placeholder="Cari ulasan pelanggan..." type="text" />
                </div>
                <div className="review-mitra-select-box">
                  <select className="review-mitra-select">
                    <option>Semua Rating</option>
                    <option>5 Bintang</option>
                    <option>4 Bintang</option>
                    <option>3 Bintang</option>
                    <option>&lt; 3 Bintang</option>
                  </select>
                  <span className="material-symbols-outlined review-mitra-select-icon">expand_more</span>
                </div>
              </div>
              <button className="review-mitra-export-btn">
                <span className="material-symbols-outlined">download</span> Export
              </button>
            </div>

            {/* Contact List */}
            <div className="review-mitra-table-container">
              <div className="review-mitra-table-header">
                <h2 className="review-mitra-table-title">Daftar Ulasan Pelanggan</h2>
              </div>
              <div className="review-mitra-table-wrapper">
                <table className="review-mitra-table">
                  <thead>
                    <tr>
                      <th>Pelanggan</th>
                      <th>Layanan</th>
                      <th>Rating</th>
                      <th>Komentar</th>
                      <th className="text-right">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map(review => (
                      <tr key={review.id}>
                        <td>
                          <div className="review-mitra-customer-info">
                            <img alt="Avatar" className="review-mitra-customer-avatar" src={review.avatar} />
                            <div className="review-mitra-customer-details">
                              <span className="review-mitra-customer-name">{review.name}</span>
                              <span className="review-mitra-customer-role">{review.role}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="review-mitra-service-name">{review.service}</span>
                        </td>
                        <td>
                          {renderStars(review.rating)}
                        </td>
                        <td>
                          <div className="review-mitra-comment" title={review.comment}>
                            {review.comment}
                          </div>
                        </td>
                        <td className="text-right">
                          <span className="review-mitra-date">{review.date}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="review-mitra-table-footer">
                <span className="review-mitra-pagination-info">Showing {reviews.length} of {stats.totalReviews} reviews</span>
                <div className="review-mitra-pagination-actions">
                  <button className="review-mitra-pagination-btn disabled">Previous</button>
                  <button className="review-mitra-pagination-btn">Next</button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="review-mitra-footer">
        <div className="review-mitra-footer-brand">
          <span className="review-mitra-brand-text">
            KostHub<span className="review-mitra-brand-dot">.</span>
          </span>
          <p className="review-mitra-copyright">© 2024 KostHub Hyperlocal Marketplace</p>
        </div>
        <div className="review-mitra-footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Partner Support</a>
        </div>
      </footer>
    </div>
  );
};

export default ReviewMitra;
