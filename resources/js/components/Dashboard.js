import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
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

    const COLORS = ["#4f46e5", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

    return (
        <div className="dashboard-content">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Overview</h1>
                    <p className="page-subtitle">
                        Welcome Back! Here's your system overview.
                    </p>
                </div>
            </header>

            {error && <div className="alert-error">{error}</div>}

            <section className="stats-cards">
                <div className="stat-card purple">
                    <div className="stat-icon">👩‍🎓</div>
                    <div className="stat-label">Students</div>
                    <div className="stat-value">{stats.total_students}</div>
                </div>

                <div className="stat-card orange">
                    <div className="stat-icon">👨‍🏫</div>
                    <div className="stat-label">Faculty</div>
                    <div className="stat-value">{stats.total_faculty}</div>
                </div>

                <div className="stat-card yellow">
                    <div className="stat-icon">🏛️</div>
                    <div className="stat-label">Department</div>
                    <div className="stat-value">{stats.total_departments}</div>
                </div>

                <div className="stat-card navy">
                    <div className="stat-icon">📘</div>
                    <div className="stat-label">Courses</div>
                    <div className="stat-value">{stats.total_courses}</div>
                </div>
            </section>

            <div className="charts">
                <div className="chart-card">
                    <h3>Students per Course</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={stats.students_by_course}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar
                                dataKey="count"
                                fill="#8b5cf6"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Faculty per Department</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={stats.faculty_by_department}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="label"
                            >
                                {stats.faculty_by_department.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Legend />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
