import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Edit, X, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDelivery = () => {
    const [agents, setAgents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', phone: '', email: '', vehicleType: 'bike', vehicleNumber: '' });

    useEffect(() => { fetchAgents(); }, []);

    const fetchAgents = async () => {
        try { const res = await adminAPI.getAgents(); if (res.success) setAgents(res.data.agents); }
        catch (err) { console.error(err); }
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
                <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>{agents.length} Delivery Agents</h3>
                <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add Agent</button>
            </div>

            <div className="card">
                <table className="admin-table">
                    <thead><tr><th>Agent</th><th>Phone</th><th>Vehicle</th><th>Status</th><th>Deliveries</th><th>Rating</th><th>Actions</th></tr></thead>
                    <tbody>
                        {agents.map(a => (
                            <tr key={a._id}>
                                <td style={{ fontWeight: 600 }}>{a.name}</td>
                                <td style={{ fontSize: '12px' }}>{a.phone}</td>
                                <td style={{ textTransform: 'capitalize' }}>{a.vehicleType} {a.vehicleNumber && `• ${a.vehicleNumber}`}</td>
                                <td><span className={`badge ${a.isAvailable ? 'badge-success' : 'badge-error'}`}>{a.isAvailable ? 'Available' : 'Busy'}</span></td>
                                <td style={{ fontWeight: 700 }}>{a.totalDeliveries || 0}</td>
                                <td>⭐ {a.rating?.average?.toFixed(1) || (typeof a.rating === 'number' ? a.rating.toFixed(1) : '0.0')}</td>
                                <td><button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}><Edit size={14} /></button></td>
                            </tr>
                        ))}
                        {agents.length === 0 && <tr><td colSpan={7} className="empty-state">No delivery agents</td></tr>}
                    </tbody>
                </table>
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
