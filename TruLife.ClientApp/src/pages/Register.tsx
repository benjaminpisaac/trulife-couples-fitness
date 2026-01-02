import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { register as registerApi } from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await registerApi(formData);
            const { userId, email, firstName, lastName, token } = response.data;

            dispatch(setCredentials({
                user: { userId, email, firstName, lastName },
                token
            }));

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page flex items-center justify-center" style={{ minHeight: '100vh' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 className="page-title text-center mb-4">Join TruLife</h1>
                <p className="text-center text-gray mb-4">Start your fitness journey today!</p>

                {error && (
                    <div className="card" style={{ background: '#fee2e2', border: '1px solid #ef4444', marginBottom: '1rem' }}>
                        <p className="text-danger">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            className="input"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            placeholder="John"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            className="input"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            placeholder="Doe"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary" style={{ fontWeight: 600 }}>
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
