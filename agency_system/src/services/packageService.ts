import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com";

export interface Package {
  _id: string;
  packageId: string;
  description: string;
  weight: number;
  price: number; 
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  receiverId: string;
  pickupLocation: string;
  deliveryLocation: string;
  shiftId: string;
  driverName: string;
  plateNumber: string;
  status: "Pending" | "In Transit" | "Delivered" | "Cancelled" | "Returned";
  agencyName: string;
  deliveredAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PackageParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  shiftId?: string;
  driverName?: string;
  plateNumber?: string;
  senderName?: string;
  receiverName?: string;
  receiverId?: string;
  dateFrom?: string;
  dateTo?: string;
  agencyName?: string;
}

export const getPackages = async (params: PackageParams = {}) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const response = await axios.get(
      `${API_URL}/api/packages?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch packages"
    );
  }
};

export const getPackageById = async (id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await axios.get(`${API_URL}/api/packages/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch package details"
    );
  }
};

export const getPackageStats = async (
  startDate?: string,
  endDate?: string,
  agencyName?: string
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (agencyName) queryParams.append("agencyName", agencyName);

    const response = await axios.get(
      `${API_URL}/api/packages/stats?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.stats;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch package statistics"
    );
  }
};

export const createPackage = async (
  packageData: Omit<Package, "_id" | "createdAt" | "updatedAt">
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    const formattedData = {
      ...packageData,
      price: Number(packageData.price),
      weight: Number(packageData.weight),
    };

    const response = await axios.post(
      `${API_URL}/api/packages`,
      formattedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.package;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create package"
    );
  }
};

export const updatePackage = async (
  id: string,
  packageData: Partial<Package>
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    const formattedData = { ...packageData };

    if (formattedData.price !== undefined) {
      formattedData.price = Number(formattedData.price);
    }

    if (formattedData.weight !== undefined) {
      formattedData.weight = Number(formattedData.weight);
    }

    const response = await axios.put(
      `${API_URL}/api/packages/${id}`,
      formattedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.package;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update package"
    );
  }
};

export const updatePackageStatus = async (
  id: string,
  status: string,
  notes?: string
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await axios.patch(
      `${API_URL}/api/packages/${id}/status`,
      { status, notes },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.package;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update package status"
    );
  }
};

export const deletePackage = async (id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    await axios.delete(`${API_URL}/api/packages/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return true;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete package"
    );
  }
};

export const formatPackageStatus = (status: string) => {
  switch (status) {
    case "Pending":
      return {
        label: "Pending",
        color: "bg-yellow-500",
        textColor: "text-yellow-800",
        badgeColor: "bg-yellow-100",
      };
    case "In Transit":
      return {
        label: "In Transit",
        color: "bg-blue-500",
        textColor: "text-blue-800",
        badgeColor: "bg-blue-100",
      };
    case "Delivered":
      return {
        label: "Delivered",
        color: "bg-green-500",
        textColor: "text-green-800",
        badgeColor: "bg-green-100",
      };
    case "Cancelled":
      return {
        label: "Cancelled",
        color: "bg-red-500",
        textColor: "text-red-800",
        badgeColor: "bg-red-100",
      };
    case "Returned":
      return {
        label: "Returned",
        color: "bg-purple-500",
        textColor: "text-purple-800",
        badgeColor: "bg-purple-100",
      };
    default:
      return {
        label: status,
        color: "bg-gray-500",
        textColor: "text-gray-800",
        badgeColor: "bg-gray-100",
      };
  }
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString();
};

export const formatWeight = (weight: number) => {
  return `${weight.toFixed(2)} kg`;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", 
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

const packageService = {
  getPackages,
  getPackageById,
  getPackageStats,
  createPackage,
  updatePackage,
  updatePackageStatus,
  deletePackage,
  formatPackageStatus,
  formatDate,
  formatWeight,
  formatCurrency,
};

export default packageService;
