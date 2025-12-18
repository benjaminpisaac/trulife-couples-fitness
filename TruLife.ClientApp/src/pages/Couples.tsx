import { useState, useEffect } from 'react';
import { getCoupleProfile, createCouplePairing, getChallenges, generateRomanticEvening } from '../services/api';
import CouplesOnboarding from '../components/CouplesOnboarding';
import ChallengeSetup from '../components/ChallengeSetup';
import ChallengePhotoCapture, { ChallengePhotoGallery } from '../components/ChallengePhotoCapture';
import ChallengeDashboard from '../components/ChallengeDashboard';
import ChallengeJudge from '../components/ChallengeJudge';

const Couples = () => {
    const [coupleProfile, setCoupleProfile] = useState<any>(null);
    const [challenges, setChallenges] = useState<any[]>([]);
    const [partnerEmail, setPartnerEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [showChallengeSetup, setShowChallengeSetup] = useState(false);
    const [showPhotoCapture, setShowPhotoCapture] = useState(false);
    const [currentPartnerId, setCurrentPartnerId] = useState<'A' | 'B'>('A');
    const [showDashboard, setShowDashboard] = useState(false);
    const [showJudge, setShowJudge] = useState(false);
    const [photoType, setPhotoType] = useState<'before' | 'after'>('before');

    useEffect(() => {
        fetchCoupleData();
    }, []);

    const fetchCoupleData = async () => {
        try {
            const [profileRes, challengesRes] = await Promise.allSettled([
                getCoupleProfile(),
                getChallenges()
            ]);

            if (profileRes.status === 'fulfilled') {
                setCoupleProfile(profileRes.value.data);
            }

            if (challengesRes.status === 'fulfilled') {
                setChallenges(challengesRes.value.data);
            }
        } catch (error) {
            console.error('Error fetching couple data:', error);
        }
    };

    const handlePairing = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createCouplePairing(partnerEmail);
            await fetchCoupleData();
            setPartnerEmail('');
            alert('Successfully paired with your partner!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to pair. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOnboardingComplete = (preferences: any) => {
        console.log('Onboarding preferences:', preferences);
        // TODO: Save to backend
        localStorage.setItem('couplesPreferences', JSON.stringify(preferences));
        setOnboardingComplete(true);
        setShowOnboarding(false);
        alert('Preferences saved! You can now create challenges.');
    };

    const handleChallengeSetupComplete = (challengeData: any) => {
        console.log('Challenge created:', challengeData);
        // TODO: Save to backend
        localStorage.setItem('activeChallenge', JSON.stringify(challengeData));
        setShowChallengeSetup(false);
        alert(`Challenge "${challengeData.challengeName}" created successfully!`);
    };

    const handleGenerateRomanticEvening = async () => {
        setLoading(true);
        try {
            const response = await generateRomanticEvening({
                partnerAPreferences: 'Romantic, candlelit, Italian flavors, wine pairing',
                partnerBPreferences: 'Cozy, intimate, Asian fusion, dessert lover'
            });

            alert('Romantic evening generated! Check your romantic history.');
            await fetchCoupleData();
        } catch (error) {
            alert('Failed to generate romantic evening. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Couples Mode 💑</h1>
                <p className="text-gray">Fitness and romance, together</p>
            </div>

            <div className="container">
                {/* Global Challenge Setup - Shows when any Create Challenge button is clicked */}
                {showChallengeSetup && (
                    <ChallengeSetup
                        onComplete={handleChallengeSetupComplete}
                        onBack={() => setShowChallengeSetup(false)}
                    />
                )}

                {/* Only show other content when NOT in challenge setup */}
                {!showChallengeSetup && (
                    <>
                        {!coupleProfile ? (
                            /* Pairing Form */
                            <div className="card">
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Pair with Your Partner</h2>
                                <p className="text-gray mb-3">
                                    Enter your partner's email to start your couples fitness journey!
                                </p>
                                <form onSubmit={handlePairing}>
                                    <div className="form-group">
                                        <label className="label">Partner's Email</label>
                                        <input
                                            type="email"
                                            className="input"
                                            value={partnerEmail}
                                            onChange={(e) => setPartnerEmail(e.target.value)}
                                            required
                                            placeholder="partner@email.com"
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-secondary w-full" disabled={loading}>
                                        {loading ? 'Pairing...' : '💑 Pair with Partner'}
                                    </button>
                                </form>
                            </div>
                        ) : onboardingComplete || localStorage.getItem('couplesPreferences') ? (
                            <>
                                {/* Show challenge setup after onboarding */}
                                {!showChallengeSetup && !localStorage.getItem('activeChallenge') ? (
                                    <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>✅ Onboarding Complete!</h2>
                                        <p style={{ opacity: 0.9, marginBottom: '1rem' }}>You're ready to create your first challenge</p>
                                        <button
                                            className="btn"
                                            style={{ background: 'white', color: '#059669', fontWeight: 600 }}
                                            onClick={() => setShowChallengeSetup(true)}
                                        >
                                            Create Challenge →
                                        </button>
                                    </div>
                                ) : showChallengeSetup ? (
                                    <ChallengeSetup
                                        onComplete={handleChallengeSetupComplete}
                                        onBack={() => setShowChallengeSetup(false)}
                                    />
                                ) : (
                                    /* Active Challenge - Dashboard, Photos & Judge */
                                    <>
                                        {showPhotoCapture ? (
                                            <ChallengePhotoCapture
                                                challengeId={JSON.parse(localStorage.getItem('activeChallenge') || '{}').challengeName || 'default'}
                                                partnerId={currentPartnerId}
                                                photoType={photoType}
                                                onComplete={() => setShowPhotoCapture(false)}
                                            />
                                        ) : showJudge ? (
                                            <>
                                                <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', color: 'white', marginBottom: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                                            🏆 Challenge Results
                                                        </h2>
                                                        <button
                                                            className="btn"
                                                            style={{ background: 'white', color: '#8b5cf6', fontWeight: 600, fontSize: '0.85rem' }}
                                                            onClick={() => setShowJudge(false)}
                                                        >
                                                            ← Back
                                                        </button>
                                                    </div>
                                                </div>
                                                <ChallengeJudge
                                                    challengeId={JSON.parse(localStorage.getItem('activeChallenge') || '{}').challengeName || 'default'}
                                                />
                                            </>
                                        ) : showDashboard ? (
                                            <>
                                                <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', color: 'white', marginBottom: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                                            🎯 Challenge Dashboard
                                                        </h2>
                                                        <button
                                                            className="btn"
                                                            style={{ background: 'white', color: '#8b5cf6', fontWeight: 600, fontSize: '0.85rem' }}
                                                            onClick={() => setShowDashboard(false)}
                                                        >
                                                            📸 Photos
                                                        </button>
                                                    </div>
                                                </div>
                                                <ChallengeDashboard
                                                    challengeId={JSON.parse(localStorage.getItem('activeChallenge') || '{}').challengeName || 'default'}
                                                />
                                            </>
                                        ) : (
                                            <div>
                                                <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', color: 'white', marginBottom: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🎯 Challenge Active!</h2>
                                                            <p style={{ opacity: 0.9, marginBottom: 0 }}>
                                                                {JSON.parse(localStorage.getItem('activeChallenge') || '{}').challengeName}
                                                            </p>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                className="btn"
                                                                style={{ background: 'white', color: '#8b5cf6', fontWeight: 600, fontSize: '0.85rem' }}
                                                                onClick={() => setShowDashboard(true)}
                                                            >
                                                                📊 Dashboard
                                                            </button>
                                                            <button
                                                                className="btn"
                                                                style={{ background: 'white', color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem' }}
                                                                onClick={() => setShowJudge(true)}
                                                            >
                                                                🏆 Judge
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Photo Upload Buttons */}
                                                <div className="card">
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                                                        📸 Upload Photos
                                                    </h3>

                                                    {/* Before Photos */}
                                                    <div style={{ marginBottom: '1.5rem' }}>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#6b7280' }}>
                                                            Before Photos
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => {
                                                                    setCurrentPartnerId('A');
                                                                    setPhotoType('before');
                                                                    setShowPhotoCapture(true);
                                                                }}
                                                            >
                                                                📷 Partner A - Before Photo
                                                            </button>
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => {
                                                                    setCurrentPartnerId('B');
                                                                    setPhotoType('before');
                                                                    setShowPhotoCapture(true);
                                                                }}
                                                            >
                                                                📷 Partner B - Before Photo
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* After Photos */}
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#6b7280' }}>
                                                            After Photos (Upload when challenge ends)
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            <button
                                                                className="btn btn-outline"
                                                                onClick={() => {
                                                                    setCurrentPartnerId('A');
                                                                    setPhotoType('after');
                                                                    setShowPhotoCapture(true);
                                                                }}
                                                            >
                                                                📷 Partner A - After Photo
                                                            </button>
                                                            <button
                                                                className="btn btn-outline"
                                                                onClick={() => {
                                                                    setCurrentPartnerId('B');
                                                                    setPhotoType('after');
                                                                    setShowPhotoCapture(true);
                                                                }}
                                                            >
                                                                📷 Partner B - After Photo
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Photo Gallery */}
                                                <ChallengePhotoGallery
                                                    challengeId={JSON.parse(localStorage.getItem('activeChallenge') || '{}').challengeName || 'default'}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Onboarding Flow */}
                                {!showOnboarding ? (
                                    <div className="card" style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💑</div>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                                            Start Your Couples Fitness Journey
                                        </h2>
                                        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                                            Complete a quick onboarding to personalize your experience
                                        </p>
                                        <button
                                            className="btn btn-primary w-full"
                                            onClick={() => setShowOnboarding(true)}
                                            style={{ fontSize: '1.1rem', padding: '1rem' }}
                                        >
                                            Begin Onboarding
                                        </button>
                                    </div>
                                ) : (
                                    <CouplesOnboarding
                                        onComplete={handleOnboardingComplete}
                                        onSkip={() => {
                                            setShowOnboarding(false);
                                            setOnboardingComplete(true);
                                        }}
                                    />
                                )}
                            </>
                        )}
                        {/* Couple Profile */}
                        {coupleProfile && (
                            <div className="card" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', color: 'white' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                    {coupleProfile.partnerAName} & {coupleProfile.partnerBName}
                                </h2>
                                <p style={{ opacity: 0.9 }}>
                                    Paired since {new Date(coupleProfile.pairedAt).toLocaleDateString()}
                                </p>
                            </div>
                        )}

                        {/* Romantic Evening Generator */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🌹 AI Romantic Evening</h2>
                            <p className="text-gray mb-3">
                                Generate a personalized date night with reciprocal meal planning!
                            </p>
                            <button
                                className="btn btn-secondary w-full"
                                onClick={handleGenerateRomanticEvening}
                                disabled={loading}
                            >
                                {loading ? 'Generating...' : '✨ Generate Romantic Evening'}
                            </button>
                        </div>

                        {/* Challenges */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Challenges</h2>
                            {challenges.length === 0 ? (
                                <div>
                                    <p className="text-gray mb-3">No active challenges. Create one to get started!</p>
                                    <button
                                        className="btn btn-outline w-full"
                                        onClick={() => setShowChallengeSetup(true)}
                                    >
                                        Create Challenge
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {challenges.map((challenge, index) => (
                                        <div key={index} style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{challenge.name}</div>
                                            <div className="text-gray text-sm mb-2">{challenge.description}</div>
                                            <div className="flex justify-between text-sm">
                                                <span>Type: {challenge.challengeType}</span>
                                                <span>Metric: {challenge.metric}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Couples Features</h2>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setShowChallengeSetup(true)}
                                >
                                    💪 Create Workout Challenge
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setShowChallengeSetup(true)}
                                >
                                    🍽️ Create Nutrition Challenge
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => alert('Set body goals inspired by what your partner finds attractive! This feature helps you understand and work towards physical attributes your partner loves. Coming soon! 💕')}
                                >
                                    🎯 Set Romantic Attraction Goal
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => alert('Private messaging, shared goals, and couple check-ins all in one place! Stay connected with your fitness partner. Coming soon! 💬')}
                                >
                                    💬 Communication Hub
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => alert('Your relationship timeline with fitness milestones, date nights, and special moments! Celebrate your journey together. Coming soon! 📚')}
                                >
                                    📚 Romantic History Vault
                                </button>
                            </div>
                        </div>

                        {/* Features Overview */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>How Couples Mode Works</h2>
                            <div className="flex flex-col gap-2">
                                <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>🏆 Competitive Challenges</div>
                                    <div className="text-gray text-sm">Compete on weight loss, body fat %, or fitness metrics for a declared reward</div>
                                </div>
                                <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>🤝 Cooperative Goals</div>
                                    <div className="text-gray text-sm">Work together towards joint metrics like combined steps or total workout hours</div>
                                </div>
                                <div style={{ padding: '1rem', background: '#fce7f3', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>💕 Romantic Attraction Goals</div>
                                    <div className="text-gray text-sm">Set personal body goals inspired by what your partner finds attractive</div>
                                </div>
                                <div style={{ padding: '1rem', background: '#f3e8ff', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>🌹 AI Date Night Planner</div>
                                    <div className="text-gray text-sm">Generate romantic evenings with reciprocal meal planning using AI fusion logic</div>
                                </div>
                            </div>
                        </div>
                    </div>
            </>
                )}
        </div>
        </div >
    );
};

export default Couples;
