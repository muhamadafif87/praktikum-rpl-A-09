import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();

    // ── Form State ──
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // ── UI State ──
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    // ── Password Visibility Toggle ──
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // ── Form Submission ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/v1/auth/login', {
                email: identifier,
                password,
            });

            const { data } = response.data;

            // Extract and save token securely
            if (data?.token) {
                localStorage.setItem('token', data.token);
            }

            // Save user data
            if (data?.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Show success state briefly before redirect
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 800);
        } catch (err) {
            if (err.response) {
                const serverMessage =
                    err.response.data?.message ||
                    'Login gagal. Periksa kembali email dan password Anda.';
                setError(serverMessage);
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
        <div className="login-page">
            <div className="login-layout">
                {/* ═══ LEFT COLUMN — Branding & Value Prop ═══ */}
                <div className="login-branding">
                    {/* Top Logo */}
                    <div className="login-branding-logo">
                        <a className="login-logo-link" href="#">
                            KostHub<span className="login-logo-dot">.</span>
                        </a>
                    </div>

                    {/* Center Value Prop */}
                    <div className="login-branding-content">
                        <div className="login-branding-icon">
                            <span className="material-symbols-outlined">shield</span>
                        </div>
                        <h1 className="login-branding-headline">
                            Sistem Escrow: Transaksi Aman, Duit Terlindungi.
                        </h1>
                        <p className="login-branding-body">
                            KostHub menjaga uangmu tetap aman di platform. Dana baru akan
                            diteruskan ke mitra setelah kamu memberikan konfirmasi bahwa
                            layanan sudah selesai dan clear.
                        </p>
                    </div>

                    {/* Bottom spacer */}
                    <div />
                </div>

                {/* ═══ RIGHT COLUMN — Login Form ═══ */}
                <div className="login-form-panel">
                    {/* Mobile Logo */}
                    <div className="login-mobile-logo">
                        <a className="login-logo-link" href="#">
                            KostHub<span className="login-logo-dot">.</span>
                        </a>
                    </div>

                    <div className="login-form-container">
                        {/* Header */}
                        <div className="login-form-header">
                            <h1 className="login-form-title">Selamat Datang Kembali</h1>
                            <p className="login-form-subtitle">
                                Silakan masuk ke akun Anda
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && <div className="login-error">{error}</div>}

                        {/* Form */}
                        <form className="login-form" onSubmit={handleSubmit}>
                            {/* Email/WhatsApp Input */}
                            <div className="login-field">
                                <label
                                    className="login-label"
                                    htmlFor="identifier"
                                >
                                    Email atau Nomor WhatsApp
                                </label>
                                <input
                                    className="login-input"
                                    id="identifier"
                                    name="identifier"
                                    type="text"
                                    placeholder="Masukkan email atau nomor WA"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>

                            {/* Password Input */}
                            <div className="login-field">
                                <div className="login-label-row">
                                    <label
                                        className="login-label"
                                        htmlFor="password"
                                    >
                                        Kata Sandi
                                    </label>
                                    <a className="login-forgot-link" href="#">
                                        Lupa Kata Sandi?
                                    </a>
                                </div>
                                <div className="login-input-wrapper">
                                    <input
                                        className="login-input login-input--with-toggle"
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Masukkan kata sandi"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="login-password-toggle"
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
                            </div>

                            {/* Submit Button */}
                            <div className="login-submit-wrapper">
                                <button
                                    className={`login-submit-btn ${isSuccess ? 'login-submit-btn--success' : ''}`}
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="material-symbols-outlined login-spinner">
                                            progress_activity
                                        </span>
                                    ) : isSuccess ? (
                                        <>
                                            <span>Berhasil</span>
                                            <span className="material-symbols-outlined">
                                                check_circle
                                            </span>
                                        </>
                                    ) : (
                                        <span>Masuk Aplikasi</span>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Register Link */}
                        <div className="login-register-link">
                            <p className="login-register-text">
                                Belum punya akun?{' '}
                                <Link className="login-register-anchor" to="/register">
                                    Daftar Akun Baru Sekarang
                                </Link>
                            </p>
                        </div>

                        {/* Admin/Mitra Note */}
                        <div className="login-note">
                            <p className="login-note-text">
                                Catatan: Untuk role Mitra &amp; Admin, silakan langsung
                                masuk menggunakan kredensial resmi yang telah dikonfigurasi
                                oleh tim developer pusat.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
