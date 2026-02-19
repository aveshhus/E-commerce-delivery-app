import { useState, useEffect } from 'react';
import { Wallet, ArrowRight, History } from 'lucide-react';
import { userAPI } from '../../services/api';

const WalletPage = () => {
    // Professional empty state - no mocked data
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const res = await userAPI.getWallet();
                if (res.success) {
                    setBalance(res.data.balance);
                    setHistory(res.data.history);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchWallet();
    }, []);

    return (
        <div className="profile-section fade-in">
            <h2 className="section-title">My Wallet</h2>

            {/* Balance Card */}
            <div className="wallet-card-main">
                <div className="wallet-bg-icon">
                    <Wallet size={120} />
                </div>
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <p className="wallet-balance-label">Available Balance</p>
                    <h1 className="wallet-balance-amount">₹{balance.toFixed(2)}</h1>
                    <button className="wallet-add-btn">
                        + Add Money
                    </button>
                </div>
            </div>

            {/* History */}
            <h3 className="section-title" style={{ fontSize: '18px', marginTop: '32px' }}>Transaction History</h3>

            {history.length === 0 ? (
                <div className="profile-empty-state" style={{ minHeight: '200px', padding: '32px' }}>
                    <div className="empty-icon-container" style={{ background: '#f5f5f5', color: '#bdbdbd' }}>
                        <History size={24} />
                    </div>
                    <h4 className="empty-title" style={{ fontSize: '16px' }}>No transactions yet</h4>
                    <p className="empty-desc" style={{ marginBottom: 0 }}>
                        Your recent wallet transactions will appear here.
                    </p>
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
                    {history.map((tx, i) => (
                        <div key={tx.id} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i !== history.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: tx.type === 'Credit' ? '#e8f5e9' : '#ffebee', color: tx.type === 'Credit' ? '#2e7d32' : '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowRight size={18} style={{ transform: tx.type === 'Credit' ? 'rotate(45deg)' : 'rotate(-45deg)' }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{tx.desc}</p>
                                    <p style={{ fontSize: '12px', color: '#888' }}>{tx.date}</p>
                                </div>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '14px', color: tx.type === 'Credit' ? '#2e7d32' : '#c62828' }}>
                                {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WalletPage;
