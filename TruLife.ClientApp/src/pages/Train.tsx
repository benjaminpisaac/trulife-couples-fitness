import { useState } from 'react';
import { generateWorkout, createWorkoutSession } from '../services/api';

const Train = () => {
    const [mode, setMode] = useState<'individual' | 'couples'>('individual');
    const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerateWorkout = async () => {
        setLoading(true);
        try {
            const response = await generateWorkout({
                fitnessGoal: 'General Fitness',
                useReadinessScore: true
            });

            const workoutData = JSON.parse(response.data.workout);
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
                            className={`btn ${mode === 'couples' ? 'btn-secondary' : 'btn-outline'} flex-1`}
                            onClick={() => setMode('couples')}
                        >
                            Couples Mode
                        </button>
                    </div>
                </div>

                {mode === 'individual' ? (
                    <>
                        {/* Generate Workout */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Generate AI Workout</h2>
                            <p className="text-gray mb-3">
                                Get a personalized workout based on your readiness score and available equipment.
                            </p>
                            <button
                                className="btn btn-primary w-full"
                                onClick={handleGenerateWorkout}
                                disabled={loading}
                            >
                                {loading ? 'Generating...' : '🤖 Generate Workout'}
                            </button>
                        </div>

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

                        {/* Quick Tips */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Training Tips</h2>
                            <div className="flex flex-col gap-2">
                                <div style={{ padding: '0.75rem', background: '#f3f4f6', borderRadius: '8px' }}>
                                    <div style={{ fontWeight: 600 }}>📸 Scan Your Gym</div>
                                    <div className="text-gray text-sm">Take a photo of your gym to detect available equipment</div>
                                </div>
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
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Couples Training</h2>
                        <p className="text-gray mb-3">
                            Work out together, compete in challenges, or support each other's fitness goals!
                        </p>
                        <div className="flex flex-col gap-2">
                            <button className="btn btn-secondary">Create Workout Challenge</button>
                            <button className="btn btn-outline">View Partner's Workouts</button>
                            <button className="btn btn-outline">Shared Training Program</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Train;
