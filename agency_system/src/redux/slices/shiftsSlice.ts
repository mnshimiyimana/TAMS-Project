import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { shiftsAPI } from "@/services/api";
import { RootState } from "@/redux/store";

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
    agencyName: string | null;
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
    agencyName: null,
  },
};

export const fetchShifts = createAsyncThunk(
  "shifts/fetchShifts",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userRole = state.auth.user?.role || "";
      const userAgency = state.auth.user?.agencyName || "";
      const shiftsState = state.shifts;

      const params: any = {
        page: shiftsState.currentPage,
        limit: 50,
      };

      if (shiftsState.searchQuery && shiftsState.searchQuery.trim() !== "") {
        const trimmedSearch = shiftsState.searchQuery.trim();
        params.search = trimmedSearch;
        params.q = trimmedSearch;
        params.query = trimmedSearch;
        params.keyword = trimmedSearch;
        params.term = trimmedSearch;
        
        console.log("SHIFTS API - Searching with term:", trimmedSearch);
      }

      if (shiftsState.filters.date) {
        params.date = shiftsState.filters.date;
        params.startDate = shiftsState.filters.date;
        params.endDate = shiftsState.filters.date;
      }

      if (shiftsState.filters.destination) {
        params.destination = shiftsState.filters.destination;
      }

      if (userRole !== "superadmin") {
        params.agencyName = userAgency;
      } else if (shiftsState.filters.agencyName) {
        params.agencyName = shiftsState.filters.agencyName;
      }

      console.log("SHIFTS API - Request params:", params);
      const response = await shiftsAPI.getAllShifts(params);
      console.log("SHIFTS API - Response:", response);

      let result = response;
      
      if (shiftsState.searchQuery && shiftsState.searchQuery.trim() !== "") {
        const searchTerm = shiftsState.searchQuery.trim().toLowerCase();
        
        if (response.shifts && Array.isArray(response.shifts)) {
          const filteredShifts = response.shifts.filter((shift: { plateNumber: string; driverName: string; destination: string; origin: string; }) =>
            shift.plateNumber.toLowerCase().includes(searchTerm) ||
            shift.driverName.toLowerCase().includes(searchTerm) ||
            shift.destination.toLowerCase().includes(searchTerm) ||
            shift.origin.toLowerCase().includes(searchTerm)
          );
          
          if (filteredShifts.length !== response.shifts.length) {
            console.log("Using client-side filtering. Results:", filteredShifts.length);
            result = {
              ...response,
              shifts: filteredShifts,
              totalShifts: filteredShifts.length
            };
          }
        }
      }
      
      return result;
    } catch (error: any) {
      console.error("SHIFTS API - Error:", error);
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
  async (shiftData: Omit<Shift, "_id">, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userAgency = state.auth.user?.agencyName || "";

      const dataWithAgency = {
        ...shiftData,
        agencyName: shiftData.agencyName || userAgency,
      };

      const response = await shiftsAPI.createShift(dataWithAgency);
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
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const userRole = state.auth.user?.role || "";
      const userAgency = state.auth.user?.agencyName || "";

      if (
        userRole !== "superadmin" &&
        shiftData.agencyName &&
        shiftData.agencyName !== userAgency
      ) {
        return rejectWithValue(
          "You do not have permission to change the agency"
        );
      }

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
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = "";
      state.currentPage = 1;
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

        if (Array.isArray(action.payload)) {
          state.shifts = action.payload;
          state.filteredShifts = action.payload;
          state.totalCount = action.payload.length;
        } else if (action.payload.shifts) {
          state.shifts = action.payload.shifts;
          state.filteredShifts = action.payload.shifts;
          state.totalCount =
            action.payload.totalShifts || action.payload.shifts.length;
        } else {
          state.shifts = [];
          state.filteredShifts = [];
          state.totalCount = 0;
        }
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
        state.shifts.unshift(action.payload); // Add to beginning
        state.filteredShifts.unshift(action.payload);
        state.totalCount += 1;
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

        const filteredIndex = state.filteredShifts.findIndex(
          (shift) => shift._id === action.payload._id
        );
        if (filteredIndex !== -1) {
          state.filteredShifts[filteredIndex] = action.payload;
        }

        if (state.selectedShift?._id === action.payload._id) {
          state.selectedShift = action.payload;
        }
      })
      .addCase(updateShift.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(deleteShift.fulfilled, (state, action) => {
        state.shifts = state.shifts.filter(
          (shift) => shift._id !== action.payload
        );
        state.filteredShifts = state.filteredShifts.filter(
          (shift) => shift._id !== action.payload
        );
        state.totalCount -= 1;

        if (state.selectedShift?._id === action.payload) {
          state.selectedShift = null;
        }
      });
  },
});

export const {
  setSearchQuery,
  setFilter,
  setPage,
  clearFilters,
  selectShift,
  clearSelectedShift,
} = shiftsSlice.actions;

export default shiftsSlice.reducer;