import React, { useState, useEffect } from "react";
import "../../sass/profile.scss";
import axios from "axios";

function MyProfile() {
    // Setting default role to match the image's text
    const DEFAULT_ROLE_DISPLAY = "System Administrator";

    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        email: "",
        role: DEFAULT_ROLE_DISPLAY,
        avatar: null,
    });
    // Store the original profile data for the 'Cancel' button
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
                window.location.href = "/login";
                return;
            }
            if (response.ok) {
                const data = await response.json();
                const userProfile = {
                    ...data.user,
                    role: data.user.role || DEFAULT_ROLE_DISPLAY,
                    // Ensure the initial email is available, if not provided by API
                    email: data.user.email || "AKademi@edutech.com",
                };
                setProfile(userProfile);
                setInitialProfile(userProfile); // Save initial profile
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
                window.location.href = "/login";
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
            // Clear tokens first
            localStorage.clear();
            sessionStorage.clear();

            // Call logout endpoint
            await axios.post(
                "/api/logout",
                {},
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            // Force navigation to login
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout failed:", error);
            window.location.href = "/login";
        }
    };

    // Helper for avatar URL
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
                        Update you personal details and contact information
                    </p>
                </div>
                {/* Top Right Log out button */}
                <button
                    className="btn btn-danger log-out-top"
                    onClick={handleLogout}
                >
                    <i className="fas fa-sign-out-alt"></i> Log out
                </button>
            </div>

            {/* Main Content Area */}
            <div className="profile-main-content">
                {/* Two-Column Grid */}
                <div className="profile-grid">
                    {/* Left Column: Avatar and Info Display Card */}
                    <div className="profile-card">
                        <div className="avatar">
                            {/* Avatar Image */}
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

                        {/* Avatar Upload Field (only visible when editing) */}
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

                    {/* Right Column: Form Fields and Actions Card */}
                    <div className="card form-card">
                        {/* First Name */}
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

                        {/* Last Name */}
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

                        {/* Role (Read Only) */}
                        <div className="form-row">
                            <label>Role</label>
                            <input
                                type="text"
                                value={profile.role}
                                readOnly
                                disabled
                            />
                        </div>

                        {/* Profile Action Buttons */}
                        <div className="form-actions">
                            {/* Conditional rendering for Edit/Save/Cancel */}
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
                                        className="btn" // Assuming default 'btn' is secondary
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

                {/* Account Action: Logout Section at the bottom */}
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

            {/* Error/Success Message Display (Optional: Floating/fixed positioning usually) */}
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
