import axios from "axios";

const API_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


apiClient.interceptors.request.use(
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

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/auth/sign-in") {
        window.location.href = "/auth/sign-in";
      }
    }
    return Promise.reject(error);
  }
);

export const vehiclesAPI = {
  getAllVehicles: async (params = {}) => {
    const response = await apiClient.get("/buses", { params });
    return response.data;
  },
  getVehicleById: async (id: string) => {
    const response = await apiClient.get(`/buses/${id}`);
    return response.data;
  },
  createVehicle: async (vehicleData: any) => {
    const response = await apiClient.post("/buses", vehicleData);
    return response.data;
  },
  updateVehicle: async (id: string, vehicleData: any) => {
    const response = await apiClient.put(`/buses/${id}`, vehicleData);
    return response.data;
  },
  deleteVehicle: async (id: string) => {
    const response = await apiClient.delete(`/buses/${id}`);
    return response.data;
  },
};

export const shiftsAPI = {
  getAllShifts: async (params = {}) => {
    const response = await apiClient.get("/shifts", { params });
    return response.data;
  },
  getShiftById: async (id: string) => {
    const response = await apiClient.get(`/shifts/${id}`);
    return response.data;
  },
  createShift: async (shiftData: any) => {
    const response = await apiClient.post("/shifts", shiftData);
    return response.data;
  },
  updateShift: async (id: string, shiftData: any) => {
    const response = await apiClient.put(`/shifts/${id}`, shiftData);
    return response.data;
  },
  deleteShift: async (id: string) => {
    const response = await apiClient.delete(`/shifts/${id}`);
    return response.data;
  },
};

export const fuelsAPI = {
  getAllFuels: async (params = {}) => {
    const response = await apiClient.get("/fuel-management", { params });
    return response.data;
  },
  getFuelById: async (id: string) => {
    const response = await apiClient.get(`/fuel-management/${id}`);
    return response.data;
  },
  createFuel: async (fuelData: any) => {
    const response = await apiClient.post("/fuel-management", fuelData);
    return response.data;
  },
  updateFuel: async (id: string, fuelData: any) => {
    const response = await apiClient.put(`/fuel-management/${id}`, fuelData);
    return response.data;
  },
  deleteFuel: async (id: string) => {
    const response = await apiClient.delete(`/fuel-management/${id}`);
    return response.data;
  },
};

export default apiClient;
