import { useState } from 'react';

interface ChallengeSetupProps {
    onComplete: (challengeData: any) => void;
    onBack?: () => void;
}

export default function ChallengeSetup({ onComplete, onBack }: ChallengeSetupProps) {
    const [challengeData, setChallengeData] = useState({
        challengeName: '',
        startDate: '',
        endDate: '',
        partnerAPrize: '',
        partnerBPrize: '',
        challengeType: 'competitive' as 'competitive' | 'cooperative',
        partnerAShowFocus: false,
        partnerBShowFocus: false
    });

    const [errors, setErrors] = useState<any>({});

    const validateDates = () => {
        const newErrors: any = {};

        if (!challengeData.startDate) {
            newErrors.startDate = 'Start date is required';
        } else {
            const start = new Date(challengeData.startDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (start < today) {
                newErrors.startDate = 'Start date cannot be in the past';
            }
        }

        if (!challengeData.endDate) {
            newErrors.endDate = 'End date is required';
        } else if (challengeData.startDate) {
            const start = new Date(challengeData.startDate);
            const end = new Date(challengeData.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

            if (end <= start) {
                newErrors.endDate = 'End date must be after start date';
            } else if (diffWeeks < 4) {
                newErrors.endDate = 'Challenge must be at least 4 weeks long';
            } else if (diffWeeks > 16) {
                newErrors.endDate = 'Challenge cannot exceed 16 weeks';
            }
        }

        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const dateErrors = validateDates();
        const newErrors: any = { ...dateErrors };

        if (!challengeData.challengeName.trim()) {
            newErrors.challengeName = 'Challenge name is required';
        }

        if (!challengeData.partnerAPrize.trim()) {
            newErrors.partnerAPrize = 'Partner A prize is required';
        }

        if (!challengeData.partnerBPrize.trim()) {
            newErrors.partnerBPrize = 'Partner B prize is required';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onComplete(challengeData);
        }
    };

    const handleChange = (field: string, value: any) => {
        setChallengeData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev: any) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const calculateDuration = () => {
        if (challengeData.startDate && challengeData.endDate) {
            const start = new Date(challengeData.startDate);
            const end = new Date(challengeData.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
            return diffWeeks;
        }
        return 0;
    };

    const duration = calculateDuration();

    return (
        <div className="card">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Create Your Challenge
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '2rem' }}>
                Set up your couples transformation challenge
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Challenge Name */}
                    <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                            Challenge Name *
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={challengeData.challengeName}
                            onChange={(e) => handleChange('challengeName', e.target.value)}
                            placeholder="e.g., Summer Transformation 2024"
                        />
                        {errors.challengeName && (
                            <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                {errors.challengeName}
                            </div>
                        )}
                    </div>

                    {/* Date Range */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <div>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                Start Date *
                            </label>
                            <input
                                type="date"
                                className="input"
                                value={challengeData.startDate}
                                onChange={(e) => handleChange('startDate', e.target.value)}
                            />
                            {errors.startDate && (
                                <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                    {errors.startDate}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                End Date *
                            </label>
                            <input
                                type="date"
                                className="input"
                                value={challengeData.endDate}
                                onChange={(e) => handleChange('endDate', e.target.value)}
                            />
                            {errors.endDate && (
                                <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                    {errors.endDate}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Duration Display */}
                    {duration > 0 && (
                        <div style={{
                            padding: '1rem',
                            background: duration >= 4 && duration <= 16 ? '#d1fae5' : '#fee2e2',
                            borderRadius: '8px',
                            border: `2px solid ${duration >= 4 && duration <= 16 ? '#10b981' : '#ef4444'}`
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                Duration: {duration} weeks
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                                {duration < 4 && '⚠️ Minimum 4 weeks required'}
                                {duration >= 4 && duration <= 16 && '✅ Perfect duration for transformation!'}
                                {duration > 16 && '⚠️ Maximum 16 weeks allowed'}
                            </div>
                        </div>
                    )}

                    {/* Challenge Type */}
                    <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                            Challenge Type
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => handleChange('challengeType', 'competitive')}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${challengeData.challengeType === 'competitive' ? '#ec4899' : '#e5e7eb'}`,
                                    background: challengeData.challengeType === 'competitive' ? '#fdf2f8' : 'white',
                                    fontWeight: challengeData.challengeType === 'competitive' ? 600 : 400,
                                    cursor: 'pointer'
                                }}
                            >
                                🏆 Competitive
                            </button>
                            <button
                                type="button"
                                onClick={() => handleChange('challengeType', 'cooperative')}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${challengeData.challengeType === 'cooperative' ? '#ec4899' : '#e5e7eb'}`,
                                    background: challengeData.challengeType === 'cooperative' ? '#fdf2f8' : 'white',
                                    fontWeight: challengeData.challengeType === 'cooperative' ? 600 : 400,
                                    cursor: 'pointer'
                                }}
                            >
                                🤝 Cooperative
                            </button>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                            {challengeData.challengeType === 'competitive'
                                ? 'Compete against each other for prizes'
                                : 'Work together towards shared goals'}
                        </p>
                    </div>

                    {/* Prize Preferences */}
                    <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                            🎁 Prize Preferences
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
                            What does each partner want if they win?
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                    Partner A Prize *
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={challengeData.partnerAPrize}
                                    onChange={(e) => handleChange('partnerAPrize', e.target.value)}
                                    placeholder="e.g., Romantic dinner at favorite restaurant"
                                />
                                {errors.partnerAPrize && (
                                    <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                        {errors.partnerAPrize}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                    Partner B Prize *
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={challengeData.partnerBPrize}
                                    onChange={(e) => handleChange('partnerBPrize', e.target.value)}
                                    placeholder="e.g., Weekend getaway"
                                />
                                {errors.partnerBPrize && (
                                    <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                        {errors.partnerBPrize}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Partner Notifications */}
                    <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                            💡 Focus Area Notifications (Optional)
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
                            Should partners receive tactful suggestions based on preferences?
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'start',
                                padding: '1rem',
                                background: '#f9fafb',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={challengeData.partnerAShowFocus}
                                    onChange={(e) => handleChange('partnerAShowFocus', e.target.checked)}
                                    style={{ marginTop: '0.25rem', marginRight: '0.75rem' }}
                                />
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                        Partner A: Show focus suggestions
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                        Receive suggestions like "Your partner finds athletic builds attractive"
                                    </div>
                                </div>
                            </label>

                            <label style={{
                                display: 'flex',
                                alignItems: 'start',
                                padding: '1rem',
                                background: '#f9fafb',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={challengeData.partnerBShowFocus}
                                    onChange={(e) => handleChange('partnerBShowFocus', e.target.checked)}
                                    style={{ marginTop: '0.25rem', marginRight: '0.75rem' }}
                                />
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                        Partner B: Show focus suggestions
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                        Receive suggestions like "Focus on core definition to align with partner's vision"
                                    </div>
                                </div>
                            </label>
                        </div>

                        <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                            <p style={{ fontSize: '0.85rem', color: '#78350f', margin: 0 }}>
                                <strong>🔒 Privacy:</strong> These settings can be changed anytime during the challenge. Default is OFF.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        {onBack && (
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={onBack}
                                style={{ flex: 1 }}
                            >
                                ← Back
                            </button>
                        )}
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 2 }}
                        >
                            Create Challenge 🚀
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
