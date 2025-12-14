import React, { useState } from 'react';
import { Sparkles, Loader } from 'lucide-react';

interface LabFocusedMeal {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    ingredients: string[];
    prepTime: string;
    instructions: string;
    targetBiomarker: string;
    rationale: string;
}

interface LabFocusedMealsProps {
    labResults?: any; // Lab results from LabController
}

export default function LabFocusedMeals({ labResults }: LabFocusedMealsProps) {
    const [meals, setMeals] = useState<LabFocusedMeal[]>([]);
    const [generating, setGenerating] = useState(false);
    const [selectedBiomarker, setSelectedBiomarker] = useState('');

    const commonBiomarkers = [
        { value: 'cholesterol', label: 'High Cholesterol', emoji: '❤️' },
        { value: 'blood_sugar', label: 'Blood Sugar', emoji: '🩸' },
        { value: 'inflammation', label: 'Inflammation (CRP)', emoji: '🔥' },
        { value: 'vitamin_d', label: 'Low Vitamin D', emoji: '☀️' },
        { value: 'iron', label: 'Low Iron', emoji: '🧲' },
        { value: 'testosterone', label: 'Low Testosterone', emoji: '💪' },
        { value: 'thyroid', label: 'Thyroid (TSH)', emoji: '🦋' },
    ];

    const generateMeals = async () => {
        if (!selectedBiomarker) return;

        setGenerating(true);
        try {
            // In production, this would call the AI service with actual lab results
            // For now, we'll simulate the generation
            const response = await fetch('/api/nutrition/lab-focused-meals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    biomarker: selectedBiomarker,
                    labResults: labResults
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMeals(data.meals || []);
            }
        } catch (err) {
            console.error('Failed to generate meals:', err);
            // Fallback with sample data
            setMeals([
                {
                    name: 'Omega-3 Rich Salmon Bowl',
                    calories: 450,
                    protein: 35,
                    carbs: 40,
                    fats: 18,
                    ingredients: ['Wild salmon', 'Quinoa', 'Avocado', 'Spinach', 'Olive oil'],
                    prepTime: '25 minutes',
                    instructions: 'Grill salmon, cook quinoa, assemble bowl with fresh vegetables.',
                    targetBiomarker: selectedBiomarker,
                    rationale: 'High in omega-3 fatty acids to support heart health and reduce inflammation.'
                }
            ]);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="lab-focused-meals">
            <div className="card">
                <div className="card-header">
                    <h3 className="flex items-center gap-2">
                        <Sparkles className="text-purple-500" size={24} />
                        Lab-Focused Meals
                    </h3>
                    <p className="text-sm text-gray-600">
                        AI-generated meals tailored to your lab results
                    </p>
                </div>

                <div className="card-content space-y-4">
                    {/* Biomarker Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Select Biomarker to Target
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {commonBiomarkers.map(bio => (
                                <button
                                    key={bio.value}
                                    className={`p-3 rounded-lg border-2 transition-all ${selectedBiomarker === bio.value
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                    onClick={() => setSelectedBiomarker(bio.value)}
                                >
                                    <span className="text-2xl mr-2">{bio.emoji}</span>
                                    <span className="text-sm font-medium">{bio.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        className="btn btn-primary w-full"
                        onClick={generateMeals}
                        disabled={!selectedBiomarker || generating}
                    >
                        {generating ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                Generating Meals...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate Lab-Focused Meals
                            </>
                        )}
                    </button>

                    {/* Generated Meals */}
                    {meals.length > 0 && (
                        <div className="space-y-4 mt-4">
                            <h4 className="font-semibold">Recommended Meals</h4>
                            {meals.map((meal, idx) => (
                                <div key={idx} className="card bg-purple-50">
                                    <div className="card-content">
                                        <h5 className="font-semibold text-lg mb-2">{meal.name}</h5>

                                        {/* Macros */}
                                        <div className="flex gap-4 text-sm mb-3">
                                            <span><strong>{meal.calories}</strong> cal</span>
                                            <span><strong>{meal.protein}g</strong> protein</span>
                                            <span><strong>{meal.carbs}g</strong> carbs</span>
                                            <span><strong>{meal.fats}g</strong> fat</span>
                                        </div>

                                        {/* Rationale */}
                                        <div className="bg-white rounded p-3 mb-3">
                                            <p className="text-sm text-purple-900">
                                                <strong>Why this meal?</strong> {meal.rationale}
                                            </p>
                                        </div>

                                        {/* Ingredients */}
                                        <div className="mb-3">
                                            <p className="text-sm font-medium mb-1">Ingredients:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {meal.ingredients.map((ing, i) => (
                                                    <span key={i} className="badge badge-sm">
                                                        {ing}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Instructions */}
                                        <div>
                                            <p className="text-sm font-medium mb-1">
                                                Prep Time: {meal.prepTime}
                                            </p>
                                            <p className="text-sm text-gray-700">{meal.instructions}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-sm text-purple-900">
                            <strong>💡 How it works:</strong> Upload your lab results in the Labs page,
                            then generate meals specifically designed to improve your biomarkers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
