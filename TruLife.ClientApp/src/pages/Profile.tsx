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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                                <label className="label">Height (cm)</label>
                                <input
                                    type="number"
                                    name="heightCm"
                                    className="input"
                                    value={formData.heightCm || ''}
                                    onChange={handleChange}
                                    placeholder="170"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Current Weight (kg)</label>
                                <input
                                    type="number"
                                    name="currentWeightKg"
                                    className="input"
                                    value={formData.currentWeightKg || ''}
                                    onChange={handleChange}
                                    placeholder="70"
                                    step="0.1"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Target Weight (kg)</label>
                                <input
                                    type="number"
                                    name="targetWeightKg"
                                    className="input"
                                    value={formData.targetWeightKg || ''}
                                    onChange={handleChange}
                                    placeholder="65"
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
