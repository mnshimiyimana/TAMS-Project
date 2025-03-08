import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { vehiclesAPI } from "@/services/api";
import { RootState } from "@/redux/store";

export type Status = "Available" | "Assigned" | "Under Maintenance";

export interface Vehicle {
  _id: string;
  busId: string;
  plateNumber: string;
  type: string;
  agencyName: string;
  status: Status;
  capacity: number;
  busHistory: string | string[];
  createdAt?: string;
  updatedAt?: string;
}

interface VehiclesState {
  vehicles: Vehicle[];
  filteredVehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  searchQuery: string;
  filters: {
    status: string | null;
    capacity: string | null;
    agencyName: string | null;
  };
}

const initialState: VehiclesState = {
  vehicles: [],
  filteredVehicles: [],
  selectedVehicle: null,
  status: "idle",
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  searchQuery: "",
  filters: {
    status: null,
    capacity: null,
    agencyName: null,
  },
};

// Fetch vehicles with agency isolation built-in
export const fetchVehicles = createAsyncThunk(
  "vehicles/fetchVehicles",
  async (_, { getState, rejectWithValue }) => {
    try {
      // Get the current user's agency from auth state
      const state = getState() as RootState;
      const userAgency = state.auth.user?.agencyName || "";
      const userRole = state.auth.user?.role || "";

      // If not superadmin, force agency filter
      const params: any = {};
      if (userRole !== "superadmin") {
        params.agencyName = userAgency;
      } else if (state.vehicles.filters.agencyName) {
        // Allow superadmin to filter by agency if desired
        params.agencyName = state.vehicles.filters.agencyName;
      }

      // Add other filters
      if (state.vehicles.filters.status) {
        params.status = state.vehicles.filters.status;
      }

      // Add search if present
      if (state.vehicles.searchQuery) {
        params.search = state.vehicles.searchQuery;
      }

      // Add pagination
      params.page = state.vehicles.currentPage;
      params.limit = 50; // Match backend default

      const response = await vehiclesAPI.getAllVehicles(params);
      return response.buses || response; // Handle both response formats
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to fetch vehicles"
      );
    }
  }
);

export const addVehicle = createAsyncThunk(
  "vehicles/addVehicle",
  async (vehicleData: Omit<Vehicle, "_id">, { getState, rejectWithValue }) => {
    try {
      // Get the current user's agency
      const state = getState() as RootState;
      const userAgency = state.auth.user?.agencyName || "";

      // Ensure agencyName is set if not provided
      const dataWithAgency = {
        ...vehicleData,
        agencyName: vehicleData.agencyName || userAgency,
      };

      const response = await vehiclesAPI.createVehicle(dataWithAgency);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add vehicle"
      );
    }
  }
);

export const updateVehicle = createAsyncThunk(
  "vehicles/updateVehicle",
  async (
    { id, vehicleData }: { id: string; vehicleData: Partial<Vehicle> },
    { getState, rejectWithValue }
  ) => {
    try {
      // Get the current user's agency
      const state = getState() as RootState;
      const userAgency = state.auth.user?.agencyName || "";
      const userRole = state.auth.user?.role || "";

      // Non-superadmins cannot change agency
      if (
        userRole !== "superadmin" &&
        vehicleData.agencyName &&
        vehicleData.agencyName !== userAgency
      ) {
        return rejectWithValue(
          "You do not have permission to change the agency"
        );
      }

      // Ensure agencyName is set if not provided (non-superadmin only)
      let dataToUpdate = { ...vehicleData };
      if (userRole !== "superadmin" && !dataToUpdate.agencyName) {
        dataToUpdate.agencyName = userAgency;
      }

      const response = await vehiclesAPI.updateVehicle(id, dataToUpdate);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update vehicle"
      );
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  "vehicles/deleteVehicle",
  async (id: string, { rejectWithValue }) => {
    try {
      await vehiclesAPI.deleteVehicle(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete vehicle"
      );
    }
  }
);

const vehiclesSlice = createSlice({
  name: "vehicles",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
      // Don't apply filter immediately - wait for API call
    },
    setFilter: (
      state,
      action: PayloadAction<{
        key: keyof VehiclesState["filters"];
        value: string | null;
      }>
    ) => {
      const { key, value } = action.payload;
      state.filters[key] = value === "all" ? null : value;
      state.currentPage = 1;
      // Don't apply filter immediately - wait for API call
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = "";
      state.currentPage = 1;
      // Reset to fetch from API again
    },
    selectVehicle: (state, action: PayloadAction<string>) => {
      state.selectedVehicle =
        state.vehicles.find((vehicle) => vehicle._id === action.payload) ||
        null;
    },
    clearSelectedVehicle: (state) => {
      state.selectedVehicle = null;
    },
    // New reducer to handle pagination response from backend
    setTotalCount: (
      state,
      action: PayloadAction<{ total: number; pages: number }>
    ) => {
      state.totalCount = action.payload.total;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.status = "loading";
        state.isLoading = true;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isLoading = false;

        // Handle both response formats (array or paginated object)
        if (Array.isArray(action.payload)) {
          state.vehicles = action.payload;
          state.filteredVehicles = action.payload;
          state.totalCount = action.payload.length;
        } else {
          // Handle paginated response
          state.vehicles = action.payload.buses || [];
          state.filteredVehicles = action.payload.buses || [];
          state.totalCount = action.payload.totalBuses || 0;
        }
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.status = "failed";
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(addVehicle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicles.unshift(action.payload); // Add to beginning
        state.filteredVehicles.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(addVehicle.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(updateVehicle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.vehicles.findIndex(
          (vehicle) => vehicle._id === action.payload._id
        );
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }

        const filteredIndex = state.filteredVehicles.findIndex(
          (vehicle) => vehicle._id === action.payload._id
        );
        if (filteredIndex !== -1) {
          state.filteredVehicles[filteredIndex] = action.payload;
        }

        if (state.selectedVehicle?._id === action.payload._id) {
          state.selectedVehicle = action.payload;
        }
      })
      .addCase(updateVehicle.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.filter(
          (vehicle) => vehicle._id !== action.payload
        );
        state.filteredVehicles = state.filteredVehicles.filter(
          (vehicle) => vehicle._id !== action.payload
        );
        state.totalCount -= 1;

        if (state.selectedVehicle?._id === action.payload) {
          state.selectedVehicle = null;
        }
      });
  },
});

export const {
  setSearchQuery,
  setFilter,
  setPage,
  clearFilters,
  selectVehicle,
  clearSelectedVehicle,
  setTotalCount,
} = vehiclesSlice.actions;

export default vehiclesSlice.reducer;
