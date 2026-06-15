import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import OrderCard from '../features/orders/OrderCard/OrderCard';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('/v1/landing-page/pesanan/riwayat', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setOrders(response.data.data);
            } else {
                setError('Gagal mengambil riwayat pesanan');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan pada server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ohp-container">
            <div className="ohp-header">
                <button className="ohp-back-btn" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="ohp-title">Pesanan Saya</h1>
            </div>

            <div className="ohp-content">
                {loading ? (
                    <div className="ohp-loading">
                        <div className="ohp-spinner"></div>
                        <p>Memuat riwayat pesanan...</p>
                    </div>
                ) : error ? (
                    <div className="ohp-error">
                        <span className="material-symbols-outlined">error</span>
                        <p>{error}</p>
                        <button onClick={fetchOrders} className="ohp-retry-btn">Coba Lagi</button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="ohp-empty">
                        <img src="/empty-orders.svg" alt="Kosong" className="ohp-empty-img" onError={(e) => e.target.style.display='none'} />
                        <h2>Belum Ada Pesanan</h2>
                        <p>Anda belum pernah melakukan pemesanan layanan apapun.</p>
                        <button onClick={() => navigate('/')} className="ohp-explore-btn">Eksplor Layanan</button>
                    </div>
                ) : (
                    <div className="ohp-list">
                        {orders.map((order) => (
                            <OrderCard key={order.id_unique_pesanan} order={order} onRefresh={fetchOrders} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;
