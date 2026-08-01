import axios from "axios";
const axiosInstance = axios.create({
    // Relative URLs use the same Render service in production. During local
    // development Vite proxies /api requests to the Express server.
    baseURL: "/api/v1",
    withCredentials: true,   // ← required to send/receive cookies cross-origin
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;
