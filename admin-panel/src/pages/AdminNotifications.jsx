import { useState } from 'react';
import { adminAPI } from '../services/api';
import { Send, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
    const [form, setForm] = useState({ title: '', message: '', type: 'promotion', isBroadcast: true });
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await adminAPI.sendNotification(form);
            if (res.success) {
                toast.success('Notification sent!');
                setForm({ title: '', message: '', type: 'promotion', isBroadcast: true });
            }
        } catch (err) {
            toast.error(err.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <div className="card">
                <div className="card-header">
                    <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={18} /> Send Push Notification
                    </span>
                </div>
                <form onSubmit={handleSend}>
                    <div className="card-body">
                        <div className="form-group">
                            <label className="form-label">Notification Title</label>
                            <input className="form-input" required placeholder="e.g. 🎉 Flash Sale Today!" value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Message</label>
                            <textarea className="form-input" rows={4} required placeholder="Write your notification message..." value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })} />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="promotion">Promotion</option>
                                    <option value="order">Order Update</option>
                                    <option value="general">General</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Audience</label>
                                <select className="form-select" value={form.isBroadcast} onChange={e => setForm({ ...form, isBroadcast: e.target.value === 'true' })}>
                                    <option value="true">All Users (Broadcast)</option>
                                    <option value="false">Specific User</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '6px' }}>
                            <Send size={16} /> {loading ? 'Sending...' : 'Send Notification'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header"><span className="card-title">📋 Notification Templates</span></div>
                <div className="card-body">
                    {[
                        { title: '🎉 Flash Sale!', msg: 'Get up to 50% off on all products. Limited time only!' },
                        { title: '🆕 New Arrivals', msg: 'Fresh fruits and vegetables just arrived. Order now!' },
                        { title: '🚚 Free Delivery', msg: 'Enjoy free delivery on all orders above ₹500 today!' },
                        { title: '⭐ Loyalty Bonus', msg: 'Earn 2x loyalty points on every order this weekend!' }
                    ].map((t, i) => (
                        <div key={i} style={{ padding: '12px', background: 'var(--bg)', borderRadius: '10px', marginBottom: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                            onClick={() => setForm({ ...form, title: t.title, message: t.msg })}>
                            <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{t.title}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.msg}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
