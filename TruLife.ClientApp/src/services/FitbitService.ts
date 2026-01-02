// Web-compatible Fitbit Service (Capacitor imports removed for Vercel build)
import { getApiUrl } from './api';
// Note: Full native functionality requires Capacitor plugins

const FITBIT_CLIENT_ID = import.meta.env.VITE_FITBIT_CLIENT_ID || 'YOUR_FITBIT_CLIENT_ID';
const FITBIT_CLIENT_SECRET = import.meta.env.VITE_FITBIT_CLIENT_SECRET || 'YOUR_FITBIT_CLIENT_SECRET';
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/fitbit-callback` : 'http://localhost:5173/fitbit-callback';

export class FitbitService {
    private static accessToken: string | null = null;
    private static refreshToken: string | null = null;

    // Initialize (web version - no deep links)
    static initialize() {
        // Check for OAuth callback in URL
        if (typeof window !== 'undefined' && window.location.pathname === '/fitbit-callback') {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            if (code) {
                this.handleCallback(code);
            }
        }
    }

    // OAuth Authorization (web version)
    static async authorize(): Promise<boolean> {
        try {
            const authUrl = `https://www.fitbit.com/oauth2/authorize?` +
                `client_id=${FITBIT_CLIENT_ID}&` +
                `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
                `response_type=code&` +
                `scope=activity heartrate sleep nutrition profile weight`;

            // Open in new window for web
            window.open(authUrl, '_blank');
            return true;
        } catch (error) {
            console.error('Fitbit auth error:', error);
            return false;
        }
    }

    // Handle OAuth callback
    private static async handleCallback(code: string) {
        try {
            await this.exchangeCodeForToken(code);

            // Notify app of successful auth
            window.dispatchEvent(new CustomEvent('fitbit-authorized'));

            // Redirect back to app
            window.location.href = '/profile';
        } catch (error) {
            console.error('Callback error:', error);
        }
    }

    // Exchange authorization code for access token
    private static async exchangeCodeForToken(code: string): Promise<boolean> {
        try {
            const response = await fetch('https://api.fitbit.com/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`)
                },
                body: new URLSearchParams({
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: REDIRECT_URI
                }).toString()
            });

            const data = await response.json();

            if (data.access_token) {
                this.accessToken = data.access_token;
                this.refreshToken = data.refresh_token;

                // Store tokens
                await this.storeTokens(data.access_token, data.refresh_token);

                return true;
            }
            return false;
        } catch (error) {
            console.error('Token exchange error:', error);
            return false;
        }
    }

    // Store tokens
    private static async storeTokens(accessToken: string, refreshToken: string) {
        try {
            localStorage.setItem('fitbit_access_token', accessToken);
            localStorage.setItem('fitbit_refresh_token', refreshToken);
        } catch (error) {
            console.error('Token storage error:', error);
        }
    }

    // Get access token
    private static async getAccessToken(): Promise<string | null> {
        if (!this.accessToken) {
            this.accessToken = localStorage.getItem('fitbit_access_token');
        }
        return this.accessToken;
    }

    // Refresh access token
    private static async refreshAccessToken(): Promise<boolean> {
        try {
            const refreshToken = localStorage.getItem('fitbit_refresh_token');
            if (!refreshToken) return false;

            const response = await fetch('https://api.fitbit.com/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`)
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                }).toString()
            });

            const data = await response.json();

            if (data.access_token) {
                await this.storeTokens(data.access_token, data.refresh_token);
                this.accessToken = data.access_token;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh error:', error);
            return false;
        }
    }

    // Make authenticated request
    private static async makeRequest(url: string): Promise<any> {
        let token = await this.getAccessToken();
        if (!token) return null;

        let response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // If unauthorized, try refreshing token
        if (response.status === 401) {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
                token = await this.getAccessToken();
                response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        }

        return response.ok ? response.json() : null;
    }

    // Get activity data
    static async getActivityData(date: string = 'today'): Promise<any> {
        return this.makeRequest(
            `https://api.fitbit.com/1/user/-/activities/date/${date}.json`
        );
    }

    // Get heart rate data
    static async getHeartRateData(date: string = 'today'): Promise<any> {
        return this.makeRequest(
            `https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`
        );
    }

    // Get sleep data
    static async getSleepData(date: string = 'today'): Promise<any> {
        return this.makeRequest(
            `https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`
        );
    }

    // Get weight data
    static async getWeightData(date: string = 'today'): Promise<any> {
        return this.makeRequest(
            `https://api.fitbit.com/1/user/-/body/log/weight/date/${date}.json`
        );
    }

    // Sync all data to backend
    static async syncToBackend(): Promise<boolean> {
        try {
            const today = new Date().toISOString().split('T')[0];

            const [activity, heartRate, sleep, weight] = await Promise.all([
                this.getActivityData(today),
                this.getHeartRateData(today),
                this.getSleepData(today),
                this.getWeightData(today)
            ]);

            // Send to your backend
            const response = await fetch(getApiUrl('/api/fitbit/sync'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    activity,
                    heartRate,
                    sleep,
                    weight,
                    syncDate: today
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Sync error:', error);
            return false;
        }
    }

    // Check if authorized
    static async isAuthorized(): Promise<boolean> {
        const token = await this.getAccessToken();
        return !!token;
    }

    // Disconnect
    static async disconnect(): Promise<void> {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('fitbit_access_token');
        localStorage.removeItem('fitbit_refresh_token');
    }
}

// Initialize on app start
if (typeof window !== 'undefined') {
    FitbitService.initialize();
}
