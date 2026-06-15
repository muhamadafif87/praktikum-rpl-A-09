import React, { useState } from 'react';
import './RatingModal.css';
import axios from 'axios';

const RatingModal = ({ isOpen, onClose, idUniquePesanan, onReviewSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [komentar, setKomentar] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Silakan berikan rating bintang terlebih dahulu.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `/v1/landing-page/pesanan/${idUniquePesanan}/ulasan`,
                { rating, komentar },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.data.success) {
                onReviewSuccess(response.data.data);
                onClose();
            } else {
                setError(response.data.message || "Gagal mengirim ulasan.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Terjadi kesalahan saat mengirim ulasan.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="rm-modal-overlay">
            <div className="rm-modal-content">
                <button className="rm-close-btn" onClick={onClose}>
                    <span className="material-symbols-outlined">close</span>
                </button>

                <h2 className="rm-title">Beri Penilaian</h2>
                <p className="rm-subtitle">Bagaimana pengalamanmu dengan layanan ini?</p>

                {error && <div className="rm-error-alert">{error}</div>}

                <form onSubmit={handleSubmit} className="rm-form">
                    <div className="rm-stars-container">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                className={`rm-star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <span className="material-symbols-outlined">
                                    {(hoverRating || rating) >= star ? 'star' : 'grade'}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="rm-input-group">
                        <label htmlFor="komentar">Komentar (Opsional)</label>
                        <textarea
                            id="komentar"
                            rows="4"
                            placeholder="Ceritakan pengalamanmu..."
                            value={komentar}
                            onChange={(e) => setKomentar(e.target.value)}
                        />
                    </div>

                    <div className="rm-actions">
                        <button type="button" className="rm-cancel-btn" onClick={onClose} disabled={isLoading}>
                            Batal
                        </button>
                        <button type="submit" className="rm-submit-btn" disabled={isLoading}>
                            {isLoading ? 'Mengirim...' : 'Kirim Penilaian'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RatingModal;
