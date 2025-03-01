import axios from "axios";

const driverAPI = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

driverAPI.interceptors.request.use(
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

export interface Driver {
  _id: string;
  driverId: string;
  names: string;
  email: string;
  phoneNumber: string;
  status: "On leave" | "On Shift" | "Off shift";
  lastShift?: string;
  agencyName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverResponse {
  drivers: Driver[];
  totalDrivers: number;
  currentPage: number;
  totalPages: number;
}

export interface DriverParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  agencyName?: string;
}

export const getDrivers = async (
  params: DriverParams = {}
): Promise<DriverResponse> => {
  try {
    const {
      page = 1,
      limit = 50,
      search = "",
      status = "",
      agencyName = "",
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    if (search) {
      queryParams.append("search", search);
    }

    if (status) {
      queryParams.append("status", status);
    }

    if (agencyName) {
      queryParams.append("agencyName", agencyName);
    }

    const response = await driverAPI.get(`/drivers?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching drivers:", error);
    throw error;
  }
};

export interface CreateDriverData {
  driverId: string;
  names: string;
  email: string;
  phoneNumber: string;
  status: "On leave" | "On Shift" | "Off shift";
  lastShift?: string | Date;
  agencyName?: string;
}

export const createDriver = async (driverData: CreateDriverData) => {
  try {
    console.log("Request URL:", "/drivers");
    console.log("Request Data:", driverData);

    const response = await driverAPI.post("/drivers", driverData);
    return response.data;
  } catch (error: any) {
    console.error("Error creating driver:", error.response || error);
    throw error;
  }
};

export const updateDriver = async (
  id: string,
  driverData: Partial<Driver>
): Promise<Driver> => {
  try {
    const response = await driverAPI.put(`/drivers/${id}`, driverData);
    return response.data;
  } catch (error) {
    console.error("Error updating driver:", error);
    throw error;
  }
};

export const deleteDriver = async (id: string): Promise<void> => {
  try {
    await driverAPI.delete(`/drivers/${id}`);
  } catch (error) {
    console.error("Error deleting driver:", error);
    throw error;
  }
};

export const getDriverById = async (id: string): Promise<Driver> => {
  try {
    const response = await driverAPI.get(`/drivers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching driver:", error);
    throw error;
  }
};

export default {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverById,
};
