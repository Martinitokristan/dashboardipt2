import React, { useState, useEffect } from "react";
import "../../sass/profile.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MyProfile() {
    const navigate = useNavigate();
    const DEFAULT_ROLE_DISPLAY = "System Administrator";

    // Ensure axios sends cookies for Sanctum session auth
    axios.defaults.withCredentials = true;

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

    // password-related transient fields (kept separate so we don't accidentally persist them)
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const ensureCsrf = async () => {
        try {
            await axios.get("/sanctum/csrf-cookie");
        } catch (err) {
            console.warn("Failed to fetch CSRF cookie:", err);
        }
    };

    const loadProfile = async () => {
        setLoading(true);
        setError("");
        try {
            await ensureCsrf();

            const response = await axios.get("/api/profile", {
                withCredentials: true,
            });

            if (response.status === 401 || response.status === 403) {
                navigate("/401");
                return;
            }

            const data = response.data;
            const userProfile = {
                ...data.user,
                role: data.user.role || DEFAULT_ROLE_DISPLAY,
                email: data.user.email || "AKademi@edutech.com",
            };

            setProfile(userProfile);
            setInitialProfile(userProfile);

            // clear password fields if any
            setCurrentPassword("");
            setNewPassword("");
            setNewPasswordConfirmation("");
        } catch (err) {
            console.error("Error loading profile:", err);
            if (
                err.response &&
                (err.response.status === 401 || err.response.status === 403)
            ) {
                navigate("/401");
                return;
            }
            setError("Error loading profile");
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
            await ensureCsrf();

            const formData = new FormData();
            formData.append("first_name", profile.first_name);
            formData.append("last_name", profile.last_name);
            formData.append("email", profile.email);

            // Avatar: only append if it's a File (i.e., user selected a new file)
            if (profile.avatar && typeof profile.avatar !== "string") {
                formData.append("avatar", profile.avatar);
            }

            // Append password fields only if user entered a new password (and/or current)
            if (newPassword) {
                // current_password is required_with:new_password on backend
                if (currentPassword) {
                    formData.append("current_password", currentPassword);
                }
                formData.append("new_password", newPassword);
                formData.append(
                    "new_password_confirmation",
                    newPasswordConfirmation
                );
            }

            // Laravel accepts file uploads more reliably via POST + _method=PUT
            formData.append("_method", "PUT");

            const response = await axios.post("/api/profile", formData, {
                withCredentials: true,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200 || response.status === 201) {
                const data = response.data;
                const updatedProfile = {
                    ...data.user,
                    role: data.user.role || DEFAULT_ROLE_DISPLAY,
                };

                setProfile(updatedProfile);
                setInitialProfile(updatedProfile);
                // Clear local password fields
                setCurrentPassword("");
                setNewPassword("");
                setNewPasswordConfirmation("");
                setError("Profile updated successfully!");
                setIsEditing(false);
            } else {
                setError("Failed to update profile");
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            if (err.response) {
                if (
                    err.response.status === 401 ||
                    err.response.status === 403
                ) {
                    navigate("/401");
                    return;
                }
                const data = err.response.data;
                if (data && data.errors) {
                    // Flatten the errors into a single message string
                    const messages = [];
                    Object.keys(data.errors).forEach((key) => {
                        if (Array.isArray(data.errors[key])) {
                            messages.push(...data.errors[key]);
                        } else if (typeof data.errors[key] === "string") {
                            messages.push(data.errors[key]);
                        }
                    });
                    setError(messages.join(" "));
                } else if (data && data.message) {
                    setError(data.message);
                } else {
                    setError("Error updating profile");
                }
            } else {
                setError("Network error updating profile");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setProfile(initialProfile);
        setIsEditing(false);
        setError("");
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirmation("");
    };

    const handleLogout = async () => {
        try {
            await ensureCsrf();
            await axios.post("/logout", {}, { withCredentials: true });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            try {
                localStorage.removeItem("token");
                delete axios.defaults.headers.common["Authorization"];
            } catch (_) {}
            navigate("/login", { replace: true });
        }
    };

    const getAvatarUrl = (avatar) => {
        if (!avatar) return null;
        if (typeof avatar === "string") {
            // backend may return either a path (avatars/...) or full URL. If it's a path, prefix with /storage/
            if (
                avatar.startsWith("http://") ||
                avatar.startsWith("https://") ||
                avatar.startsWith("/storage/")
            ) {
                return avatar;
            }
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

                        {/* Inline Change Password section (appears only when editing) */}
                        {isEditing && (
                            <>
                                <div
                                    className="form-note"
                                    style={{
                                        marginBottom: 8,
                                        color: "#6b7280",
                                    }}
                                >
                                    Leave password fields empty if you do not
                                    want to change your password.
                                </div>

                                <div className="form-row">
                                    <label htmlFor="current_password">
                                        Current Password
                                    </label>
                                    <input
                                        id="current_password"
                                        type="password"
                                        name="current_password"
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                        className="form-input"
                                        placeholder="Enter current password"
                                    />
                                </div>

                                <div className="form-row">
                                    <label htmlFor="new_password">
                                        New Password
                                    </label>
                                    <input
                                        id="new_password"
                                        type="password"
                                        name="new_password"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        className="form-input"
                                        placeholder="Enter new password (min 8 chars)"
                                    />
                                </div>

                                <div className="form-row">
                                    <label htmlFor="new_password_confirmation">
                                        Confirm New Password
                                    </label>
                                    <input
                                        id="new_password_confirmation"
                                        type="password"
                                        name="new_password_confirmation"
                                        value={newPasswordConfirmation}
                                        onChange={(e) =>
                                            setNewPasswordConfirmation(
                                                e.target.value
                                            )
                                        }
                                        className="form-input"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </>
                        )}

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
                        Log out from Account <br />
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
