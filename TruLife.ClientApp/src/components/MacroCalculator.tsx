import { useState } from 'react';
import { calculateMacros } from '../services/api';

interface MacroCalculatorProps {
    onCalculated?: (macros: any) => void;
}

export default function MacroCalculator({ onCalculated }: MacroCalculatorProps) {
    const [currentWeightKg, setCurrentWeightKg] = useState(70);
    const [targetWeightKg, setTargetWeightKg] = useState(65);
    const [fitnessGoal, setFitnessGoal] = useState('Weight Loss');
    const [activityLevel, setActivityLevel] = useState('Moderately Active');
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState<any>(null);

    const goals = ['Weight Loss', 'Muscle Gain', 'Maintenance'];
    const activityLevels = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'];

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCalculating(true);

        try {
            const response = await calculateMacros({
                currentWeightKg,
                targetWeightKg,
                fitnessGoal,
                activityLevel
            });

            setResult(response.data);
            if (onCalculated) onCalculated(response.data);
            alert('Macros calculated and saved successfully!');
        } catch (error) {
            console.error('Error calculating macros:', error);
            alert('Failed to calculate macros. Please try again.');
        } finally {
            setCalculating(false);
        }
    };

    return (
        <div className="card">
            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px 12px 0 0', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊 Macro Calculator</h2>
                <p style={{ opacity: 0.9 }}>Calculate your personalized daily macros</p>
            </div>

            <form onSubmit={handleCalculate} style={{ padding: '0 1.5rem 1.5rem' }}>
                {/* Current Weight */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                        Current Weight (kg)
                    </label>
                    <input
                        type="number"
                        min="30"
                        max="300"
                        step="0.1"
                        value={currentWeightKg}
                        onChange={(e) => setCurrentWeightKg(parseFloat(e.target.value))}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '1rem' }}
                        required
                    />
                </div>

                {/* Target Weight */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                        Target Weight (kg)
                    </label>
                    <input
                        type="number"
                        min="30"
                        max="300"
                        step="0.1"
                        value={targetWeightKg}
                        onChange={(e) => setTargetWeightKg(parseFloat(e.target.value))}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '1rem' }}
                        required
                    />
                </div>

                {/* Fitness Goal */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                        Fitness Goal
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {goals.map(goal => (
                            <button
                                key={goal}
                                type="button"
                                onClick={() => setFitnessGoal(goal)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${fitnessGoal === goal ? '#f5576c' : '#e5e7eb'}`,
                                    background: fitnessGoal === goal ? '#fef3f2' : 'white',
                                    fontWeight: fitnessGoal === goal ? 600 : 400,
                                    cursor: 'pointer'
                                }}
                            >
                                {goal}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Activity Level */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                        Activity Level
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        {activityLevels.map(level => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => setActivityLevel(level)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${activityLevel === level ? '#f5576c' : '#e5e7eb'}`,
                                    background: activityLevel === level ? '#fef3f2' : 'white',
                                    fontWeight: activityLevel === level ? 600 : 400,
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Calculate Button */}
                <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={calculating}
                    style={{ fontSize: '1.1rem', padding: '1rem', marginBottom: '1rem' }}
                >
                    {calculating ? 'Calculating...' : '🎯 Calculate My Macros'}
                </button>

                {/* Results */}
                {result && (
                    <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', padding: '1.5rem', marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#166534' }}>
                            Your Daily Macros
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                                    {Math.round(result.dailyCalories)}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#166534' }}>Calories</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                                    {Math.round(result.proteinGrams)}g
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#166534' }}>Protein</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                                    {Math.round(result.carbsGrams)}g
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#166534' }}>Carbs</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                                    {Math.round(result.fatsGrams)}g
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#166534' }}>Fats</div>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
