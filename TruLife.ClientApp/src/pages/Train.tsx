import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateWorkout, createWorkoutSession, getEnvironments, createEnvironment, deleteEnvironment } from '../services/api';

interface Environment {
    id: number;
    name: string;
    photoUrl?: string;
    availableEquipment: string;
    createdAt: string;
}

const Train = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'individual' | 'teamwork'>('individual');
    const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<number | null>(null);
    const [customPrompt, setCustomPrompt] = useState('');

    // Location creation state
    const [showLocationForm, setShowLocationForm] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');
    const [newLocationImage, setNewLocationImage] = useState<string | null>(null);
    const [analyzedEquipment, setAnalyzedEquipment] = useState<string[]>([]);
    const [analyzingImage, setAnalyzingImage] = useState(false);

    useEffect(() => {
        loadEnvironments();
    }, []);

    const loadEnvironments = async () => {
        try {
            const response = await getEnvironments();
            setEnvironments(response.data);
            if (response.data.length > 0 && !selectedEnvironmentId) {
                setSelectedEnvironmentId(response.data[0].id);
            }
        } catch (error) {
            console.error('Error loading environments:', error);
        }
    };

    const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAnalyzingImage(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const base64Image = base64.split(',')[1];
                setNewLocationImage(base64Image);

                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/workout/analyze-equipment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ base64Image })
                    });

                    const data = await response.json();
                    const equipment = JSON.parse(data.equipment);
                    setAnalyzedEquipment(equipment);
                } catch (error) {
                    console.error('Error analyzing equipment:', error);
                    alert('Failed to analyze equipment. You can still save the location manually.');
                } finally {
                    setAnalyzingImage(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error reading file:', error);
            setAnalyzingImage(false);
        }
    };

    const handleSaveLocation = async () => {
        if (!newLocationName.trim()) {
            alert('Please enter a location name');
            return;
        }

        setLoading(true);
        try {
            await createEnvironment({
                name: newLocationName,
                base64Image: newLocationImage || undefined,
                manualEquipment: analyzedEquipment.length > 0 ? JSON.stringify(analyzedEquipment) : undefined
            });

            // Reset form
            setShowLocationForm(false);
            setNewLocationName('');
            setNewLocationImage(null);
            setAnalyzedEquipment([]);

            // Reload environments
            await loadEnvironments();
            alert('Location saved successfully!');
        } catch (error) {
            console.error('Error saving location:', error);
            alert('Failed to save location. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLocation = async (id: number) => {
        if (!confirm('Are you sure you want to delete this location?')) return;

        try {
            await deleteEnvironment(id);
            await loadEnvironments();
            if (selectedEnvironmentId === id) {
                setSelectedEnvironmentId(null);
            }
        } catch (error) {
            console.error('Error deleting location:', error);
            alert('Failed to delete location.');
        }
    };

    const handleGenerateWorkout = async () => {
        if (!selectedEnvironmentId) {
            alert('Please select a location first');
            return;
        }

        setLoading(true);
        try {
            const response = await generateWorkout({
                fitnessGoal: 'General Fitness',
                environmentId: selectedEnvironmentId,
                useReadinessScore: true,
                customPrompt: customPrompt || undefined
            });

            let workoutJson = response.data.workout;
            if (workoutJson.startsWith('```')) {
                workoutJson = workoutJson.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            }

            const workoutData = JSON.parse(workoutJson);
            setGeneratedWorkout(workoutData);
        } catch (error) {
            console.error('Error generating workout:', error);
            alert('Failed to generate workout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveWorkout = async () => {
        if (!generatedWorkout) return;

        try {
            await createWorkoutSession({
                name: generatedWorkout.workoutName,
                scheduledDate: new Date().toISOString(),
                workoutData: JSON.stringify(generatedWorkout)
            });

            alert('Workout saved successfully!');
            setGeneratedWorkout(null);
        } catch (error) {
            console.error('Error saving workout:', error);
            alert('Failed to save workout. Please try again.');
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Train 💪</h1>
                <p className="text-gray">AI-powered workouts tailored to you</p>
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
                            className={`btn ${mode === 'teamwork' ? 'btn-secondary' : 'btn-outline'} flex-1`}
                            onClick={() => setMode('teamwork')}
                        >
                            Teamwork Mode
                        </button>
                    </div>
                </div>

                {mode === 'individual' ? (
                    <>
                        {/* Location Management */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📍 Your Locations</h2>
                            <p className="text-gray mb-3">
                                Define your workout locations by taking photos. AI will detect available equipment.
                            </p>

                            {environments.length === 0 && !showLocationForm && (
                                <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '8px' }}>
                                    <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                                        You haven't added any locations yet. Add your first location to get started!
                                    </p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowLocationForm(true)}
                                    >
                                        + Add First Location
                                    </button>
                                </div>
                            )}

                            {environments.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    {environments.map((env) => (
                                        <div key={env.id} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{env.name}</div>
                                                <div className="text-gray text-sm">
                                                    {JSON.parse(env.availableEquipment || '[]').length} items detected
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                onClick={() => handleDeleteLocation(env.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className="btn btn-outline w-full"
                                        onClick={() => setShowLocationForm(true)}
                                        disabled={showLocationForm}
                                    >
                                        + Add Another Location
                                    </button>
                                </div>
                            )}

                            {showLocationForm && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Add New Location</h3>

                                    <div className="form-group">
                                        <label className="label">Location Name</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g., Home Gym, Park, Office"
                                            value={newLocationName}
                                            onChange={(e) => setNewLocationName(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="label">Take/Upload Photo</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            style={{ display: 'none' }}
                                            id="location-camera"
                                            onChange={handleImageCapture}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-outline flex-1"
                                                onClick={() => document.getElementById('location-camera')?.click()}
                                                disabled={analyzingImage}
                                            >
                                                📷 {analyzingImage ? 'Analyzing...' : 'Take Photo'}
                                            </button>
                                        </div>
                                    </div>

                                    {analyzedEquipment.length > 0 && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'white', borderRadius: '8px' }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#166534' }}>✅ Detected Equipment:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {analyzedEquipment.map((item, index) => (
                                                    <span key={index} style={{ padding: '0.25rem 0.75rem', background: '#f0fdf4', borderRadius: '16px', fontSize: '0.875rem', border: '1px solid #86efac' }}>
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                                        <button
                                            className="btn btn-primary flex-1"
                                            onClick={handleSaveLocation}
                                            disabled={loading || !newLocationName.trim()}
                                        >
                                            Save Location
                                        </button>
                                        <button
                                            className="btn btn-outline flex-1"
                                            onClick={() => {
                                                setShowLocationForm(false);
                                                setNewLocationName('');
                                                setNewLocationImage(null);
                                                setAnalyzedEquipment([]);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Generate Workout - Only show if locations exist */}
                        {environments.length > 0 && (
                            <div className="card">
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🤖 AI Expert Workout</h2>
                                <p className="text-gray mb-4">
                                    Generate a science-backed workout for your selected location.
                                </p>

                                <div className="form-group">
                                    <label className="label">Select Location</label>
                                    <select
                                        className="input"
                                        value={selectedEnvironmentId || ''}
                                        onChange={(e) => setSelectedEnvironmentId(Number(e.target.value))}
                                    >
                                        {environments.map((env) => (
                                            <option key={env.id} value={env.id}>
                                                {env.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="label">Workout Description (Optional)</label>
                                    <textarea
                                        className="input"
                                        placeholder="e.g., 10 minute a day workout for three days a week"
                                        rows={2}
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                    />
                                </div>

                                <button
                                    className="btn btn-primary w-full"
                                    onClick={handleGenerateWorkout}
                                    disabled={loading || !selectedEnvironmentId}
                                >
                                    {loading ? 'Creating Expert Plan...' : 'Generate Expert Workout'}
                                </button>
                            </div>
                        )}

                        {/* Generated Workout Display */}
                        {generatedWorkout && (
                            <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{generatedWorkout.workoutName}</h2>
                                <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
                                    Duration: {generatedWorkout.durationMinutes} minutes
                                </p>

                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Warmup</h3>
                                    <p style={{ opacity: 0.9 }}>{generatedWorkout.warmup}</p>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Exercises</h3>
                                    {generatedWorkout.exercises?.map((exercise: any, index: number) => (
                                        <div key={index} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{exercise.name}</div>
                                            <div style={{ opacity: 0.9, marginTop: '0.25rem' }}>
                                                {exercise.sets} sets × {exercise.reps} reps | Rest: {exercise.restSeconds}s
                                            </div>
                                            <div style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                                {exercise.muscleGroup} | {exercise.equipment}
                                            </div>
                                            {exercise.notes && (
                                                <div style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                                    💡 {exercise.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Cooldown</h3>
                                    <p style={{ opacity: 0.9 }}>{generatedWorkout.cooldown}</p>
                                </div>

                                <button className="btn w-full" style={{ background: 'white', color: '#6366f1' }} onClick={handleSaveWorkout}>
                                    💾 Save Workout
                                </button>
                            </div>
                        )}

                        {/* Training Tips */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Training Tips</h2>
                            <div className="flex flex-col gap-2">
                                <div style={{ padding: '0.75rem', background: '#f3f4f6', borderRadius: '8px' }}>
                                    <div style={{ fontWeight: 600 }}>📊 Track Readiness</div>
                                    <div className="text-gray text-sm">Log daily readiness for optimized workout intensity</div>
                                </div>
                                <div style={{ padding: '0.75rem', background: '#f3f4f6', borderRadius: '8px' }}>
                                    <div style={{ fontWeight: 600 }}>🎯 Set Goals</div>
                                    <div className="text-gray text-sm">Define your fitness goals in your profile for better recommendations</div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Teamwork Training</h2>
                        <p className="text-gray mb-3">
                            Work out together, compete in challenges, or support each other's fitness goals!
                        </p>
                        <div className="flex flex-col gap-2">
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate('/teamwork')}
                            >
                                🤝 Shared Workout Challenge
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => alert('View your partner\'s/teammate\'s workout history and progress! Feature coming soon 💪')}
                            >
                                View Teammate's Workouts
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => alert('Create a shared training program you can both follow! Feature coming soon 🏋️')}
                            >
                                Shared Training Program
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Train;
