import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import MitraLayout from '../../../components/MitraLayout/MitraLayout';
import './ReviewMitra.css';

const ReviewMitra = () => {
  // State Manajemen Loading
  const [loadingList, setLoadingList] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // State Statistik sesuai response struktur Backend Anda
  const [stats, setStats] = useState({
    rata_rata_rating: 0,
    total_ulasan: 0,
    persentase_bintang5: 0,
    distribusi: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  // State Paginasi & List Ulasan
  const [pagination, setPagination] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10
  });

  // State Kontrol Filter & Query
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState('');
  const [page, setPage] = useState(1);

  // Data konstan tambahan untuk performa operasional
  const additionalStats = {
    responseTime: '8 Menit (Rata-rata)',
    completionRate: '98% Pesanan Selesai'
  };

  // 1. FUNGSI FETCH STATISTIK (Hanya dipanggil sekali saat mount)
  const fetchStatsData = async () => {
    setLoadingStats(true);
    try {
      const response = await api.get('/v1/mitra/ulasan/statistik');
      if (response.data && response.data.status === 'success') {
        // Menangani jika data dibungkus objek .data lagi oleh API formatter resource
        const statsPayload = response.data.data || response.data;
        setStats({
          rata_rata_rating: statsPayload.rata_rata_rating || 0,
          total_ulasan: statsPayload.total_ulasan || 0,
          persentase_bintang5: statsPayload.persentase_bintang5 || 0,
          distribusi: statsPayload.distribusi || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
      }
    } catch (error) {
      console.error('Gagal memuat API statistik ulasan:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // 2. FUNGSI FETCH LIST ULASAN (Dipanggil setiap kali filter/halaman berubah)
  const fetchReviewList = async () => {
    setLoadingList(true);
    try {
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(rating && { rating })
      };

      const response = await api.get('/v1/mitra/ulasan', { params });

      if (response.data && response.data.status === 'success') {
        const ulasanArray = response.data.data || [];
        const metadata = response.data.meta || {};

        setPagination({
          data: ulasanArray,
          current_page: metadata.current_page || 1,
          last_page: metadata.total_pages || 1,
          total: metadata.total_items || 0,
          per_page: metadata.per_page || 10
        });
      }
    } catch (error) {
      console.error('Gagal memuat API list ulasan:', error);
    } finally {
      setLoadingList(false);
    }
  };

  // Efek Pertama: Jalankan pengambilan statistik sekali saja
  useEffect(() => {
    fetchStatsData();
  }, []);

  // Efek Kedua: Jalankan list ulasan secara dinamis dengan Debounce 400ms
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchReviewList();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [page, rating, search]);

  // Handler Perubahan Input Filter
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRatingChange = (e) => {
    setRating(e.target.value);
    setPage(1);
  };

  // Helper Formatter Tanggal ISO ke Format Lokal Indonesia
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Helper Render Ikon Bintang Google Font
  const renderStars = (ratingValue) => {
    const stars = [];
    const floorRating = Math.floor(ratingValue || 0);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span
          key={i}
          className="material-symbols-outlined review-mitra-star"
          style={i < floorRating ? { fontVariationSettings: '"FILL" 1' } : {}}
        >
          star
        </span>
      );
    }
    return <div className="review-mitra-stars-container">{stars}</div>;
  };

  return (
    <MitraLayout activePage="reviews">
      {/* Main Content */}
      <header className="review-mitra-header">
        <h1 className="review-mitra-title">Ulasan & Performa</h1>
        <p className="review-mitra-description">Pantau feedback pelanggan dan metrik performa layanan Anda secara real-time.</p>
      </header>

      {/* Stats Row Terintegrasi API Statistik */}
      <div className="review-mitra-stats-grid">
        <div className="review-mitra-stat-card">
          <p className="review-mitra-stat-label">Average Rating</p>
          <div className="review-mitra-stat-rating-wrapper">
            <p className="review-mitra-stat-value">
              {loadingStats ? '...' : `${stats.rata_rata_rating}/5.0`}
            </p>
            {renderStars(stats.rata_rata_rating)}
            <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
              {stats.persentase_bintang5}% Bintang 5
            </span>
          </div>
        </div>
        <div className="review-mitra-stat-card">
          <p className="review-mitra-stat-label">Total Reviews</p>
          <p className="review-mitra-stat-value">
            {loadingStats ? '...' : `${stats.total_ulasan} Ulasan`}
          </p>
          {/* Tampilan Mini Progress Bar Distribusi Bintang (5 down to 1) */}
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[5, 4, 3, 2, 1].map(num => {
              const count = stats.distribusi[num] || 0;
              const percent = stats.total_ulasan > 0 ? (count / stats.total_ulasan) * 100 : 0;
              return (
                <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px' }}>
                  <span style={{ width: '8px' }}>{num}</span>
                  <div style={{ flex: 1, height: '4px', backgroundColor: '#eff4ff', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#facc15' }}></div>
                  </div>
                  <span style={{ color: '#6b7280', width: '16px', textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="review-mitra-stat-card">
          <p className="review-mitra-stat-label">Response Time</p>
          <p className="review-mitra-stat-value highlight-primary">{additionalStats.responseTime}</p>
        </div>
        <div className="review-mitra-stat-card">
          <p className="review-mitra-stat-label">Completion Rate</p>
          <p className="review-mitra-stat-value highlight-success">{additionalStats.completionRate}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="review-mitra-filters-section">
        <div className="review-mitra-filters-group">
          <div className="review-mitra-search-box">
            <span className="material-symbols-outlined review-mitra-search-icon">search</span>
            <input
              className="review-mitra-search-input"
              placeholder="Cari nama ulasan pelanggan atau layanan..."
              type="text"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="review-mitra-select-box">
            <select
              className="review-mitra-select"
              value={rating}
              onChange={handleRatingChange}
            >
              <option value="">Semua Rating</option>
              <option value="5">5 Bintang</option>
              <option value="4">4 Bintang</option>
              <option value="3">3 Bintang</option>
              <option value="2">2 Bintang</option>
              <option value="1">1 Bintang</option>
            </select>
            <span className="material-symbols-outlined review-mitra-select-icon">expand_more</span>
          </div>
        </div>
        <button className="review-mitra-export-btn">
          <span className="material-symbols-outlined">download</span> Export
        </button>
      </div>

      {/* Table Review List Section */}
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
              {loadingList ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined review-mitra-spinner" style={{ fontSize: '24px' }}>progress_activity</span>
                      <span>Memuat data ulasan...</span>
                    </div>
                  </td>
                </tr>
              ) : pagination.data.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    Tidak ada ulasan ditemukan.
                  </td>
                </tr>
              ) : (
                pagination.data.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <div className="review-mitra-customer-info">
                        <img
                          alt="Avatar"
                          className="review-mitra-customer-avatar"
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.nama_pelanggan || 'User')}&background=dce9ff&color=004ac6`}
                        />
                        <div className="review-mitra-customer-details">
                          <span className="review-mitra-customer-name">{review.nama_pelanggan}</span>
                          <span className="review-mitra-customer-role">Pelanggan</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="review-mitra-service-name">{review.nama_layanan}</span>
                    </td>
                    <td>
                      {renderStars(review.rating)}
                    </td>
                    <td>
                      <div className="review-mitra-comment" title={review.komentar}>
                        {review.komentar || <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>Tanpa komentar</span>}
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="review-mitra-date">{formatDate(review.created_at)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="review-mitra-table-footer">
          <span className="review-mitra-pagination-info">
            Showing {pagination.data.length} of {pagination.total} reviews
          </span>
          <div className="review-mitra-pagination-actions">
            <button
              className={`review-mitra-pagination-btn ${page === 1 ? 'disabled' : ''}`}
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <button
              className={`review-mitra-pagination-btn ${page >= pagination.last_page ? 'disabled' : ''}`}
              disabled={page >= pagination.last_page}
              onClick={() => setPage(prev => Math.min(prev + 1, pagination.last_page))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </MitraLayout>
  );
};

export default ReviewMitra;
