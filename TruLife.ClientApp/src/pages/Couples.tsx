import { useState, useEffect } from 'react';
import { getCoupleProfile, createCouplePairing, getChallenges, generateRomanticEvening } from '../services/api';

const Couples = () => {
    const [coupleProfile, setCoupleProfile] = useState<any>(null);
    const [challenges, setChallenges] = useState<any[]>([]);
    const [partnerEmail, setPartnerEmail] = useState('');
    const [loading, setLoading] = useState(false);

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
                ) : (
                    <>
                        {/* Couple Profile */}
                        <div className="card" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', color: 'white' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                {coupleProfile.partnerAName} & {coupleProfile.partnerBName}
                            </h2>
                            <p style={{ opacity: 0.9 }}>
                                Paired since {new Date(coupleProfile.pairedAt).toLocaleDateString()}
                            </p>
                        </div>

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
                                    <button className="btn btn-outline w-full">Create Challenge</button>
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
                                <button className="btn btn-outline">💪 Create Workout Challenge</button>
                                <button className="btn btn-outline">🍽️ Create Nutrition Challenge</button>
                                <button className="btn btn-outline">🎯 Set Romantic Attraction Goal</button>
                                <button className="btn btn-outline">💬 Communication Hub</button>
                                <button className="btn btn-outline">📚 Romantic History Vault</button>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default Couples;
