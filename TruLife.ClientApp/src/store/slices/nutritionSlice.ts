import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NutritionState {
    macroTarget: any | null;
    todaysMeals: any[];
    loading: boolean;
}

const initialState: NutritionState = {
    macroTarget: null,
    todaysMeals: [],
    loading: false,
};

const nutritionSlice = createSlice({
    name: 'nutrition',
    initialState,
    reducers: {
        setMacroTarget: (state, action: PayloadAction<any>) => {
            state.macroTarget = action.payload;
        },
        setTodaysMeals: (state, action: PayloadAction<any[]>) => {
            state.todaysMeals = action.payload;
        },
        addMeal: (state, action: PayloadAction<any>) => {
            state.todaysMeals.push(action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setMacroTarget, setTodaysMeals, addMeal, setLoading } = nutritionSlice.actions;
export default nutritionSlice.reducer;
