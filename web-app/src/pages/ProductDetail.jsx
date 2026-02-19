import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Minus, ShoppingCart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { productAPI } from '../services/api';
import { formatUnit, getQtyLabel } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [qty, setQty] = useState(1);
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await productAPI.getProduct(id);
            if (res.success) {
                setProduct(res.data.product);
                if (res.data.product.variants?.length > 0) {
                    setSelectedVariant(res.data.product.variants[0]);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        addToCart(product._id, qty, selectedVariant ? { name: selectedVariant.name, value: selectedVariant.value, price: selectedVariant.price } : null);
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
    if (!product) return <div style={{ textAlign: 'center', padding: '60px' }}><h2>Product not found</h2></div>;

    const currentPrice = selectedVariant?.price || product.price;
    const currentMrp = selectedVariant?.mrp || product.mrp;
    const discount = currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

    return (
        <div className="product-detail fade-in">
            <div className="product-detail-image">
                {primaryImage?.url ? (
                    <img
                        src={primaryImage.url.startsWith('http') ? primaryImage.url : `http://localhost:5000${primaryImage.url}`}
                        alt={product.name}
                        style={{ maxHeight: '80%', objectFit: 'contain' }}
                    />
                ) : (
                    <span style={{ fontSize: '120px', opacity: 0.3 }}>🛒</span>
                )}
            </div>

            <div className="product-detail-info">
                <div className="product-category">{product.category?.name}</div>
                <h1>{product.name}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{formatUnit(product.unitValue, product.unit)}</p>

                <div className="product-detail-pricing">
                    <span className="price">₹{currentPrice}</span>
                    {currentMrp > currentPrice && <span className="mrp">₹{currentMrp}</span>}
                    {discount > 0 && <span className="discount">{discount}% OFF</span>}
                </div>

                {/* Variants */}
                {product.variants?.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>Select {product.variants[0]?.name}:</p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {product.variants.map((v, i) => (
                                <button
                                    key={i}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: 'var(--radius-md)',
                                        border: `2px solid ${selectedVariant?.value === v.value ? 'var(--primary)' : 'var(--border)'}`,
                                        background: selectedVariant?.value === v.value ? 'var(--primary-50)' : 'white',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => setSelectedVariant(v)}
                                >
                                    {v.value} — ₹{v.price}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quantity & Add to Cart */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0',
                        border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden'
                    }}>
                        <button style={{ width: '44px', height: '44px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
                            onClick={() => setQty(Math.max(1, qty - 1))}>
                            <Minus size={16} />
                        </button>
                        <span style={{ minWidth: '44px', padding: '0 8px', textAlign: 'center', fontWeight: 700 }}>{getQtyLabel(qty, product.unit)}</span>
                        <button style={{ width: '44px', height: '44px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
                            onClick={() => setQty(qty + 1)}>
                            <Plus size={16} />
                        </button>
                    </div>

                    <button className="btn btn-primary" style={{ flex: 1, maxWidth: '300px' }} onClick={handleAddToCart}>
                        <ShoppingCart size={18} style={{ marginRight: '8px' }} />
                        Add to Cart — ₹{(currentPrice * qty).toFixed(2)}
                    </button>
                </div>

                {/* Description */}
                {product.description && (
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>About this product</h3>
                        <p className="product-description">{product.description}</p>
                    </div>
                )}

                {/* Features */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                        { icon: <Truck size={18} />, label: '20 min delivery' },
                        { icon: <Shield size={18} />, label: '100% fresh guarantee' },
                        { icon: <RotateCcw size={18} />, label: 'Easy returns' },
                        { icon: <Star size={18} />, label: 'Earn loyalty points' }
                    ].map((f, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                            fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)'
                        }}>
                            <span style={{ color: 'var(--primary)' }}>{f.icon}</span>
                            {f.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
