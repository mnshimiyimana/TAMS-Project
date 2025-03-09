import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fuelsAPI } from "@/services/api";
import { RootState } from "@/redux/store";

export interface FuelTransaction {
  _id: string;
  plateNumber: string;
  driverName: string;
  fuelDate: string;
  amount: number;
  amountPrice: number;
  lastFill: number;
  lastFillPrice: number;
  agencyName?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FuelsState {
  fuelTransactions: FuelTransaction[];
  filteredTransactions: FuelTransaction[];
  selectedTransaction: FuelTransaction | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  searchQuery: string;
  filters: {
    plateNumber: string | null;
    date: string | null;
    agencyName: string | null;
  };
}

const initialState: FuelsState = {
  fuelTransactions: [],
  filteredTransactions: [],
  selectedTransaction: null,
  status: "idle",
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  searchQuery: "",
  filters: {
    plateNumber: null,
    date: null,
    agencyName: null,
  },
};

export const fetchFuelTransactions = createAsyncThunk(
  "fuels/fetchFuelTransactions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userRole = state.auth.user?.role || "";
      const userAgency = state.auth.user?.agencyName || "";
      const fuelsState = state.fuels;

      const params: any = {
        page: fuelsState.currentPage,
        limit: 20,
      };

      if (fuelsState.searchQuery && fuelsState.searchQuery.trim() !== "") {
        const trimmedSearch = fuelsState.searchQuery.trim();
        params.search = trimmedSearch;
        params.q = trimmedSearch;
        params.query = trimmedSearch;
        params.keyword = trimmedSearch;
        params.term = trimmedSearch;

        console.log("FUEL API - Searching with term:", trimmedSearch);
      }

      if (fuelsState.filters.date) {
        params.startDate = fuelsState.filters.date;
        params.endDate = fuelsState.filters.date;
        params.date = fuelsState.filters.date;
      }

      if (fuelsState.filters.plateNumber) {
        params.plateNumber = fuelsState.filters.plateNumber;
      }

      if (userRole !== "superadmin") {
        params.agencyName = userAgency;
      } else if (fuelsState.filters.agencyName) {
        params.agencyName = fuelsState.filters.agencyName;
      }

      console.log("FUEL API - Request params:", params);
      const response = await fuelsAPI.getAllFuels(params);
      console.log("FUEL API - Response:", response);

      let result = response;

      if (fuelsState.searchQuery && fuelsState.searchQuery.trim() !== "") {
        const searchTerm = fuelsState.searchQuery.trim().toLowerCase();

        const filteredTransactions = response.fuelTransactions.filter(
          (transaction: { plateNumber: string; driverName: string }) =>
            transaction.plateNumber.toLowerCase().includes(searchTerm) ||
            transaction.driverName.toLowerCase().includes(searchTerm)
        );

        if (filteredTransactions.length !== response.fuelTransactions.length) {
          console.log(
            "Using client-side filtering. Results:",
            filteredTransactions.length
          );
          result = {
            ...response,
            fuelTransactions: filteredTransactions,
            totalTransactions: filteredTransactions.length,
          };
        }
      }

      return result;
    } catch (error: any) {
      console.error("FUEL API - Error:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to fetch fuel transactions"
      );
    }
  }
);

export const addFuelTransaction = createAsyncThunk(
  "fuels/addFuelTransaction",
  async (
    fuelData: Omit<FuelTransaction, "_id">,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const userAgency = state.auth.user?.agencyName || "";

      const dataWithAgency = {
        ...fuelData,
        agencyName: fuelData.agencyName || userAgency,
      };

      const response = await fuelsAPI.createFuel(dataWithAgency);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add fuel transaction"
      );
    }
  }
);

export const updateFuelTransaction = createAsyncThunk(
  "fuels/updateFuelTransaction",
  async (
    { id, fuelData }: { id: string; fuelData: Partial<FuelTransaction> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const userRole = state.auth.user?.role || "";
      const userAgency = state.auth.user?.agencyName || "";

      if (
        userRole !== "superadmin" &&
        fuelData.agencyName &&
        fuelData.agencyName !== userAgency
      ) {
        return rejectWithValue(
          "You do not have permission to change the agency"
        );
      }

      const response = await fuelsAPI.updateFuel(id, fuelData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update fuel transaction"
      );
    }
  }
);

export const deleteFuelTransaction = createAsyncThunk(
  "fuels/deleteFuelTransaction",
  async (id: string, { rejectWithValue }) => {
    try {
      await fuelsAPI.deleteFuel(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete fuel transaction"
      );
    }
  }
);

const fuelsSlice = createSlice({
  name: "fuels",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setFilter: (
      state,
      action: PayloadAction<{
        key: keyof FuelsState["filters"];
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
    selectFuelTransaction: (state, action: PayloadAction<string>) => {
      state.selectedTransaction =
        state.fuelTransactions.find(
          (transaction) => transaction._id === action.payload
        ) || null;
    },
    clearSelectedTransaction: (state) => {
      state.selectedTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFuelTransactions.pending, (state) => {
        state.status = "loading";
        state.isLoading = true;
      })
      .addCase(fetchFuelTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isLoading = false;

        if (Array.isArray(action.payload)) {
          state.fuelTransactions = action.payload;
          state.filteredTransactions = action.payload;
          state.totalCount = action.payload.length;
        } else if (action.payload.fuelTransactions) {
          state.fuelTransactions = action.payload.fuelTransactions;
          state.filteredTransactions = action.payload.fuelTransactions;
          state.totalCount =
            action.payload.totalTransactions ||
            action.payload.fuelTransactions.length;
        } else {
          state.fuelTransactions = [];
          state.filteredTransactions = [];
          state.totalCount = 0;
        }
      })
      .addCase(fetchFuelTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(addFuelTransaction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addFuelTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fuelTransactions.unshift(action.payload);
        state.filteredTransactions.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(addFuelTransaction.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(updateFuelTransaction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateFuelTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.fuelTransactions.findIndex(
          (transaction) => transaction._id === action.payload._id
        );
        if (index !== -1) {
          state.fuelTransactions[index] = action.payload;
        }

        const filteredIndex = state.filteredTransactions.findIndex(
          (transaction) => transaction._id === action.payload._id
        );
        if (filteredIndex !== -1) {
          state.filteredTransactions[filteredIndex] = action.payload;
        }

        if (state.selectedTransaction?._id === action.payload._id) {
          state.selectedTransaction = action.payload;
        }
      })
      .addCase(updateFuelTransaction.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(deleteFuelTransaction.fulfilled, (state, action) => {
        state.fuelTransactions = state.fuelTransactions.filter(
          (transaction) => transaction._id !== action.payload
        );
        state.filteredTransactions = state.filteredTransactions.filter(
          (transaction) => transaction._id !== action.payload
        );
        state.totalCount -= 1;

        if (state.selectedTransaction?._id === action.payload) {
          state.selectedTransaction = null;
        }
      });
  },
});

export const {
  setSearchQuery,
  setFilter,
  setPage,
  clearFilters,
  selectFuelTransaction,
  clearSelectedTransaction,
} = fuelsSlice.actions;

export default fuelsSlice.reducer;
