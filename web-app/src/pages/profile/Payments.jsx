import { useState } from 'react';
import { CreditCard, Plus, Landmark, Wallet, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Payments = () => {
    // Professional empty state - no mocked data
    const [savedMethods, setSavedMethods] = useState([]);

    return (
        <div className="profile-section fade-in">
            <h2 className="section-title">Payment Methods</h2>

            {savedMethods.length === 0 ? (
                <div className="profile-empty-state">
                    <div className="empty-icon-container" style={{ background: '#e3f2fd', color: '#1976d2' }}>
                        <CreditCard size={32} />
                    </div>
                    <h3 className="empty-title">No Saved Cards</h3>
                    <p className="empty-desc">
                        Save your credit or debit cards for faster checkout. Your data is encrypted and secure.
                    </p>
                    <button className="outline-btn">
                        <Plus size={18} /> Add New Card
                    </button>
                    <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#aaa' }}>
                        <ShieldCheck size={14} color="#0C831F" />
                        100% Secure Payments
                    </div>
                </div>
            ) : (
                <>
                    <h3 className="section-title" style={{ fontSize: '16px' }}>Saved Cards</h3>
                    {savedMethods.map(method => (
                        <div key={method.id} className="payment-option-card">
                            {/* Card content would go here */}
                        </div>
                    ))}

                    <button className="outline-btn w-full mb-6 justify-center">
                        <Plus size={16} /> Add New Card
                    </button>
                </>
            )}

            <h3 className="section-title" style={{ fontSize: '16px', marginTop: '32px' }}>Available Payment Options</h3>
            <div className="payment-methods-grid">
                <div className="payment-option-card">
                    <div className="payment-icon-box">
                        <Wallet size={24} />
                    </div>
                    <div className="payment-info">
                        <h4>UPI / Wallets</h4>
                        <p>GPay, PhonePe, Paytm</p>
                    </div>
                </div>
                <div className="payment-option-card">
                    <div className="payment-icon-box">
                        <Landmark size={24} />
                    </div>
                    <div className="payment-info">
                        <h4>Net Banking</h4>
                        <p>All Major Banks Supported</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
