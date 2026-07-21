import axios from "axios";
const axiosInstance = axios.create({
    baseURL: import.meta.env.DEV ? "http://localhost:5000/api/v1" : "/api",
    withCredentials: true,   // ← required to send/receive cookies cross-origin
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;