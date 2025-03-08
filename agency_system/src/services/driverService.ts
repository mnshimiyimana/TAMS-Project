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

driverAPI.interceptors.response.use(
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
  shift?: string;
}

export const getDrivers = async (
  params: DriverParams = {}
): Promise<DriverResponse> => {
  try {
    // Get user info from localStorage to apply agency isolation
    const userString = localStorage.getItem("user");
    let userAgency = "";
    let userRole = "";

    if (userString) {
      try {
        const user = JSON.parse(userString);
        userAgency = user.agencyName || "";
        userRole = user.role || "";
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    // Apply agency isolation for non-superadmins
    const queryParams = new URLSearchParams();

    // Apply pagination
    queryParams.append("page", (params.page || 1).toString());
    queryParams.append("limit", (params.limit || 50).toString());

    // Apply search if provided
    if (params.search) {
      queryParams.append("search", params.search);
    }

    // Apply status filter if provided
    if (params.status) {
      queryParams.append("status", params.status);
    }

    // Apply agency isolation based on user role
    if (userRole !== "superadmin") {
      // Force user's agency for non-superadmins
      queryParams.append("agencyName", userAgency);
    } else if (params.agencyName) {
      // Allow superadmins to filter by agency if they want
      queryParams.append("agencyName", params.agencyName);
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
    // Get user info from localStorage for agency isolation
    const userString = localStorage.getItem("user");
    let userAgency = "";
    let userRole = "";

    if (userString) {
      try {
        const user = JSON.parse(userString);
        userAgency = user.agencyName || "";
        userRole = user.role || "";
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    // If not superadmin, enforce user's agency
    if (userRole !== "superadmin") {
      driverData.agencyName = userAgency;
    } else if (!driverData.agencyName) {
      // If superadmin doesn't specify agency, use their agency as default
      driverData.agencyName = userAgency;
    }

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
    // Get user info from localStorage for agency isolation
    const userString = localStorage.getItem("user");
    let userAgency = "";
    let userRole = "";

    if (userString) {
      try {
        const user = JSON.parse(userString);
        userAgency = user.agencyName || "";
        userRole = user.role || "";
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    // If not superadmin and trying to change agency, block it
    if (
      userRole !== "superadmin" &&
      driverData.agencyName &&
      driverData.agencyName !== userAgency
    ) {
      throw new Error("You do not have permission to change the agency");
    }

    // If not superadmin, enforce user's agency
    if (userRole !== "superadmin") {
      driverData.agencyName = userAgency;
    }

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
