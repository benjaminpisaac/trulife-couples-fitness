import { useState } from 'react';
import AICoachChat from '../components/AICoachChat';

const Coaching = () => {
    const [activeCoach, setActiveCoach] = useState<'PersonalTrainer' | 'MindsetCoach'>('PersonalTrainer');

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">AI Coaching 🤖</h1>
                <p className="text-gray">Get personalized guidance from your AI coaches</p>
            </div>

            <div className="container">
                {/* Coach Selection */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Select Your Coach</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <button
                            onClick={() => setActiveCoach('PersonalTrainer')}
                            style={{
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: `3px solid ${activeCoach === 'PersonalTrainer' ? '#6366f1' : '#e5e7eb'}`,
                                background: activeCoach === 'PersonalTrainer' ? '#eef2ff' : 'white',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💪</div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                Personal Trainer
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                Workout plans, form tips, exercise guidance
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveCoach('MindsetCoach')}
                            style={{
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: `3px solid ${activeCoach === 'MindsetCoach' ? '#ec4899' : '#e5e7eb'}`,
                                background: activeCoach === 'MindsetCoach' ? '#fdf2f8' : 'white',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧠</div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                Mindset Coach
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                Motivation, mental health, goal setting
                            </div>
                        </button>
                    </div>
                </div>

                {/* AI Coach Chat */}
                <AICoachChat
                    coachType={activeCoach}
                    title={activeCoach === 'PersonalTrainer' ? 'Personal Trainer' : 'Mindset Coach'}
                    icon={activeCoach === 'PersonalTrainer' ? '💪' : '🧠'}
                />

                {/* Info Card */}
                <div className="card" style={{ background: '#f0f9ff', border: '2px solid #bae6fd' }}>
                    <div style={{ fontSize: '0.9rem', color: '#0c4a6e' }}>
                        <strong>💡 How to use:</strong> Ask your AI coach anything! Get workout advice, form corrections,
                        nutrition tips, motivation, or help with mental barriers. Your coach has access to your profile,
                        goals, and progress to give personalized guidance.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Coaching;
