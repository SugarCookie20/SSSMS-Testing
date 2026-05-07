import axios from "axios";
// import env variable from .env file
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 403) {
            console.error("Access Forbidden: Check user Role or Cookie/Header.");
        }
        return Promise.reject(error);
    }
);

export default api;