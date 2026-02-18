import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Edit, Trash2, X, Search, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        name: '', description: '', price: '', mrp: '', stock: '',
        category: '', unit: 'kg', unitValue: '1', isFeatured: false
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [search]);

    const fetchProducts = async () => {
        try {
            const res = await adminAPI.getProducts({ search, limit: 100 });
            if (res.success) setProducts(res.data.products);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchCategories = async () => {
        try {
            const res = await adminAPI.getCategories();
            if (res.success) setCategories(res.data.categories);
        } catch (err) { console.error(err); }
    };

    const openNew = () => {
        setEditing(null);
        setForm({ name: '', description: '', price: '', mrp: '', stock: '', category: '', unit: 'kg', unitValue: '1', isFeatured: false });
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditing(product._id);
        setForm({
            name: product.name, description: product.description || '', price: product.price,
            mrp: product.mrp, stock: product.stock, category: product.category?._id || '',
            unit: product.unit, unitValue: product.unitValue, isFeatured: product.isFeatured
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...form, price: Number(form.price), mrp: Number(form.mrp), stock: Number(form.stock), unitValue: Number(form.unitValue) };
            if (editing) {
                await adminAPI.updateProduct(editing, data);
                toast.success('Product updated');
            } else {
                await adminAPI.createProduct(data);
                toast.success('Product created');
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            toast.error(err.message || 'Failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            await adminAPI.deleteProduct(id);
            toast.success('Deleted');
            fetchProducts();
        } catch (err) { toast.error('Failed to delete'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="form-input" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '38px', width: '300px' }} />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add Product</button>
            </div>

            <div className="card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>MRP</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p._id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.unitValue} {p.unit}</div>
                                </td>
                                <td>{p.category?.name || '-'}</td>
                                <td style={{ fontWeight: 700 }}>₹{p.price}</td>
                                <td style={{ color: 'var(--text-muted)' }}>₹{p.mrp}</td>
                                <td>
                                    {p.stock <= 10 ? (
                                        <span className="badge badge-error" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                                            <AlertTriangle size={12} /> {p.stock}
                                        </span>
                                    ) : (
                                        <span className="badge badge-success">{p.stock}</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`badge ${p.isActive ? 'badge-success' : 'badge-error'}`}>
                                        {p.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}><Edit size={14} /></button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && !loading && (
                            <tr><td colSpan={7} className="empty-state">No products found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editing ? 'Edit Product' : 'Add New Product'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Product Name</label>
                                    <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <div className="grid-3">
                                    <div className="form-group">
                                        <label className="form-label">Price (₹)</label>
                                        <input className="form-input" type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">MRP (₹)</label>
                                        <input className="form-input" type="number" required value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stock</label>
                                        <input className="form-input" type="number" required value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Unit</label>
                                        <select className="form-select" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                                            {['kg', 'g', 'l', 'ml', 'piece', 'pack', 'dozen'].map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
                                        <span className="form-label" style={{ margin: 0 }}>Featured Product</span>
                                    </label>
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

export default AdminProducts;
