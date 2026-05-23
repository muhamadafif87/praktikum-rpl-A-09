import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();

    // ── Form State ──
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
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
            const response = await api.post('/login', {
                username,
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
                // Server responded with an error
                const serverMessage =
                    err.response.data?.message ||
                    'Login gagal. Periksa kembali username dan password Anda.';
                setError(serverMessage);
            } else if (err.request) {
                // No response from server
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
            <main className="login-main">
                {/* Abstract Background Decorative Elements */}
                <div className="login-bg-orb login-bg-orb--primary" />
                <div className="login-bg-orb login-bg-orb--tertiary" />

                {/* Login Container */}
                <div className="login-container">
                    {/* Brand Logo */}
                    <div className="login-brand">
                        <div className="login-brand-inner">
                            <span className="material-symbols-outlined login-brand-icon">
                                home_work
                            </span>
                            <span className="login-brand-text">KostHUB</span>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="login-card">
                        <div className="login-card-header">
                            <h1 className="login-card-title">Login</h1>
                            <p className="login-card-subtitle">
                                Silakan masuk ke akun manajemen KostHUB Anda
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && <div className="login-error">{error}</div>}

                        <form className="login-form" onSubmit={handleSubmit}>
                            {/* Username Field */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="username">
                                    Username
                                </label>
                                <div className="input-wrapper">
                                    <span className="material-symbols-outlined input-icon">
                                        person
                                    </span>
                                    <input
                                        className="form-input"
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="Masukkan username"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="password">
                                    Password
                                </label>
                                <div className="input-wrapper">
                                    <span className="material-symbols-outlined input-icon">
                                        lock
                                    </span>
                                    <input
                                        className="form-input form-input--with-toggle"
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Masukkan password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={togglePasswordVisibility}
                                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Options Row */}
                            <div className="login-options">
                                <label className="remember-label">
                                    <input
                                        className="remember-checkbox"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="remember-text">Remember me</span>
                                </label>
                                <a className="forgot-link" href="#">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
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
                                        <span className="material-symbols-outlined">check_circle</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Login</span>
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer Link */}
                        <div className="login-footer">
                            <p className="login-footer-text">
                                Don&apos;t have an account?{' '}
                                <Link className="login-footer-link" to="/register">
                                    Register
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Support Links */}
                    <div className="login-support">
                        <a className="login-support-link" href="#">
                            <span className="material-symbols-outlined">help</span>
                            Bantuan
                        </a>
                        <a className="login-support-link" href="#">
                            <span className="material-symbols-outlined">language</span>
                            Bahasa Indonesia
                        </a>
                    </div>
                </div>
            </main>

            {/* Page Footer */}
            <footer className="login-page-footer">
                <p className="login-page-footer-text">
                    © 2024 KostHUB Property Management Services. Semua hak dilindungi.
                </p>
            </footer>
        </div>
    );
};

export default Login;
