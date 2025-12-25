import { useState } from 'react';
import { createReadinessLog } from '../services/api';

interface ReadinessCheckInProps {
    onComplete?: () => void;
}

export default function ReadinessCheckIn({ onComplete }: ReadinessCheckInProps) {
    const [sleepQuality, setSleepQuality] = useState(7);
    const [stressLevel, setStressLevel] = useState(5);
    const [sorenessLevel, setSorenessLevel] = useState(5);
    const [energyLevel, setEnergyLevel] = useState(7);
    const [motivationLevel, setMotivationLevel] = useState(7);
    const [hoursSlept, setHoursSlept] = useState(7);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const readinessScore = Math.round(
        (sleepQuality + energyLevel + motivationLevel + (10 - stressLevel) + (10 - sorenessLevel)) / 5
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await createReadinessLog({
                sleepQuality,
                stressLevel,
                sorenessLevel,
                energyLevel,
                motivationLevel,
                hoursSlept,
                notes
            });

            console.log('✅ Readiness logged successfully:', response.data);

            // Success - trigger parent refresh
            if (onComplete) onComplete();
        } catch (error: any) {
            console.error('❌ Error logging readiness:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to log readiness';
            alert(errorMsg + '. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const SliderInput = ({
        label,
        value,
        onChange,
        emoji
    }: {
        label: string;
        value: number;
        onChange: (val: number) => void;
        emoji: string;
    }) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>{emoji} {label}</label>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#6366f1' }}>{value}/10</span>
            </div>
            <input
                type="range"
                min="1"
                max="10"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                style={{ width: '100%', height: '8px', borderRadius: '4px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                <span>1</span>
                <span>10</span>
            </div>
        </div>
    );

    return (
        <div className="card">
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px 12px 0 0', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Daily Readiness Check-In</h2>
                <p style={{ opacity: 0.9 }}>How are you feeling today?</p>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', marginTop: '1rem' }}>
                    {readinessScore}/10
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Your Readiness Score</div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '0 1.5rem 1.5rem' }}>
                <SliderInput
                    label="Sleep Quality"
                    value={sleepQuality}
                    onChange={setSleepQuality}
                    emoji="😴"
                />

                <SliderInput
                    label="Energy Level"
                    value={energyLevel}
                    onChange={setEnergyLevel}
                    emoji="⚡"
                />

                <SliderInput
                    label="Motivation"
                    value={motivationLevel}
                    onChange={setMotivationLevel}
                    emoji="🎯"
                />

                <SliderInput
                    label="Stress Level"
                    value={stressLevel}
                    onChange={setStressLevel}
                    emoji="😰"
                />

                <SliderInput
                    label="Soreness Level"
                    value={sorenessLevel}
                    onChange={setSorenessLevel}
                    emoji="💪"
                />

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                        🛌 Hours Slept
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={hoursSlept}
                        onChange={(e) => setHoursSlept(parseFloat(e.target.value))}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                        📝 Notes (Optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="How are you feeling? Any concerns?"
                        rows={3}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', resize: 'vertical' }}
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={submitting}
                    style={{ fontSize: '1.1rem', padding: '1rem' }}
                >
                    {submitting ? 'Logging...' : '✅ Log Readiness'}
                </button>
            </form>
        </div>
    );
}
