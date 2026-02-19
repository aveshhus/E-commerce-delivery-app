import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Edit, Trash2, X, Search, AlertTriangle, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
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
        category: '', unit: 'kg', unitValue: '1', isFeatured: false,
        productUrl: ''
    });

    // Image handling
    const [imageType, setImageType] = useState('url'); // 'url', 'upload', 'stock'
    const [customImage, setCustomImage] = useState('');
    const [selectedStock, setSelectedStock] = useState('');
    const [uploadFile, setUploadFile] = useState(null);

    const STOCK_IMAGES = [
        // Vegetables
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80', // Tomato
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80', // Potato
        'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=400&q=80', // Onion
        'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80', // Carrot
        'https://images.unsplash.com/photo-1615485500704-8e99099928b3?w=400&q=80', // Mixed Veg

        // Fruits
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', // Apple
        'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&q=80', // Banana
        'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80', // Orange
        'https://images.unsplash.com/photo-1523049673856-4287b38d18b4?w=400&q=80', // Grapes

        // Dairy & Bakery
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80', // Milk
        'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&q=80', // Eggs
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', // Dairy
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', // Bread

        // Snacks & Grocery
        'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&q=80', // Chips 
        'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80', // Chips/Snacks
        'https://images.unsplash.com/photo-1511381971729-32221735cb5d?w=400&q=80', // Chocolate
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&q=80', // Rice/Grains
        'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80', // Noodles

        // Beverages
        'https://images.unsplash.com/photo-1543599538-a6c4f6cc5c05?w=400&q=80', // Soft Drinks
        'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80', // Cola
        'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80', // Juice
    ];

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
        setForm({
            name: '', description: '', price: '', mrp: '', stock: '',
            category: '', unit: 'kg', unitValue: '1', isFeatured: false,
            productUrl: ''
        });
        setImageType('url');
        setCustomImage('');
        setSelectedStock('');
        setUploadFile(null);
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditing(product._id);
        setForm({
            name: product.name, description: product.description || '', price: product.price,
            mrp: product.mrp, stock: product.stock, category: product.category?._id || '',
            unit: product.unit, unitValue: product.unitValue, isFeatured: product.isFeatured,
            productUrl: product.productUrl || ''
        });

        // Handle existing image display
        if (product.images && product.images.length > 0) {
            setImageType('url');
            setCustomImage(product.images[0].url);
        } else {
            setImageType('url');
            setCustomImage('');
        }
        setUploadFile(null);
        setSelectedStock('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...form, price: Number(form.price), mrp: Number(form.mrp), stock: Number(form.stock), unitValue: Number(form.unitValue) };

            // Handle Images
            if (imageType === 'url' && customImage) {
                data.images = [{ url: customImage, isPrimary: true }];
            } else if (imageType === 'stock' && selectedStock) {
                data.images = [{ url: selectedStock, isPrimary: true }];
            }

            let productId = editing;

            if (editing) {
                await adminAPI.updateProduct(editing, data);
                productId = editing;
                toast.success('Product updated');
            } else {
                const res = await adminAPI.createProduct(data);
                productId = res.data.product._id;
                toast.success('Product created');
            }

            // Handle File Upload if selected
            if (imageType === 'upload' && uploadFile && productId) {
                const formData = new FormData();
                formData.append('images', uploadFile);
                await adminAPI.uploadImages(productId, formData);
                toast.success('Image uploaded');
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: '#f5f5f5' }}>
                                            {p.images && p.images.length > 0 ? (
                                                <img src={p.images[0].url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                                    <ImageIcon size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.unitValue} {p.unit}</div>
                                            {p.productUrl && (
                                                <a href={p.productUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                    External Link <LinkIcon size={10} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
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

                                <div className="form-group">
                                    <label className="form-label">Product Image</label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <button type="button" className={`btn btn-sm ${imageType === 'upload' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setImageType('upload')}>
                                            <Upload size={14} /> Upload
                                        </button>
                                        <button type="button" className={`btn btn-sm ${imageType === 'url' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setImageType('url')}>
                                            <LinkIcon size={14} /> URL
                                        </button>
                                        <button type="button" className={`btn btn-sm ${imageType === 'stock' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setImageType('stock')}>
                                            <ImageIcon size={14} /> Stock
                                        </button>
                                    </div>

                                    {imageType === 'upload' && (
                                        <input type="file" className="form-input" accept="image/*" onChange={e => setUploadFile(e.target.files[0])} />
                                    )}

                                    {imageType === 'url' && (
                                        <input className="form-input" placeholder="https://example.com/image.jpg" value={customImage} onChange={e => setCustomImage(e.target.value)} />
                                    )}

                                    {imageType === 'stock' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                                            {STOCK_IMAGES.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedStock(img)}
                                                    style={{
                                                        border: selectedStock === img ? '2px solid var(--primary)' : '1px solid #ddd',
                                                        borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', height: '80px'
                                                    }}
                                                >
                                                    <img src={img} alt="Stock" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Product Link (Optional)</label>
                                    <input className="form-input" placeholder="External link to product" value={form.productUrl} onChange={e => setForm({ ...form, productUrl: e.target.value })} />
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
