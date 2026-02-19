import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Edit, Trash2, X, Search, CheckCircle, XCircle, Calendar, Palette, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminFestivals = () => {
    const [festivals, setFestivals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        name: '', date: '', message: '', themeColor: '#ff9933', imageUrl: ''
    });

    useEffect(() => {
        fetchFestivals();
    }, []);

    const fetchFestivals = async () => {
        try {
            const res = await adminAPI.getFestivals();
            if (res.success) setFestivals(res.data.festivals);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openNew = () => {
        setEditing(null);
        setForm({
            name: '', date: '', message: '', themeColor: '#ff9933', imageUrl: ''
        });
        setShowModal(true);
    };

    const openEdit = (festival) => {
        setEditing(festival._id);
        const formattedDate = new Date(festival.date).toISOString().split('T')[0];
        setForm({
            name: festival.name,
            date: formattedDate,
            message: festival.message,
            themeColor: festival.themeColor || '#ff9933',
            imageUrl: festival.imageUrl || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await adminAPI.updateFestival(editing, form);
                toast.success('Festival updated');
            } else {
                await adminAPI.createFestival(form);
                toast.success('Festival created');
            }
            setShowModal(false);
            fetchFestivals();
        } catch (err) {
            toast.error(err.message || 'Failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this festival?')) return;
        try {
            await adminAPI.deleteFestival(id);
            toast.success('Deleted');
            fetchFestivals();
        } catch (err) { toast.error('Failed to delete'); }
    };

    const handleToggleStatus = async (id) => {
        try {
            await adminAPI.toggleFestivalStatus(id);
            toast.success('Status updated');
            fetchFestivals();
        } catch (err) { toast.error('Failed to update status'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2>Festival Management</h2>
                <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add Festival</button>
            </div>

            <div className="card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Theme Details</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {festivals.map(f => (
                            <tr key={f._id}>
                                <td style={{ fontWeight: 600 }}>{f.name}</td>
                                <td>{new Date(f.date).toLocaleDateString()}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: f.themeColor, border: '1px solid #ddd' }} title="Theme Color"></div>
                                        {f.imageUrl && <span style={{ fontSize: '11px', color: 'blue' }}>[Image]</span>}
                                        <span style={{ fontSize: '12px', color: '#666', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.message}</span>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleToggleStatus(f._id)}
                                        className={`badge ${f.isActive ? 'badge-success' : 'badge-outline'}`}
                                        style={{ cursor: 'pointer', border: 'none' }}
                                    >
                                        {f.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(f)}><Edit size={14} /></button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f._id)}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {festivals.length === 0 && !loading && (
                            <tr><td colSpan={5} className="empty-state">No festivals found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editing ? 'Edit Festival' : 'Add New Festival'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Festival Name</label>
                                    <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Diwali" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input type="date" className="form-input" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Greeting Message</label>
                                    <textarea className="form-input" required rows={2} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="e.g. Wishing you a very Happy Diwali!" />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Theme Color</label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input type="color" value={form.themeColor} onChange={e => setForm({ ...form, themeColor: e.target.value })} style={{ height: '40px', width: '60px', padding: '0', border: 'none' }} />
                                            <input className="form-input" value={form.themeColor} onChange={e => setForm({ ...form, themeColor: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Banner Image URL (Optional)</label>
                                        <input className="form-input" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFestivals;
