import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Link } from 'react-router-dom';
import { getProfile, getLatestReadiness, getTodaysMeals, getCurrentMacros } from '../services/api';
import ReadinessCheckIn from '../components/ReadinessCheckIn';

const kgToLbs = (kg: number) => Math.round(kg * 2.20462);
const cmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
};

const Dashboard = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [profile, setProfile] = useState<any>(null);
    const [readiness, setReadiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [measurementSystem, setMeasurementSystem] = useState<'metric' | 'imperial'>('imperial');
    const [readinessExpanded, setReadinessExpanded] = useState(false); // Collapsed by default after check-in

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

                // Backend now returns 404 if no readiness log for today
                if (readinessRes.status === 'fulfilled') {
                    setReadiness(readinessRes.value.data);
                } else {
                    // No readiness for today - show check-in form
                    setReadiness(null);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Set up midnight reset timer
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        const midnightTimer = setTimeout(() => {
            // Reset readiness at midnight to show form again
            setReadiness(null);
            setLoading(true);
            fetchData();
        }, msUntilMidnight);

        return () => clearTimeout(midnightTimer);
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
                        <div
                            onClick={() => setReadinessExpanded(!readinessExpanded)}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Today's Readiness</h2>
                                <span>{readinessExpanded ? '▼' : '▶'}</span>
                            </div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{readiness.readinessScore}/10</div>
                        </div>
                        {readinessExpanded && (
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
                        )}
                    </div>
                )}

                {/* Readiness Check-In */}
                {!readiness && (
                    <ReadinessCheckIn onComplete={() => window.location.reload()} />
                )}

                {/* Quick Actions */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <Link to="/train" className="btn btn-primary">
                            💪 Start Workout
                        </Link>
                        <Link to="/eat" className="btn btn-secondary">
                            🍽️ Log Meal
                        </Link>
                        <Link to="/teamwork" className="btn btn-outline">
                            🤝 Teamwork
                        </Link>
                        <Link to="/profile" className="btn btn-outline">
                            ⚙️ Settings
                        </Link>
                    </div>
                </div>

                {/* Profile Completion */}
                {profile && !profile.fitnessGoal && (
                    <div className="card" style={{ background: '#fef3c7', border: '2px solid #f59e0b' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Complete Your Profile</h3>
                        <p className="text-gray mb-2">Set up your fitness goals and preferences to get personalized recommendations!</p>
                        <Link to="/profile" className="btn btn-primary">
                            Complete Profile
                        </Link>
                    </div>
                )}

                {/* Stats Overview */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Your Stats</h2>
                        <div style={{ display: 'flex', gap: '0.5rem', background: '#f3f4f6', borderRadius: '8px', padding: '0.25rem' }}>
                            <button
                                onClick={() => setMeasurementSystem('imperial')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: measurementSystem === 'imperial' ? 'white' : 'transparent',
                                    fontWeight: measurementSystem === 'imperial' ? 600 : 400,
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Imperial
                            </button>
                            <button
                                onClick={() => setMeasurementSystem('metric')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: measurementSystem === 'metric' ? 'white' : 'transparent',
                                    fontWeight: measurementSystem === 'metric' ? 600 : 400,
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Metric
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div style={{ textAlign: 'center', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>
                                {profile?.currentWeightKg
                                    ? measurementSystem === 'imperial'
                                        ? kgToLbs(profile.currentWeightKg)
                                        : Math.round(profile.currentWeightKg)
                                    : '--'}
                            </div>
                            <div className="text-gray">Current Weight ({measurementSystem === 'imperial' ? 'lbs' : 'kg'})</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899' }}>
                                {profile?.targetWeightKg
                                    ? measurementSystem === 'imperial'
                                        ? kgToLbs(profile.targetWeightKg)
                                        : Math.round(profile.targetWeightKg)
                                    : '--'}
                            </div>
                            <div className="text-gray">Target Weight ({measurementSystem === 'imperial' ? 'lbs' : 'kg'})</div>
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
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>🤝 Teamwork Mode</div>
                            <div className="text-gray text-sm">Create challenges and shared activities with your partner or teammate</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
