
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";


export type FeedbackType = "feedback" | "issue" | "suggestion";

export interface FeedbackItem {
  _id?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  agencyName?: string;
  type: FeedbackType;
  message: string;
  status?: "pending" | "in-progress" | "resolved" | "closed";
  response?: string;
  resolvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FeedbackState {
  items: FeedbackItem[];
  userFeedback: FeedbackItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  submissionStatus: "idle" | "loading" | "succeeded" | "failed";
  submissionError: string | null;
}

const initialState: FeedbackState = {
  items: [],
  userFeedback: [],
  status: "idle",
  error: null,
  submissionStatus: "idle",
  submissionError: null,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com"

export const submitFeedback = createAsyncThunk(
  "feedback/submit",
  async (
    feedback: { type: FeedbackType; message: string },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return rejectWithValue("Authentication required. Please log in.");
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/feedback`,
        feedback,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to submit feedback";
      return rejectWithValue(message);
    }
  }
);

export const fetchUserFeedback = createAsyncThunk(
  "feedback/fetchUserFeedback",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return rejectWithValue("Authentication required. Please log in.");
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/feedback/my-feedback`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch feedback history";
      return rejectWithValue(message);
    }
  }
);

// For admin users: fetch all feedback
export const fetchAllFeedback = createAsyncThunk(
  "feedback/fetchAll",
  async (agencyName: string | undefined, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return rejectWithValue("Authentication required. Please log in.");
      }

      const response = await axios.get(`${API_BASE_URL}/api/feedback`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: agencyName ? { agencyName } : {},
      });

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch feedback";
      return rejectWithValue(message);
    }
  }
);

// Update feedback status (admin only)
export const updateFeedbackStatus = createAsyncThunk(
  "feedback/updateStatus",
  async (
    {
      id,
      status,
      responseText,
    }: {
      id: string;
      status?: string;
      responseText?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return rejectWithValue("Authentication required. Please log in.");
      }

      const response = await axios.patch(
        `${API_BASE_URL}/api/feedback/${id}`,
        {
          status,
          response: responseText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update feedback status";
      return rejectWithValue(message);
    }
  }
);

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    clearFeedbackErrors: (state) => {
      state.error = null;
      state.submissionError = null;
    },
    resetSubmissionStatus: (state) => {
      state.submissionStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit feedback
      .addCase(submitFeedback.pending, (state) => {
        state.submissionStatus = "loading";
        state.submissionError = null;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.submissionStatus = "succeeded";
        if (action.payload?.feedback) {
          state.userFeedback.unshift(action.payload.feedback);
        }
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.submissionStatus = "failed";
        state.submissionError = action.payload as string;
      })

      .addCase(fetchUserFeedback.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserFeedback.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userFeedback = action.payload;
      })
      .addCase(fetchUserFeedback.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(fetchAllFeedback.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllFeedback.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAllFeedback.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(updateFeedbackStatus.fulfilled, (state, action) => {
        const updatedFeedback = action.payload.feedback;

        const itemIndex = state.items.findIndex(
          (item) => item._id === updatedFeedback._id
        );
        if (itemIndex !== -1) {
          state.items[itemIndex] = updatedFeedback;
        }

        const userFeedbackIndex = state.userFeedback.findIndex(
          (item) => item._id === updatedFeedback._id
        );
        if (userFeedbackIndex !== -1) {
          state.userFeedback[userFeedbackIndex] = updatedFeedback;
        }
      });
  },
});

export const { clearFeedbackErrors, resetSubmissionStatus } =
  feedbackSlice.actions;

export default feedbackSlice.reducer;
