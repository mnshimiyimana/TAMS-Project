import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fuelsAPI } from "@/services/api";

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
  },
};

export const fetchFuelTransactions = createAsyncThunk(
  "fuels/fetchFuelTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fuelsAPI.getAllFuels();
      return response;
    } catch (error: any) {
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
  async (fuelData: Omit<FuelTransaction, "_id">, { rejectWithValue }) => {
    try {
      const response = await fuelsAPI.createFuel(fuelData);
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
    { rejectWithValue }
  ) => {
    try {
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
      applyFiltersAndSearch(state);
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
      applyFiltersAndSearch(state);
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = "";
      state.currentPage = 1;
      state.filteredTransactions = [...state.fuelTransactions];
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
      // Fetch fuel transactions cases
      .addCase(fetchFuelTransactions.pending, (state) => {
        state.status = "loading";
        state.isLoading = true;
      })
      .addCase(fetchFuelTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isLoading = false;
        state.fuelTransactions = action.payload;
        state.filteredTransactions = action.payload;
        state.totalCount = action.payload.length;
        applyFiltersAndSearch(state);
      })
      .addCase(fetchFuelTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add fuel transaction cases
      .addCase(addFuelTransaction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addFuelTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fuelTransactions.push(action.payload);
        applyFiltersAndSearch(state);
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
        if (state.selectedTransaction?._id === action.payload._id) {
          state.selectedTransaction = action.payload;
        }
        applyFiltersAndSearch(state);
      })
      .addCase(updateFuelTransaction.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(deleteFuelTransaction.fulfilled, (state, action) => {
        state.fuelTransactions = state.fuelTransactions.filter(
          (transaction) => transaction._id !== action.payload
        );
        if (state.selectedTransaction?._id === action.payload) {
          state.selectedTransaction = null;
        }
        applyFiltersAndSearch(state);
      });
  },
});

function applyFiltersAndSearch(state: FuelsState) {
  let filtered = [...state.fuelTransactions];

  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (transaction) =>
        transaction.plateNumber.toLowerCase().includes(query) ||
        transaction.driverName.toLowerCase().includes(query)
    );
  }

  if (state.filters.plateNumber) {
    filtered = filtered.filter(
      (transaction) => transaction.plateNumber === state.filters.plateNumber
    );
  }

  if (state.filters.date) {
    const filterDate = new Date(state.filters.date);
    filterDate.setHours(0, 0, 0, 0);

    filtered = filtered.filter((transaction) => {
      const transactionDate = new Date(transaction.fuelDate);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() === filterDate.getTime();
    });
  }

  state.filteredTransactions = filtered;
  state.totalCount = filtered.length;
}

export const {
  setSearchQuery,
  setFilter,
  setPage,
  clearFilters,
  selectFuelTransaction,
  clearSelectedTransaction,
} = fuelsSlice.actions;

export default fuelsSlice.reducer;
