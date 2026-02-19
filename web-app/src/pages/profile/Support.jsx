import { useState } from 'react';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Support = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate sending email
        setTimeout(() => {
            setLoading(false);
            toast.success("Support ticket created! We'll contact you shortly.");
            setSubject('');
            setMessage('');
        }, 1500);
    };

    return (
        <div className="profile-section fade-in">
            <h2 className="section-title">Help & Support</h2>

            <div className="profile-card mb-6">
                <h3 className="section-title" style={{ fontSize: '16px' }}>Contact Us</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e3f2fd', color: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Phone size={20} />
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Call Support</p>
                            <a href="tel:+911234567890" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}>+91 12345 67890</a>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e8f5e9', color: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>WhatsApp</p>
                            <a href="https://wa.me/911234567890" target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}>Chat with us</a>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffebee', color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Mail size={20} />
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Email Support</p>
                            <a href="mailto:support@groceryapp.com" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}>support@groceryapp.com</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket Form */}
            <div className="profile-card mb-6">
                <h3 className="section-title" style={{ fontSize: '16px' }}>Send a Message</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>Subject</label>
                        <input
                            type="text"
                            className="form-input"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                            placeholder="Order Issue / Feedback / General Query"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>Message</label>
                        <textarea
                            className="form-input"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '100px' }}
                            rows="4"
                            placeholder="Describe your issue..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="primary-btn" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Sending...' : 'Submit Ticket'}
                    </button>
                </form>
            </div>

            {/* FAQs */}
            <div className="profile-card" style={{ background: 'var(--bg)', border: 'none' }}>
                <h3 className="section-title" style={{ fontSize: '16px' }}>Frequently Asked Questions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <details className="group" style={{ cursor: 'pointer' }}>
                        <summary style={{ fontWeight: 600, fontSize: '14px', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                            How do I track my order?
                            <span>▼</span>
                        </summary>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', paddingLeft: '16px', borderLeft: '2px solid var(--border)' }}>Go to 'My Orders' section and tap on 'Track Order' for real-time updates.</p>
                    </details>
                    <details className="group" style={{ cursor: 'pointer' }}>
                        <summary style={{ fontWeight: 600, fontSize: '14px', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                            What is the refund policy?
                            <span>▼</span>
                        </summary>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', paddingLeft: '16px', borderLeft: '2px solid var(--border)' }}>Refunds are processed within 5-7 business days for cancelled orders or returns.</p>
                    </details>
                </div>
            </div>
        </div>
    );
};

export default Support;
