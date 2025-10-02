// resources/js/components/MyProfile.js
import React from 'react';
import '../../sass/profile.scss';

function MyProfile() {
    return (
        <div className="page">
            <header className="page-header profile-header">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Profile Information</p>
                    <p className="page-subtitle subtle">Update you personal details and contact  information</p>
                </div>
                <button className="btn btn-danger">⎋ Log out</button>
            </header>

            <div className="profile-grid">
                <aside className="profile-card">
                    <div className="avatar">
                        <img src="https://via.placeholder.com/96" alt="avatar" />
                    </div>
                    <div className="profile-name">AKademi</div>
                    <div className="profile-email">AKademi@edutech.com</div>
                    <div className="profile-role">ADMIN</div>
                </aside>

                <section className="profile-form card">
                    <div className="form-row">
                        <label>First Name</label>
                        <input type="text" defaultValue="AKade" />
                    </div>
                    <div className="form-row">
                        <label>Last Name</label>
                        <input type="text" defaultValue="Mi" />
                    </div>
                    <div className="form-row">
                        <label>Role</label>
                        <input type="text" defaultValue="System Administrator" />
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-primary">Edit Profile</button>
                    </div>
                </section>
            </div>

            <section className="account-action">
                <div className="action-title">Account Action</div>
                <div className="logout-box">Log out from Account<br /><span>This will end your session and redirect you to the log in page.</span></div>
            </section>
        </div>
    );
}

export default MyProfile;


