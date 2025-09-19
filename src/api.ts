import axios from "axios";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "/api",
	timeout: 5000
});

// Add token to all requests
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(res) => res,
	(err) => {
		if (err.response?.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/auth/login";
		}
		return Promise.reject(err);
	}
);
