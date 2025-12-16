import { useState } from 'react';

interface CouplesOnboardingProps {
    onComplete: (preferences: any) => void;
    onSkip?: () => void;
}

export default function CouplesOnboarding({ onComplete, onSkip }: CouplesOnboardingProps) {
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState({
        fitnessGoals: '',
        attractiveAreas: [] as string[],
        muscleDefinition: 5,
        idealVision: '',
        allowPartnerNotifications: false
    });

    const areaOptions = [
        'Arms', 'Core/Abs', 'Legs', 'Back', 'Chest', 'Shoulders', 'Overall Tone'
    ];

    const handleAreaToggle = (area: string) => {
        setPreferences(prev => ({
            ...prev,
            attractiveAreas: prev.attractiveAreas.includes(area)
                ? prev.attractiveAreas.filter(a => a !== area)
                : [...prev.attractiveAreas, area]
        }));
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = () => {
        onComplete(preferences);
    };

    const handleSkipQuestion = () => {
        handleNext();
    };

    return (
        <div className="card">
            {/* Progress Indicator */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Step {step} of 3</span>
                    <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{Math.round((step / 3) * 100)}% Complete</span>
                </div>
                <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                        width: `${(step / 3) * 100}%`,
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>

            {/* Step 1: Welcome */}
            {step === 1 && (
                <div>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💑</div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
                            Welcome to Couples Challenges!
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '2rem' }}>
                            Transform together with AI-powered challenges designed for couples
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>🏆 Compete & Win</div>
                            <div style={{ fontSize: '0.9rem', color: '#78350f' }}>
                                Set challenges with your partner and compete for prizes you both choose
                            </div>
                        </div>
                        <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>📸 Track Progress</div>
                            <div style={{ fontSize: '0.9rem', color: '#1e40af' }}>
                                Before and after photos show your transformation journey
                            </div>
                        </div>
                        <div style={{ padding: '1rem', background: '#fce7f3', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>🤖 AI Judging</div>
                            <div style={{ fontSize: '0.9rem', color: '#9f1239' }}>
                                Fair, objective winner determination based on transformation
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary w-full"
                        onClick={handleNext}
                        style={{ fontSize: '1.1rem', padding: '1rem' }}
                    >
                        Get Started →
                    </button>
                    {onSkip && (
                        <button
                            className="btn btn-outline w-full"
                            onClick={onSkip}
                            style={{ marginTop: '0.5rem' }}
                        >
                            Skip Onboarding
                        </button>
                    )}
                </div>
            )}

            {/* Step 2: Preference Questionnaire */}
            {step === 2 && (
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Partner Preferences
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '2rem' }}>
                        Help us personalize your experience. Your responses are private and used only by our AI.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Question 1 */}
                        <div>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                What fitness goals would you love to see your partner achieve?
                            </label>
                            <textarea
                                className="input"
                                rows={3}
                                value={preferences.fitnessGoals}
                                onChange={(e) => setPreferences({ ...preferences, fitnessGoals: e.target.value })}
                                placeholder="e.g., Build strength, improve endurance, feel more confident..."
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        {/* Question 2 */}
                        <div>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                Which areas would you find most attractive if toned?
                            </label>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                                Select all that apply
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                {areaOptions.map(area => (
                                    <button
                                        key={area}
                                        type="button"
                                        onClick={() => handleAreaToggle(area)}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: `2px solid ${preferences.attractiveAreas.includes(area) ? '#ec4899' : '#e5e7eb'}`,
                                            background: preferences.attractiveAreas.includes(area) ? '#fdf2f8' : 'white',
                                            fontWeight: preferences.attractiveAreas.includes(area) ? 600 : 400,
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {preferences.attractiveAreas.includes(area) && '✓ '}{area}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question 3 */}
                        <div>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                What level of muscle definition appeals to you?
                            </label>
                            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                                    <span>Lean</span>
                                    <span>Athletic</span>
                                    <span>Muscular</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={preferences.muscleDefinition}
                                    onChange={(e) => setPreferences({ ...preferences, muscleDefinition: parseInt(e.target.value) })}
                                    style={{ width: '100%' }}
                                />
                                <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#ec4899' }}>
                                    {preferences.muscleDefinition}/10
                                </div>
                            </div>
                        </div>

                        {/* Question 4 */}
                        <div>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                What's your ideal vision of your partner at their healthiest?
                            </label>
                            <textarea
                                className="input"
                                rows={3}
                                value={preferences.idealVision}
                                onChange={(e) => setPreferences({ ...preferences, idealVision: e.target.value })}
                                placeholder="Describe what you find most attractive about a healthy, fit partner..."
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
                        <button
                            className="btn btn-outline"
                            onClick={handleBack}
                            style={{ flex: 1 }}
                        >
                            ← Back
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={handleSkipQuestion}
                            style={{ flex: 1 }}
                        >
                            Skip
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                            style={{ flex: 1 }}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Privacy Confirmation */}
            {step === 3 && (
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Privacy & Notifications
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '2rem' }}>
                        Your preferences are completely private
                    </p>

                    <div style={{ background: '#f0f9ff', border: '2px solid #bae6fd', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#0c4a6e' }}>
                            🔒 How Your Data is Used
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#0c4a6e' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Your responses are <strong>never shown directly</strong> to your partner</li>
                            <li style={{ marginBottom: '0.5rem' }}>Our AI uses them to generate <strong>tactful suggestions</strong></li>
                            <li style={{ marginBottom: '0.5rem' }}>You control whether your partner sees focus area recommendations</li>
                            <li>All data is encrypted and secure</li>
                        </ul>
                    </div>

                    <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'start', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={preferences.allowPartnerNotifications}
                                onChange={(e) => setPreferences({ ...preferences, allowPartnerNotifications: e.target.checked })}
                                style={{ marginTop: '0.25rem', marginRight: '0.75rem' }}
                            />
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                    Show me focus areas based on my partner's preferences
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#78350f' }}>
                                    You'll receive tactful suggestions like "Your partner finds athletic builds attractive - consider adding HIIT workouts"
                                </div>
                            </div>
                        </label>
                    </div>

                    <div style={{ background: '#fce7f3', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
                        <p style={{ fontSize: '0.85rem', color: '#9f1239', margin: 0 }}>
                            <strong>💡 Note:</strong> You can change this setting anytime in your challenge dashboard. Default is OFF for privacy.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn btn-outline"
                            onClick={handleBack}
                            style={{ flex: 1 }}
                        >
                            ← Back
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            style={{ flex: 2 }}
                        >
                            Complete Onboarding ✓
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
