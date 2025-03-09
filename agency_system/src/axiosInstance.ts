import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "https://tams-project.onrender.com/api/auth",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page if appropriate
      if (window.location.pathname !== '/auth/sign-in') {
        window.location.href = '/auth/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;