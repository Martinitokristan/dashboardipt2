import "./bootstrap";
import React from "react";
import { createRoot } from "react-dom/client";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Layout from "./components/Layout";
import Students from "./components/Students";
import Faculty from "./components/Faculty";
import Report from "./components/Report";
import MyProfile from "./components/MyProfile";
import ArchivedAll from "./components/ArchivedAll";
import Unauthorized from "./components/Unauthorized";

// ✅ Protect specific routes
function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/401" replace />;
    }
    return children;
}

function App() {
    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/401" element={<Unauthorized />} />

                {/* Protected routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/faculty" element={<Faculty />} />
                    <Route path="/reports" element={<Report />} />
                    <Route path="/archived" element={<ArchivedAll />} />
                    <Route path="/profile" element={<MyProfile />} />
                </Route>
            </Routes>
        </Router>
    );
}

const appElement = document.getElementById("app");
if (appElement) {
    const root = createRoot(appElement);
    root.render(<App />);
}
