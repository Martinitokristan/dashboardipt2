import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import "../../sass/layout.scss";

function Layout() {
    return (
        <div className="app-layout">
            <aside className="sidebar">
                <Link to="/dashboard" className="brand">
                    <div className="brand-logo">🎓</div>
                    <div className="brand-text">
                        <div className="brand-title">M&P EduTech</div>
                        <div className="brand-subtitle">
                            Academic Management
                        </div>
                    </div>
                </Link>
                <nav className="nav">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        All Overview
                    </NavLink>
                    <NavLink
                        to="/faculty"
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        Faculty
                    </NavLink>
                    <NavLink
                        to="/students"
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        Students
                    </NavLink>
                    <NavLink
                        to="/reports"
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        Reports
                    </NavLink>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        Settings
                    </NavLink>
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        My Profile
                    </NavLink>
                </nav>
            </aside>
            <main className="main">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
