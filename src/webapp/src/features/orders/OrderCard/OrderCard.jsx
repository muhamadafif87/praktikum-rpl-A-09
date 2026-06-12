import React, { useState } from 'react';
import './OrderCard.css';
import RatingModal from '../RatingModal/RatingModal';
import { useToast } from '../../../context/ToastContext';
import api from '../../../services/api';

const OrderCard = ({ order, onRefresh }) => {
    const { addToast } = useToast();
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [completeLoading, setCompleteLoading] = useState(false);
    const [ulasan, setUlasan] = useState(order.ulasan);

    const formatCurrency = (amount) => {
        if (!amount) return 'Rp 0';
        return `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleReviewSuccess = (newUlasan) => {
        setUlasan(newUlasan);
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;
        
        setCancelLoading(true);
        try {
            await api.patch(`/v1/landing-page/pesanan/${order.id_unique_pesanan}/cancel`);
            addToast('Pesanan berhasil dibatalkan.', 'info');
            if (onRefresh) onRefresh();
        } catch (err) {
            addToast(err.response?.data?.message || 'Gagal membatalkan pesanan.', 'error');
        } finally {
            setCancelLoading(false);
        }
    };

    const handleCompleteOrder = async () => {
        if (!window.confirm('Apakah Anda yakin ingin mengonfirmasi bahwa layanan telah selesai?')) return;
        
        setCompleteLoading(true);
        try {
            await api.patch(`/v1/landing-page/pesanan/${order.id_unique_pesanan}/selesai`);
            addToast('Pesanan berhasil diselesaikan! Silakan berikan ulasan Anda.', 'success');
            if (onRefresh) onRefresh();
        } catch (err) {
            addToast(err.response?.data?.message || 'Gagal menyelesaikan pesanan.', 'error');
        } finally {
            setCompleteLoading(false);
        }
    };

    return (
        <div className="oc-card">
            <div className="oc-header">
                <div className="oc-mitra-info">
                    <span className="material-symbols-outlined oc-store-icon">store</span>
                    <h3 className="oc-mitra-name">{order.mitra?.nama_mitra || 'Mitra Tidak Diketahui'}</h3>
                </div>
                <div className={`oc-status oc-status-${order.status_pesanan}`}>
                    {order.status_pesanan.toUpperCase()}
                </div>
            </div>

            <div className="oc-body">
                <div className="oc-info-row">
                    <span className="oc-label">Tanggal Pesanan:</span>
                    <span className="oc-value">{formatDate(order.tgl_pesanan)}</span>
                </div>
                <div className="oc-info-row">
                    <span className="oc-label">Jenis Layanan:</span>
                    <span className="oc-value capitalize">{order.mitra?.jenis_jasa?.replace('_', ' ') || '-'}</span>
                </div>
                
                <div className="oc-details">
                    {order.detail_layanan && order.detail_layanan.map((item, idx) => (
                        <div key={idx} className="oc-detail-item">
                            <span>{item.jumlah}x {item.nama_layanan}</span>
                            <span>{formatCurrency(item.subtotal)}</span>
                        </div>
                    ))}
                </div>

                <div className="oc-total">
                    <span>Total Pembayaran</span>
                    <span className="oc-total-price">{formatCurrency(order.total_pembayaran)}</span>
                </div>
            </div>

            <div className="oc-footer">
                <div className="oc-order-id">ID: {order.id_unique_pesanan}</div>
                
                <div className="oc-action">
                    {order.status_pesanan === 'pending' && (
                        <button 
                            className="oc-cancel-btn"
                            onClick={handleCancelOrder}
                            disabled={cancelLoading}
                        >
                            {cancelLoading ? 'Membatalkan...' : 'Batalkan Pesanan'}
                        </button>
                    )}

                    {order.status_pesanan === 'diproses' && (
                        <button 
                            className="oc-complete-btn"
                            onClick={handleCompleteOrder}
                            disabled={completeLoading}
                        >
                            {completeLoading ? 'Memproses...' : 'Pesanan Selesai'}
                        </button>
                    )}

                    {order.status_pesanan === 'selesai' && (
                        ulasan ? (
                            <div className="oc-reviewed-badge">
                                <span className="material-symbols-outlined star-icon">star</span>
                                <span>{ulasan.rating}/5</span>
                                <span className="oc-reviewed-text">Dinilai</span>
                            </div>
                        ) : (
                            <button 
                                className="oc-rate-btn"
                                onClick={() => setIsRatingModalOpen(true)}
                            >
                                Beri Penilaian
                            </button>
                        )
                    )}
                </div>
            </div>

            <RatingModal 
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                idUniquePesanan={order.id_unique_pesanan}
                onReviewSuccess={handleReviewSuccess}
            />
        </div>
    );
};

export default OrderCard;
