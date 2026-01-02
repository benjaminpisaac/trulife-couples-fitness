import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { getApiUrl } from '../services/api';

interface EquipmentAnalysisProps {
    onAnalysisComplete: (equipment: string[], spaceAssessment: string) => void;
}

export default function EquipmentAnalysis({ onAnalysisComplete }: EquipmentAnalysisProps) {
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAnalyzing(true);
        setError(null);

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const base64Data = base64.split(',')[1];

                // Call API
                const response = await fetch(getApiUrl('/api/equipment/analyze'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ base64Image: base64Data })
                });

                if (!response.ok) throw new Error('Analysis failed');

                const data = await response.json();
                onAnalysisComplete(data.detectedEquipment, data.spaceAssessment);
            };

            reader.readAsDataURL(file);
        } catch (err) {
            setError('Failed to analyze equipment. Please try again.');
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="equipment-analysis">
            <div className="card">
                <div className="card-header">
                    <h3>📸 Analyze Your Gym</h3>
                    <p className="text-sm text-gray-600">
                        Take a photo of your workout space and let AI detect available equipment
                    </p>
                </div>

                <div className="card-content">
                    <label className="upload-button">
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoUpload}
                            disabled={analyzing}
                            style={{ display: 'none' }}
                        />
                        <button
                            className="btn btn-primary w-full"
                            disabled={analyzing}
                            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                        >
                            <Camera size={20} />
                            {analyzing ? 'Analyzing...' : 'Take Photo'}
                        </button>
                    </label>

                    {error && (
                        <div className="alert alert-error mt-4">
                            {error}
                        </div>
                    )}

                    {analyzing && (
                        <div className="mt-4 text-center">
                            <div className="spinner"></div>
                            <p className="text-sm text-gray-600 mt-2">
                                AI is analyzing your gym equipment...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
