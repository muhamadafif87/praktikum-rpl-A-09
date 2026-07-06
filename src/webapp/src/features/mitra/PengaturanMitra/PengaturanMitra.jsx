import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import MitraLayout from '../../../components/MitraLayout/MitraLayout';
import './PengaturanMitra.css';

// ---------------------------------------------------------------------------
// Helper: format slot jadwal jadi label yang mudah dibaca
// ---------------------------------------------------------------------------
const SLOT_OPTIONS = Array.from({ length: 24 }, (_, h) =>
  [`${String(h).padStart(2, '0')}:00`, `${String(h).padStart(2, '0')}:30`]
).flat();

// ---------------------------------------------------------------------------
// Sub-komponen: Modal Ubah Password
// ---------------------------------------------------------------------------
const ModalUbahPassword = ({ onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({
    password_lama: '',
    password_baru: '',
    konfirmasi_password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async () => {
    const result = await onSubmit(form);
    if (result?.errors) setErrors(result.errors);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">Ubah Kata Sandi</h3>

        {['password_lama', 'password_baru', 'konfirmasi_password'].map(field => (
          <div key={field} className="pengaturan-mitra-form-group">
            <label>
              {{ password_lama: 'Password Lama', password_baru: 'Password Baru', konfirmasi_password: 'Konfirmasi Password Baru' }[field]}
            </label>
            <input
              type="password"
              value={form[field]}
              onChange={e => handleChange(field, e.target.value)}
              className={errors[field] ? 'input-error' : ''}
            />
            {errors[field] && (
              <span className="field-error">{errors[field][0]}</span>
            )}
          </div>
        ))}

        <div className="modal-actions">
          <button className="pengaturan-mitra-btn-secondary" onClick={onClose} disabled={loading}>
            Batal
          </button>
          <button className="pengaturan-mitra-btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Komponen utama
// ---------------------------------------------------------------------------
const PengaturanMitra = () => {
  // State loading & feedback
  const [loading, setLoading]                     = useState(true);
  const [savingProfil, setSavingProfil]           = useState(false);
  const [savingJadwal, setSavingJadwal]           = useState(false);
  const [savingPassword, setSavingPassword]       = useState(false);
  const [toast, setToast]                         = useState(null);   // { type: 'success'|'error', message }
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // State data
  const [jenisJasa, setJenisJasa]   = useState('');
  const [jadwalKey, setJadwalKey]   = useState('jadwal_penjemputan');

  const [profilBisnis, setProfilBisnis] = useState({
    nama_mitra: '',
    deskripsi: '',
    alamat_mitra: '',
    nomor_telepon: '',
    latitude: '',
    longitude: '',
    radius_layanan: '',
  });

  // Jadwal: array string HH:MM yang dicentang
  const [jadwalDipilih, setJadwalDipilih] = useState([]);

  // Error per field profil
  const [profilErrors, setProfilErrors] = useState({});

  // ---------------------------------------------------------------------------
  // Toast helper
  // ---------------------------------------------------------------------------
  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch initial settings
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await api.get('/v1/mitra/settings');
        const { data } = response.data;

        if (data?.profilBisnis) {
          setProfilBisnis({
            nama_mitra:     data.profilBisnis.nama_mitra     ?? '',
            deskripsi:      data.profilBisnis.deskripsi      ?? '',
            alamat_mitra:   data.profilBisnis.alamat_mitra   ?? '',
            nomor_telepon:  data.profilBisnis.nomor_telepon  ?? '',
            latitude:       data.profilBisnis.latitude       ?? '',
            longitude:      data.profilBisnis.longitude      ?? '',
            radius_layanan: data.profilBisnis.radius_layanan ?? '',
          });
          setJenisJasa(data.jenis_jasa ?? '');
          setJadwalKey(data.jadwal_key ?? 'jadwal_penjemputan');
          setJadwalDipilih(data.jadwal ?? []);

          // Sinkronkan localStorage agar navbar/sidebar konsisten
          try {
            const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = {
              ...existingUser,
              nama_mitra:    data.profilBisnis.nama_mitra,
              nama_usaha:    data.profilBisnis.nama_mitra,
              nomor_telepon: data.profilBisnis.nomor_telepon,
              jenis_jasa:    data.jenis_jasa,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } catch (_) { /* ignore localStorage errors */ }
        }
      } catch (error) {
        console.warn('Gagal mengambil pengaturan:', error);
        showToast('error', 'Gagal memuat data pengaturan.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [showToast]);

  // ---------------------------------------------------------------------------
  // Handler: Profil
  // ---------------------------------------------------------------------------
  const handleProfilChange = (field, value) => {
    setProfilBisnis(prev => ({ ...prev, [field]: value }));
    setProfilErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSaveProfil = async () => {
    setSavingProfil(true);
    setProfilErrors({});
    try {
      const response = await api.put('/v1/mitra/settings/profil', {
        nama_mitra:     profilBisnis.nama_mitra,
        deskripsi:      profilBisnis.deskripsi      || null,
        alamat_mitra:   profilBisnis.alamat_mitra,
        nomor_telepon:  profilBisnis.nomor_telepon,
        latitude:       profilBisnis.latitude       || null,
        longitude:      profilBisnis.longitude      || null,
        radius_layanan: profilBisnis.radius_layanan || null,
      });

      if (response.data?.success) {
        showToast('success', response.data.message || 'Profil berhasil diperbarui.');

        // Update localStorage setelah save berhasil
        try {
          const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUser = {
            ...existingUser,
            nama_mitra:    profilBisnis.nama_mitra,
            nama_usaha:    profilBisnis.nama_mitra,
            nomor_telepon: profilBisnis.nomor_telepon,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (_) { /* ignore */ }
      }
    } catch (error) {
      if (error.response?.status === 422) {
        setProfilErrors(error.response.data?.errors ?? {});
        showToast('error', 'Periksa kembali isian profil Anda.');
      } else {
        showToast('error', 'Terjadi kesalahan saat menyimpan profil.');
      }
    } finally {
      setSavingProfil(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Handler: Jadwal
  // ---------------------------------------------------------------------------
  const toggleSlotJadwal = (slot) => {
    setJadwalDipilih(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot].sort()
    );
  };

  const handleSaveJadwal = async () => {
    setSavingJadwal(true);
    try {
      const response = await api.put('/v1/mitra/settings/jadwal', {
        jadwal: jadwalDipilih,
      });

      if (response.data?.success) {
        showToast('success', response.data.message || 'Jadwal berhasil diperbarui.');
      }
    } catch (error) {
      if (error.response?.status === 422) {
        showToast('error', error.response.data?.message || 'Format jadwal tidak valid.');
      } else {
        showToast('error', 'Terjadi kesalahan saat menyimpan jadwal.');
      }
    } finally {
      setSavingJadwal(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Handler: Password
  // ---------------------------------------------------------------------------
  const handleUpdatePassword = async (form) => {
    setSavingPassword(true);
    try {
      const response = await api.put('/v1/mitra/settings/password', form);

      if (response.data?.success) {
        showToast('success', response.data.message || 'Password berhasil diperbarui.');
        setShowPasswordModal(false);

        // Force re-login: hapus token dan redirect ke login
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login/mitra';
        }, 2000);

        return null;
      }
    } catch (error) {
      if (error.response?.status === 422) {
        return error.response.data; // { errors: {...} }
      }
      showToast('error', 'Terjadi kesalahan saat memperbarui password.');
    } finally {
      setSavingPassword(false);
    }
    return null;
  };

  // ---------------------------------------------------------------------------
  // Label jadwal berdasarkan jenis jasa
  // ---------------------------------------------------------------------------
  const jadwalLabel =
    jenisJasa === 'gas_galon' || jenisJasa === 'gas' || jenisJasa === 'galon_gas'
      ? 'Slot Waktu Pengiriman'
      : (jenisJasa === 'cleaning' || jenisJasa === 'daily_cleaning' 
         ? 'Slot Waktu Pelayanan' 
         : 'Slot Waktu Penjemputan');

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <MitraLayout activePage="settings">

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span className="material-symbols-outlined">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modal Ubah Password */}
      {showPasswordModal && (
        <ModalUbahPassword
          loading={savingPassword}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handleUpdatePassword}
        />
      )}

      {loading ? (
        <div className="pengaturan-mitra-loading-container">
          <span className="material-symbols-outlined pengaturan-mitra-spinner">progress_activity</span>
        </div>
      ) : (
        <div className="pengaturan-mitra-wrapper">
          <header className="pengaturan-mitra-header">
            <h1 className="pengaturan-mitra-title">Pengaturan Mitra</h1>
            <p className="pengaturan-mitra-description">
              Kelola profil bisnis, jadwal operasional, dan keamanan akun Anda.
            </p>
          </header>

          <div className="pengaturan-mitra-sections">

            {/* ----------------------------------------------------------------
                SECTION 1 — Profil Bisnis
            ---------------------------------------------------------------- */}
            <section className="pengaturan-mitra-section-card">
              <h2 className="pengaturan-mitra-section-title">Profil Bisnis</h2>

              <div className="pengaturan-mitra-grid-2">
                {/* Nama Mitra */}
                <div className="pengaturan-mitra-form-group">
                  <label>Nama Mitra <span className="required-mark">*</span></label>
                  <input
                    type="text"
                    value={profilBisnis.nama_mitra}
                    onChange={e => handleProfilChange('nama_mitra', e.target.value)}
                    className={profilErrors.nama_mitra ? 'input-error' : ''}
                  />
                  {profilErrors.nama_mitra && (
                    <span className="field-error">{profilErrors.nama_mitra[0]}</span>
                  )}
                </div>

                {/* Nomor Telepon */}
                <div className="pengaturan-mitra-form-group">
                  <label>Nomor Telepon / WhatsApp <span className="required-mark">*</span></label>
                  <input
                    type="text"
                    value={profilBisnis.nomor_telepon}
                    onChange={e => handleProfilChange('nomor_telepon', e.target.value)}
                    placeholder="contoh: 08123456789"
                    className={profilErrors.nomor_telepon ? 'input-error' : ''}
                  />
                  {profilErrors.nomor_telepon && (
                    <span className="field-error">{profilErrors.nomor_telepon[0]}</span>
                  )}
                </div>

                {/* Alamat */}
                <div className="pengaturan-mitra-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Alamat <span className="required-mark">*</span></label>
                  <input
                    type="text"
                    value={profilBisnis.alamat_mitra}
                    onChange={e => handleProfilChange('alamat_mitra', e.target.value)}
                    className={profilErrors.alamat_mitra ? 'input-error' : ''}
                  />
                  {profilErrors.alamat_mitra && (
                    <span className="field-error">{profilErrors.alamat_mitra[0]}</span>
                  )}
                </div>

                {/* Deskripsi */}
                <div className="pengaturan-mitra-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Deskripsi</label>
                  <textarea
                    rows={3}
                    value={profilBisnis.deskripsi}
                    onChange={e => handleProfilChange('deskripsi', e.target.value)}
                    placeholder="Ceritakan sedikit tentang usaha Anda..."
                    className={profilErrors.deskripsi ? 'input-error' : ''}
                  />
                  {profilErrors.deskripsi && (
                    <span className="field-error">{profilErrors.deskripsi[0]}</span>
                  )}
                </div>

                {/* Koordinat */}
                <div className="pengaturan-mitra-form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={profilBisnis.latitude}
                    onChange={e => handleProfilChange('latitude', e.target.value)}
                    placeholder="-7.123456"
                    className={profilErrors.latitude ? 'input-error' : ''}
                  />
                  {profilErrors.latitude && (
                    <span className="field-error">{profilErrors.latitude[0]}</span>
                  )}
                </div>

                <div className="pengaturan-mitra-form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={profilBisnis.longitude}
                    onChange={e => handleProfilChange('longitude', e.target.value)}
                    placeholder="110.123456"
                    className={profilErrors.longitude ? 'input-error' : ''}
                  />
                  {profilErrors.longitude && (
                    <span className="field-error">{profilErrors.longitude[0]}</span>
                  )}
                </div>

                {/* Radius Layanan */}
                <div className="pengaturan-mitra-form-group">
                  <label>Radius Layanan (meter)</label>
                  <input
                    type="number"
                    min="0"
                    value={profilBisnis.radius_layanan}
                    onChange={e => handleProfilChange('radius_layanan', e.target.value)}
                    placeholder="contoh: 3000"
                    className={profilErrors.radius_layanan ? 'input-error' : ''}
                  />
                  {profilErrors.radius_layanan && (
                    <span className="field-error">{profilErrors.radius_layanan[0]}</span>
                  )}
                </div>

                {/* Jenis Jasa (read-only) */}
                <div className="pengaturan-mitra-form-group">
                  <label>Jenis Jasa</label>
                  <input
                    type="text"
                    value={jenisJasa}
                    readOnly
                    className="input-readonly"
                    title="Jenis jasa hanya dapat diubah oleh admin."
                  />
                  <span className="field-hint">Hanya admin yang dapat mengubah jenis jasa.</span>
                </div>
              </div>

              <div className="section-action-row">
                <button className="pengaturan-mitra-primary-btn" onClick={() => {}}>
                  Unggah Logo Baru
                </button>
                <button
                  className="pengaturan-mitra-btn-primary"
                  onClick={handleSaveProfil}
                  disabled={savingProfil}
                >
                  {savingProfil ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </div>
            </section>

            {/* ----------------------------------------------------------------
                SECTION 2 — Jadwal Operasional
            ---------------------------------------------------------------- */}
            <section className="pengaturan-mitra-section-card">
              <h2 className="pengaturan-mitra-section-title">{jadwalLabel}</h2>
              <p className="pengaturan-mitra-description" style={{ marginBottom: '1rem' }}>
                Pilih slot waktu yang tersedia. Slot yang dipilih akan ditampilkan kepada pelanggan saat memesan.
              </p>

              <div className="jadwal-slot-grid">
                {SLOT_OPTIONS.map(slot => {
                  const isSelected = jadwalDipilih.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`jadwal-slot-btn ${isSelected ? 'jadwal-slot-active' : ''}`}
                      onClick={() => toggleSlotJadwal(slot)}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              <div className="section-action-row" style={{ marginTop: '1.25rem' }}>
                <span className="field-hint">
                  {jadwalDipilih.length} slot dipilih
                  {jadwalDipilih.length > 0 && `: ${jadwalDipilih.join(', ')}`}
                </span>
                <button
                  className="pengaturan-mitra-btn-primary"
                  onClick={handleSaveJadwal}
                  disabled={savingJadwal}
                >
                  {savingJadwal ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </section>

            {/* ----------------------------------------------------------------
                SECTION 3 — Keamanan & Akun
            ---------------------------------------------------------------- */}
            <section className="pengaturan-mitra-section-card">
              <h2 className="pengaturan-mitra-section-title">Keamanan & Akun</h2>
              <div className="pengaturan-mitra-security-list">
                <button
                  className="pengaturan-mitra-change-pwd-btn"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <div className="pengaturan-mitra-flex-center">
                    <span className="material-symbols-outlined">lock</span>
                    <span>Ubah Kata Sandi</span>
                  </div>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </section>

          </div>
        </div>
      )}
    </MitraLayout>
  );
};

export default PengaturanMitra;
