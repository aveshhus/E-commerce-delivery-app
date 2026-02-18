import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', icon: '' });

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const res = await adminAPI.getCategories();
            if (res.success) setCategories(res.data.categories);
        } catch (err) { console.error(err); }
    };

    const openNew = () => { setEditing(null); setForm({ name: '', description: '', icon: '' }); setShowModal(true); };
    const openEdit = (cat) => { setEditing(cat._id); setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '' }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await adminAPI.updateCategory(editing, form);
                toast.success('Category updated');
            } else {
                await adminAPI.createCategory(form);
                toast.success('Category created');
            }
            setShowModal(false);
            fetchCategories();
        } catch (err) { toast.error(err.message || 'Failed'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category?')) return;
        try { await adminAPI.deleteCategory(id); toast.success('Deleted'); fetchCategories(); }
        catch (err) { toast.error('Failed to delete'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>{categories.length} Categories</h3>
                <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add Category</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {categories.map(cat => (
                    <div key={cat._id} className="card" style={{ marginBottom: 0 }}>
                        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '32px' }}>{cat.icon || '📦'}</span>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '15px' }}>{cat.name}</h4>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.description || 'No description'}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button className="btn btn-outline btn-sm" onClick={() => openEdit(cat)}><Edit size={14} /></button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat._id)}><Trash2 size={14} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editing ? 'Edit Category' : 'Add Category'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Icon (emoji)</label>
                                    <input className="form-input" placeholder="e.g. 🥬" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
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

export default AdminCategories;
