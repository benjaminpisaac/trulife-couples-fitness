import { useState, useEffect } from 'react';

interface ChallengeDashboardProps {
    challengeId: string;
}

interface ActivityLog {
    type: 'meal' | 'water' | 'workout' | 'weighin' | 'macros' | 'readiness';
    partnerId: 'A' | 'B';
    points: number;
    timestamp: string;
    description: string;
}

export default function ChallengeDashboard({ challengeId }: ChallengeDashboardProps) {
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [partnerAPoints, setPartnerAPoints] = useState(0);
    const [partnerBPoints, setPartnerBPoints] = useState(0);
    const [partnerAStreak, setPartnerAStreak] = useState(0);
    const [partnerBStreak, setPartnerBStreak] = useState(0);

    const challengeData = JSON.parse(localStorage.getItem('activeChallenge') || '{}');
    const preferences = JSON.parse(localStorage.getItem('couplesPreferences') || '{}');

    useEffect(() => {
        loadActivityLogs();
        calculatePoints();
    }, [challengeId]);

    const loadActivityLogs = () => {
        const logs = JSON.parse(localStorage.getItem(`challenge_${challengeId}_activities`) || '[]');
        setActivityLogs(logs);
    };

    const calculatePoints = () => {
        const logs: ActivityLog[] = JSON.parse(localStorage.getItem(`challenge_${challengeId}_activities`) || '[]');

        const partnerATotal = logs
            .filter(log => log.partnerId === 'A')
            .reduce((sum, log) => sum + log.points, 0);

        const partnerBTotal = logs
            .filter(log => log.partnerId === 'B')
            .reduce((sum, log) => sum + log.points, 0);

        setPartnerAPoints(partnerATotal);
        setPartnerBPoints(partnerBTotal);

        // Calculate streaks (simplified - would need date checking in production)
        const partnerALogs = logs.filter(log => log.partnerId === 'A');
        const partnerBLogs = logs.filter(log => log.partnerId === 'B');
        setPartnerAStreak(partnerALogs.length > 0 ? Math.min(partnerALogs.length, 7) : 0);
        setPartnerBStreak(partnerBLogs.length > 0 ? Math.min(partnerBLogs.length, 7) : 0);
    };

    const logActivity = (type: ActivityLog['type'], partnerId: 'A' | 'B') => {
        const pointsMap = {
            meal: 10,
            water: 5,
            workout: 20,
            weighin: 5,
            macros: 15,
            readiness: 5
        };

        const descriptionMap = {
            meal: 'Logged meal',
            water: 'Logged water intake',
            workout: 'Completed workout',
            weighin: 'Daily weigh-in',
            macros: 'Hit macro targets',
            readiness: 'Logged readiness'
        };

        const newActivity: ActivityLog = {
            type,
            partnerId,
            points: pointsMap[type],
            timestamp: new Date().toISOString(),
            description: descriptionMap[type]
        };

        const logs = [...activityLogs, newActivity];
        setActivityLogs(logs);
        localStorage.setItem(`challenge_${challengeId}_activities`, JSON.stringify(logs));
        calculatePoints();
    };

    const getDaysRemaining = () => {
        if (!challengeData.endDate) return 0;
        const end = new Date(challengeData.endDate);
        const today = new Date();
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const getWeekNumber = () => {
        if (!challengeData.startDate) return 1;
        const start = new Date(challengeData.startDate);
        const today = new Date();
        const diffTime = today.getTime() - start.getTime();
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        return diffWeeks + 1;
    };

    const getTotalWeeks = () => {
        if (!challengeData.startDate || !challengeData.endDate) return 8;
        const start = new Date(challengeData.startDate);
        const end = new Date(challengeData.endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        return diffWeeks;
    };

    const getFocusAreas = (partnerId: 'A' | 'B') => {
        if (!preferences.attractiveAreas || preferences.attractiveAreas.length === 0) {
            return null;
        }

        const showFocus = partnerId === 'A'
            ? challengeData.partnerAShowFocus
            : challengeData.partnerBShowFocus;

        if (!showFocus) return null;

        return preferences.attractiveAreas.slice(0, 3);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Challenge Overview */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', color: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {challengeData.challengeName || 'Challenge Dashboard'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Week</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {getWeekNumber()}/{getTotalWeeks()}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Days Left</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {getDaysRemaining()}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Type</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            {challengeData.challengeType === 'competitive' ? '🏆 Competitive' : '🤝 Cooperative'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Points Leaderboard */}
            <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                    📊 Leaderboard
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Partner A */}
                    <div style={{
                        padding: '1.5rem',
                        background: partnerAPoints > partnerBPoints ? '#d1fae5' : '#f3f4f6',
                        borderRadius: '12px',
                        border: `3px solid ${partnerAPoints > partnerBPoints ? '#10b981' : '#e5e7eb'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                    Partner A {partnerAPoints > partnerBPoints && '🥇'}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                    {partnerAStreak > 0 && `🔥 ${partnerAStreak} day streak`}
                                </div>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#8b5cf6' }}>
                                {partnerAPoints}
                            </div>
                        </div>
                        {challengeData.partnerAPrize && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                                🎁 Prize: {challengeData.partnerAPrize}
                            </div>
                        )}
                    </div>

                    {/* Partner B */}
                    <div style={{
                        padding: '1.5rem',
                        background: partnerBPoints > partnerAPoints ? '#d1fae5' : '#f3f4f6',
                        borderRadius: '12px',
                        border: `3px solid ${partnerBPoints > partnerAPoints ? '#10b981' : '#e5e7eb'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                    Partner B {partnerBPoints > partnerAPoints && '🥇'}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                    {partnerBStreak > 0 && `🔥 ${partnerBStreak} day streak`}
                                </div>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#8b5cf6' }}>
                                {partnerBPoints}
                            </div>
                        </div>
                        {challengeData.partnerBPrize && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                                🎁 Prize: {challengeData.partnerBPrize}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Focus Areas (if enabled) */}
            {(getFocusAreas('A') || getFocusAreas('B')) && (
                <div className="card" style={{ background: '#fef3c7', border: '2px solid #fbbf24' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#78350f' }}>
                        💡 Partner Focus Suggestions
                    </h3>

                    {getFocusAreas('A') && (
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#78350f' }}>
                                Partner A:
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#78350f' }}>
                                Your partner finds these areas attractive: <strong>{getFocusAreas('A')?.join(', ')}</strong>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#92400e', marginTop: '0.25rem' }}>
                                💪 Suggested workouts: Upper body strength, Core definition exercises
                            </div>
                        </div>
                    )}

                    {getFocusAreas('B') && (
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#78350f' }}>
                                Partner B:
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#78350f' }}>
                                Your partner finds these areas attractive: <strong>{getFocusAreas('B')?.join(', ')}</strong>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#92400e', marginTop: '0.25rem' }}>
                                💪 Suggested workouts: Upper body strength, Core definition exercises
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Daily Activity Checklist */}
            <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                    ✅ Log Today's Activities
                </h3>

                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                        Partner A
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        <button
                            className="btn btn-outline"
                            onClick={() => logActivity('meal', 'A')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            🍽️ Meal (+10)
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => logActivity('water', 'A')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            💧 Water (+5)
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => logActivity('workout', 'A')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            💪 Workout (+20)
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => logActivity('weighin', 'A')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            ⚖️ Weigh-in (+5)
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => logActivity('macros', 'A')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            📊 Hit Macros (+15)
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => logActivity('readiness', 'A')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            📝 Readiness (+5)
                        </button>
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                        Partner B
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        <button
                            className="btn btn-outline"
                            onClick={() => logActivity('meal', 'B')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            🍽️ Meal (+10)
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => logActivity('water', 'B')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            💧 Water (+5)
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => logActivity('workout', 'B')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            💪 Workout (+20)
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => logActivity('weighin', 'B')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            ⚖️ Weigh-in (+5)
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => logActivity('macros', 'B')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            📊 Hit Macros (+15)
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => logActivity('readiness', 'B')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            📝 Readiness (+5)
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                    📝 Recent Activity
                </h3>

                {activityLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📋</div>
                        <p>No activities logged yet. Start logging to earn points!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {activityLogs.slice(-10).reverse().map((log, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '0.75rem',
                                    background: '#f9fafb',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                        Partner {log.partnerId}: {log.description}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{
                                    fontWeight: 700,
                                    color: '#10b981',
                                    fontSize: '1.1rem'
                                }}>
                                    +{log.points}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Points Guide */}
            <div className="card" style={{ background: '#f0f9ff', border: '2px solid #3b82f6' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e40af' }}>
                    📖 Points Guide
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.85rem', color: '#1e40af' }}>
                    <div>🍽️ Log meal: <strong>10 pts</strong></div>
                    <div>💧 Log water: <strong>5 pts</strong></div>
                    <div>💪 Complete workout: <strong>20 pts</strong></div>
                    <div>⚖️ Daily weigh-in: <strong>5 pts</strong></div>
                    <div>📊 Hit macros: <strong>15 pts</strong></div>
                    <div>📝 Log readiness: <strong>5 pts</strong></div>
                </div>
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#dbeafe', borderRadius: '8px', fontSize: '0.85rem', color: '#1e40af' }}>
                    <strong>🔥 Streak Bonus:</strong> 7-day streak = +50 points!
                </div>
            </div>
        </div>
    );
}
