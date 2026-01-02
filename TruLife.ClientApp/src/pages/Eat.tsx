import { useState, useEffect } from 'react';
import { getCurrentMacros, getTodaysMeals, analyzeMeal, logMeal, getProfile } from '../services/api';
import DietaryPreferences from '../components/DietaryPreferences';
import MealRecommendations from '../components/MealRecommendations';
import LabFocusedMeals from '../components/LabFocusedMeals';
import HydrationTracker from '../components/HydrationTracker';
import MacroCalculator from '../components/MacroCalculator';
import DNAFocusedMeals from '../components/DNAFocusedMeals';
import RestaurantFinder from '../components/RestaurantFinder';

const Eat = () => {
    const [mode, setMode] = useState<'individual' | 'couples'>('individual');
    const [macros, setMacros] = useState<any>(null);
    const [meals, setMeals] = useState<any[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [dietaryPreference, setDietaryPreference] = useState<string>('none');

    useEffect(() => {
        fetchData();
        loadProfilePreferences();
    }, []);

    const loadProfilePreferences = async () => {
        try {
            const response = await getProfile();
            if (response.data.dietaryPreferences) {
                // Use first preference if multiple are listed
                const firstPref = response.data.dietaryPreferences.split(',')[0].trim().toLowerCase();
                setDietaryPreference(firstPref);
            }
        } catch (error) {
            console.error('Error loading profile preferences:', error);
        }
    };

    const fetchData = async () => {
        try {
            const [macrosRes, mealsRes] = await Promise.allSettled([
                getCurrentMacros(),
                getTodaysMeals()
            ]);

            if (macrosRes.status === 'fulfilled') {
                setMacros(macrosRes.value.data);
            }

            if (mealsRes.status === 'fulfilled') {
                setMeals(mealsRes.value.data.meals || []);
            }
        } catch (error) {
            console.error('Error fetching nutrition data:', error);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAnalyzing(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const response = await analyzeMeal(base64);

                const analysis = response.data;

                // Auto-log the meal
                await logMeal({
                    mealName: analysis.mealName,
                    calories: analysis.calories,
                    proteinGrams: analysis.protein,
                    carbsGrams: analysis.carbs,
                    fatsGrams: analysis.fats
                });

                await fetchData();
                alert(`Meal logged: ${analysis.mealName}`);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error analyzing meal:', error);
            alert('Failed to analyze meal. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const totals = meals.reduce(
        (acc, meal) => ({
            calories: acc.calories + meal.calories,
            protein: acc.protein + meal.proteinGrams,
            carbs: acc.carbs + meal.carbsGrams,
            fats: acc.fats + meal.fatsGrams
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const remaining = macros
        ? {
            calories: macros.dailyCalories - totals.calories,
            protein: macros.proteinGrams - totals.protein,
            carbs: macros.carbsGrams - totals.carbs,
            fats: macros.fatsGrams - totals.fats
        }
        : null;

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Eat 🍽️</h1>
                <p className="text-gray">Track your nutrition with AI</p>
            </div>

            <div className="container">
                {/* Mode Toggle */}
                <div className="card">
                    <div className="flex gap-2">
                        <button
                            className={`btn ${mode === 'individual' ? 'btn-primary' : 'btn-outline'} flex-1`}
                            onClick={() => setMode('individual')}
                        >
                            Individual Mode
                        </button>
                        <button
                            className={`btn ${mode === 'couples' ? 'btn-secondary' : 'btn-outline'} flex-1`}
                            onClick={() => setMode('couples')}
                        >
                            Couples Mode
                        </button>
                    </div>
                </div>

                {mode === 'individual' ? (
                    <>
                        {/* 1. Dietary Preferences */}
                        <DietaryPreferences
                            currentPreference={dietaryPreference}
                            onSelect={setDietaryPreference}
                        />

                        {/* 2. Today's Macros */}
                        {macros && (
                            <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Today's Macros</h2>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Calories</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                            {Math.round(totals.calories)} / {Math.round(macros.dailyCalories)}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                                            {remaining && Math.round(remaining.calories)} remaining
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Protein</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                            {Math.round(totals.protein)}g / {Math.round(macros.proteinGrams)}g
                                        </div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                                            {remaining && Math.round(remaining.protein)}g remaining
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Carbs</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                            {Math.round(totals.carbs)}g / {Math.round(macros.carbsGrams)}g
                                        </div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                                            {remaining && Math.round(remaining.carbs)}g remaining
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Fats</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                            {Math.round(totals.fats)}g / {Math.round(macros.fatsGrams)}g
                                        </div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                                            {remaining && Math.round(remaining.fats)}g remaining
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Macro Calculator */}
                        {!macros && (
                            <MacroCalculator onCalculated={() => window.location.reload()} />
                        )}

                        {/* 4. Today's Meals */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Today's Meals</h2>
                            {meals.length === 0 ? (
                                <p className="text-gray">No meals logged yet. Start by taking a photo!</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {meals.map((meal, index) => (
                                        <div key={index} style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{meal.mealName}</div>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray">
                                                <div>Calories: {Math.round(meal.calories)}</div>
                                                <div>Protein: {Math.round(meal.proteinGrams)}g</div>
                                                <div>Carbs: {Math.round(meal.carbsGrams)}g</div>
                                                <div>Fats: {Math.round(meal.fatsGrams)}g</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 5. AI Meal Recommendations */}
                        <MealRecommendations
                            remainingMacros={remaining || { calories: 0, protein: 0, carbs: 0, fats: 0 }}
                            dietaryPreference={dietaryPreference}
                        />

                        {/* 6. Restaurant Finder */}
                        <RestaurantFinder
                            targetCalories={remaining?.calories || 600}
                            targetProtein={remaining?.protein || 30}
                            dietaryPreference={dietaryPreference}
                        />

                        {/* 7. Photo Upload */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📸 Log Meal with AI</h2>
                            <p className="text-gray mb-3">
                                Take a photo of your meal and get instant macro estimates!
                            </p>
                            <label className="btn btn-primary w-full" style={{ cursor: 'pointer' }}>
                                {analyzing ? 'Analyzing...' : '📷 Take Photo'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handlePhotoUpload}
                                    style={{ display: 'none' }}
                                    disabled={analyzing}
                                />
                            </label>
                        </div>

                        {/* 8. Hydration Tracker */}
                        <HydrationTracker />

                        {/* 9. DNA-Focused Foods */}
                        <DNAFocusedMeals />

                        {/* 10. Lab-Focused Foods */}
                        <LabFocusedMeals />
                    </>
                ) : (
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Couples Nutrition</h2>
                        <p className="text-gray mb-3">
                            Share meals, create nutrition challenges, or plan romantic dinners together!
                        </p>
                        <div className="flex flex-col gap-2">
                            <button
                                className="btn btn-secondary"
                                onClick={() => window.location.href = '/couples'}
                            >
                                💑 Plan Romantic Dinner
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => window.location.href = '/couples'}
                            >
                                Create Nutrition Challenge
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => alert('View your partner\'s meal history and nutrition stats! Feature coming soon 🍽️')}
                            >
                                View Partner's Meals
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Eat;
