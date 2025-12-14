import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getProfile, getLatestReadiness } from '../services/api';

const Dashboard = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [profile, setProfile] = useState<any>(null);
    const [readiness, setReadiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, readinessRes] = await Promise.allSettled([
                    getProfile(),
                    getLatestReadiness()
                ]);

                if (profileRes.status === 'fulfilled') {
                    setProfile(profileRes.value.data);
                }

                if (readinessRes.status === 'fulfilled') {
                    setReadiness(readinessRes.value.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                <h1 className="page-title">Welcome back, {user?.firstName}! 👋</h1>
                <p className="text-gray">Let's crush your goals today!</p>
            </div>

            <div className="container">
                {/* Readiness Score */}
                {readiness && (
                    <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Today's Readiness</h2>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{readiness.readinessScore}/10</div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            <div>
                                <div className="text-sm">Sleep: {readiness.sleepQuality}/10</div>
                                <div className="text-sm">Energy: {readiness.energyLevel}/10</div>
                            </div>
                            <div>
                                <div className="text-sm">Stress: {readiness.stressLevel}/10</div>
                                <div className="text-sm">Soreness: {readiness.sorenessLevel}/10</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <a href="/train" className="btn btn-primary">
                            💪 Start Workout
                        </a>
                        <a href="/eat" className="btn btn-secondary">
                            🍽️ Log Meal
                        </a>
                        <a href="/couples" className="btn btn-outline">
                            💑 Couples Mode
                        </a>
                        <a href="/profile" className="btn btn-outline">
                            ⚙️ Settings
                        </a>
                    </div>
                </div>

                {/* Profile Completion */}
                {profile && !profile.fitnessGoal && (
                    <div className="card" style={{ background: '#fef3c7', border: '2px solid #f59e0b' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Complete Your Profile</h3>
                        <p className="text-gray mb-2">Set up your fitness goals and preferences to get personalized recommendations!</p>
                        <a href="/profile" className="btn btn-primary">
                            Complete Profile
                        </a>
                    </div>
                )}

                {/* Stats Overview */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Your Stats</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div style={{ textAlign: 'center', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>
                                {profile?.currentWeightKg || '--'}
                            </div>
                            <div className="text-gray">Current Weight (kg)</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899' }}>
                                {profile?.targetWeightKg || '--'}
                            </div>
                            <div className="text-gray">Target Weight (kg)</div>
                        </div>
                    </div>
                </div>

                {/* Features Overview */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>TruLife Features</h2>
                    <div className="flex flex-col gap-2">
                        <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>🤖 AI Workout Generation</div>
                            <div className="text-gray text-sm">Get personalized workouts based on your readiness and available equipment</div>
                        </div>
                        <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>📸 Meal Photo Analysis</div>
                            <div className="text-gray text-sm">Snap a photo of your meal and get instant macro estimates</div>
                        </div>
                        <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>💑 Couples Mode</div>
                            <div className="text-gray text-sm">Create challenges and romantic date nights with your partner</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
