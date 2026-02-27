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
    const [form, setForm] = useState({ name: '', phone: '', email: '', vehicleType: 'bike', vehicleNumber: '' });

    useEffect(() => {
        fetchAgents();
        fetchApplications();
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

    const openNew = () => { setEditing(null); setForm({ name: '', phone: '', email: '', vehicleType: 'bike', vehicleNumber: '' }); setShowModal(true); };
    const openEdit = (a) => { setEditing(a._id); setForm({ name: a.name, phone: a.phone, email: a.email || '', vehicleType: a.vehicleType, vehicleNumber: a.vehicleNumber || '' }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) { await adminAPI.updateAgent(editing, form); toast.success('Agent updated'); }
            else { await adminAPI.createAgent(form); toast.success('Agent added'); }
            setShowModal(false); fetchAgents();
        } catch (err) { toast.error(err.message || 'Failed'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Delivery Management</h3>
                <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add Agent Manually</button>
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
            </div>

            <div className="card">
                {activeTab === 'agents' ? (
                    <table className="admin-table">
                        <thead><tr><th>Agent</th><th>Phone</th><th>Vehicle</th><th>Status</th><th>Deliveries</th><th>Rating</th><th>Actions</th></tr></thead>
                        <tbody>
                            {agents.map(a => (
                                <tr key={a._id}>
                                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                                    <td style={{ fontSize: '12px' }}>{a.phone}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{a.vehicleType} {a.vehicleNumber && `• ${a.vehicleNumber}`}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span className={`badge ${a.isOnline ? 'badge-success' : 'badge-outline'}`} style={{ fontSize: '10px' }}>
                                                {a.isOnline ? 'ONLINE' : 'OFFLINE'}
                                            </span>
                                            <span className={`badge ${a.isAvailable ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                                                {a.isAvailable ? 'Free' : 'Busy'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{a.totalDeliveries || 0}</td>
                                    <td>⭐ {a.rating?.average?.toFixed(1) || (typeof a.rating === 'number' ? a.rating.toFixed(1) : '0.0')}</td>
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
                            {agents.length === 0 && <tr><td colSpan={7} className="empty-state">No active delivery agents found</td></tr>}
                        </tbody>
                    </table>
                ) : (
                    <table className="admin-table">
                        <thead><tr><th>Applicant</th><th>Documents</th><th>Vehicle</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
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
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Agent'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDelivery;
