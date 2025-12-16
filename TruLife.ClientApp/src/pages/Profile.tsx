import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { getProfile, updateProfile } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [measurementSystem, setMeasurementSystem] = useState<'imperial' | 'metric'>('imperial'); // Default to imperial (US)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await getProfile();
            setProfile(response.data);
            setFormData(response.data);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateProfile(formData);
            await fetchProfile();
            setEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
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

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Profile ⚙️</h1>
                <p className="text-gray">Manage your account and preferences</p>
            </div>

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
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="number"
                                            className="input"
                                            value={Math.floor((formData.heightCm || 0) / 30.48)}
                                            onChange={(e) => {
                                                const feet = parseInt(e.target.value) || 0;
                                                const inches = Math.round(((formData.heightCm || 0) / 2.54) % 12);
                                                setFormData({
                                                    ...formData,
                                                    heightCm: (feet * 30.48) + (inches * 2.54)
                                                });
                                            }}
                                            placeholder="5"
                                            min="0"
                                            max="8"
                                        />
                                        <span style={{ alignSelf: 'center', fontWeight: 600 }}>ft</span>
                                        <input
                                            type="number"
                                            className="input"
                                            value={Math.round(((formData.heightCm || 0) / 2.54) % 12)}
                                            onChange={(e) => {
                                                const feet = Math.floor((formData.heightCm || 0) / 30.48);
                                                const inches = parseInt(e.target.value) || 0;
                                                setFormData({
                                                    ...formData,
                                                    heightCm: (feet * 30.48) + (inches * 2.54)
                                                });
                                            }}
                                            placeholder="8"
                                            min="0"
                                            max="11"
                                        />
                                        <span style={{ alignSelf: 'center', fontWeight: 600 }}>in</span>
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
                                <input
                                    type="number"
                                    name="currentWeightKg"
                                    className="input"
                                    value={
                                        measurementSystem === 'imperial'
                                            ? (formData.currentWeightKg * 2.20462).toFixed(1)
                                            : formData.currentWeightKg || ''
                                    }
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        setFormData({
                                            ...formData,
                                            currentWeightKg: measurementSystem === 'imperial' ? value / 2.20462 : value
                                        });
                                    }}
                                    placeholder={measurementSystem === 'imperial' ? '154' : '70'}
                                    step="0.1"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">
                                    Target Weight {measurementSystem === 'imperial' ? '(lbs)' : '(kg)'}
                                </label>
                                <input
                                    type="number"
                                    name="targetWeightKg"
                                    className="input"
                                    value={
                                        measurementSystem === 'imperial'
                                            ? (formData.targetWeightKg * 2.20462).toFixed(1)
                                            : formData.targetWeightKg || ''
                                    }
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        setFormData({
                                            ...formData,
                                            targetWeightKg: measurementSystem === 'imperial' ? value / 2.20462 : value
                                        });
                                    }}
                                    placeholder={measurementSystem === 'imperial' ? '143' : '65'}
                                    step="0.1"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Fitness Goal</label>
                                <select
                                    name="fitnessGoal"
                                    className="input"
                                    value={formData.fitnessGoal || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Select a goal</option>
                                    <option value="Weight Loss">Weight Loss</option>
                                    <option value="Muscle Gain">Muscle Gain</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Athletic Performance">Athletic Performance</option>
                                    <option value="General Fitness">General Fitness</option>
                                </select>
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

                            {/* Medical & Personal Data Section */}
                            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
                                    📋 Medical & Personal Information (Optional)
                                </h3>
                                <p className="text-gray text-sm mb-3">
                                    This information helps personalize your experience without DNA or lab data
                                </p>

                                <div className="form-group">
                                    <label className="label">Ethnicity</label>
                                    <input
                                        type="text"
                                        name="ethnicity"
                                        className="input"
                                        value={formData.ethnicity || ''}
                                        onChange={handleChange}
                                        placeholder="e.g., African American, Hispanic, Asian, etc."
                                    />
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
                                        DNA and lab data can be added separately for even more precise guidance.
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
                                <div style={{ fontWeight: 600 }}>{profile?.heightCm ? `${profile.heightCm} cm` : 'Not set'}</div>
                            </div>
                            <div>
                                <div className="text-gray text-sm">Current Weight</div>
                                <div style={{ fontWeight: 600 }}>{profile?.currentWeightKg ? `${profile.currentWeightKg} kg` : 'Not set'}</div>
                            </div>
                            <div>
                                <div className="text-gray text-sm">Target Weight</div>
                                <div style={{ fontWeight: 600 }}>{profile?.targetWeightKg ? `${profile.targetWeightKg} kg` : 'Not set'}</div>
                            </div>
                            <div>
                                <div className="text-gray text-sm">Fitness Goal</div>
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
        </div>
    );
};

export default Profile;
