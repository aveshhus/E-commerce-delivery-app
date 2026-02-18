import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ShoppingCart, DollarSign, Users, Package, TrendingUp, AlertTriangle, Clock, Box } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [period, setPeriod] = useState('7days');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        try {
            const [dashRes, salesRes, topRes] = await Promise.all([
                adminAPI.getDashboard(),
                adminAPI.getSalesGraph(period),
                adminAPI.getTopProducts()
            ]);
            if (dashRes.success) setStats(dashRes.data.stats);
            if (salesRes.success) setSalesData(salesRes.data.salesData);
            if (topRes.success) setTopProducts(topRes.data.products);
        } catch (err) {
            console.error(err);
            // Demo data
            setStats({
                totalOrders: 1247, todayOrders: 42, totalRevenue: 584200,
                todayRevenue: 18500, totalCustomers: 356, totalProducts: 128,
                pendingOrders: 8, lowStockProducts: 5
            });
            setSalesData([
                { _id: '2026-02-11', orders: 35, revenue: 15200 },
                { _id: '2026-02-12', orders: 42, revenue: 18900 },
                { _id: '2026-02-13', orders: 28, revenue: 12400 },
                { _id: '2026-02-14', orders: 56, revenue: 24100 },
                { _id: '2026-02-15', orders: 38, revenue: 16800 },
                { _id: '2026-02-16', orders: 45, revenue: 20300 },
                { _id: '2026-02-17', orders: 42, revenue: 18500 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    const statCards = [
        { label: 'Total Orders', value: stats?.totalOrders?.toLocaleString(), icon: <ShoppingCart size={22} />, cls: 'green', change: '+12%', dir: 'up' },
        { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign size={22} />, cls: 'blue', change: '+8%', dir: 'up' },
        { label: 'Customers', value: stats?.totalCustomers?.toLocaleString(), icon: <Users size={22} />, cls: 'purple', change: '+5%', dir: 'up' },
        { label: 'Products', value: stats?.totalProducts?.toLocaleString(), icon: <Package size={22} />, cls: 'teal' },
        { label: 'Today Orders', value: stats?.todayOrders?.toLocaleString(), icon: <Clock size={22} />, cls: 'orange' },
        { label: "Today's Revenue", value: `₹${(stats?.todayRevenue || 0).toLocaleString()}`, icon: <TrendingUp size={22} />, cls: 'green' },
        { label: 'Pending Orders', value: stats?.pendingOrders?.toLocaleString(), icon: <Box size={22} />, cls: 'orange', change: 'Action needed', dir: 'down' },
        { label: 'Low Stock Items', value: stats?.lowStockProducts?.toLocaleString(), icon: <AlertTriangle size={22} />, cls: 'red', change: 'Restock', dir: 'down' }
    ];

    return (
        <div>
            {/* Stats */}
            <div className="stats-grid">
                {statCards.map((s, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-card-header">
                            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                            {s.change && <span className={`stat-change ${s.dir}`}>{s.change}</span>}
                        </div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Revenue Overview</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {['7days', '30days', '12months'].map(p => (
                                <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setPeriod(p)}>
                                    {p === '7days' ? '7D' : p === '30days' ? '30D' : '12M'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="chart-container">
                            <ResponsiveContainer>
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="revenue" stroke="#4CAF50" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Orders Trend</span>
                    </div>
                    <div className="card-body">
                        <div className="chart-container">
                            <ResponsiveContainer>
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="orders" fill="#4CAF50" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                    <span className="card-title">🏆 Top Selling Products</span>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Sold</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topProducts.map((p, i) => (
                            <tr key={p._id}>
                                <td style={{ fontWeight: 700 }}>{i + 1}</td>
                                <td style={{ fontWeight: 600 }}>{p.name}</td>
                                <td>₹{p.price}</td>
                                <td>
                                    <span className={`badge ${p.stock > 20 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-error'}`}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.totalSold}</td>
                            </tr>
                        ))}
                        {topProducts.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No data available. Connect backend and seed data.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
