import { useState } from 'react';

interface DNAFocusedMeal {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    ingredients: string[];
    prepTime: string;
    instructions: string;
    geneticRationale: string;
}

interface DNAFocusedMealsProps {
    geneticProfile?: any;
}

export default function DNAFocusedMeals({ geneticProfile }: DNAFocusedMealsProps) {
    const [meals, setMeals] = useState<DNAFocusedMeal[]>([]);
    const [generating, setGenerating] = useState(false);
    const [selectedTrait, setSelectedTrait] = useState('');

    const geneticTraits = [
        { value: 'metabolism', label: 'Metabolism', emoji: '🔥', description: 'Fast/slow metabolism' },
        { value: 'carb_sensitivity', label: 'Carb Sensitivity', emoji: '🍞', description: 'How you process carbs' },
        { value: 'fat_metabolism', label: 'Fat Metabolism', emoji: '🥑', description: 'Fat processing efficiency' },
        { value: 'lactose', label: 'Lactose Tolerance', emoji: '🥛', description: 'Dairy digestion' },
        { value: 'caffeine', label: 'Caffeine Metabolism', emoji: '☕', description: 'Caffeine processing' },
        { value: 'vitamin_d', label: 'Vitamin D Absorption', emoji: '☀️', description: 'Vitamin D needs' },
    ];

    const generateMeals = async () => {
        if (!selectedTrait) return;

        setGenerating(true);
        try {
            // In production, this would call the AI service with genetic profile
            // For now, we'll simulate the generation
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Sample data based on selected trait
            const sampleMeals: DNAFocusedMeal[] = [
                {
                    name: 'Genetically Optimized Power Bowl',
                    calories: 520,
                    protein: 38,
                    carbs: 45,
                    fats: 22,
                    ingredients: ['Grilled chicken', 'Quinoa', 'Avocado', 'Spinach', 'Olive oil', 'Lemon'],
                    prepTime: '25 minutes',
                    instructions: 'Grill chicken, cook quinoa, assemble bowl with fresh vegetables and healthy fats.',
                    geneticRationale: `Based on your ${selectedTrait} genetic profile, this meal is optimized for your body's unique needs. The balanced macros support your genetic predisposition.`
                },
                {
                    name: 'DNA-Tailored Salmon Plate',
                    calories: 480,
                    protein: 42,
                    carbs: 35,
                    fats: 20,
                    ingredients: ['Wild salmon', 'Sweet potato', 'Broccoli', 'Almonds'],
                    prepTime: '30 minutes',
                    instructions: 'Bake salmon and sweet potato, steam broccoli, garnish with almonds.',
                    geneticRationale: `Your genetic markers suggest enhanced benefits from omega-3 fatty acids and complex carbohydrates in this combination.`
                }
            ];

            setMeals(sampleMeals);
        } catch (err) {
            console.error('Failed to generate meals:', err);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="card">
            <div style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px 12px 0 0', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🧬 DNA-Focused Meals</h2>
                <p style={{ opacity: 0.9 }}>Meals optimized for your genetic profile</p>
            </div>

            <div style={{ padding: '0 1.5rem 1.5rem' }}>
                {/* Genetic Trait Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>
                        Select Genetic Trait to Optimize
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {geneticTraits.map(trait => (
                            <button
                                key={trait.value}
                                onClick={() => setSelectedTrait(trait.value)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${selectedTrait === trait.value ? '#a78bfa' : '#e5e7eb'}`,
                                    background: selectedTrait === trait.value ? '#f3e8ff' : 'white',
                                    textAlign: 'left',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{trait.emoji}</div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{trait.label}</div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{trait.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    className="btn btn-primary w-full"
                    onClick={generateMeals}
                    disabled={!selectedTrait || generating}
                    style={{ marginBottom: '1.5rem' }}
                >
                    {generating ? '🧬 Generating DNA-Optimized Meals...' : '🧬 Generate Meals'}
                </button>

                {/* Generated Meals */}
                {meals.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {meals.map((meal, idx) => (
                            <div key={idx} style={{ background: '#f3e8ff', borderRadius: '12px', padding: '1.5rem', border: '2px solid #a78bfa' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#7c3aed' }}>
                                    {meal.name}
                                </h4>

                                {/* Macros */}
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    <span><strong>{meal.calories}</strong> cal</span>
                                    <span><strong>{meal.protein}g</strong> protein</span>
                                    <span><strong>{meal.carbs}g</strong> carbs</span>
                                    <span><strong>{meal.fats}g</strong> fat</span>
                                </div>

                                {/* Genetic Rationale */}
                                <div style={{ background: 'white', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#7c3aed' }}>🧬 Genetic Optimization:</div>
                                    <p style={{ fontSize: '0.9rem', color: '#374151', margin: 0 }}>{meal.geneticRationale}</p>
                                </div>

                                {/* Ingredients */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ingredients:</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {meal.ingredients.map((ing, i) => (
                                            <span key={i} style={{ background: 'white', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Prep Time & Instructions */}
                                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                    <div><strong>Prep Time:</strong> {meal.prepTime}</div>
                                    <div style={{ marginTop: '0.5rem' }}><strong>Instructions:</strong> {meal.instructions}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                <div style={{ background: '#ede9fe', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#5b21b6', margin: 0 }}>
                        <strong>💡 How it works:</strong> Upload your DNA results in the DNA page, then generate meals specifically designed to work with your unique genetic makeup for optimal nutrition and performance.
                    </p>
                </div>
            </div>
        </div>
    );
}
