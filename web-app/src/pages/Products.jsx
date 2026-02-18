import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../services/api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [searchParams, setSearchParams] = useSearchParams();

    const currentCategory = searchParams.get('category') || '';
    const currentSearch = searchParams.get('search') || '';
    const currentSort = searchParams.get('sort') || '';

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [searchParams]);

    const fetchCategories = async () => {
        try {
            const res = await productAPI.getCategories();
            if (res.success) setCategories(res.data.categories);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: searchParams.get('page') || 1,
                limit: 20,
                category: currentCategory,
                search: currentSearch,
                sort: currentSort,
                featured: searchParams.get('featured') || '',
                popular: searchParams.get('popular') || ''
            };
            const res = await productAPI.getProducts(params);
            if (res.success) {
                setProducts(res.data.products);
                setPagination(res.data.pagination);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const setFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        newParams.delete('page');
        setSearchParams(newParams);
    };

    return (
        <div className="section" style={{ paddingTop: '30px' }}>
            <div className="section-header">
                <h2 className="section-title">
                    {currentSearch ? `Results for "${currentSearch}"` : currentCategory ? 'Category Products' : 'All Products'}
                </h2>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{pagination.total} products</span>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <button
                    className={`btn ${!currentCategory ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '8px 18px', fontSize: '13px', width: 'auto' }}
                    onClick={() => setFilter('category', '')}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat._id}
                        className={`btn ${currentCategory === cat._id ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '8px 18px', fontSize: '13px', width: 'auto' }}
                        onClick={() => setFilter('category', cat._id)}
                    >
                        {cat.icon} {cat.name}
                    </button>
                ))}
            </div>

            {/* Sort */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Sort by:</span>
                {[
                    { label: 'Newest', value: '' },
                    { label: 'Price: Low → High', value: 'price_asc' },
                    { label: 'Price: High → Low', value: 'price_desc' },
                    { label: 'Most Popular', value: 'popular' }
                ].map(opt => (
                    <button
                        key={opt.value}
                        style={{
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '12px',
                            fontWeight: currentSort === opt.value ? '700' : '500',
                            background: currentSort === opt.value ? 'var(--primary)' : 'white',
                            color: currentSort === opt.value ? 'white' : 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onClick={() => setFilter('sort', opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</p>
                    <h3>No products found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search</p>
                </div>
            ) : (
                <>
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px' }}>
                            {Array.from({ length: pagination.pages }, (_, i) => (
                                <button
                                    key={i}
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: pagination.page === i + 1 ? 'var(--primary)' : 'white',
                                        color: pagination.page === i + 1 ? 'white' : 'var(--text-primary)',
                                        border: '1px solid var(--border)', fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setFilter('page', i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Products;
