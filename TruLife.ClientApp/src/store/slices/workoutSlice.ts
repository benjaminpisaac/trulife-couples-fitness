import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkoutState {
    sessions: any[];
    currentWorkout: any | null;
    loading: boolean;
}

const initialState: WorkoutState = {
    sessions: [],
    currentWorkout: null,
    loading: false,
};

const workoutSlice = createSlice({
    name: 'workout',
    initialState,
    reducers: {
        setSessions: (state, action: PayloadAction<any[]>) => {
            state.sessions = action.payload;
        },
        setCurrentWorkout: (state, action: PayloadAction<any>) => {
            state.currentWorkout = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setSessions, setCurrentWorkout, setLoading } = workoutSlice.actions;
export default workoutSlice.reducer;
