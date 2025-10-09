import React, { useEffect, useState } from "react";
import "../../sass/dashboard.scss";

function Dashboard() {
    const [stats, setStats] = useState({
        total_students: 0,
        total_faculty: 0,
        total_departments: 0,
        total_courses: 0,
        students_by_course: [],
        faculty_by_department: [],
    });
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/dashboard", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                });
                if (response.status === 401 || response.status === 403) {
                    window.location.href = "/login";
                    return;
                }
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                } else {
                    setError("Failed to load dashboard data");
                }
            } catch (error) {
                setError("Error loading dashboard data");
                console.error("Error:", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="dashboard-content">
            <header className="page-header">
                <h1 className="page-title">Overview</h1>
                <p className="page-subtitle">
                    Welcome Back! Here's your system overview.
                </p>
            </header>

            {error && <div className="alert-error">{error}</div>}

            <section className="stats-cards">
                <div className="stat-card">
                    <div className="stat-label">Students</div>
                    <div className="stat-value">{stats.total_students}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Faculty</div>
                    <div className="stat-value">{stats.total_faculty}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Departments</div>
                    <div className="stat-value">{stats.total_departments}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Courses</div>
                    <div className="stat-value">{stats.total_courses}</div>
                </div>
            </section>

            <div className="table-wrapper two-col">
                <div className="chart-card">
                    <h3>Students per Course</h3>
                    <ul>
                        {stats.students_by_course.map((item, index) => (
                            <li key={index}>
                                {item.label}: {item.count}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="chart-card">
                    <h3>Faculty per Department</h3>
                    <ul>
                        {stats.faculty_by_department.map((item, index) => (
                            <li key={index}>
                                {item.label}: {item.count}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
