import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CouplesState {
    coupleProfile: any | null;
    challenges: any[];
    romanticEvenings: any[];
    loading: boolean;
}

const initialState: CouplesState = {
    coupleProfile: null,
    challenges: [],
    romanticEvenings: [],
    loading: false,
};

const couplesSlice = createSlice({
    name: 'couples',
    initialState,
    reducers: {
        setCoupleProfile: (state, action: PayloadAction<any>) => {
            state.coupleProfile = action.payload;
        },
        setChallenges: (state, action: PayloadAction<any[]>) => {
            state.challenges = action.payload;
        },
        setRomanticEvenings: (state, action: PayloadAction<any[]>) => {
            state.romanticEvenings = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setCoupleProfile, setChallenges, setRomanticEvenings, setLoading } = couplesSlice.actions;
export default couplesSlice.reducer;
