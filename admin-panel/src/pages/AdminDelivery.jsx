import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Edit, X, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDelivery = () => {
    const [agents, setAgents] = useState([]);
    const [applications, setApplications] = useState([]);
    const [activeTab, setActiveTab] = useState('agents'); // 'agents' or 'applications'
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [showAnnModal, setShowAnnModal] = useState(false);
    const [annForm, setAnnForm] = useState({ title: '', content: '', targetAudience: 'delivery' });
    const [form, setForm] = useState({ name: '', phone: '', email: '', vehicleType: 'bike', vehicleNumber: '', dailyTarget: 20 });

    useEffect(() => {
        fetchAgents();
        fetchApplications();
        fetchAnnouncements();
    }, []);

    const fetchAgents = async () => {
        try {
            const res = await adminAPI.getAgents({ status: 'approved' });
            if (res.success) setAgents(res.data.agents);
        } catch (err) { console.error(err); }
    };

    const fetchApplications = async () => {
        try {
            const res = await adminAPI.getAgents({ status: 'pending' });
            if (res.success) setApplications(res.data.agents);
        } catch (err) { console.error(err); }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await adminAPI.getAnnouncements();
            if (res.success) setAnnouncements(res.data.announcements);
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this agent/application? This cannot be undone.')) return;
        try {
            const res = await adminAPI.deleteAgent(id);
            if (res.success) {
                toast.success('Record removed');
                activeTab === 'agents' ? fetchAgents() : fetchApplications();
            }
        } catch (err) { toast.error(err.message || 'Delete failed'); }
    };

    const handleApplicationAction = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this application?`)) return;
        try {
            const res = await adminAPI.updateApplicationStatus(id, { status });
            if (res.success) {
                toast.success(`Application ${status}`);
                fetchApplications();
                fetchAgents();
            }
        } catch (err) { toast.error(err.message || 'Action failed'); }
    };

    const openNew = () => { setEditing(null); setForm({ name: '', phone: '', email: '', vehicleType: 'bike', vehicleNumber: '', dailyTarget: 20 }); setShowModal(true); };
    const openEdit = (a) => { setEditing(a._id); setForm({ name: a.name, phone: a.phone, email: a.email || '', vehicleType: a.vehicleType, vehicleNumber: a.vehicleNumber || '', dailyTarget: a.dailyTarget || 20 }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) { await adminAPI.updateAgent(editing, form); toast.success('Agent updated'); }
            else { await adminAPI.createAgent(form); toast.success('Agent added'); }
            setShowModal(false); fetchAgents();
        } catch (err) { toast.error(err.message || 'Failed'); }
    };

    const handleAnnSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createAnnouncement(annForm);
            toast.success('Announcement broadcasted');
            setShowAnnModal(false);
            setAnnForm({ title: '', content: '', targetAudience: 'delivery' });
            fetchAnnouncements();
        } catch (err) { toast.error(err.message || 'Failed'); }
    };

    const deleteAnnouncement = async (id) => {
        if (!window.confirm('Delete announcement?')) return;
        try {
            await adminAPI.deleteAnnouncement(id);
            toast.success('Announcement deleted');
            fetchAnnouncements();
        } catch (err) { toast.error(err.message || 'Failed'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Delivery Management</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={() => setShowAnnModal(true)}>📣 Broadcast Message</button>
                    <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add Agent Manually</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                <button
                    style={{ background: 'none', border: 'none', borderBottom: activeTab === 'agents' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'agents' ? 'var(--primary)' : 'var(--text-secondary)', padding: '10px 15px', fontWeight: '600', cursor: 'pointer' }}
                    onClick={() => setActiveTab('agents')}
                >
                    Active Partners ({agents.length})
                </button>
                <button
                    style={{ background: 'none', border: 'none', borderBottom: activeTab === 'applications' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'applications' ? 'var(--primary)' : 'var(--text-secondary)', padding: '10px 15px', fontWeight: '600', cursor: 'pointer' }}
                    onClick={() => setActiveTab('applications')}
                >
                    Pending Applications ({applications.length})
                </button>
                <button
                    style={{ background: 'none', border: 'none', borderBottom: activeTab === 'announcements' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'announcements' ? 'var(--primary)' : 'var(--text-secondary)', padding: '10px 15px', fontWeight: '600', cursor: 'pointer' }}
                    onClick={() => setActiveTab('announcements')}
                >
                    Announcements ({announcements.length})
                </button>
            </div>

            <div className="card">
                {activeTab === 'agents' ? (
                    <table className="admin-table">
                        <thead><tr><th>Agent</th><th>Status</th><th>Target</th><th>Today</th><th>Performance</th><th>Rating</th><th>Actions</th></tr></thead>
                        <tbody>
                            {agents.map(a => (
                                <tr key={a._id}>
                                    <td style={{ fontWeight: 600 }}>
                                        {a.name}
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 400 }}>{a.phone}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span className={`badge ${a.isOnline ? 'badge-success' : 'badge-outline'}`} style={{ fontSize: '10px' }}>
                                                {a.isOnline ? 'ONLINE' : 'OFFLINE'}
                                            </span>
                                            {a.checkInTime && (
                                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                    Clock In: {new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{a.dailyTarget || 20}</td>
                                    <td style={{ fontWeight: 700 }}>{a.earnings?.today || 0}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <div style={{ fontSize: '12px', fontWeight: 700 }}>On-Time: {a.performance?.onTimePercentage || 100}%</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Avg: {a.avgDeliveryTime || 'N/A'}</div>
                                            <div style={{ fontSize: '11px', fontWeight: 600, color: a.performance?.grade === 'A' ? 'var(--success)' : 'var(--danger)' }}>Grade: {a.performance?.grade || 'A'}</div>
                                        </div>
                                    </td>
                                    <td>⭐ {a.rating?.average?.toFixed(1) || '5.0'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)} title="Edit"><Edit size={14} /></button>
                                            <button className="btn btn-outline btn-sm" style={{ color: '#ff4d4f', borderColor: 'rgba(255, 77, 79, 0.2)' }} onClick={() => handleDelete(a._id)} title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {agents.length === 0 && <tr><td colSpan={8} className="empty-state">No active delivery agents found</td></tr>}
                        </tbody>
                    </table>
                ) : activeTab === 'applications' ? (
                    <table className="admin-table">
                        <thead><tr><th>Applicant</th><th>Documents</th><th>Vehicle</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {/* ... existing applications mapping ... */}
                            {applications.map(a => (
                                <tr key={a._id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{a.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{a.phone} | {a.email}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '11px' }}>Aadhaar: <strong style={{ color: 'var(--text-primary)' }}>{a.aadhaarNumber || 'N/A'}</strong></div>
                                        <div style={{ fontSize: '11px' }}>PAN: <strong style={{ color: 'var(--text-primary)' }}>{a.panNumber || 'N/A'}</strong></div>
                                        <div style={{ fontSize: '11px' }}>Bank AC: <strong style={{ color: 'var(--text-primary)' }}>{a.bankDetails?.accountNumber || 'N/A'}</strong></div>
                                    </td>
                                    <td style={{ textTransform: 'capitalize' }}>
                                        {a.vehicleType}
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Reg: {a.vehicleNumber || 'N/A'}</div>
                                    </td>
                                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-outline btn-sm" style={{ color: 'var(--success)', borderColor: 'rgba(37, 211, 102, 0.2)' }} onClick={() => handleApplicationAction(a._id, 'approved')} title="Approve">
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                            <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(255, 77, 79, 0.2)' }} onClick={() => handleApplicationAction(a._id, 'rejected')} title="Reject">
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {applications.length === 0 && <tr><td colSpan={5} className="empty-state">No pending applications</td></tr>}
                        </tbody>
                    </table>
                ) : (
                    <table className="admin-table">
                        <thead><tr><th>Announcement</th><th>Audience</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {announcements.map(ann => (
                                <tr key={ann._id}>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>{ann.title}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{ann.content}</div>
                                    </td>
                                    <td><span className="badge badge-outline" style={{ textTransform: 'uppercase' }}>{ann.targetAudience}</span></td>
                                    <td style={{ fontSize: '12px' }}>{new Date(ann.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(255, 77, 79, 0.2)' }} onClick={() => deleteAnnouncement(ann._id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {announcements.length === 0 && <tr><td colSpan={4} className="empty-state">No announcements sent</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editing ? 'Edit Agent' : 'Add Agent'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group"><label className="form-label">Name</label><input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                                <div className="grid-2">
                                    <div className="form-group"><label className="form-label">Vehicle Type</label>
                                        <select className="form-select" value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })}>
                                            <option value="bike">Bike</option><option value="scooter">Scooter</option><option value="bicycle">Bicycle</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label className="form-label">Vehicle Number</label><input className="form-input" value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} /></div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Daily Target (Orders)</label>
                                    <input className="form-input" type="number" min="1" required value={form.dailyTarget} onChange={e => setForm({ ...form, dailyTarget: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Agent'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showAnnModal && (
                <div className="modal-overlay" onClick={() => setShowAnnModal(false)}>
                    <div className="modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Broadcast Announcement</h3>
                            <button className="modal-close" onClick={() => setShowAnnModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleAnnSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input className="form-input" required value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} placeholder="e.g. Heavy Rain Warning" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Message Content</label>
                                    <textarea className="form-input" required rows="4" value={annForm.content} onChange={e => setAnnForm({ ...annForm, content: e.target.value })} placeholder="Message for agents..." />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Target Audience</label>
                                    <select className="form-select" value={annForm.targetAudience} onChange={e => setAnnForm({ ...annForm, targetAudience: e.target.value })}>
                                        <option value="all">All Users</option>
                                        <option value="delivery">Delivery Agents Only</option>
                                        <option value="customer">Customers Only</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowAnnModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Send Broadcast</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


export default AdminDelivery;
