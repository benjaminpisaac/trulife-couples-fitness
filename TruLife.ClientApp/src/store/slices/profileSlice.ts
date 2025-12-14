import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProfileState {
    profile: any | null;
    coupleProfile: any | null;
    loading: boolean;
}

const initialState: ProfileState = {
    profile: null,
    coupleProfile: null,
    loading: false,
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setProfile: (state, action: PayloadAction<any>) => {
            state.profile = action.payload;
        },
        setCoupleProfile: (state, action: PayloadAction<any>) => {
            state.coupleProfile = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setProfile, setCoupleProfile, setLoading } = profileSlice.actions;
export default profileSlice.reducer;
