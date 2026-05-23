import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();

    // ── Form State ──
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nama_lengkap: '',
        nomor_telepon: '',
        alamat_kost: '',
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

        // Client-side validation
        if (!termsAccepted) {
            setError('Anda harus menyetujui syarat dan ketentuan.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/register', {
                nama_lengkap: formData.nama_lengkap,
                email: formData.email,
                password: formData.password,
                nomor_telepon: formData.nomor_telepon,
                alamat_kost: formData.alamat_kost,
            });

            const { data } = response.data;

            /*
             * Expected response shape:
             * {
             *   "message": "Registrasi berhasil.",
             *   "data": {
             *     "user": { "nama_lengkap", "email", "nomor_telepon", "alamat_kost", "id_user" },
             *     "token": "1|Etx4E5zpgIj..."
             *   }
             * }
             */

            // Save auth token securely to localStorage
            if (data?.token) {
                localStorage.setItem('token', data.token);
            }

            // Save user profile data
            if (data?.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirect to dashboard after successful registration
            navigate('/dashboard');
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
            <main className="register-wrapper">
                {/* ═══ LEFT PANEL — Branding & Entry ═══ */}
                <section className="register-branding">
                    {/* Decorative atmospheric background */}
                    <div className="register-orb register-orb--top" />
                    <div className="register-orb register-orb--bottom" />

                    <div className="register-brand-top">
                        <h1 className="register-brand-title">KostHUB</h1>
                        <div className="register-brand-tagline">
                            <span className="material-symbols-outlined">domain</span>
                            <span className="register-brand-tagline-text">
                                Property Management
                            </span>
                        </div>
                    </div>

                    <div className="register-brand-middle">
                        <div className="register-brand-middle-content">
                            <h2 className="register-cta-heading">Get Started</h2>
                            <p className="register-cta-description">
                                Experience a new standard in property management and
                                boarding house services with a touch of modern
                                hospitality.
                            </p>
                        </div>
                        <div>
                            <p className="register-cta-prompt">
                                Already have an account?
                            </p>
                            <Link className="register-login-btn" to="/login">
                                Login
                            </Link>
                        </div>
                    </div>

                    <div className="register-stats">
                        <div className="register-stat-card register-stat-card--primary">
                            <p className="register-stat-value register-stat-value--primary">
                                1000+
                            </p>
                            <p className="register-stat-label">Units Managed</p>
                        </div>
                        <div className="register-stat-card register-stat-card--secondary">
                            <p className="register-stat-value register-stat-value--secondary">
                                4.9/5.0
                            </p>
                            <p className="register-stat-label">User Rating</p>
                        </div>
                    </div>
                </section>

                {/* ═══ RIGHT PANEL — Registration Form ═══ */}
                <section className="register-form-panel">
                    <div className="register-form-inner">
                        <div className="register-form-header">
                            <h2 className="register-form-title">Create Account</h2>
                            <p className="register-form-subtitle">
                                Join our ecosystem of premium property services.
                            </p>
                        </div>

                        {/* Global Error Message */}
                        {error && <div className="register-error">{error}</div>}

                        <form className="register-form" onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="reg-email">
                                    Email
                                </label>
                                <div className="input-wrapper">
                                    <span className="material-symbols-outlined input-icon">
                                        mail
                                    </span>
                                    <input
                                        className="form-input"
                                        id="reg-email"
                                        name="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                {fieldErrors.email && (
                                    <span className="field-error">
                                        {fieldErrors.email[0]}
                                    </span>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="reg-password">
                                    Password
                                </label>
                                <div className="input-wrapper">
                                    <span className="material-symbols-outlined input-icon">
                                        lock
                                    </span>
                                    <input
                                        className="form-input form-input--with-toggle"
                                        id="reg-password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
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
                                    <span className="field-error">
                                        {fieldErrors.password[0]}
                                    </span>
                                )}
                            </div>

                            {/* Full Name Field */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="reg-fullname">
                                    Full Name
                                </label>
                                <div className="input-wrapper">
                                    <span className="material-symbols-outlined input-icon">
                                        person
                                    </span>
                                    <input
                                        className="form-input"
                                        id="reg-fullname"
                                        name="nama_lengkap"
                                        type="text"
                                        placeholder="John Doe"
                                        required
                                        value={formData.nama_lengkap}
                                        onChange={handleChange}
                                    />
                                </div>
                                {fieldErrors.nama_lengkap && (
                                    <span className="field-error">
                                        {fieldErrors.nama_lengkap[0]}
                                    </span>
                                )}
                            </div>

                            {/* Phone Number Field (NEW — required by backend) */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="reg-phone">
                                    Phone Number
                                </label>
                                <div className="input-wrapper">
                                    <span className="material-symbols-outlined input-icon">
                                        phone
                                    </span>
                                    <input
                                        className="form-input"
                                        id="reg-phone"
                                        name="nomor_telepon"
                                        type="tel"
                                        placeholder="08xxxxxxxxxx"
                                        required
                                        value={formData.nomor_telepon}
                                        onChange={handleChange}
                                    />
                                </div>
                                {fieldErrors.nomor_telepon && (
                                    <span className="field-error">
                                        {fieldErrors.nomor_telepon[0]}
                                    </span>
                                )}
                            </div>

                            {/* Kost Address Field (NEW — required by backend) */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="reg-address">
                                    Kost Address
                                </label>
                                <div className="input-wrapper">
                                    <span className="material-symbols-outlined input-icon">
                                        location_on
                                    </span>
                                    <input
                                        className="form-input"
                                        id="reg-address"
                                        name="alamat_kost"
                                        type="text"
                                        placeholder="Jl. Contoh No. 123, Kota"
                                        required
                                        value={formData.alamat_kost}
                                        onChange={handleChange}
                                    />
                                </div>
                                {fieldErrors.alamat_kost && (
                                    <span className="field-error">
                                        {fieldErrors.alamat_kost[0]}
                                    </span>
                                )}
                            </div>

                            {/* Terms Checkbox */}
                            <div className="register-terms">
                                <div className="register-terms-checkbox-wrapper">
                                    <input
                                        className="register-terms-checkbox"
                                        id="terms"
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) =>
                                            setTermsAccepted(e.target.checked)
                                        }
                                    />
                                </div>
                                <label
                                    className="register-terms-label"
                                    htmlFor="terms"
                                >
                                    I accept the terms of the agreement
                                </label>
                            </div>

                            {/* Action Button */}
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
                                    <>
                                        <span>Sign Up</span>
                                        <span className="material-symbols-outlined">
                                            arrow_forward
                                        </span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Social Provider Alternative */}
                        <div className="register-social-section">
                            <div className="register-divider">
                                <hr className="register-divider-line" />
                                <span className="register-divider-text">
                                    Or continue with
                                </span>
                                <hr className="register-divider-line" />
                            </div>
                            <div className="register-social-grid">
                                <button className="register-social-btn" type="button">
                                    <img
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRMFfEPvW9pTAZo5M_pixleAA-Ewo8NScljhkRM6nP0h-DTrE6Fy_zOIYgcSzQN06MHG4P1mJ-DuVSvzztbQzKn9-R9uEw1wdktznOUBjYiHSbsgUXNPHRxaoy85f_3TP9sGIwivxzSatxlCA2Y2Bom83pjwSiIN2JdmIFmpETzDHaSruxtlS948AsuJw9NuPD7e1FjH-PYKU_7hrW_1uP1WGW1Na-uCwjMu52NXJIwub9CPYrTDeqlf5va0iqLMU5SO2zD3u-oLM"
                                        alt="Google"
                                    />
                                    Google
                                </button>
                                <button className="register-social-btn" type="button">
                                    <span className="material-symbols-outlined">
                                        social_leaderboard
                                    </span>
                                    Facebook
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Subtle brand background decoration */}
                    <div className="register-bg-decoration">
                        <span className="material-symbols-outlined">apartment</span>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Register;
