import { useEffect, useState } from 'react';
import { getProfile, getLatestReadiness, getTodaysMeals, getCurrentMacros } from '../services/api';
import ReadinessCheckIn from '../components/ReadinessCheckIn';
import HydrationTracker from '../components/HydrationTracker';

const Today = () => {
    const [readiness, setReadiness] = useState<any>(null);
    const [macros, setMacros] = useState<any>(null);
    const [meals, setMeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [readinessRes, macrosRes, mealsRes] = await Promise.allSettled([
                getLatestReadiness(),
                getCurrentMacros(),
                getTodaysMeals()
            ]);

            if (readinessRes.status === 'fulfilled') {
                setReadiness(readinessRes.value.data);
            }

            if (macrosRes.status === 'fulfilled') {
                setMacros(macrosRes.value.data);
            }

            if (mealsRes.status === 'fulfilled') {
                setMeals(mealsRes.value.data.meals || []);
            }
        } catch (error) {
            console.error('Error fetching today data:', error);
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

    const totals = meals.reduce(
        (acc, meal) => ({
            calories: acc.calories + meal.calories,
            protein: acc.protein + meal.proteinGrams,
            carbs: acc.carbs + meal.carbsGrams,
            fats: acc.fats + meal.fatsGrams
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Today 📅</h1>
                <p className="text-gray">Your daily overview</p>
            </div>

            <div className="container">
                {/* Readiness Check-In or Score */}
                {!readiness ? (
                    <ReadinessCheckIn onComplete={() => window.location.reload()} />
                ) : (
                    <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Today's Readiness</h2>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{readiness.readinessScore}/10</div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            <div>
                                <div className="text-sm">😴 Sleep: {readiness.sleepQuality}/10</div>
                                <div className="text-sm">⚡ Energy: {readiness.energyLevel}/10</div>
                            </div>
                            <div>
                                <div className="text-sm">😰 Stress: {readiness.stressLevel}/10</div>
                                <div className="text-sm">💪 Soreness: {readiness.sorenessLevel}/10</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nutrition Summary */}
                {macros && (
                    <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Today's Nutrition</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Calories</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {Math.round(totals.calories)} / {Math.round(macros.dailyCalories)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Protein</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {Math.round(totals.protein)}g / {Math.round(macros.proteinGrams)}g
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hydration Tracker */}
                <HydrationTracker />

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

                {/* Today's Meals */}
                {meals.length > 0 && (
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Today's Meals</h2>
                        <div className="flex flex-col gap-2">
                            {meals.map((meal, index) => (
                                <div key={index} style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{meal.mealName}</div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray">
                                        <div>Calories: {Math.round(meal.calories)}</div>
                                        <div>Protein: {Math.round(meal.proteinGrams)}g</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Today;
