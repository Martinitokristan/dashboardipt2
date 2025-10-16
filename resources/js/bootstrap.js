window._ = require("lodash");

try {
    require("bootstrap");
} catch (e) {}

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */
window.axios = require("axios");

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
window.axios.defaults.withCredentials = true;

const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
}

// Ensure Sanctum CSRF cookie is set before first API call
if (typeof window.__sanctumInitialized === "undefined") {
    window.__sanctumInitialized = true;
    window.axios.get("/sanctum/csrf-cookie").catch(() => {});
}

/**
 * Add a global Axios response interceptor
 * This will catch any 401 (Unauthorized) responses and redirect users
 * to a clean Unauthorized page (/401)
 */
window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && [401, 403].includes(error.response.status)) {
            localStorage.removeItem("token");
            window.location.href = "/401";
        }

        return Promise.reject(error);
    }
);
