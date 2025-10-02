
import React from 'react';
import '../../sass/dashboard.scss';

function Dashboard() {
    return (
        <div className="dashboard-content">
            <header className="page-header">
                <h1 className="page-title">Overview</h1>
                <p className="page-subtitle">Welcome Back! Here's your system overview.</p>
            </header>

            <section className="stats-cards">
                <div className="stat-card"><div className="stat-label">Students</div><div className="stat-value">0</div></div>
                <div className="stat-card"><div className="stat-label">Faculty</div><div className="stat-value">0</div></div>
                <div className="stat-card"><div className="stat-label">Department</div><div className="stat-value">0</div></div>
                <div className="stat-card"><div className="stat-label">Courses</div><div className="stat-value">0</div></div>
            </section>

            <div className="table-wrapper two-col">
                <div className="chart-card">Students per Course</div>
                <div className="chart-card">Faculty per Department</div>
            </div>
        </div>
    );
}

export default Dashboard;


