import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { getApiUrl } from '../services/api';

const DIETARY_PREFERENCES = [
    { value: 'none', label: 'No Restrictions', description: 'Standard balanced diet', emoji: '🍽️' },
    { value: 'carnivore', label: 'Carnivore', description: 'Meat, eggs, dairy only', emoji: '🥩' },
    { value: 'keto', label: 'Keto', description: 'Very low carb, high fat', emoji: '🥑' },
    { value: 'low_carb', label: 'Low Carb', description: 'Reduced carbohydrate intake', emoji: '🥗' },
    { value: 'vegan', label: 'Vegan', description: 'No animal products', emoji: '🌱' },
    { value: 'vegetarian', label: 'Vegetarian', description: 'No meat, fish allowed', emoji: '🥕' },
    { value: 'pescatarian', label: 'Pescatarian', description: 'Fish and seafood allowed', emoji: '🐟' },
    { value: 'paleo', label: 'Paleo', description: 'No processed foods, grains, dairy', emoji: '🦴' },
    { value: 'mediterranean', label: 'Mediterranean', description: 'Heart-healthy, olive oil based', emoji: '🫒' },
    { value: 'gluten_free', label: 'Gluten Free', description: 'No wheat, barley, rye', emoji: '🌾' },
];

interface DietaryPreferencesProps {
    currentPreference?: string;
    onSelect: (preference: string) => void;
}

export default function DietaryPreferences({ currentPreference = 'none', onSelect }: DietaryPreferencesProps) {
    const [selected, setSelected] = useState(currentPreference);
    const [saving, setSaving] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        setSelected(currentPreference);
    }, [currentPreference]);

    const handleSelect = async (value: string) => {
        setSelected(value);
        setSaving(true);

        try {
            // Update profile with dietary preference
            const response = await fetch(getApiUrl('/api/profile'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ dietaryPreferences: value })
            });

            if (response.ok) {
                onSelect(value);
            }
        } catch (err) {
            console.error('Failed to update dietary preference:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dietary-preferences">
            <div className="card">
                <div
                    className="card-header"
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3>🍴 Dietary Preferences</h3>
                            <p className="text-sm text-gray-600">
                                Current: {DIETARY_PREFERENCES.find(p => p.value === selected)?.label || 'None'}
                            </p>
                        </div>
                        <span>{isExpanded ? '▼' : '▶'}</span>
                    </div>
                </div>

                {isExpanded && (
                    <div className="card-content">
                        <div className="grid gap-3">
                            {DIETARY_PREFERENCES.map(pref => (
                                <button
                                    key={pref.value}
                                    className={`preference-card ${selected === pref.value ? 'selected' : ''}`}
                                    onClick={() => handleSelect(pref.value)}
                                    disabled={saving}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-3xl">{pref.emoji}</span>
                                        <div className="flex-1 text-left">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold">{pref.label}</h4>
                                                {selected === pref.value && (
                                                    <Check size={16} className="text-green-600" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{pref.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {saving && (
                            <div className="mt-4 text-center">
                                <div className="spinner inline-block"></div>
                                <p className="text-sm text-gray-600 mt-2">Saving preference...</p>
                            </div>
                        )}

                        <div className="mt-4 bg-blue-50 rounded-lg p-3">
                            <p className="text-sm text-blue-900">
                                <strong>💡 Note:</strong> Your dietary preference will be used to generate
                                personalized meal recommendations and filter restaurant suggestions.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .preference-card {
          @apply w-full p-4 rounded-lg border-2 border-gray-200 hover:border-primary transition-all;
          @apply bg-white hover:bg-gray-50;
        }
        
        .preference-card.selected {
          @apply border-primary bg-primary/5;
        }
        
        .preference-card:disabled {
          @apply opacity-50 cursor-not-allowed;
        }
      `}</style>
        </div>
    );
}
