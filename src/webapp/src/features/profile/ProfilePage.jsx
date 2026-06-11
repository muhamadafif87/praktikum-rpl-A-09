import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation as useGlobalLocation } from '../../context/LocationContext';
import api from '../../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, updateUser, logout } = useAuth();
    const { location, openMap } = useGlobalLocation();
    
    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        nama_lengkap: '',
        nomor_telepon: '',
        alamat_kost: '',
        old_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    // Password visibility states
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nama_lengkap: user.nama_lengkap || user.nama_mitra || user.nama || '',
                nomor_telepon: user.nomor_telepon || '',
                alamat_kost: user.alamat_kost || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear messages when user types
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const payload = {
                nama_lengkap: formData.nama_lengkap,
                nomor_telepon: formData.nomor_telepon,
                alamat_kost: formData.alamat_kost
            };

            // Include coordinates if user just picked a new location from map
            if (location && location.isConfirmed && !location.isFromProfile && location.lat && location.lng) {
                payload.latitude = location.lat;
                payload.longitude = location.lng;
                payload.address_detail = location.address;
            }

            // Only send password fields if user filled them out
            if (formData.old_password || formData.new_password) {
                payload.old_password = formData.old_password;
                payload.new_password = formData.new_password;
                payload.new_password_confirmation = formData.new_password_confirmation;
            }

            const response = await api.put('/v1/auth/me', payload);
            
            // Update context so the navbar reflects changes immediately
            updateUser(response.data.data);
            
            setSuccessMessage(response.data.message || 'Profil berhasil diperbarui!');
            
            // Clear password fields
            setFormData(prev => ({
                ...prev,
                old_password: '',
                new_password: '',
                new_password_confirmation: ''
            }));

        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Terjadi kesalahan saat memperbarui profil.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // Get initials for avatar
    const nameStr = user?.nama_lengkap || user?.nama_mitra || user?.nama || 'User';
    const names = nameStr.trim().split(' ');
    const initials = names.length >= 2 ? (names[0][0] + names[1][0]).toUpperCase() : nameStr.substring(0, 2).toUpperCase();

    // Format join date
    const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : 'Baru-baru ini';

    return (
        <div className="profile-page">
            <nav className="lp-navbar" style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--lp-outline-variant)', backgroundColor: 'var(--lp-surface-container-lowest)' }}>
                <div className="lp-container lp-navbar-inner">
                    <div className="lp-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => navigate(-1)} className="profile-back-btn">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <span className="lp-brand-link" style={{ cursor: 'default', margin: 0, padding: 0 }}>KostHub<span className="lp-brand-dot">.</span></span>
                    </div>
                </div>
            </nav>

            <main className="profile-container">
                <div className="profile-header-card">
                    <div className="profile-avatar-lg">{initials}</div>
                    <div className="profile-header-info">
                        <h1 className="profile-name-lg">{nameStr}</h1>
                        <p className="profile-email-badge">{user.email}</p>
                        <p className="profile-join-date">Anggota sejak {joinDate}</p>
                    </div>
                </div>

                <form className="profile-form-container" onSubmit={handleSubmit}>
                    
                    {successMessage && (
                        <div className="profile-alert profile-alert-success">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span>{successMessage}</span>
                        </div>
                    )}
                    
                    {errorMessage && (
                        <div className="profile-alert profile-alert-error">
                            <span className="material-symbols-outlined">error</span>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <section className="profile-section">
                        <h2 className="profile-section-title">Informasi Pribadi</h2>
                        
                        <div className="profile-form-group">
                            <label className="profile-label">Nama Lengkap</label>
                            <input 
                                type="text" 
                                name="nama_lengkap" 
                                className="profile-input" 
                                value={formData.nama_lengkap} 
                                onChange={handleChange} 
                                required
                            />
                        </div>

                        <div className="profile-form-group">
                            <label className="profile-label">Nomor Telepon / WhatsApp</label>
                            <input 
                                type="tel" 
                                name="nomor_telepon" 
                                className="profile-input" 
                                value={formData.nomor_telepon} 
                                onChange={handleChange} 
                                placeholder="Contoh: 08123456789"
                                required
                            />
                            <p className="profile-help-text">Dibutuhkan agar Mitra dapat menghubungi Anda terkait pesanan.</p>
                        </div>
                    </section>

                    <hr className="profile-divider" />

                    <section className="profile-section">
                        <h2 className="profile-section-title">Lokasi & Alamat Kos</h2>
                        
                        {location && location.isConfirmed && !location.isFromProfile ? (
                            <div className="profile-location-card info">
                                <div className="profile-location-icon">
                                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>pin_drop</span>
                                </div>
                                <div className="profile-location-details">
                                    <h3 className="profile-location-title">Lokasi Baru Dipilih</h3>
                                    <p className="profile-location-address">{location.address}</p>
                                    <p className="profile-location-coords">{location.lat}, {location.lng}</p>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                        <span className="profile-help-text" style={{ margin: 0, fontWeight: 500, color: '#1e3a8a' }}>Klik "Simpan Perubahan" di bawah untuk menetapkan lokasi ini.</span>
                                        <button type="button" className="profile-btn-outline-warning" onClick={openMap} style={{ padding: '0.25rem 0.75rem', alignSelf: 'flex-start', marginLeft: 'auto', borderColor: '#3b82f6', color: '#1d4ed8' }}>
                                            Ubah
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : user.latitude && user.longitude ? (
                            <div className="profile-location-card success">
                                <div className="profile-location-icon">
                                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                </div>
                                <div className="profile-location-details">
                                    <h3 className="profile-location-title">Titik Lokasi Tersimpan</h3>
                                    <p className="profile-location-address">{user.address_detail || 'Koordinat telah diatur.'}</p>
                                    <p className="profile-location-coords">{user.latitude}, {user.longitude}</p>
                                    <button 
                                        type="button" 
                                        className="profile-btn-outline-warning"
                                        onClick={openMap}
                                        style={{ marginTop: '0.5rem' }}
                                    >
                                        Ubah Lokasi
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="profile-location-card warning">
                                <div className="profile-location-icon">
                                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                                </div>
                                <div className="profile-location-details">
                                    <h3 className="profile-location-title">Lokasi Utama Belum Diatur!</h3>
                                    <p className="profile-location-address">Sistem membutuhkan koordinat GPS agar Mitra bisa menemukan Anda.</p>
                                    <button 
                                        type="button" 
                                        className="profile-btn-outline-warning"
                                        onClick={openMap}
                                    >
                                        Pilih Lokasi di Peta
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="profile-form-group" style={{marginTop: '1.5rem'}}>
                            <label className="profile-label">Detail Kamar & Patokan Khusus (Opsional)</label>
                            <textarea 
                                name="alamat_kost" 
                                className="profile-textarea" 
                                value={formData.alamat_kost} 
                                onChange={handleChange} 
                                placeholder="Contoh: Kos Bu Broto, Kamar No. 12 lantai 2. Patokan: Pagar hitam depan warung makan."
                                rows="4"
                            />
                            <p className="profile-help-text">Tuliskan patokan dan nomor kamar secara spesifik agar kurir galon/laundry tidak tersesat.</p>
                        </div>
                    </section>

                    <hr className="profile-divider" />

                    <section className="profile-section">
                        <h2 className="profile-section-title">Keamanan Akun</h2>
                        <p className="profile-help-text" style={{marginTop: '-0.5rem', marginBottom: '1rem'}}>Biarkan kosong jika tidak ingin mengubah kata sandi.</p>
                        
                        <div className="profile-form-group">
                            <label className="profile-label">Kata Sandi Lama</label>
                            <div className="profile-password-wrapper">
                                <input 
                                    type={showOldPassword ? "text" : "password"} 
                                    name="old_password" 
                                    className="profile-input" 
                                    value={formData.old_password} 
                                    onChange={handleChange} 
                                />
                                <button 
                                    type="button" 
                                    className="profile-password-toggle"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                >
                                    <span className="material-symbols-outlined">
                                        {showOldPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="profile-form-row">
                            <div className="profile-form-group">
                                <label className="profile-label">Kata Sandi Baru</label>
                                <div className="profile-password-wrapper">
                                    <input 
                                        type={showNewPassword ? "text" : "password"} 
                                        name="new_password" 
                                        className="profile-input" 
                                        value={formData.new_password} 
                                        onChange={handleChange} 
                                    />
                                    <button 
                                        type="button" 
                                        className="profile-password-toggle"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        <span className="material-symbols-outlined">
                                            {showNewPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div className="profile-form-group">
                                <label className="profile-label">Konfirmasi Kata Sandi Baru</label>
                                <div className="profile-password-wrapper">
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        name="new_password_confirmation" 
                                        className="profile-input" 
                                        value={formData.new_password_confirmation} 
                                        onChange={handleChange} 
                                    />
                                    <button 
                                        type="button" 
                                        className="profile-password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <span className="material-symbols-outlined">
                                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="profile-form-actions">
                        <button type="button" className="profile-btn-secondary" onClick={() => navigate(-1)}>Batal</button>
                        <button type="submit" className="profile-btn-primary" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ProfilePage;
