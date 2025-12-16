import { useEffect, useState } from 'react';

const Recovery = () => {
    const [loading, setLoading] = useState(true);
    const [recoveryData, setRecoveryData] = useState<any>(null);

    useEffect(() => {
        fetchRecoveryData();
    }, []);

    const fetchRecoveryData = async () => {
        try {
            // In production, this would fetch from RecoveryController
            // For now, simulate with sample data
            await new Promise(resolve => setTimeout(resolve, 500));

            setRecoveryData({
                recoveryScore: 7.5,
                sleepQuality: 8,
                restingHeartRate: 62,
                hrvScore: 75,
                stressLevel: 4
            });
        } catch (error) {
            console.error('Error fetching recovery data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Recovery 💆</h1>
                <p className="text-gray">Track your wellness and recovery</p>
            </div>

            <div className="container">
                {/* Recovery Score */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Recovery Score</h2>
                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        {recoveryData?.recoveryScore || 0}/10
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        {recoveryData?.recoveryScore >= 8 ? 'Excellent recovery!' :
                            recoveryData?.recoveryScore >= 6 ? 'Good recovery' :
                                'Focus on rest today'}
                    </div>
                </div>

                {/* Recovery Metrics */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recovery Metrics</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '1rem', border: '2px solid #86efac' }}>
                            <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '0.25rem' }}>😴 Sleep Quality</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                                {recoveryData?.sleepQuality || 0}/10
                            </div>
                        </div>
                        <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '1rem', border: '2px solid #fbbf24' }}>
                            <div style={{ fontSize: '0.85rem', color: '#78350f', marginBottom: '0.25rem' }}>❤️ Resting HR</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                                {recoveryData?.restingHeartRate || 0}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#78350f' }}>bpm</div>
                        </div>
                        <div style={{ background: '#ede9fe', borderRadius: '12px', padding: '1rem', border: '2px solid #c4b5fd' }}>
                            <div style={{ fontSize: '0.85rem', color: '#5b21b6', marginBottom: '0.25rem' }}>📊 HRV Score</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed' }}>
                                {recoveryData?.hrvScore || 0}
                            </div>
                        </div>
                        <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '1rem', border: '2px solid #fca5a5' }}>
                            <div style={{ fontSize: '0.85rem', color: '#991b1b', marginBottom: '0.25rem' }}>😰 Stress</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
                                {recoveryData?.stressLevel || 0}/10
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recovery Recommendations */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>💡 Recovery Recommendations</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '1rem', border: '1px solid #86efac' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#166534' }}>✅ Sleep 7-9 hours tonight</div>
                            <div style={{ fontSize: '0.85rem', color: '#166534' }}>Your sleep quality is good. Maintain your current sleep schedule.</div>
                        </div>
                        <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '1rem', border: '1px solid #fbbf24' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#78350f' }}>🧘 Practice stress management</div>
                            <div style={{ fontSize: '0.85rem', color: '#78350f' }}>Try meditation, deep breathing, or yoga to reduce stress levels.</div>
                        </div>
                        <div style={{ background: '#ede9fe', borderRadius: '8px', padding: '1rem', border: '1px solid #c4b5fd' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#5b21b6' }}>💧 Stay hydrated</div>
                            <div style={{ fontSize: '0.85rem', color: '#5b21b6' }}>Proper hydration supports recovery and performance.</div>
                        </div>
                    </div>
                </div>

                {/* Recovery Tools */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🛠️ Recovery Tools</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="btn btn-outline" style={{ padding: '1rem' }}>
                            <div>🧘 Meditation</div>
                        </button>
                        <button className="btn btn-outline" style={{ padding: '1rem' }}>
                            <div>🛁 Ice Bath</div>
                        </button>
                        <button className="btn btn-outline" style={{ padding: '1rem' }}>
                            <div>🧖 Sauna</div>
                        </button>
                        <button className="btn btn-outline" style={{ padding: '1rem' }}>
                            <div>💆 Massage</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Recovery;
