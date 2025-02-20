import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance"; 

interface AuthState {
  isLoading: boolean;
  error: string | null;
  user: any; 
}

const initialState: AuthState = {
  isLoading: false,
  error: null,
  user: null,
};


export const signUp = createAsyncThunk(
  "auth/signUp",
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/signup", userData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Something went wrong");
    }
  }
);


export const signIn = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/login", credentials);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Invalid credentials");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signOut: (state) => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign-up cases
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Sign-in cases
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { signOut } = authSlice.actions;
export default authSlice.reducer;
