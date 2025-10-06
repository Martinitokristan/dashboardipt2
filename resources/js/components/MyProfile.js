// resources/js/components/MyProfile.js
import React, { useState, useEffect } from 'react';
import '../../sass/profile.scss';

function MyProfile() {
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: 'admin',
        avatar: null
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Load profile data on component mount
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setProfile(data.user);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfile(prev => ({
                ...prev,
                avatar: file
            }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        try {
            const formData = new FormData();
            formData.append('first_name', profile.first_name);
            formData.append('last_name', profile.last_name);
            formData.append('email', profile.email);
            
            if (profile.avatar) {
                formData.append('avatar', profile.avatar);
            }

            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data.user);
                setMessage('Profile updated successfully!');
            } else {
                const error = await response.json();
                setMessage('Error: ' + (error.message || 'Failed to update profile'));
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear token and redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    };

    if (loading) {
        return <div className="page">Loading...</div>;
    }

    return (
        <div className="page">
            <header className="page-header profile-header">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Profile Information</p>
                    <p className="page-subtitle subtle">Update your personal details and contact information</p>
                </div>
                <div style={{display:'flex', gap:'8px'}}>
                    <button 
                        className="btn btn-light" 
                        onClick={() => setIsEditing(prev => !prev)}
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                    <button className="btn btn-danger" onClick={handleLogout}>⎋ Log out</button>
                </div>
            </header>

            <div className="profile-grid">
                <aside className="profile-card">
                    <div className="avatar">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt="avatar" />
                        ) : (
                            <img src="https://via.placeholder.com/96" alt="avatar" />
                        )}
                    </div>
                    <div className="profile-name">{profile.first_name} {profile.last_name}</div>
                    <div className="profile-email">{profile.email}</div>
                    <div className="profile-role">ADMIN</div>
                </aside>

                <section className="profile-form card">
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
                            accept="image/png, image/jpeg"
                            onChange={handleAvatarChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="form-actions">
                        {isEditing && (
                            <button 
                                className="btn btn-primary" 
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                        )}
                    </div>
                    {message && (
                        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                            {message}
                        </div>
                    )}
                </section>
            </div>

            <section className="account-action">
                <div className="action-title">Account Action</div>
                <div className="logout-box" onClick={handleLogout} style={{cursor: 'pointer'}}>
                    Log out from Account<br />
                    <span>This will end your session and redirect you to the log in page.</span>
                </div>
            </section>
        </div>
    );
}

export default MyProfile;


