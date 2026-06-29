import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Menggunakan instance API sesuai arsitektur DailyCleaningDetail
import OrderCard from '../features/orders/OrderCard/OrderCard';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // State untuk filter dan pagination
    const [statusFilter, setStatusFilter] = useState('');
    const [tglDari, setTglDari] = useState('');
    const [tglSampai, setTglSampai] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);

    // Cek autentikasi dan guard saat mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const guard = localStorage.getItem('guard');

        if (!token) {
            // Belum login — redirect ke halaman login
            sessionStorage.setItem('redirectAfterLogin', '/pesanan-saya');
            navigate('/login');
            return;
        }

        if (guard === 'mitra') {
            // Mitra tidak bisa akses halaman pesanan user — redirect ke dashboard mitra
            navigate('/dashboard/mitra');
            return;
        }

        if (guard === 'admin') {
            // Admin tidak bisa akses halaman pesanan user — redirect ke dashboard admin
            navigate('/dashboard/admin');
            return;
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const guard = localStorage.getItem('guard');
        // Hanya fetch jika user biasa yang sudah login
        if (token && guard !== 'mitra' && guard !== 'admin') {
            fetchOrders(page);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, statusFilter, tglDari, tglSampai]);

    const fetchOrders = async (currentPage = 1) => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/v1/landing-page/pesanan/riwayat', {
                params: {
                    page: currentPage,
                    per_page: 10,
                    status: statusFilter || undefined,
                    tgl_dari: tglDari || undefined,
                    tgl_sampai: tglSampai || undefined
                }
            });

            if (response.data.success) {
                setOrders(response.data.data);
                // Cek apakah ada meta untuk pagination
                if (response.data.meta) {
                    setMeta(response.data.meta);
                }
            } else {
                setError(response.data.message || 'Gagal mengambil riwayat pesanan');
            }
        } catch (err) {
            if (err.response?.status === 401) {
                // Token expired atau invalid — redirect ke login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('guard');
                sessionStorage.setItem('redirectAfterLogin', '/pesanan-saya');
                navigate('/login');
            } else if (err.response?.status === 403) {
                setError('Anda tidak memiliki akses untuk melihat halaman ini.');
            } else if (!err.response) {
                // Network error — tidak bisa terhubung ke server
                setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.');
            } else {
                setError(err.response?.data?.message || 'Terjadi kesalahan pada server. Silakan coba lagi nanti.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setPage(1); // Reset ke halaman pertama saat filter diubah
    };

    return (
        <div className="ohp-container">
            <div className="ohp-header">
                <button className="ohp-back-btn" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="ohp-title">Pesanan Saya</h1>
            </div>

            {/* Bagian Filter */}
            <div className="ohp-filters" style={{ display: 'flex', gap: '10px', padding: '10px 20px', flexWrap: 'wrap' }}>
                <select
                    value={statusFilter}
                    onChange={handleFilterChange(setStatusFilter)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                    <option value="">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="diproses">Diproses</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                </select>

                <input
                    type="date"
                    value={tglDari}
                    onChange={handleFilterChange(setTglDari)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />

                <input
                    type="date"
                    value={tglSampai}
                    onChange={handleFilterChange(setTglSampai)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />

                {(statusFilter || tglDari || tglSampai) && (
                    <button
                        onClick={() => {
                            setStatusFilter('');
                            setTglDari('');
                            setTglSampai('');
                            setPage(1);
                        }}
                        style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#e0e0e0', cursor: 'pointer' }}
                    >
                        Reset
                    </button>
                )}
            </div>

            <div className="ohp-content">
                {loading && orders.length === 0 ? (
                    <div className="ohp-loading">
                        <div className="ohp-spinner"></div>
                        <p>Memuat riwayat pesanan...</p>
                    </div>
                ) : error ? (
                    <div className="ohp-error">
                        <span className="material-symbols-outlined">error</span>
                        <p>{error}</p>
                        <button onClick={() => fetchOrders(page)} className="ohp-retry-btn">Coba Lagi</button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="ohp-empty">
                        <img src="/empty-orders.svg" alt="Kosong" className="ohp-empty-img" onError={(e) => e.target.style.display='none'} />
                        <h2>Belum Ada Pesanan</h2>
                        <p>Tidak ada riwayat pemesanan yang sesuai dengan filter Anda.</p>
                        <button onClick={() => navigate('/')} className="ohp-explore-btn">Eksplor Layanan</button>
                    </div>
                ) : (
                    <>
                        <div className="ohp-list">
                            {orders.map((order) => (
                                <OrderCard
                                    key={order.id_unique_pesanan}
                                    order={order}
                                    onRefresh={() => fetchOrders(page)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {meta && meta.last_page > 1 && (
                            <div className="ohp-pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '20px' }}>
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    style={{ padding: '8px 12px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                                >
                                    Sebelumnya
                                </button>

                                <span>Halaman {meta.current_page} dari {meta.last_page}</span>

                                <button
                                    disabled={page === meta.last_page}
                                    onClick={() => setPage(page + 1)}
                                    style={{ padding: '8px 12px', cursor: page === meta.last_page ? 'not-allowed' : 'pointer' }}
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;
