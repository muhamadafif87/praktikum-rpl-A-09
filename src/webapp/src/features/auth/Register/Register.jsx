import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    // ── Form State ──
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        nomor_telepon: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ── UI State ──
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // ── Handle Input Changes ──
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear field-specific error on change
        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    // ── Password Visibility Toggle ──
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // ── Form Submission ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        if (!termsAccepted) {
            setError('Anda harus menyetujui syarat dan ketentuan.');
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setFieldErrors({
                password_confirmation: ['Konfirmasi password tidak cocok.'],
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/v1/auth/register', {
                nama_lengkap: formData.nama_lengkap,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
                nomor_telepon: formData.nomor_telepon,
            });

            const { data } = response.data;

            // Update AuthContext and LocalStorage seamlessly
            if (data?.user && data?.token) {
                const guard = data.guard || 'web';
                authLogin(data.user, data.token, guard);
            }

            // Redirect to home after successful registration for user
            navigate('/');
        } catch (err) {
            if (err.response) {
                const status = err.response.status;
                const responseData = err.response.data;

                if (status === 422 && responseData?.errors) {
                    // Laravel validation errors — map to per-field display
                    setFieldErrors(responseData.errors);
                } else {
                    setError(
                        responseData?.message ||
                            'Registrasi gagal. Silakan coba lagi.'
                    );
                }
            } else if (err.request) {
                setError('Tidak dapat terhubung ke server. Coba lagi nanti.');
            } else {
                setError('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <main className="register-main">
                <div className="register-container">
                    {/* Logo */}
                    <div className="register-logo">
                        <a className="register-logo-link" href="#">
                            KostHub<span className="register-logo-dot">.</span>
                        </a>
                    </div>

                    {/* Header */}
                    <div className="register-header">
                        <h1 className="register-title">Daftar Akun Pelanggan</h1>
                        <p className="register-subtitle">
                            Mulai penuhi kebutuhan kosmu dengan aman dan anti-cemas.
                        </p>
                    </div>

                    {/* Global Error Message */}
                    {error && <div className="register-error">{error}</div>}

                    {/* Form */}
                    <form className="register-form" onSubmit={handleSubmit}>
                        {/* Nama Lengkap */}
                        <div className="register-field">
                            <label className="register-label" htmlFor="fullName">
                                Nama Lengkap
                            </label>
                            <input
                                className="register-input"
                                id="fullName"
                                name="nama_lengkap"
                                type="text"
                                placeholder="Masukkan nama lengkap sesuai KTP..."
                                required
                                value={formData.nama_lengkap}
                                onChange={handleChange}
                            />
                            {fieldErrors.nama_lengkap && (
                                <span className="register-field-error">
                                    {fieldErrors.nama_lengkap[0]}
                                </span>
                            )}
                        </div>

                        {/* Nomor WhatsApp Aktif */}
                        <div className="register-field">
                            <label className="register-label" htmlFor="whatsapp">
                                Nomor WhatsApp Aktif
                            </label>
                            <input
                                className="register-input"
                                id="whatsapp"
                                name="nomor_telepon"
                                type="tel"
                                placeholder="Contoh: 08123456789..."
                                required
                                value={formData.nomor_telepon}
                                onChange={handleChange}
                            />
                            {fieldErrors.nomor_telepon && (
                                <span className="register-field-error">
                                    {fieldErrors.nomor_telepon[0]}
                                </span>
                            )}
                        </div>

                        {/* Email */}
                        <div className="register-field">
                            <label className="register-label" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="register-input"
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Masukkan alamat email..."
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {fieldErrors.email && (
                                <span className="register-field-error">
                                    {fieldErrors.email[0]}
                                </span>
                            )}
                        </div>

                        {/* Kata Sandi Baru */}
                        <div className="register-field">
                            <label className="register-label" htmlFor="password">
                                Kata Sandi Baru
                            </label>
                            <div className="register-input-wrapper">
                                <input
                                    className="register-input register-input--with-toggle"
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={togglePasswordVisibility}
                                    aria-label={
                                        showPassword
                                            ? 'Sembunyikan password'
                                            : 'Tampilkan password'
                                    }
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword
                                            ? 'visibility_off'
                                            : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <span className="register-field-error">
                                    {fieldErrors.password[0]}
                                </span>
                            )}
                        </div>

                        {/* Konfirmasi Kata Sandi */}
                        <div className="register-field">
                            <label
                                className="register-label"
                                htmlFor="confirmPassword"
                            >
                                Konfirmasi Kata Sandi
                            </label>
                            <div className="register-input-wrapper">
                                <input
                                    className="register-input register-input--with-toggle"
                                    id="confirmPassword"
                                    name="password_confirmation"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    required
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={togglePasswordVisibility}
                                    aria-label={
                                        showPassword
                                            ? 'Sembunyikan password'
                                            : 'Tampilkan password'
                                    }
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword
                                            ? 'visibility_off'
                                            : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            {fieldErrors.password_confirmation && (
                                <span className="register-field-error">
                                    {fieldErrors.password_confirmation[0]}
                                </span>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <div className="register-terms">
                            <input
                                className="register-terms-checkbox"
                                id="terms"
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) =>
                                    setTermsAccepted(e.target.checked)
                                }
                            />
                            <label
                                className="register-terms-label"
                                htmlFor="terms"
                            >
                                Saya menyetujui Syarat &amp; Ketentuan serta
                                Jaminan Keamanan Escrow di KostHub.
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            className="register-submit-btn"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="material-symbols-outlined register-spinner">
                                    progress_activity
                                </span>
                            ) : (
                                <span>Daftar Sekarang</span>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="register-login-link">
                        Sudah memiliki akun?{' '}
                        <Link className="register-login-anchor" to="/login">
                            Masuk di sini
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Register;
