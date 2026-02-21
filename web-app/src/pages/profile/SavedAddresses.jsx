import { useState, useEffect } from 'react';
import { addressAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { MapPin, Plus, Trash2, Home, Briefcase, Map } from 'lucide-react';

const SavedAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        label: 'home',
        fullName: '',
        phone: '',
        alternatePhone: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await addressAPI.getAddresses();
            if (res.success) setAddresses(res.data.addresses);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingId) {
                res = await addressAPI.updateAddress(editingId, form);
            } else {
                res = await addressAPI.addAddress(form);
            }

            if (res.success) {
                toast.success(editingId ? 'Address updated' : 'Address added');
                fetchAddresses();
                setShowForm(false);
                resetForm();
            }
        } catch (err) {
            toast.error(err.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this address?')) return;
        try {
            const res = await addressAPI.deleteAddress(id);
            if (res.success) {
                toast.success('Address deleted');
                fetchAddresses();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const resetForm = () => {
        setForm({
            label: 'home', fullName: '', phone: '', alternatePhone: '',
            addressLine1: '', addressLine2: '', landmark: '',
            city: '', state: '', pincode: '', isDefault: false
        });
        setEditingId(null);
    };

    const handleEdit = (addr) => {
        setForm(addr);
        setEditingId(addr._id);
        setShowForm(true);
    };

    return (
        <div className="profile-section fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Saved Addresses</h2>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ gap: '8px' }}>
                        <Plus size={18} /> Add New
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="profile-card">
                    <h3 style={{ marginBottom: '20px' }}>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Alternate Phone (Optional)</label>
                                <input className="form-input" value={form.alternatePhone} onChange={e => setForm({ ...form, alternatePhone: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Address Line 1</label>
                                <input className="form-input" value={form.addressLine1} onChange={e => setForm({ ...form, addressLine1: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Address Line 2 (Optional)</label>
                                <input className="form-input" value={form.addressLine2} onChange={e => setForm({ ...form, addressLine2: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Landmark (Optional)</label>
                                <input className="form-input" placeholder="e.g. Near Big Bazaar" value={form.landmark} onChange={e => setForm({ ...form, landmark: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <input className="form-input" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pincode</label>
                                <input className="form-input" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Label</label>
                                <div className="gender-options">
                                    {['home', 'work', 'other'].map(l => (
                                        <label key={l} className={`gender-radio ${form.label === l ? 'active' : ''}`}>
                                            <input
                                                type="radio" name="label" value={l}
                                                checked={form.label === l}
                                                onChange={e => setForm({ ...form, label: e.target.value })}
                                                style={{ display: 'none' }}
                                            />
                                            {l.charAt(0).toUpperCase() + l.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="form-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Address</button>
                            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="address-grid">
                    {addresses.map(addr => (
                        <div key={addr._id} className="profile-card address-card">
                            <div className="address-header">
                                <div className="address-badge">
                                    {addr.label === 'home' && <Home size={14} />}
                                    {addr.label === 'work' && <Briefcase size={14} />}
                                    {addr.label === 'other' && <MapPin size={14} />}
                                    {addr.label}
                                </div>
                                {addr.isDefault && <span className="default-badge">Default</span>}
                            </div>
                            <h4 style={{ marginBottom: '8px', fontSize: '15px' }}>{addr.fullName}</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px', lineHeight: 1.5 }}>
                                {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}<br />
                                {addr.landmark && <span style={{ color: 'var(--primary)' }}>Near {addr.landmark}<br /></span>}
                                {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                Phone: {addr.phone} {addr.alternatePhone && <span style={{ opacity: 0.6 }}>| {addr.alternatePhone}</span>}
                            </p>
                            <div className="address-actions">
                                <button className="btn-text" onClick={() => handleEdit(addr)}>Edit</button>
                                <button className="btn-text delete" onClick={() => handleDelete(addr._id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                    {addresses.length === 0 && !loading && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <MapPin size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <p>No addresses saved yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SavedAddresses;
