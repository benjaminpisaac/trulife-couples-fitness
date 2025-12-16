import { useState, useEffect } from 'react';

const Programs = () => {
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'my-programs' | 'browse'>('my-programs');

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            // In production, this would fetch from ProgramController
            await new Promise(resolve => setTimeout(resolve, 500));

            // Sample data
            setPrograms([
                {
                    id: 1,
                    name: 'Beginner Full Body',
                    description: '3-day full body workout for beginners',
                    duration: '8 weeks',
                    daysPerWeek: 3,
                    equipment: ['Dumbbells', 'Bench'],
                    difficulty: 'Beginner'
                },
                {
                    id: 2,
                    name: 'Advanced Push/Pull/Legs',
                    description: '6-day split for advanced lifters',
                    duration: '12 weeks',
                    daysPerWeek: 6,
                    equipment: ['Barbell', 'Dumbbells', 'Cable Machine'],
                    difficulty: 'Advanced'
                }
            ]);
        } catch (error) {
            console.error('Error fetching programs:', error);
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

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Programs 📋</h1>
                <p className="text-gray">Manage your workout programs</p>
            </div>

            <div className="container">
                {/* Tab Selection */}
                <div className="card">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        <button
                            onClick={() => setActiveTab('my-programs')}
                            style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                border: `2px solid ${activeTab === 'my-programs' ? '#6366f1' : '#e5e7eb'}`,
                                background: activeTab === 'my-programs' ? '#eef2ff' : 'white',
                                fontWeight: activeTab === 'my-programs' ? 600 : 400,
                                cursor: 'pointer'
                            }}
                        >
                            📚 My Programs
                        </button>
                        <button
                            onClick={() => setActiveTab('browse')}
                            style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                border: `2px solid ${activeTab === 'browse' ? '#6366f1' : '#e5e7eb'}`,
                                background: activeTab === 'browse' ? '#eef2ff' : 'white',
                                fontWeight: activeTab === 'browse' ? 600 : 400,
                                cursor: 'pointer'
                            }}
                        >
                            🔍 Browse Programs
                        </button>
                    </div>
                </div>

                {/* Create New Program */}
                {activeTab === 'my-programs' && (
                    <div className="card" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Create Custom Program</h2>
                        <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1rem' }}>
                            Design your own workout program tailored to your goals
                        </p>
                        <button className="btn" style={{ background: 'white', color: '#6366f1', fontWeight: 600 }}>
                            ➕ Create New Program
                        </button>
                    </div>
                )}

                {/* Programs List */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                        {activeTab === 'my-programs' ? 'Your Programs' : 'Available Programs'}
                    </h2>

                    {programs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                            <p>No programs yet. Create your first program!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {programs.map(program => (
                                <div key={program.id} style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.5rem', border: '2px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                                {program.name}
                                            </h3>
                                            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                                {program.description}
                                            </p>
                                        </div>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: program.difficulty === 'Beginner' ? '#dbeafe' : program.difficulty === 'Intermediate' ? '#fef3c7' : '#fecaca',
                                            color: program.difficulty === 'Beginner' ? '#1e40af' : program.difficulty === 'Intermediate' ? '#92400e' : '#991b1b'
                                        }}>
                                            {program.difficulty}
                                        </span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <span style={{ color: '#6b7280' }}>Duration:</span>{' '}
                                            <strong>{program.duration}</strong>
                                        </div>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <span style={{ color: '#6b7280' }}>Frequency:</span>{' '}
                                            <strong>{program.daysPerWeek} days/week</strong>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                            Equipment needed:
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {program.equipment.map((item: string, idx: number) => (
                                                <span key={idx} style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: '#e0e7ff',
                                                    color: '#3730a3',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-primary" style={{ flex: 1 }}>
                                            Start Program
                                        </button>
                                        <button className="btn btn-outline">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Equipment Presets */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🏋️ Equipment Presets</h2>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
                        Save your available equipment to get personalized program recommendations
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {['Home Gym', 'Full Gym', 'Minimal Equipment', 'Bodyweight Only'].map((preset, idx) => (
                            <button key={idx} className="btn btn-outline" style={{ padding: '1rem' }}>
                                {preset}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Card */}
                <div className="card" style={{ background: '#f0f9ff', border: '2px solid #bae6fd' }}>
                    <div style={{ fontSize: '0.9rem', color: '#0c4a6e' }}>
                        <strong>💡 Pro Tip:</strong> Programs are designed to progressively overload your muscles over time.
                        Stick with a program for at least 8-12 weeks to see optimal results!
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Programs;
