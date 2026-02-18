import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let success;
        if (isLogin) {
            success = await login(form.email, form.password);
        } else {
            success = await register(form);
        }
        setLoading(false);
        if (success) navigate('/');
    };

    return (
        <div className="auth-page">
            <div className="auth-container fade-in">
                <div className="auth-brand">
                    <div className="auth-brand-icon">K</div>
                    <h2 className="auth-title">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                    <p className="auth-subtitle">
                        {isLogin ? 'Login to order fresh groceries' : 'Join Krishna Marketing today'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    className="form-input"
                                    type="tel"
                                    placeholder="+91 9876543210"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            className="form-input"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                        ) : (
                            isLogin ? 'Login' : 'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-switch">
                    {isLogin ? (
                        <p>Don't have an account? <a onClick={() => setIsLogin(false)} style={{ cursor: 'pointer' }}>Sign Up</a></p>
                    ) : (
                        <p>Already have an account? <a onClick={() => setIsLogin(true)} style={{ cursor: 'pointer' }}>Login</a></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
