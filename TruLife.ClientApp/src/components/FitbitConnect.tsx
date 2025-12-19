import { useState, useEffect } from 'react';
import { FitbitService } from '../services/FitbitService';

export const FitbitConnect = () => {
    const [connected, setConnected] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    useEffect(() => {
        checkConnection();

        // Listen for authorization events
        const handleAuth = () => {
            setConnected(true);
            alert('Fitbit connected successfully! 🎉');
        };

        window.addEventListener('fitbit-authorized', handleAuth);
        return () => window.removeEventListener('fitbit-authorized', handleAuth);
    }, []);

    const checkConnection = async () => {
        const isAuth = await FitbitService.isAuthorized();
        setConnected(isAuth);

        if (isAuth) {
            const lastSyncDate = localStorage.getItem('fitbit_last_sync');
            setLastSync(lastSyncDate);
        }
    };

    const handleConnect = async () => {
        await FitbitService.authorize();
    };

    const handleSync = async () => {
        setSyncing(true);
        const success = await FitbitService.syncToBackend();
        setSyncing(false);

        if (success) {
            const now = new Date().toLocaleString();
            setLastSync(now);
            localStorage.setItem('fitbit_last_sync', now);
            alert('Data synced successfully! ✅');
        } else {
            alert('Sync failed. Please try again.');
        }
    };

    const handleDisconnect = async () => {
        if (confirm('Are you sure you want to disconnect Fitbit?')) {
            await FitbitService.disconnect();
            setConnected(false);
            setLastSync(null);
        }
    };

    return (
        <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                🏃 Fitbit Integration
            </h2>

            {!connected ? (
                <>
                    <p className="text-gray mb-3">
                        Connect your Fitbit to automatically sync your activity, heart rate, sleep, and weight data.
                    </p>
                    <button className="btn btn-primary" onClick={handleConnect}>
                        Connect Fitbit
                    </button>
                </>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{
                        padding: '1rem',
                        background: '#d1fae5',
                        borderRadius: '8px',
                        color: '#065f46'
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                            ✓ Fitbit Connected
                        </div>
                        {lastSync && (
                            <div style={{ fontSize: '0.85rem' }}>
                                Last synced: {lastSync}
                            </div>
                        )}
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleSync}
                        disabled={syncing}
                    >
                        {syncing ? 'Syncing...' : '🔄 Sync Now'}
                    </button>

                    <button className="btn btn-outline" onClick={handleDisconnect}>
                        Disconnect
                    </button>

                    <div style={{
                        fontSize: '0.85rem',
                        color: '#6b7280',
                        padding: '0.75rem',
                        background: '#f3f4f6',
                        borderRadius: '6px'
                    }}>
                        <strong>What gets synced:</strong>
                        <ul style={{ marginTop: '0.5rem', marginLeft: '1.25rem' }}>
                            <li>Daily activity (steps, calories, distance)</li>
                            <li>Heart rate data</li>
                            <li>Sleep tracking</li>
                            <li>Weight logs</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
