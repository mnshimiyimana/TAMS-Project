import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { vehiclesAPI } from "@/services/api";

export type Status =
  | "Available"
  | "Assigned"
  | "Under Maintenance"
  | "Active"
  | "Inactive"
  | "Maintenance";

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
  },
};

export const fetchVehicles = createAsyncThunk(
  "vehicles/fetchVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehiclesAPI.getAllVehicles();
      return response;
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
  async (vehicleData: Omit<Vehicle, "_id">, { rejectWithValue }) => {
    try {
      const response = await vehiclesAPI.createVehicle(vehicleData);
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
    { rejectWithValue }
  ) => {
    try {
      const response = await vehiclesAPI.updateVehicle(id, vehicleData);
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
      applyFiltersAndSearch(state);
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
      applyFiltersAndSearch(state);
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = "";
      state.currentPage = 1;
      state.filteredVehicles = [...state.vehicles];
    },
    selectVehicle: (state, action: PayloadAction<string>) => {
      state.selectedVehicle =
        state.vehicles.find((vehicle) => vehicle._id === action.payload) ||
        null;
    },
    clearSelectedVehicle: (state) => {
      state.selectedVehicle = null;
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
        state.vehicles = action.payload;
        state.filteredVehicles = action.payload;
        state.totalCount = action.payload.length;
        applyFiltersAndSearch(state);
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
        state.vehicles.push(action.payload);
        applyFiltersAndSearch(state);
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
        if (state.selectedVehicle?._id === action.payload._id) {
          state.selectedVehicle = action.payload;
        }
        applyFiltersAndSearch(state);
      })
      .addCase(updateVehicle.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.filter(
          (vehicle) => vehicle._id !== action.payload
        );
        if (state.selectedVehicle?._id === action.payload) {
          state.selectedVehicle = null;
        }
        applyFiltersAndSearch(state);
      });
  },
});

function applyFiltersAndSearch(state: VehiclesState) {
  let filtered = [...state.vehicles];

  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (vehicle) =>
        vehicle.plateNumber.toLowerCase().includes(query) ||
        vehicle.busId.toLowerCase().includes(query) ||
        vehicle.type.toLowerCase().includes(query) ||
        vehicle.agencyName.toLowerCase().includes(query)
    );
  }

  if (state.filters.status) {
    filtered = filtered.filter(
      (vehicle) => vehicle.status === state.filters.status
    );
  }

  if (state.filters.capacity) {
    const capacity = parseInt(state.filters.capacity);
    if (!isNaN(capacity)) {
      filtered = filtered.filter((vehicle) => vehicle.capacity === capacity);
    }
  }

  state.filteredVehicles = filtered;
  state.totalCount = filtered.length;
}

export const {
  setSearchQuery,
  setFilter,
  setPage,
  clearFilters,
  selectVehicle,
  clearSelectedVehicle,
} = vehiclesSlice.actions;

export default vehiclesSlice.reducer;
