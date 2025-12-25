import { useState, useEffect } from 'react';
import './ServerWakeup.css';

interface ServerWakeupProps {
    onReady: () => void;
}

const ServerWakeup = ({ onReady }: ServerWakeupProps) => {
    const [status, setStatus] = useState<'waking' | 'ready' | 'error'>('waking');
    const [attempts, setAttempts] = useState(0);
    const API_URL = 'https://trulife-couples-fitness.onrender.com/api/test/health';

    useEffect(() => {
        const pingServer = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const response = await fetch(API_URL, {
                    signal: controller.signal,
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    setStatus('ready');
                    setTimeout(() => onReady(), 500); // Small delay for smooth transition
                } else {
                    throw new Error('Server not ready');
                }
            } catch (error) {
                console.log(`Wake attempt ${attempts + 1} failed, retrying...`);
                setAttempts(prev => prev + 1);

                // Retry after 3 seconds
                setTimeout(() => {
                    pingServer();
                }, 3000);
            }
        };

        pingServer();
    }, []);

    if (status === 'ready') {
        return null;
    }

    return (
        <div className="server-wakeup">
            <div className="wakeup-content">
                <div className="spinner-large"></div>
                <h2>Waking up server...</h2>
                <p>This takes about 30-60 seconds on first load</p>
                {attempts > 0 && (
                    <p className="attempts">Attempt {attempts + 1}...</p>
                )}
                <div className="progress-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
            </div>
        </div>
    );
};

export default ServerWakeup;
