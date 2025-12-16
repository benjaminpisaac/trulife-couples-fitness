import axios from 'axios';

const API_BASE_URL = 'https://trulife-couples-fitness.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const register = (data: any) => api.post('/auth/register', data);
export const login = (data: any) => api.post('/auth/login', data);

// Profile
export const getProfile = () => api.get('/profile');
export const updateProfile = (data: any) => api.put('/profile', data);

// Readiness
export const createReadinessLog = (data: any) => api.post('/readiness', data);
export const getLatestReadiness = () => api.get('/readiness/latest');
export const getReadinessHistory = (days: number = 30) => api.get(`/readiness/history?days=${days}`);

// Workout
export const analyzeEnvironment = (base64Image: string) =>
    api.post('/workout/analyze-environment', { base64Image });
export const generateWorkout = (data: any) => api.post('/workout/generate', data);
export const getWorkoutSessions = () => api.get('/workout/sessions');
export const createWorkoutSession = (data: any) => api.post('/workout/sessions', data);
export const completeWorkoutSession = (id: number) => api.put(`/workout/sessions/${id}/complete`);

// Nutrition
export const analyzeMeal = (base64Image: string) =>
    api.post('/nutrition/analyze-meal', { base64Image });
export const calculateMacros = (data: any) => api.post('/nutrition/calculate-macros', data);
export const getCurrentMacros = () => api.get('/nutrition/macros/current');
export const logMeal = (data: any) => api.post('/nutrition/meals', data);
export const getTodaysMeals = () => api.get('/nutrition/meals/today');
export const getMealRecommendations = () => api.post('/nutrition/recommendations');

// Couples
export const createCouplePairing = (partnerEmail: string) =>
    api.post('/couples/pair', { partnerEmail });
export const getCoupleProfile = () => api.get('/couples/profile');
export const createChallenge = (data: any) => api.post('/couples/challenges', data);
export const getChallenges = () => api.get('/couples/challenges');
export const generateRomanticEvening = (data: any) =>
    api.post('/couples/romantic-evening', data);
export const getRomanticEvenings = () => api.get('/couples/romantic-evenings');

export default api;

// DNA Analysis
export const uploadDNA = (formData: FormData) => api.post('/genetics/upload', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

export const getGeneticProfile = () => api.get('/genetics/profile');

// Lab Analysis
export const uploadLabResult = (formData: FormData) => api.post('/labs/upload', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

export const getLabResults = () => api.get('/labs');

// Equipment Analysis
export const analyzeEquipment = (base64Image: string) =>
    api.post('/workout/analyze-equipment', { base64Image });
