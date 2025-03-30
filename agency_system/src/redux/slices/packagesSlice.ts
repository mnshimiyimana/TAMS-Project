import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface ShiftInfo {
  startTime: string;
  endTime?: string;
  destination: string;
  origin: string;
  Date: string;
}

export interface Package {
  _id: string;
  packageId: string;
  description: string;
  weight: number;
  price: number;  // New price field
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
  createdAt: string;
  updatedAt: string;
  shift?: ShiftInfo;
}

interface PackagesState {
  packages: Package[];
  filteredPackages: Package[];
  selectedPackage: Package | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  filters: {
    status: string | null;
    driverName: string | null;
    plateNumber: string | null;
    receiverId: string | null;
    dateRange: {
      from: string | null;
      to: string | null;
    };
  };
  stats: {
    statusCounts: { status: string; count: number }[];
    monthlyTrend: {
      date: string;
      count: number;
      delivered: number;
      deliveryRate: number;
    }[];
    topDrivers: { driverName: string; count: number }[];
    totals: {
      total: number;
      totalDelivered: number;
      totalInTransit: number;
      totalPending: number;
      totalCancelled: number;
      totalReturned: number;
    };
  } | null;
}

const initialState: PackagesState = {
  packages: [],
  filteredPackages: [],
  selectedPackage: null,
  status: "idle",
  error: null,
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
  searchQuery: "",
  filters: {
    status: null,
    driverName: null,
    plateNumber: null,
    receiverId: null,
    dateRange: {
      from: null,
      to: null,
    },
  },
  stats: null,
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com";

export const fetchPackages = createAsyncThunk(
  "packages/fetchPackages",
  async (
    {
      page = 1,
      limit = 20,
      search = "",
      status = null,
      driverName = null,
      plateNumber = null,
      receiverId = null,
      dateFrom = null,
      dateTo = null,
    }: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string | null;
      driverName?: string | null;
      plateNumber?: string | null;
      receiverId?: string | null;
      dateFrom?: string | null;
      dateTo?: string | null;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      let url = `${API_URL}/api/packages?page=${page}&limit=${limit}`;

      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status) url += `&status=${encodeURIComponent(status)}`;
      if (driverName) url += `&driverName=${encodeURIComponent(driverName)}`;
      if (plateNumber) url += `&plateNumber=${encodeURIComponent(plateNumber)}`;
      if (receiverId) url += `&receiverId=${encodeURIComponent(receiverId)}`;
      if (dateFrom) url += `&dateFrom=${encodeURIComponent(dateFrom)}`;
      if (dateTo) url += `&dateTo=${encodeURIComponent(dateTo)}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Fetch packages error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch packages"
      );
    }
  }
);

export const fetchPackageById = createAsyncThunk(
  "packages/fetchPackageById",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await axios.get(`${API_URL}/api/packages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Fetch package by ID error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch package details"
      );
    }
  }
);

export const fetchPackageStats = createAsyncThunk(
  "packages/fetchPackageStats",
  async (
    {
      startDate = null,
      endDate = null,
      agencyName = null,
    }: {
      startDate?: string | null;
      endDate?: string | null;
      agencyName?: string | null;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      let url = `${API_URL}/api/packages/stats`;
      const params: string[] = [];

      if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
      if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
      if (agencyName)
        params.push(`agencyName=${encodeURIComponent(agencyName)}`);

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.stats;
    } catch (error: any) {
      console.error("Fetch package stats error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch package statistics"
      );
    }
  }
);

export const createPackage = createAsyncThunk(
  "packages/createPackage",
  async (packageData: any, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const requiredFields = [
        "packageId",
        "description",
        "weight",
        "senderName",
        "senderPhone",
        "receiverName",
        "receiverPhone",
        "receiverId",
        "pickupLocation",
        "deliveryLocation",
        "shiftId",
        "driverName",
        "plateNumber",
      ];

      for (const field of requiredFields) {
        if (!packageData[field]) {
          return rejectWithValue(`Missing required field: ${field}`);
        }
      }

      const processedData = {
        ...packageData,
        weight: Number(packageData.weight),
        status: packageData.status || "Pending",
      };

      console.log("Sending package data:", {
        ...processedData,
        agencyName: processedData.agencyName || "Not set",
        userAgency: "From user context",
        shiftAgency: "From shift",
      });

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com";
      console.log("API URL:", `${API_URL}/api/packages`);

      try {
        const response = await axios.post(
          `${API_URL}/api/packages`,
          processedData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Create package response:", response.data);

        return response.data.package;
      } catch (error: any) {
        console.error("Create package error:", error.response || error);

        if (error.response && error.response.data) {
          console.error("Server error message:", error.response.data.message);
          console.error("Server error details:", error.response.data);

          if (error.response.status === 403 || error.response.status === 400) {
            console.log(
              "Received error but package might have been created. Refreshing packages list."
            );
            dispatch(fetchPackages({}));
          }
        }

        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            "Failed to create package"
        );
      }
    } catch (error: any) {
      console.error("Unhandled create package error:", error);
      return rejectWithValue(
        "Unexpected error occurred while creating package"
      );
    }
  }
);

export const updatePackage = createAsyncThunk(
  "packages/updatePackage",
  async (
    { id, packageData }: { id: string; packageData: Partial<Package> },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const processedData = {
        ...packageData,
        weight: packageData.weight ? Number(packageData.weight) : undefined,
      };

      const response = await axios.put(
        `${API_URL}/api/packages/${id}`,
        processedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.package;
    } catch (error: any) {
      console.error("Update package error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update package"
      );
    }
  }
);

export const updatePackageStatus = createAsyncThunk(
  "packages/updatePackageStatus",
  async (
    { id, status, notes }: { id: string; status: string; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const validStatuses = [
        "Pending",
        "In Transit",
        "Delivered",
        "Cancelled",
        "Returned",
      ];
      if (!validStatuses.includes(status)) {
        return rejectWithValue(`Invalid status: ${status}`);
      }

      const requestBody: any = { status, notes };
      if (status === "Delivered") {
        requestBody.deliveredAt = new Date().toISOString();
      }

      console.log(`Updating package ${id} status to ${status}`, requestBody);

      const response = await axios.patch(
        `${API_URL}/api/packages/${id}/status`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update package status response:", response.data);
      return response.data.package;
    } catch (error: any) {
      console.error("Update package status error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update package status"
      );
    }
  }
);

export const deletePackage = createAsyncThunk(
  "packages/deletePackage",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication required");
      }

      await axios.delete(`${API_URL}/api/packages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return id;
    } catch (error: any) {
      console.error("Delete package error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete package"
      );
    }
  }
);

const packagesSlice = createSlice({
  name: "packages",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setFilter: (
      state,
      action: PayloadAction<{
        key: keyof Omit<PackagesState["filters"], "dateRange">;
        value: string | null;
      }>
    ) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
      state.currentPage = 1;
    },
    setDateRangeFilter: (
      state,
      action: PayloadAction<{
        from: string | null;
        to: string | null;
      }>
    ) => {
      state.filters.dateRange = action.payload;
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = "";
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearSelectedPackage: (state) => {
      state.selectedPackage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.packages = action.payload.packages;
        state.filteredPackages = action.payload.packages;
        state.totalCount = action.payload.pagination.total;
        state.currentPage = action.payload.pagination.page;
        state.totalPages = action.payload.pagination.pages;
        state.error = null;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(fetchPackageById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPackageById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedPackage = action.payload;
        state.error = null;
      })
      .addCase(fetchPackageById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(fetchPackageStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchPackageStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchPackageStats.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(createPackage.pending, (state) => {
        state.error = null;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        state.packages.unshift(action.payload);
        state.filteredPackages.unshift(action.payload);
        state.totalCount += 1;
        state.error = null;
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(updatePackage.pending, (state) => {
        state.error = null;
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        const updatedPackage = action.payload;
        const index = state.packages.findIndex(
          (p) => p._id === updatedPackage._id
        );
        if (index !== -1) {
          state.packages[index] = updatedPackage;
        }

        const filteredIndex = state.filteredPackages.findIndex(
          (p) => p._id === updatedPackage._id
        );
        if (filteredIndex !== -1) {
          state.filteredPackages[filteredIndex] = updatedPackage;
        }

        if (
          state.selectedPackage &&
          state.selectedPackage._id === updatedPackage._id
        ) {
          state.selectedPackage = updatedPackage;
        }

        state.error = null;
      })
      .addCase(updatePackage.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(updatePackageStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updatePackageStatus.fulfilled, (state, action) => {
        const updatedPackage = action.payload;
        const index = state.packages.findIndex(
          (p) => p._id === updatedPackage._id
        );
        if (index !== -1) {
          state.packages[index] = updatedPackage;
        }

        const filteredIndex = state.filteredPackages.findIndex(
          (p) => p._id === updatedPackage._id
        );
        if (filteredIndex !== -1) {
          state.filteredPackages[filteredIndex] = updatedPackage;
        }

        if (
          state.selectedPackage &&
          state.selectedPackage._id === updatedPackage._id
        ) {
          state.selectedPackage = updatedPackage;
        }

        state.error = null;
      })
      .addCase(updatePackageStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(deletePackage.pending, (state) => {
        state.error = null;
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        const id = action.payload;
        state.packages = state.packages.filter((p) => p._id !== id);
        state.filteredPackages = state.filteredPackages.filter(
          (p) => p._id !== id
        );
        state.totalCount -= 1;

        if (state.selectedPackage && state.selectedPackage._id === id) {
          state.selectedPackage = null;
        }

        state.error = null;
      })
      .addCase(deletePackage.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchQuery,
  setFilter,
  setDateRangeFilter,
  clearFilters,
  setCurrentPage,
  clearSelectedPackage,
} = packagesSlice.actions;

export default packagesSlice.reducer;
