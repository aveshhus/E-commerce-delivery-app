import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await adminAPI.login({ email, password });
            if (res.success) {
                localStorage.setItem('km_admin_token', res.data.token);
                localStorage.setItem('km_admin_user', JSON.stringify(res.data.user));
                toast.success('Welcome, Admin!');
                navigate('/');
            }
        } catch (err) {
            toast.error(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <div className="admin-login-card">
                <div className="sidebar-brand-icon">K</div>
                <h2>Admin Login</h2>
                <p>Krishna Marketing Dashboard</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" placeholder="admin@krishnamarketing.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login to Dashboard'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg)', borderRadius: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <strong>Demo Credentials:</strong><br />
                    Email: admin@krishnamarketing.com<br />
                    Password: Admin@123
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
