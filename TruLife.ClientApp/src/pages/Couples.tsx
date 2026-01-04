import { useState, useEffect } from 'react';
import { getCoupleProfile, createCouplePairing } from '../services/api';
import CouplesOnboarding from '../components/CouplesOnboarding';
import ChallengeDashboard from '../components/ChallengeDashboard';
import { Heart, Trophy, Camera, Utensils, Zap } from 'lucide-react';

const Couples = () => {
    const [couple, setCouple] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [partnerEmail, setPartnerEmail] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCoupleProfile();
    }, []);

    const fetchCoupleProfile = async () => {
        try {
            const response = await getCoupleProfile();
            setCouple(response.data);
            setShowOnboarding(false);
        } catch (err: any) {
            console.error('Error fetching teamwork profile:', err);
            if (err.response?.status === 404) {
                setCouple(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePairing = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await createCouplePairing(partnerEmail);
            await fetchCoupleProfile();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to link with partner/teammate');
        } finally {
            setLoading(false);
        }
    };

    const handleOnboardingComplete = (preferences: any) => {
        // Save preferences to local storage for now
        localStorage.setItem('teamworkPreferences', JSON.stringify(preferences));
        setShowOnboarding(false);
    };

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!couple) {
        return (
            <div className="page">
                <div className="container">
                    <div className="card text-center">
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤝</div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Teamwork Mode</h1>
                        <p className="text-gray mb-6">
                            Connect with a partner or teammate to start shared challenges, plan together, and transform together!
                        </p>

                        <form onSubmit={handlePairing} className="mb-6">
                            <div className="form-group text-left">
                                <label className="label">Teammate's Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="teammate@example.com"
                                    value={partnerEmail}
                                    onChange={(e) => setPartnerEmail(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
                            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                {loading ? 'Sending Invitation...' : 'Invite Teammate'}
                            </button>
                        </form>

                        <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '12px' }}>
                            <p className="text-sm text-gray">
                                💡 <strong>Tip:</strong> Your teammate must also have a TruLife account to accept the invitation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showOnboarding) {
        return (
            <div className="page">
                <div className="container">
                    <CouplesOnboarding onComplete={handleOnboardingComplete} onSkip={() => setShowOnboarding(false)} />
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Teamwork Hub 🤝</h1>
                <p className="text-gray">Transforming together with {couple.partnerA?.firstName} & {couple.partnerB?.firstName}</p>
            </div>

            <div className="container">
                {/* 1. Quick Stats / Challenge Progress */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white' }}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Active Challenge</h2>
                        <Zap size={20} />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 text-center">
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{couple.partnerA?.firstName}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>120 pts</div>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>VS</div>
                        <div className="flex-1 text-center">
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{couple.partnerB?.firstName}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>95 pts</div>
                        </div>
                    </div>
                </div>

                {/* 2. Main Navigation Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="card hover-scale flex flex-col items-center gap-2 text-center" style={{ border: '2px solid #4f46e5' }}>
                        <Trophy size={32} color="#4f46e5" />
                        <span style={{ fontWeight: 600 }}>Challenges</span>
                    </button>
                    <button className="card hover-scale flex flex-col items-center gap-2 text-center" style={{ border: '2px solid #8b5cf6' }}>
                        <Heart size={32} color="#8b5cf6" />
                        <span style={{ fontWeight: 600 }}>Date/Team Nights</span>
                    </button>
                    <button className="card hover-scale flex flex-col items-center gap-2 text-center" style={{ border: '2px solid #10b981' }}>
                        <Camera size={32} color="#10b981" />
                        <span style={{ fontWeight: 600 }}>Progress</span>
                    </button>
                    <button className="card hover-scale flex flex-col items-center gap-2 text-center" style={{ border: '2px solid #f59e0b' }}>
                        <Utensils size={32} color="#f59e0b" />
                        <span style={{ fontWeight: 600 }}>Meal Prep</span>
                    </button>
                </div>

                {/* 3. Detailed View (Dashboard) */}
                <ChallengeDashboard challengeId="current-challenge" />

                {/* 4. Preference Reset */}
                <div className="card text-center">
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setShowOnboarding(true)}
                    >
                        📝 Retake Preference Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Couples;
