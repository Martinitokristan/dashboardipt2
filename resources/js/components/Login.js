import React, { useState } from "react";
import axios from "axios";
import "../../sass/Login.scss";

function Login() {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        remember: false,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post("/login", formData);
            if (response.data.redirect) {
                localStorage.setItem("token", response.data.token);
                window.location.href = response.data.redirect;
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else if (error.response?.status === 403) {
                setErrors({ general: "Unauthorized. Admins only." });
            } else {
                setErrors({ general: "An error occurred. Please try again." });
            }
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setErrors({});
        setFormData({ username: "", password: "", remember: false });
    };

    return (
        <div className="landing-page">
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

            <section className="hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <h2 className="hero-title">Welcome to</h2>
                        <h3 className="hero-subtitle">
                            Educational Tech Management
                        </h3>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <div className="footer-container">
                    <div className="contact-info">
                        <p className="contact-label">CONTACT US:</p>
                        <p className="contact-detail">
                            Tel Nos: +63 [085] 9826440
                        </p>
                    </div>
                </div>
            </footer>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-close" onClick={closeModal}>
                            <svg viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                        </div>
                        <h4 className="modal-title">Administrator Log In</h4>
                        <form className="login-form" onSubmit={handleSubmit}>
                            {errors.general && (
                                <div className="alert-error">
                                    {errors.general}
                                </div>
                            )}
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    className={`form-input ${
                                        errors.username ? "input-error" : ""
                                    }`}
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    autoComplete="username"
                                />
                                {errors.username && (
                                    <span className="error-message">
                                        {errors.username[0]}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    className={`form-input ${
                                        errors.password ? "input-error" : ""
                                    }`}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                />
                                {errors.password && (
                                    <span className="error-message">
                                        {errors.password[0]}
                                    </span>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={loading}
                            >
                                {loading ? "Logging in..." : "Log in"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;
