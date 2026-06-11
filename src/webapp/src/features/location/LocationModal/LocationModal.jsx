import React, { useState, useEffect } from 'react';
import { useLocation } from '../../../context/LocationContext';
import { useAuth } from '../../../context/AuthContext';
import LocationSearch from '../LocationSearch/LocationSearch';
import '../../landing/LandingPage/LandingPage.css'; // Reusing the modal CSS from LandingPage

const LocationModal = () => {
    const { isMapOpen, closeMap, location, syncWithUser } = useLocation();
    const { user, isAuthenticated } = useAuth();
    const [isSelectingNew, setIsSelectingNew] = useState(false);

    // Reset selection state when modal opens
    useEffect(() => {
        if (isMapOpen) {
            setIsSelectingNew(false);
        }
    }, [isMapOpen]);

    if (!isMapOpen) return null;

    return (
        <div className="lp-modal-overlay" onClick={closeMap}>
            <div className="lp-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="lp-modal-header">
                    <h3 className="lp-modal-title">Atur Lokasi Pengiriman</h3>
                    <button className="lp-modal-close" onClick={closeMap}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="lp-modal-body">
                    {isAuthenticated && user?.latitude && user?.longitude && !isSelectingNew ? (
                        <div className="lp-location-options">
                            <p className="lp-location-options-title">
                                Pilih alamat pengiriman untuk layanan KostHub:
                            </p>
                            
                            {/* Option 1: Profile Address */}
                            <div 
                                className={`lp-loc-option ${location.isFromProfile ? 'lp-loc-option--active' : ''}`}
                                onClick={() => {
                                    syncWithUser(user);
                                    closeMap();
                                }}
                            >
                                <div className="lp-loc-option-icon">
                                    <span className="material-symbols-outlined">home</span>
                                </div>
                                <div className="lp-loc-option-text">
                                    <h4>Gunakan Alamat Profil</h4>
                                    <p>{user.address_detail || 'Sesuai Profil'}</p>
                                </div>
                                {location.isFromProfile && <span className="material-symbols-outlined lp-loc-check">check_circle</span>}
                            </div>

                            {/* Option 2: Temporary Address */}
                            <div 
                                className={`lp-loc-option ${!location.isFromProfile && location.isConfirmed ? 'lp-loc-option--active' : ''}`}
                                onClick={() => setIsSelectingNew(true)}
                            >
                                <div className="lp-loc-option-icon">
                                    <span className="material-symbols-outlined">pin_drop</span>
                                </div>
                                <div className="lp-loc-option-text">
                                    <h4>Alamat Sementara</h4>
                                    <p>
                                        {!location.isFromProfile && location.isConfirmed 
                                            ? location.address 
                                            : 'Cari lokasi lain di peta...'}
                                    </p>
                                </div>
                                {!location.isFromProfile && location.isConfirmed && <span className="material-symbols-outlined lp-loc-check">check_circle</span>}
                                {location.isFromProfile && <span className="material-symbols-outlined lp-loc-arrow">chevron_right</span>}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {isAuthenticated && user?.latitude && user?.longitude && (
                                <button 
                                    onClick={() => setIsSelectingNew(false)}
                                    className="lp-loc-back-btn"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                    Kembali ke Pilihan Alamat
                                </button>
                            )}
                            <LocationSearch 
                                onConfirm={() => {
                                    closeMap();
                                    setIsSelectingNew(false);
                                }}
                                onSearchSubmit={() => {
                                    closeMap();
                                    setIsSelectingNew(false);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
