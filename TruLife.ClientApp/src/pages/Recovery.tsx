import { useEffect, useState } from 'react';

const Recovery = () => {
    const [loading, setLoading] = useState(true);
    const [recoveryData, setRecoveryData] = useState<any>(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedTool, setSelectedTool] = useState<string>('');
    const [duration, setDuration] = useState<number>(15);
    const [intensity, setIntensity] = useState<number>(5);
    const [notes, setNotes] = useState<string>('');
    const [toolHistory, setToolHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchRecoveryData();
        fetchToolHistory();
        fetchStats();
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

    const fetchToolHistory = async () => {
        try {
            const response = await fetch('/api/recovery/tools/history?days=7', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setToolHistory(data);
            }
        } catch (error) {
            console.error('Error fetching tool history:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/recovery/tools/stats', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleToolClick = (toolType: string) => {
        setSelectedTool(toolType);
        setShowLogModal(true);
        // Reset form with default durations
        setDuration(toolType === 'Meditation' ? 10 : toolType === 'IceBath' ? 5 : toolType === 'Sauna' ? 20 : 30);
        setIntensity(5);
        setNotes('');
    };

    const handleLogSession = async () => {
        try {
            const response = await fetch('/api/recovery/tool', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    toolType: selectedTool,
                    durationMinutes: duration,
                    intensity,
                    notes
                })
            });

            if (response.ok) {
                setShowLogModal(false);
                fetchToolHistory();
                fetchStats();
                alert(`${selectedTool} session logged successfully! 🎉`);
            } else {
                alert('Failed to log session. Please try again.');
            }
        } catch (error) {
            console.error('Error logging session:', error);
            alert('Failed to log session. Please try again.');
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
                        <button
                            className="btn btn-outline"
                            style={{ padding: '1rem' }}
                            onClick={() => handleToolClick('Meditation')}
                        >
                            <div>🧘 Meditation</div>
                        </button>
                        <button
                            className="btn btn-outline"
                            style={{ padding: '1rem' }}
                            onClick={() => handleToolClick('IceBath')}
                        >
                            <div>🛁 Ice Bath</div>
                        </button>
                        <button
                            className="btn btn-outline"
                            style={{ padding: '1rem' }}
                            onClick={() => handleToolClick('Sauna')}
                        >
                            <div>🧖 Sauna</div>
                        </button>
                        <button
                            className="btn btn-outline"
                            style={{ padding: '1rem' }}
                            onClick={() => handleToolClick('Massage')}
                        >
                            <div>💆 Massage</div>
                        </button>
                    </div>
                </div>

                {/* Recovery Tool Log Modal */}
                {showLogModal && (
                    <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Log {selectedTool} Session</h2>

                            <div className="form-group">
                                <label className="label">Duration (minutes)</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    min="1"
                                    max="180"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Intensity (1-10)</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={intensity}
                                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                                <div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                    {intensity}/10
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Notes (optional)</label>
                                <textarea
                                    className="input"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder="How did you feel? Any observations?"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleLogSession}
                                    disabled={loading}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? 'Logging...' : 'Log Session'}
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setShowLogModal(false)}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Sessions */}
                {toolHistory.length > 0 && (
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📊 Recent Sessions (Last 7 Days)</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {toolHistory.map((session: any, idx: number) => (
                                <div key={idx} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <strong>{session.toolType}</strong>
                                        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                            {new Date(session.loggedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                        ⏱️ {session.durationMinutes} min | 💪 Intensity: {session.intensity || 'N/A'}/10
                                    </div>
                                    {session.notes && (
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                            "{session.notes}"
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats */}
                {stats && stats.totalSessions > 0 && (
                    <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📈 30-Day Stats</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalSessions}</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Sessions</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalMinutes}</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Minutes</div>
                            </div>
                        </div>
                        {stats.byType && stats.byType.length > 0 && (
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                                <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>By Type:</div>
                                {stats.byType.map((type: any, idx: number) => (
                                    <div key={idx} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                        {type.type}: {type.count} sessions ({type.totalMinutes} min)
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recovery;
