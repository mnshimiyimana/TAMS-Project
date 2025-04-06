import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "https://tams-project.onrender.com/api/auth",
  headers: {
    'Content-Type': 'application/json',
  },
});

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

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/auth/sign-in') {
        window.location.href = '/auth/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;