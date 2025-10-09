import React, { useState, useEffect } from "react";
import "../../sass/profile.scss";

function MyProfile() {
    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        email: "",
        role: "admin",
        avatar: null,
    });
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
                setProfile(data.user);
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
                setProfile(data.user);
                setError("Profile updated successfully!");
                setIsEditing(false);
            } else {
                setError("Failed to update profile");
            }
        } catch (error) {
            setError("Error updating profile");
            console.error("Error updating profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/logout", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            localStorage.removeItem("token");
            window.location.href = "/";
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="profile-content">
            <header className="page-header">
                <h1 className="page-title">Manage your admin account</h1>
            </header>

            {loading && <div className="loading">Loading...</div>}
            {error && (
                <div
                    className={`alert ${
                        error.includes("successfully") ? "success" : "error"
                    }`}
                >
                    {error}
                </div>
            )}

            <div className="profile-sections">
                <section className="profile-info">
                    <div className="avatar">
                        {profile.avatar ? (
                            <img
                                src={
                                    typeof profile.avatar === "string"
                                        ? `/storage/${profile.avatar}`
                                        : URL.createObjectURL(profile.avatar)
                                }
                                alt="Avatar"
                            />
                        ) : (
                            <div className="avatar-placeholder">No Avatar</div>
                        )}
                    </div>
                    <div className="form-row">
                        <label>First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={profile.first_name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="form-row">
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            value={profile.last_name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="form-row">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="form-row">
                        <label>Role</label>
                        <input
                            type="text"
                            value="System Administrator"
                            readOnly
                        />
                    </div>
                    <div className="form-row">
                        <label>Avatar</label>
                        <input
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={handleAvatarChange}
                            disabled={!isEditing}
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
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditing(false)}
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
                </section>

                <section className="account-action">
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
                            login page.
                        </span>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default MyProfile;
