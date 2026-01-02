import axios from 'axios';

export const API_BASE_URL = (() => {
    // 1. Check if we're on a public domain (Vercel, Azure, Render)
    const hostname = window.location.hostname;
    const isPublic = hostname.endsWith('.vercel.app') ||
        hostname.endsWith('.azurewebsites.net') ||
        hostname.endsWith('.onrender.com');

    // 2. Determine base URL
    let url = import.meta.env.VITE_API_BASE_URL;

    if (isPublic && !url) {
        // Fallback to production Render URL if on public domain and no env var
        if (hostname.endsWith('.azurewebsites.net')) {
            // Smart detect for Azure Web Apps: trulife-app-1234 becomes trulife-api-1234
            url = 'https://' + hostname.replace('-app-', '-api-') + '/api';
        } else if (hostname.endsWith('.azurestaticapps.net')) {
            // Explicit fallback for Azure Static Web Apps to our new Central US backend
            url = 'https://trulife-api-central-6947.azurewebsites.net/api';
        } else {
            url = 'https://trulife-couples-fitness.onrender.com/api';
        }
    } else if (!url) {
        // Local development fallback
        url = `http://${hostname}:5000/api`;
    }

    // 3. Normalize
    if (url.endsWith('/')) url = url.slice(0, -1);
    if (!url.toLowerCase().endsWith('/api')) {
        url += '/api';
    }

    return url;
})();

// Helper function for components using fetch() instead of axios
export const getApiUrl = (endpoint: string) => {
    // Remove /api prefix from the endpoint if it exists
    let clean = endpoint;
    if (clean.toLowerCase().startsWith('/api/')) clean = clean.slice(4);
    else if (clean.toLowerCase().startsWith('api/')) clean = clean.slice(3);

    // Ensure leading slash
    if (!clean.startsWith('/')) clean = '/' + clean;

    return `${API_BASE_URL}${clean}`;
};

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

// Handle 401 errors (invalid/expired token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

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

// Restaurant API
export const searchRestaurants = (data: {
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    cuisine?: string;
}) => api.post('/restaurant/search', data);
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
