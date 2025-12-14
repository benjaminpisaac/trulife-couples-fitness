import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { login as loginApi } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await loginApi({ email, password });
            const { userId, email: userEmail, firstName, lastName, token } = response.data;

            dispatch(setCredentials({
                user: { userId, email: userEmail, firstName, lastName },
                token
            }));

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page flex items-center justify-center" style={{ minHeight: '100vh' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 className="page-title text-center mb-4">TruLife Fitness</h1>
                <p className="text-center text-gray mb-4">Welcome back! Log in to continue your journey.</p>

                {error && (
                    <div className="card" style={{ background: '#fee2e2', border: '1px solid #ef4444', marginBottom: '1rem' }}>
                        <p className="text-danger">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p className="text-center mt-3">
                    Don't have an account?{' '}
                    <a href="/register" className="text-primary" style={{ fontWeight: 600 }}>
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
