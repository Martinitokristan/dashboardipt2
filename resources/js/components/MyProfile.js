import React, { useState, useEffect } from "react";
import "../../sass/profile.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ Added for redirect

function MyProfile() {
    const navigate = useNavigate(); // ✅ Initialize navigation

    const DEFAULT_ROLE_DISPLAY = "System Administrator";

    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        email: "",
        role: DEFAULT_ROLE_DISPLAY,
        avatar: null,
    });
    const [initialProfile, setInitialProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await fetch("/api/profile", {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.status === 401 || response.status === 403) {
                navigate("/401"); // ✅ Redirect to Unauthorized page if token invalid
                return;
            }

            if (response.ok) {
                const data = await response.json();
                const userProfile = {
                    ...data.user,
                    role: data.user.role || DEFAULT_ROLE_DISPLAY,
                    email: data.user.email || "AKademi@edutech.com",
                };
                setProfile(userProfile);
                setInitialProfile(userProfile);
            } else {
                setError("Failed to load profile");
            }
        } catch (error) {
            setError("Error loading profile");
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfile((prev) => ({ ...prev, avatar: file }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("first_name", profile.first_name);
            formData.append("last_name", profile.last_name);
            formData.append("email", profile.email);

            if (profile.avatar && typeof profile.avatar !== "string") {
                formData.append("avatar", profile.avatar);
            }

            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            });

            if (response.status === 401 || response.status === 403) {
                navigate("/401"); // ✅ Redirect if unauthorized while saving
                return;
            }

            if (response.ok) {
                const data = await response.json();
                const updatedProfile = {
                    ...data.user,
                    role: data.user.role || DEFAULT_ROLE_DISPLAY,
                };
                setProfile(updatedProfile);
                setInitialProfile(updatedProfile);
                setError("Profile updated successfully!");
                setIsEditing(false);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to update profile");
            }
        } catch (error) {
            setError("Error updating profile");
            console.error("Error updating profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setProfile(initialProfile);
        setIsEditing(false);
        setError("");
    };

    const handleLogout = async () => {
        try {
            await axios.post(
                "/logout",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
            navigate("/login", { replace: true });
        }
    };

    const getAvatarUrl = (avatar) => {
        if (!avatar) return null;
        if (typeof avatar === "string") {
            return `/storage/${avatar}`;
        }
        return URL.createObjectURL(avatar);
    };

    if (loading) {
        return <div className="loading">Loading profile...</div>;
    }

    return (
        <div className="page-container">
            {/* Header Area */}
            <div className="profile-header">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Profile Information</p>
                    <p className="page-subtitle subtle">
                        Update your personal details and contact information
                    </p>
                </div>
                <button
                    className="btn btn-danger log-out-top"
                    onClick={handleLogout}
                >
                    <i className="fas fa-sign-out-alt"></i> Log out
                </button>
            </div>

            <div className="profile-main-content">
                <div className="profile-grid">
                    <div className="profile-card">
                        <div className="avatar">
                            {profile.avatar ? (
                                <img
                                    src={getAvatarUrl(profile.avatar)}
                                    alt="User Avatar"
                                />
                            ) : (
                                <div className="avatar-placeholder"></div>
                            )}
                        </div>
                        <h2 className="profile-name">
                            {profile.first_name || "AKademi"}
                        </h2>
                        <p className="profile-email">
                            {profile.email || "AKademi@edutech.com"}
                        </p>
                        <p className="profile-role admin">ADMIN</p>

                        {isEditing && (
                            <div className="avatar-upload-field">
                                <label
                                    htmlFor="avatar-upload-input"
                                    className="btn btn-secondary btn-small"
                                >
                                    Change Avatar
                                </label>
                                <input
                                    id="avatar-upload-input"
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    onChange={handleAvatarChange}
                                    style={{ display: "none" }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="card form-card">
                        <div className="form-row">
                            <label htmlFor="first_name">First Name</label>
                            <input
                                id="first_name"
                                type="text"
                                name="first_name"
                                value={profile.first_name}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                className={!isEditing ? "read-only-input" : ""}
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="last_name">Last Name</label>
                            <input
                                id="last_name"
                                type="text"
                                name="last_name"
                                value={profile.last_name}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                className={!isEditing ? "read-only-input" : ""}
                            />
                        </div>

                        <div className="form-row">
                            <label>Role</label>
                            <input
                                type="text"
                                value={profile.role}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-actions">
                            {!isEditing ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="btn"
                                        onClick={handleCancel}
                                        disabled={saving}
                                        style={{ marginRight: "8px" }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? "Saving..." : "Save Profile"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="account-action">
                    <div className="action-title">Account Action</div>
                    <div
                        className="logout-box"
                        onClick={handleLogout}
                        style={{ cursor: "pointer" }}
                    >
                        Log out from Account
                        <br />
                        <span>
                            This will end your session and redirect you to the
                            log in page.
                        </span>
                    </div>
                </div>
            </div>

            {error && (
                <div
                    className={`alert ${
                        error.includes("successfully") ? "success" : "error"
                    }`}
                >
                    {error}
                </div>
            )}
        </div>
    );
}

export default MyProfile;
