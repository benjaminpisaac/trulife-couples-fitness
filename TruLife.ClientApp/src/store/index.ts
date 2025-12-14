import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import workoutReducer from './slices/workoutSlice';
import nutritionReducer from './slices/nutritionSlice';
import couplesReducer from './slices/couplesSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        profile: profileReducer,
        workout: workoutReducer,
        nutrition: nutritionReducer,
        couples: couplesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
