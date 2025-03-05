import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { shiftsAPI } from "@/services/api";

export interface Shift {
  _id: string;
  plateNumber: string;
  driverName: string;
  startTime: string;
  endTime?: string;
  actualEndTime?: string;
  destination: string;
  origin: string;
  Date: string;
  agencyName?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ShiftsState {
  shifts: Shift[];
  filteredShifts: Shift[];
  selectedShift: Shift | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  searchQuery: string;
  filters: {
    destination: string | null;
    date: string | null;
  };
}

const initialState: ShiftsState = {
  shifts: [],
  filteredShifts: [],
  selectedShift: null,
  status: "idle",
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  searchQuery: "",
  filters: {
    destination: null,
    date: null,
  },
};

export const fetchShifts = createAsyncThunk(
  "shifts/fetchShifts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await shiftsAPI.getAllShifts();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to fetch shifts"
      );
    }
  }
);

export const addShift = createAsyncThunk(
  "shifts/addShift",
  async (shiftData: Omit<Shift, "_id">, { rejectWithValue }) => {
    try {
      const response = await shiftsAPI.createShift(shiftData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add shift"
      );
    }
  }
);

export const updateShift = createAsyncThunk(
  "shifts/updateShift",
  async (
    { id, shiftData }: { id: string; shiftData: Partial<Shift> },
    { rejectWithValue }
  ) => {
    try {
      const response = await shiftsAPI.updateShift(id, shiftData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update shift"
      );
    }
  }
);

export const deleteShift = createAsyncThunk(
  "shifts/deleteShift",
  async (id: string, { rejectWithValue }) => {
    try {
      await shiftsAPI.deleteShift(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete shift"
      );
    }
  }
);

const shiftsSlice = createSlice({
  name: "shifts",
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
        key: keyof ShiftsState["filters"];
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
      state.filteredShifts = [...state.shifts];
    },
    selectShift: (state, action: PayloadAction<string>) => {
      state.selectedShift =
        state.shifts.find((shift) => shift._id === action.payload) || null;
    },
    clearSelectedShift: (state) => {
      state.selectedShift = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchShifts.pending, (state) => {
        state.status = "loading";
        state.isLoading = true;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isLoading = false;
        state.shifts = action.payload;
        state.filteredShifts = action.payload;
        state.totalCount = action.payload.length;
        applyFiltersAndSearch(state);
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.status = "failed";
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(addShift.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addShift.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shifts.push(action.payload);
        applyFiltersAndSearch(state);
      })
      .addCase(addShift.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(updateShift.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.shifts.findIndex(
          (shift) => shift._id === action.payload._id
        );
        if (index !== -1) {
          state.shifts[index] = action.payload;
        }
        if (state.selectedShift?._id === action.payload._id) {
          state.selectedShift = action.payload;
        }
        applyFiltersAndSearch(state);
      })
      .addCase(updateShift.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(deleteShift.fulfilled, (state, action) => {
        state.shifts = state.shifts.filter(
          (shift) => shift._id !== action.payload
        );
        if (state.selectedShift?._id === action.payload) {
          state.selectedShift = null;
        }
        applyFiltersAndSearch(state);
      });
  },
});

function applyFiltersAndSearch(state: ShiftsState) {
  let filtered = [...state.shifts];

  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (shift) =>
        shift.plateNumber.toLowerCase().includes(query) ||
        shift.driverName.toLowerCase().includes(query) ||
        shift.destination.toLowerCase().includes(query) ||
        shift.origin.toLowerCase().includes(query)
    );
  }

  if (state.filters.destination) {
    filtered = filtered.filter(
      (shift) =>
        shift.destination.toLowerCase() ===
        state.filters.destination?.toLowerCase()
    );
  }

  if (state.filters.date) {
    filtered = filtered.filter((shift) => shift.Date === state.filters.date);
  }

  state.filteredShifts = filtered;
  state.totalCount = filtered.length;
}

export const {
  setSearchQuery,
  setFilter,
  setPage,
  clearFilters,
  selectShift,
  clearSelectedShift,
} = shiftsSlice.actions;

export default shiftsSlice.reducer;
