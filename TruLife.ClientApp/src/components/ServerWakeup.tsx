import { useState, useEffect } from 'react';
import './ServerWakeup.css';

interface ServerWakeupProps {
    onReady: () => void;
}

const ServerWakeup = ({ onReady }: ServerWakeupProps) => {
    const [progress, setProgress] = useState(0);
    const API_URL = 'https://trulife-couples-fitness.onrender.com/api/test/health';

    useEffect(() => {
        // Simulate progress while pinging
        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 1, 95));
        }, 500);

        const pingServer = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(API_URL, {
                    signal: controller.signal,
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    clearInterval(progressInterval);
                    setProgress(100);
                    setTimeout(() => onReady(), 300);
                } else {
                    throw new Error('Server not ready');
                }
            } catch (error) {
                // Retry after 3 seconds
                setTimeout(() => pingServer(), 3000);
            }
        };

        pingServer();

        return () => clearInterval(progressInterval);
    }, []);

    return (
        <div className="server-wakeup-bar">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
    );
};

export default ServerWakeup;
