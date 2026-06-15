import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: apiURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Attach token to every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Do not force redirect if we are already trying to login/register
            const isAuthEndpoint = error.config && error.config.url && error.config.url.includes('/auth/');
            if (!isAuthEndpoint) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('guard');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
