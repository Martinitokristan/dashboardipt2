// resources/js/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import '../../sass/Login.scss';

function Login() {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        remember: false
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post('/login', formData);
            if (response.data.redirect) {
                window.location.href = response.data.redirect;
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                setErrors({ general: 'An error occurred. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setErrors({});
        setFormData({ username: '', password: '', remember: false });
    };

    return (
        <div className="landing-page">
            {/* Header */}
            <header className="header">
                <div className="header-container">
                    <h1 className="logo">EduTech Management</h1>
                    <button
                        className="btn-admin-login"
                        onClick={() => setShowModal(true)}
                    >
                        Admin log in
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <h2 className="hero-title">Welcome to</h2>
                        <h3 className="hero-subtitle">Educational Tech Management</h3>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="contact-info">
                        <p className="contact-label">CONTACT US:</p>
                        <p className="contact-detail">Tel Nos: +63 [085] 9826440</p>
                        <p className="contact-detail">Email: Akademi@edutech.com</p>
                    </div>
                    <div className="copyright">
                        <p className="copyright-icon">©</p>
                        <p className="copyright-text">GECDesigns | Images use in this site courtesy of EduTech management office</p>
                    </div>
                </div>
            </footer>

            {/* Login Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-header-title">Log In</h3>
                            <button
                                className="modal-close-btn"
                                onClick={closeModal}
                                type="button"
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-icon">
                                <svg className="graduation-cap-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
                                </svg>
                            </div>

                            <h4 className="modal-title">Administrator Log In</h4>

                            <form className="login-form" onSubmit={handleSubmit}>
                                {errors.general && (
                                    <div className="alert-error">{errors.general}</div>
                                )}

                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Username"
                                        className={`form-input ${errors.username ? 'input-error' : ''}`}
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        autoComplete="username"
                                    />
                                    {errors.username && (
                                        <span className="error-message">{errors.username[0]}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        className={`form-input ${errors.password ? 'input-error' : ''}`}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="current-password"
                                    />
                                    {errors.password && (
                                        <span className="error-message">{errors.password[0]}</span>
                                    )}
                                </div>



                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Logging in...' : 'Log in'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;