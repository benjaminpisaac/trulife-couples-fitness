import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.trulife.fitness',
    appName: 'TruLife Couples Fitness',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
        // For development, point to your local API
        // url: 'http://localhost:5173',
        // cleartext: true
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#6366f1',
            showSpinner: true,
            spinnerColor: '#ffffff'
        },
        PushNotifications: {
            presentationOptions: ['badge', 'sound', 'alert']
        },
        Camera: {
            permissions: {
                camera: 'required',
                photos: 'required'
            }
        }
    }
};

export default config;
