import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { getProfile, updateProfile } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FitbitConnect } from '../components/FitbitConnect';

const Profile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [measurementSystem, setMeasurementSystem] = useState<'imperial' | 'metric'>('imperial');

    // Separate state for imperial inputs to allow free typing
    const [heightFeet, setHeightFeet] = useState('');
    const [heightInches, setHeightInches] = useState('');
    const [weightLbs, setWeightLbs] = useState('');
    const [targetWeightLbs, setTargetWeightLbs] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const ethnicities = [
        'African American / Black',
        'Asian - Chinese',
        'Asian - Filipino',
        'Asian - Indian',
        'Asian - Japanese',
        'Asian - Korean',
        'Asian - Vietnamese',
        'Asian - Other',
        'Hispanic / Latino - Mexican',
        'Hispanic / Latino - Puerto Rican',
        'Hispanic / Latino - Cuban',
        'Hispanic / Latino - Other',
        'Middle Eastern / North African',
        'Native American / Alaska Native',
        'Native Hawaiian / Pacific Islander',
        'White / Caucasian',
        'Mixed / Multiracial',
        'Other',
        'Prefer not to say'
    ];

    const fitnessGoals = [
        'Weight Loss',
        'Muscle Gain',
        'Maintenance',
        'Athletic Performance',
        'General Fitness',
        'Endurance',
        'Strength',
        'Flexibility'
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await getProfile();

            // Merge backend data
            const profileData = {
                ...response.data
            };

            setProfile(profileData);
            setFormData(profileData);

            // Initialize imperial values from metric data
            if (response.data.heightCm) {
                const totalInches = response.data.heightCm / 2.54;
                setHeightFeet(Math.floor(totalInches / 12).toString());
                setHeightInches(Math.round(totalInches % 12).toString());
            }
            if (response.data.currentWeightKg) {
                setWeightLbs((response.data.currentWeightKg * 2.20462).toFixed(1));
            }
            if (response.data.targetWeightKg) {
                setTargetWeightLbs((response.data.targetWeightKg * 2.20462).toFixed(1));
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleGoalToggle = (goal: string) => {
        const currentGoals = formData.fitnessGoal?.split(',').map((g: string) => g.trim()).filter(Boolean) || [];
        let newGoals;

        if (currentGoals.includes(goal)) {
            newGoals = currentGoals.filter((g: string) => g !== goal);
        } else {
            newGoals = [...currentGoals, goal];
        }

        setFormData({
            ...formData,
            fitnessGoal: newGoals.join(', ')
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Convert imperial to metric before saving
            const dataToSave = { ...formData };

            if (measurementSystem === 'imperial') {
                const feet = parseInt(heightFeet) || 0;
                const inches = parseInt(heightInches) || 0;
                dataToSave.heightCm = (feet * 30.48) + (inches * 2.54);

                dataToSave.currentWeightKg = parseFloat(weightLbs) / 2.20462 || 0;
                dataToSave.targetWeightKg = parseFloat(targetWeightLbs) / 2.20462 || 0;
            }

            await updateProfile(dataToSave);
            await fetchProfile();
            setEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Update profile error:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    if (loading && !profile) {
        return (
            <div className="page flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    const selectedGoals = formData.fitnessGoal?.split(',').map((g: string) => g.trim()).filter(Boolean) || [];

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Profile 👤</h1>
                <p className="text-gray">Manage your account and preferences</p>
            </div>

            {loading ? (
                <div className="container">
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <p className="text-gray">Loading profile...</p>
                    </div>
                </div>
            ) : (
                <div className="container">
                    <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            {profile?.firstName} {profile?.lastName}
                        </h2>
                        <p style={{ opacity: 0.9 }}>{profile?.email}</p>
                    </div>

                    <div className="card">
                        <div className="flex justify-between items-center mb-3">
                            <h2 style={{ fontSize: '1.25rem' }}>Personal Information</h2>
                            {!editing && (
                                <button className="btn btn-outline" onClick={() => setEditing(true)}>
                                    Edit
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="label">Measurement System</label>
                                    <select
                                        className="input"
                                        value={measurementSystem}
                                        onChange={(e) => setMeasurementSystem(e.target.value as 'imperial' | 'metric')}
                                    >
                                        <option value="imperial">Imperial (ft/in, lbs)</option>
                                        <option value="metric">Metric (cm, kg)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="label">
                                        Height {measurementSystem === 'imperial' ? '(ft/in)' : '(cm)'}
                                    </label>
                                    {measurementSystem === 'imperial' ? (
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <input
                                                type="number"
                                                className="input"
                                                value={heightFeet}
                                                onChange={(e) => setHeightFeet(e.target.value)}
                                                placeholder="5"
                                                min="0"
                                                max="8"
                                                style={{ flex: 1 }}
                                            />
                                            <span style={{ fontWeight: 600 }}>ft</span>
                                            <input
                                                type="number"
                                                className="input"
                                                value={heightInches}
                                                onChange={(e) => setHeightInches(e.target.value)}
                                                placeholder="10"
                                                min="0"
                                                max="11"
                                                style={{ flex: 1 }}
                                            />
                                            <span style={{ fontWeight: 600 }}>in</span>
                                        </div>
                                    ) : (
                                        <input
                                            type="number"
                                            name="heightCm"
                                            className="input"
                                            value={formData.heightCm || ''}
                                            onChange={handleChange}
                                            placeholder="170"
                                        />
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="label">
                                        Current Weight {measurementSystem === 'imperial' ? '(lbs)' : '(kg)'}
                                    </label>
                                    {measurementSystem === 'imperial' ? (
                                        <input
                                            type="number"
                                            className="input"
                                            value={weightLbs}
                                            onChange={(e) => setWeightLbs(e.target.value)}
                                            placeholder="185.5"
                                            step="0.1"
                                        />
                                    ) : (
                                        <input
                                            type="number"
                                            name="currentWeightKg"
                                            className="input"
                                            value={formData.currentWeightKg || ''}
                                            onChange={handleChange}
                                            placeholder="70"
                                            step="0.1"
                                        />
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="label">
                                        Target Weight {measurementSystem === 'imperial' ? '(lbs)' : '(kg)'}
                                    </label>
                                    {measurementSystem === 'imperial' ? (
                                        <input
                                            type="number"
                                            className="input"
                                            value={targetWeightLbs}
                                            onChange={(e) => setTargetWeightLbs(e.target.value)}
                                            placeholder="175.0"
                                            step="0.1"
                                        />
                                    ) : (
                                        <input
                                            type="number"
                                            name="targetWeightKg"
                                            className="input"
                                            value={formData.targetWeightKg || ''}
                                            onChange={handleChange}
                                            placeholder="65"
                                            step="0.1"
                                        />
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="label">Fitness Goals (Select all that apply)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {fitnessGoals.map(goal => (
                                            <label key={goal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedGoals.includes(goal)}
                                                    onChange={() => handleGoalToggle(goal)}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                                <span>{goal}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="label">Activity Level</label>
                                    <select
                                        name="activityLevel"
                                        className="input"
                                        value={formData.activityLevel || ''}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select activity level</option>
                                        <option value="Sedentary">Sedentary (little or no exercise)</option>
                                        <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
                                        <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                                        <option value="Very Active">Very Active (6-7 days/week)</option>
                                        <option value="Extremely Active">Extremely Active (2x per day)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="label">Dietary Preferences</label>
                                    <input
                                        type="text"
                                        name="dietaryPreferences"
                                        className="input"
                                        value={formData.dietaryPreferences || ''}
                                        onChange={handleChange}
                                        placeholder="Keto, Vegan, Gluten-Free, etc."
                                    />
                                    <p className="text-gray text-sm mt-1">Separate multiple preferences with commas</p>
                                </div>

                                <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
                                        🏭 Medical & Personal Information (Optional)
                                    </h3>
                                    <p className="text-gray text-sm mb-3">
                                        This information helps personalize your experience
                                    </p>

                                    <div className="form-group">
                                        <label className="label">Ethnicity</label>
                                        <select
                                            name="ethnicity"
                                            className="input"
                                            value={formData.ethnicity || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select ethnicity</option>
                                            {ethnicities.map(eth => (
                                                <option key={eth} value={eth}>{eth}</option>
                                            ))}
                                        </select>
                                        <p className="text-gray text-sm mt-1">Helps with culturally-relevant meal recommendations</p>
                                    </div>

                                    <div className="form-group">
                                        <label className="label">Medical Conditions</label>
                                        <textarea
                                            name="medicalConditions"
                                            className="input"
                                            value={formData.medicalConditions || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., Diabetes, Hypertension, Thyroid issues, etc."
                                            rows={3}
                                            style={{ resize: 'vertical' }}
                                        />
                                        <p className="text-gray text-sm mt-1">List any relevant medical conditions (comma-separated)</p>
                                    </div>

                                    <div className="form-group">
                                        <label className="label">Current Medications</label>
                                        <textarea
                                            name="medications"
                                            className="input"
                                            value={formData.medications || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., Metformin, Lisinopril, Levothyroxine, etc."
                                            rows={3}
                                            style={{ resize: 'vertical' }}
                                        />
                                        <p className="text-gray text-sm mt-1">List current medications (comma-separated)</p>
                                    </div>

                                    <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                                        <p style={{ fontSize: '0.85rem', color: '#78350f', margin: 0 }}>
                                            <strong>💡 Note:</strong> This information is optional but helps our AI provide more personalized recommendations.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline flex-1"
                                        onClick={() => {
                                            setEditing(false);
                                            setFormData(profile);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div>
                                    <div className="text-gray text-sm">Height</div>
                                    <div style={{ fontWeight: 600 }}>
                                        {profile?.heightCm ? (
                                            measurementSystem === 'imperial'
                                                ? `${Math.floor(profile.heightCm / 30.48)}' ${Math.round((profile.heightCm / 2.54) % 12)}"`
                                                : `${profile.heightCm} cm`
                                        ) : 'Not set'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray text-sm">Current Weight</div>
                                    <div style={{ fontWeight: 600 }}>
                                        {profile?.currentWeightKg ? (
                                            measurementSystem === 'imperial'
                                                ? `${(profile.currentWeightKg * 2.20462).toFixed(1)} lbs`
                                                : `${profile.currentWeightKg} kg`
                                        ) : 'Not set'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray text-sm">Target Weight</div>
                                    <div style={{ fontWeight: 600 }}>
                                        {profile?.targetWeightKg ? (
                                            measurementSystem === 'imperial'
                                                ? `${(profile.targetWeightKg * 2.20462).toFixed(1)} lbs`
                                                : `${profile.targetWeightKg} kg`
                                        ) : 'Not set'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray text-sm">Fitness Goals</div>
                                    <div style={{ fontWeight: 600 }}>{profile?.fitnessGoal || 'Not set'}</div>
                                </div>
                                <div>
                                    <div className="text-gray text-sm">Activity Level</div>
                                    <div style={{ fontWeight: 600 }}>{profile?.activityLevel || 'Not set'}</div>
                                </div>
                                <div>
                                    <div className="text-gray text-sm">Dietary Preferences</div>
                                    <div style={{ fontWeight: 600 }}>{profile?.dietaryPreferences || 'Not set'}</div>
                                </div>
                                <div>
                                    <div className="text-gray text-sm">Ethnicity</div>
                                    <div style={{ fontWeight: 600 }}>{profile?.ethnicity || 'Not set'}</div>
                                </div>
                                <div>
                                    <div className="text-gray text-sm">Medical Conditions</div>
                                    <div style={{ fontWeight: 600 }}>{profile?.medicalConditions || 'None listed'}</div>
                                </div>
                                <div>
                                    <div className="text-gray text-sm">Medications</div>
                                    <div style={{ fontWeight: 600 }}>{profile?.medications || 'None listed'}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>⚕️ Health Data Sync</h2>
                        <p className="text-gray text-sm mb-3">
                            Connect your fitness tracker to automatically sync activity, sleep, and health data
                        </p>

                        <FitbitConnect />

                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                            <p className="text-sm text-gray">
                                📱 <strong>Coming Soon:</strong> Apple Health (iOS) and Google Fit (Android) integration
                            </p>
                        </div>
                    </div>

                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>About TruLife</h2>
                        <p className="text-gray mb-2">Version 1.0.0</p>
                        <p className="text-gray text-sm">
                            TruLife Couples Fitness - AI-powered fitness and wellness platform with innovative couples features.
                        </p>
                    </div>

                    <div className="card">
                        <button className="btn w-full" onClick={handleLogout} style={{ background: '#ef4444', color: 'white' }}>
                            🚪 Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
