import axios from "axios";


const driverAPI = axios.create({
  baseURL: "https://tams-project.onrender.com/api",
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

    const queryParams = new URLSearchParams();

    queryParams.append("page", (params.page || 1).toString());
    queryParams.append("limit", (params.limit || 50).toString());

    if (params.search) {
      queryParams.append("search", params.search);
    }

    if (params.status) {
      queryParams.append("status", params.status);
    }

    if (userRole !== "superadmin") {
      queryParams.append("agencyName", userAgency);
    } else if (params.agencyName) {
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

    if (userRole !== "superadmin") {
      driverData.agencyName = userAgency;
    } else if (!driverData.agencyName) {
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

    if (
      userRole !== "superadmin" &&
      driverData.agencyName &&
      driverData.agencyName !== userAgency
    ) {
      throw new Error("You do not have permission to change the agency");
    }

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
