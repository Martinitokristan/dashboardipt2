import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../sass/unauthorized.scss";

export default function Unauthorized() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Countdown timer
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        // Auto redirect after 5 seconds
        const redirect = setTimeout(() => {
            navigate("/login");
        }, 5000);

        // Cleanup timers on unmount
        return () => {
            clearInterval(timer);
            clearTimeout(redirect);
        };
    }, [navigate]);

    return (
        <div className="unauthorized-container">
            <h1 className="unauthorized-code">401</h1>
            <h2 className="unauthorized-title">Unauthorized Access</h2>
            <p className="unauthorized-message">
                You don’t have permission to access this page.
            </p>
            <p className="unauthorized-redirect">
                Redirecting to <strong>Login</strong> in {countdown} seconds...
            </p>
        </div>
    );
}
