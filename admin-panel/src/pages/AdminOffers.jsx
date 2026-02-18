import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Edit, Trash2, X, Tag, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOffers = () => {
    const [offers, setOffers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', type: 'banner', discountPercentage: '', startDate: '', endDate: '', isActive: true });

    useEffect(() => { fetchOffers(); }, []);

    const fetchOffers = async () => { try { const res = await adminAPI.getOffers(); if (res.success) setOffers(res.data.offers); } catch (err) { console.error(err); } };

    const openNew = () => { setEditing(null); setForm({ title: '', description: '', type: 'banner', discountPercentage: '', startDate: '', endDate: '', isActive: true }); setShowModal(true); };
    const openEdit = (o) => { setEditing(o._id); setForm({ title: o.title, description: o.description || '', type: o.type, discountPercentage: o.discountPercentage || '', startDate: o.startDate?.slice(0, 10) || '', endDate: o.endDate?.slice(0, 10) || '', isActive: o.isActive }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) { await adminAPI.updateOffer(editing, form); toast.success('Updated'); }
            else { await adminAPI.createOffer(form); toast.success('Created'); }
            setShowModal(false); fetchOffers();
        } catch (err) { toast.error(err.message || 'Failed'); }
    };

    const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await adminAPI.deleteOffer(id); toast.success('Deleted'); fetchOffers(); } catch (err) { toast.error('Failed'); } };
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>{offers.length} Offers & Banners</h3>
                <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add Offer</button>
            </div>

            <div className="card">
                <table className="admin-table">
                    <thead><tr><th>Title</th><th>Type</th><th>Discount</th><th>Period</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {offers.map(o => (
                            <tr key={o._id}>
                                <td style={{ fontWeight: 600 }}>{o.title}</td>
                                <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{o.type}</span></td>
                                <td style={{ fontWeight: 700 }}>{o.discountPercentage ? `${o.discountPercentage}%` : '-'}</td>
                                <td style={{ fontSize: '12px' }}>{formatDate(o.startDate)} - {formatDate(o.endDate)}</td>
                                <td><span className={`badge ${o.isActive ? 'badge-success' : 'badge-error'}`}>{o.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(o)}><Edit size={14} /></button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o._id)}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {offers.length === 0 && <tr><td colSpan={6} className="empty-state">No offers</td></tr>}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>{editing ? 'Edit Offer' : 'New Offer'}</h3><button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group"><label className="form-label">Title</label><input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                                <div className="grid-3">
                                    <div className="form-group"><label className="form-label">Type</label>
                                        <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                            <option value="banner">Banner</option><option value="popup">Popup</option><option value="category">Category</option><option value="product">Product</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label className="form-label">Discount %</label><input className="form-input" type="number" value={form.discountPercentage} onChange={e => setForm({ ...form, discountPercentage: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">Active</label>
                                        <select className="form-select" value={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
                                            <option value="true">Active</option><option value="false">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
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

export default AdminOffers;
