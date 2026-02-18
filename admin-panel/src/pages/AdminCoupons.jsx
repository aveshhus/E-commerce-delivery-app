import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        code: '', description: '', discountType: 'percentage', discountValue: '',
        minOrderAmount: '', maxDiscount: '', usageLimit: '', expiryDate: '', isActive: true
    });

    useEffect(() => { fetchCoupons(); }, []);

    const fetchCoupons = async () => { try { const res = await adminAPI.getCoupons(); if (res.success) setCoupons(res.data.coupons); } catch (err) { console.error(err); } };

    const openNew = () => { setEditing(null); setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', expiryDate: '', isActive: true }); setShowModal(true); };
    const openEdit = (c) => { setEditing(c._id); setForm({ code: c.code, description: c.description || '', discountType: c.discountType, discountValue: c.discountValue, minOrderAmount: c.minOrderAmount || '', maxDiscount: c.maxDiscount || '', usageLimit: c.usageLimit || '', expiryDate: c.expiryDate?.slice(0, 10) || '', isActive: c.isActive }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { ...form, discountValue: Number(form.discountValue), minOrderAmount: Number(form.minOrderAmount) || 0, maxDiscount: Number(form.maxDiscount) || 0, usageLimit: Number(form.usageLimit) || 0 };
        try {
            if (editing) { await adminAPI.updateCoupon(editing, data); toast.success('Updated'); }
            else { await adminAPI.createCoupon(data); toast.success('Created'); }
            setShowModal(false); fetchCoupons();
        } catch (err) { toast.error(err.message || 'Failed'); }
    };

    const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await adminAPI.deleteCoupon(id); toast.success('Deleted'); fetchCoupons(); } catch (err) { toast.error('Failed'); } };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>{coupons.length} Coupons</h3>
                <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add Coupon</button>
            </div>

            <div className="card">
                <table className="admin-table">
                    <thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Max Discount</th><th>Used</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {coupons.map(c => (
                            <tr key={c._id}>
                                <td><span style={{ fontWeight: 700, fontFamily: 'monospace', background: 'var(--bg)', padding: '4px 10px', borderRadius: '6px' }}>{c.code}</span></td>
                                <td style={{ fontWeight: 700 }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                                <td>₹{c.minOrderAmount || 0}</td>
                                <td>₹{c.maxDiscount || '-'}</td>
                                <td>{c.usedCount || 0} / {c.usageLimit || '∞'}</td>
                                <td style={{ fontSize: '12px' }}>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-IN') : 'No expiry'}</td>
                                <td><span className={`badge ${c.isActive ? 'badge-success' : 'badge-error'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}><Edit size={14} /></button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && <tr><td colSpan={8} className="empty-state">No coupons</td></tr>}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>{editing ? 'Edit Coupon' : 'New Coupon'}</h3><button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid-2">
                                    <div className="form-group"><label className="form-label">Code</label><input className="form-input" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} style={{ fontFamily: 'monospace', textTransform: 'uppercase' }} /></div>
                                    <div className="form-group"><label className="form-label">Discount Type</label>
                                        <select className="form-select" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                                            <option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                                <div className="grid-3">
                                    <div className="form-group"><label className="form-label">Discount Value</label><input className="form-input" type="number" required value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">Min Order (₹)</label><input className="form-input" type="number" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">Max Discount (₹)</label><input className="form-input" type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} /></div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label className="form-label">Usage Limit</label><input className="form-input" type="number" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">Expiry Date</label><input className="form-input" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></div>
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

export default AdminCoupons;
