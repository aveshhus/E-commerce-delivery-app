import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Search, Mail, Phone, Star } from 'lucide-react';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { fetchCustomers(); }, [search]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getCustomers({ search });
            if (res.success) setCustomers(res.data.customers);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '38px' }} />
                </div>
            </div>

            <div className="card">
                {loading ? <div className="loading"><div className="spinner"></div></div> : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Orders</th>
                                <th>Loyalty Points</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(c => (
                                <tr key={c._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '13px' }}>
                                                {c.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{c.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '12px' }}>{c.email}</td>
                                    <td style={{ fontSize: '12px' }}>{c.phone || '-'}</td>
                                    <td style={{ fontWeight: 700 }}>{c.totalOrders || 0}</td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)' }}>
                                            <Star size={14} fill="var(--accent)" /> {c.loyaltyPoints || 0}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(c.createdAt)}</td>
                                </tr>
                            ))}
                            {customers.length === 0 && <tr><td colSpan={6} className="empty-state">No customers found</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminCustomers;
