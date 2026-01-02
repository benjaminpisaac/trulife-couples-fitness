import React, { useState, useEffect } from 'react';
import { ChefHat, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../services/api';

interface MealRecommendation {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    ingredients: string[];
    prepTime: string;
    instructions: string;
}

interface MealRecommendationsProps {
    remainingMacros?: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
    dietaryPreference?: string;
}

export default function MealRecommendations({
    remainingMacros = { calories: 600, protein: 30, carbs: 60, fats: 20 },
    dietaryPreference = 'none'
}: MealRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<MealRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<MealRecommendation | null>(null);

    useEffect(() => {
        generateRecommendations();
    }, []);

    const generateRecommendations = async () => {
        setLoading(true);
        try {
            const response = await fetch(getApiUrl('/api/nutrition/recommendations'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    remainingCalories: remainingMacros.calories,
                    remainingProtein: remainingMacros.protein,
                    remainingCarbs: remainingMacros.carbs,
                    remainingFats: remainingMacros.fats,
                    dietaryPreferences: dietaryPreference
                })
            });

            if (response.ok) {
                const data = await response.json();
                setRecommendations(data.recommendations || []);
            }
        } catch (err) {
            console.error('Failed to generate recommendations:', err);
            // Fallback sample data
            setRecommendations([
                {
                    name: 'Grilled Chicken & Quinoa Bowl',
                    calories: 580,
                    protein: 45,
                    carbs: 55,
                    fats: 18,
                    ingredients: ['Chicken breast', 'Quinoa', 'Broccoli', 'Olive oil', 'Lemon'],
                    prepTime: '30 minutes',
                    instructions: 'Grill chicken, cook quinoa, steam broccoli, drizzle with olive oil and lemon.'
                },
                {
                    name: 'Salmon with Sweet Potato',
                    calories: 620,
                    protein: 38,
                    carbs: 48,
                    fats: 28,
                    ingredients: ['Salmon fillet', 'Sweet potato', 'Asparagus', 'Butter', 'Garlic'],
                    prepTime: '35 minutes',
                    instructions: 'Bake salmon and sweet potato, sauté asparagus with garlic butter.'
                },
                {
                    name: 'Turkey & Avocado Wrap',
                    calories: 550,
                    protein: 35,
                    carbs: 45,
                    fats: 22,
                    ingredients: ['Turkey breast', 'Whole wheat wrap', 'Avocado', 'Lettuce', 'Tomato'],
                    prepTime: '10 minutes',
                    instructions: 'Assemble wrap with sliced turkey, avocado, and fresh vegetables.'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const logMeal = async (meal: MealRecommendation) => {
        try {
            const response = await fetch(getApiUrl('/api/nutrition/meals'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    mealName: meal.name,
                    calories: meal.calories,
                    proteinGrams: meal.protein,
                    carbsGrams: meal.carbs,
                    fatsGrams: meal.fats
                })
            });

            if (response.ok) {
                alert(`${meal.name} logged successfully!`);
            }
        } catch (err) {
            console.error('Failed to log meal:', err);
        }
    };

    if (loading) {
        return <div className="text-center py-8"><div className="spinner"></div></div>;
    }

    return (
        <div className="meal-recommendations">
            <div className="card">
                <div className="card-header">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="flex items-center gap-2">
                                <ChefHat className="text-orange-500" size={24} />
                                AI Meal Recommendations
                            </h3>
                            <p className="text-sm text-gray-600">
                                Based on your remaining macros: {remainingMacros.calories} cal,
                                {remainingMacros.protein}g protein
                            </p>
                        </div>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={generateRecommendations}
                            disabled={loading}
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                <div className="card-content">
                    <div className="grid gap-4">
                        {recommendations.map((meal, idx) => (
                            <div key={idx} className="card bg-orange-50 hover:shadow-lg transition-shadow">
                                <div className="card-content">
                                    <h4 className="font-semibold text-lg mb-2">{meal.name}</h4>

                                    {/* Macros */}
                                    <div className="flex gap-4 text-sm mb-3">
                                        <span className="badge">{meal.calories} cal</span>
                                        <span className="badge">{meal.protein}g P</span>
                                        <span className="badge">{meal.carbs}g C</span>
                                        <span className="badge">{meal.fats}g F</span>
                                    </div>

                                    {/* Prep Time */}
                                    <p className="text-sm text-gray-600 mb-2">
                                        ⏱️ {meal.prepTime}
                                    </p>

                                    {/* Ingredients */}
                                    <div className="mb-3">
                                        <p className="text-sm font-medium mb-1">Ingredients:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {meal.ingredients.map((ing, i) => (
                                                <span key={i} className="text-xs bg-white px-2 py-1 rounded">
                                                    {ing}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-sm btn-primary flex-1"
                                            onClick={() => setSelectedMeal(meal)}
                                        >
                                            View Recipe
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline flex-1"
                                            onClick={() => logMeal(meal)}
                                        >
                                            Log Meal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recipe Modal */}
            {selectedMeal && (
                <div className="modal-overlay" onClick={() => setSelectedMeal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">{selectedMeal.name}</h3>

                        <div className="space-y-4">
                            {/* Macros */}
                            <div className="flex gap-4">
                                <div className="stat-box">
                                    <p className="text-2xl font-bold">{selectedMeal.calories}</p>
                                    <p className="text-xs text-gray-600">Calories</p>
                                </div>
                                <div className="stat-box">
                                    <p className="text-2xl font-bold">{selectedMeal.protein}g</p>
                                    <p className="text-xs text-gray-600">Protein</p>
                                </div>
                                <div className="stat-box">
                                    <p className="text-2xl font-bold">{selectedMeal.carbs}g</p>
                                    <p className="text-xs text-gray-600">Carbs</p>
                                </div>
                                <div className="stat-box">
                                    <p className="text-2xl font-bold">{selectedMeal.fats}g</p>
                                    <p className="text-xs text-gray-600">Fats</p>
                                </div>
                            </div>

                            {/* Ingredients */}
                            <div>
                                <h4 className="font-semibold mb-2">Ingredients</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {selectedMeal.ingredients.map((ing, i) => (
                                        <li key={i} className="text-sm">{ing}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Instructions */}
                            <div>
                                <h4 className="font-semibold mb-2">Instructions</h4>
                                <p className="text-sm text-gray-700">{selectedMeal.instructions}</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    className="btn btn-primary flex-1"
                                    onClick={() => {
                                        logMeal(selectedMeal);
                                        setSelectedMeal(null);
                                    }}
                                >
                                    Log This Meal
                                </button>
                                <button
                                    className="btn btn-ghost flex-1"
                                    onClick={() => setSelectedMeal(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .stat-box {
          @apply flex-1 text-center p-3 bg-gray-50 rounded-lg;
        }
      `}</style>
        </div>
    );
}
