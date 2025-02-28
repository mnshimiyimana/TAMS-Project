import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance"; 

interface UserData {
  id?: string;
  username?: string;
  email?: string;
  agencyName?: string;
  role?: string;
  token?: string;
  location?: string;
}

interface AuthState {
  isLoading: boolean;
  error: string | null;
  user: UserData | null;
  resetToken: string | null;
}


interface SignUpData {
  agencyName: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  password: string;
  role: "admin" | "manager" | "fuel";
}

interface ResetPasswordResponse {
  message: string;
  resetToken?: string;
}

const initialState: AuthState = {
  isLoading: false,
  error: null,
  user: null,
  resetToken: null
};

// Sign up
export const signUp = createAsyncThunk(
  "auth/signUp",
  async (userData: SignUpData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/signup", userData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Registration failed. Please try again."
      );
    }
  }
);

// Sign in
export const signIn = createAsyncThunk(
  "auth/sign-in",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/login", credentials);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Invalid credentials"
      );
    }
  }
);

// Send reset code
export const sendResetCode = createAsyncThunk(
  "auth/sendResetCode",
  async (email: { email: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/send-reset-code", email);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || 
        "Failed to send reset code. Please try again."
      );
    }
  }
);

// Verify reset code
export const verifyResetCode = createAsyncThunk(
  "auth/verifyResetCode",
  async (data: { email: string; code: string; resetToken: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/verify-reset-code", {
        email: data.email,
        code: data.code,
        resetToken: data.resetToken
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || 
        "Invalid verification code."
      );
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: { email: string; newPassword: string; resetToken: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/reset-password", {
        email: data.email,
        newPassword: data.newPassword,
        resetToken: data.resetToken
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || 
        "Failed to reset password. Please try again."
      );
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
    clearResetToken: (state) => {
      state.resetToken = null;
    }
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
      .addCase(signIn.fulfilled, (state, action: PayloadAction<{ user: UserData; token: string }>) => {
        state.isLoading = false;
        state.user = action.payload.user;  // Store user data
        // Store user data in localStorage for persistence
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Send reset code cases
      .addCase(sendResetCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendResetCode.fulfilled, (state, action) => {
        state.isLoading = false;
        // Store the reset token from response
        state.resetToken = action.payload.resetToken || null;
      })
      .addCase(sendResetCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Verify reset code cases
      .addCase(verifyResetCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyResetCode.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyResetCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.resetToken = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
  },
});

export const { signOut, clearError, clearResetToken } = authSlice.actions;
export default authSlice.reducer;