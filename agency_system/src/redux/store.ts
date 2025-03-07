import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import vehiclesReducer from "./slices/vehiclesSlice";
import shiftsReducer from "./slices/shiftsSlice";
import fuelsReducer from "./slices/fuelsSlice";
import feedbackReducer from './slices/feedbackSlice';
import packagesReducer from './slices/packagesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehiclesReducer,
    shifts: shiftsReducer,
    fuels: fuelsReducer,
    feedback: feedbackReducer,
    packages: packagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
