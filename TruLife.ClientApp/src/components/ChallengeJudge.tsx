import { useState } from 'react';
import api from '../services/api';

interface ChallengeJudgeProps {
    challengeId: string;
    onJudgingComplete?: (winner: any) => void;
}

export default function ChallengeJudge({ challengeId, onJudgingComplete }: ChallengeJudgeProps) {
    const [judging, setJudging] = useState(false);
    const [results, setResults] = useState<any>(null);

    const handleJudgeChallenge = async () => {
        setJudging(true);

        try {
            // Get photos from localStorage
            const partnerABefore = localStorage.getItem(`challenge_${challengeId}_partnerA_before`);
            const partnerAAfter = localStorage.getItem(`challenge_${challengeId}_partnerA_after`);
            const partnerBBefore = localStorage.getItem(`challenge_${challengeId}_partnerB_before`);
            const partnerBAfter = localStorage.getItem(`challenge_${challengeId}_partnerB_after`);

            if (!partnerABefore || !partnerAAfter || !partnerBBefore || !partnerBAfter) {
                alert('All before and after photos are required for judging');
                setJudging(false);
                return;
            }

            // Get points from activity logs
            const activities = JSON.parse(localStorage.getItem(`challenge_${challengeId}_activities`) || '[]');
            const partnerAPoints = activities
                .filter((a: any) => a.partnerId === 'A')
                .reduce((sum: number, a: any) => sum + a.points, 0);
            const partnerBPoints = activities
                .filter((a: any) => a.partnerId === 'B')
                .reduce((sum: number, a: any) => sum + a.points, 0);

            // Calculate consistency (simplified - count unique days)
            const partnerADays = new Set(activities
                .filter((a: any) => a.partnerId === 'A')
                .map((a: any) => new Date(a.timestamp).toDateString())
            ).size;
            const partnerBDays = new Set(activities
                .filter((a: any) => a.partnerId === 'B')
                .map((a: any) => new Date(a.timestamp).toDateString())
            ).size;

            // Get challenge duration
            const challengeData = JSON.parse(localStorage.getItem('activeChallenge') || '{}');
            const startDate = new Date(challengeData.startDate);
            const endDate = new Date(challengeData.endDate);
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

            // Call API
            const response = await api.post('/couples/judge-challenge', {
                partnerABeforePhoto: JSON.parse(partnerABefore).photo,
                partnerAAfterPhoto: JSON.parse(partnerAAfter).photo,
                partnerBBeforePhoto: JSON.parse(partnerBBefore).photo,
                partnerBAfterPhoto: JSON.parse(partnerBAfter).photo,
                partnerAPoints,
                partnerBPoints,
                partnerAConsistencyDays: partnerADays,
                partnerBConsistencyDays: partnerBDays,
                totalChallengeDays: totalDays
            });

            setResults(response.data);
            if (onJudgingComplete) {
                onJudgingComplete(response.data);
            }
        } catch (error: any) {
            console.error('Judging error:', error);
            alert(error.response?.data?.message || 'Failed to judge challenge');
        } finally {
            setJudging(false);
        }
    };

    return (
        <div className="card">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                🏆 AI Transformation Judge
            </h2>

            {!results ? (
                <>
                    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                        Ready to determine the winner? Our AI will analyze both partners' transformations using:
                    </p>

                    <div style={{ background: '#f0f9ff', border: '2px solid #3b82f6', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#1e40af' }}>
                            Scoring Algorithm
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#1e40af' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>📸 Visual Transformation (AI Analysis)</span>
                                <strong>60%</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>📊 Points Earned</span>
                                <strong>20%</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>🔥 Consistency (Daily Logging)</span>
                                <strong>15%</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>🎯 Goal Achievement</span>
                                <strong>5%</strong>
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary w-full"
                        onClick={handleJudgeChallenge}
                        disabled={judging}
                        style={{ fontSize: '1.1rem', padding: '1rem' }}
                    >
                        {judging ? '🤖 AI Analyzing Transformations...' : '🏆 Judge Challenge'}
                    </button>
                </>
            ) : (
                <>
                    {/* Winner Announcement */}
                    <div style={{
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {results.winner.winnerId === 'TIE' ? 'It\'s a Tie!' : `Partner ${results.winner.winnerId} Wins!`}
                        </h2>
                        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                            {results.winner.winnerId === 'TIE'
                                ? 'Both partners showed amazing transformations!'
                                : 'Congratulations on an incredible transformation!'}
                        </p>
                    </div>

                    {/* Score Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: '#f3f4f6', borderRadius: '12px', padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                                Partner A
                            </h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '1rem' }}>
                                {results.winner.partnerAScore}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                <div>Transformation: {results.winner.partnerABreakdown.transformationScore}</div>
                                <div>Points: {results.winner.partnerABreakdown.pointsScore}</div>
                                <div>Consistency: {results.winner.partnerABreakdown.consistencyScore}</div>
                                <div>Goals: {results.winner.partnerABreakdown.goalScore}</div>
                            </div>
                        </div>

                        <div style={{ background: '#f3f4f6', borderRadius: '12px', padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                                Partner B
                            </h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '1rem' }}>
                                {results.winner.partnerBScore}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                <div>Transformation: {results.winner.partnerBBreakdown.transformationScore}</div>
                                <div>Points: {results.winner.partnerBBreakdown.pointsScore}</div>
                                <div>Consistency: {results.winner.partnerBBreakdown.consistencyScore}</div>
                                <div>Goals: {results.winner.partnerBBreakdown.goalScore}</div>
                            </div>
                        </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="card" style={{ background: '#dbeafe', border: '2px solid #3b82f6' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e40af' }}>
                            🤖 AI Transformation Analysis
                        </h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1e40af' }}>Partner A:</div>
                            <div style={{ fontSize: '0.9rem', color: '#1e40af', marginBottom: '0.5rem' }}>
                                {results.partnerAAnalysis.overallAssessment}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                                Body Fat: {results.partnerAAnalysis.bodyFatBefore}% → {results.partnerAAnalysis.bodyFatAfter}% |
                                Definition: {results.partnerAAnalysis.muscleDefinitionBefore}/10 → {results.partnerAAnalysis.muscleDefinitionAfter}/10
                            </div>
                        </div>

                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1e40af' }}>Partner B:</div>
                            <div style={{ fontSize: '0.9rem', color: '#1e40af', marginBottom: '0.5rem' }}>
                                {results.partnerBAnalysis.overallAssessment}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                                Body Fat: {results.partnerBAnalysis.bodyFatBefore}% → {results.partnerBAnalysis.bodyFatAfter}% |
                                Definition: {results.partnerBAnalysis.muscleDefinitionBefore}/10 → {results.partnerBAnalysis.muscleDefinitionAfter}/10
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-outline w-full"
                        onClick={() => setResults(null)}
                        style={{ marginTop: '1rem' }}
                    >
                        Judge Another Challenge
                    </button>
                </>
            )}
        </div>
    );
}
