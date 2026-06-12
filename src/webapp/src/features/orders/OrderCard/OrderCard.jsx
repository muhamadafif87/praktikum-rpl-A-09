import React, { useState } from 'react';
import './OrderCard.css';
import RatingModal from '../RatingModal/RatingModal';

const OrderCard = ({ order }) => {
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
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
                
                {order.status_pesanan === 'selesai' && (
                    <div className="oc-action">
                        {ulasan ? (
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
                        )}
                    </div>
                )}
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
