import "./bootstrap";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Layout from "./components/Layout";
import Students from "./components/Students";
import Faculty from "./components/Faculty";
import Report from "./components/Report";
import MyProfile from "./components/MyProfile";
import ArchivedAll from "./components/ArchivedAll";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route element={<Layout />}>
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
