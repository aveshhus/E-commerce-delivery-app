import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiAlertCircle,
    FiCamera,
    FiSend,
    FiChevronLeft,
    FiMessageSquare,
    FiUserX,
    FiMapPin,
    FiTruck
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './DeliveryDashboard.css';

const DeliveryIssueReport = () => {
    const navigate = useNavigate();
    const [issueType, setIssueType] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const issueTypes = [
        { id: 'customer_no_answer', label: 'Customer not answering', icon: <FiUserX /> },
        { id: 'address_incorrect', label: 'Address incorrect', icon: <FiMapPin /> },
        { id: 'order_damaged', label: 'Order damaged', icon: <FiAlertCircle /> },
        { id: 'vehicle_issue', label: 'Vehicle issue', icon: <FiTruck /> },
        { id: 'other', label: 'Other problem', icon: <FiMessageSquare /> }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!issueType) return toast.error("Please select an issue type");
        if (!note) return toast.error("Please provide a brief note");

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            toast.success("Incident report filed. Hub Ops notified.");
            setIsSubmitting(false);
            navigate('/delivery/menu');
        }, 1500);
    };

    return (
        <div className="op-dashboard-container fade-in" style={{ paddingBottom: '90px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <button onClick={() => navigate('/delivery/menu')} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>
                    <FiChevronLeft />
                </button>
                <h2 className="op-section-title" style={{ margin: 0 }}>Report an Issue</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ color: '#949CA4', fontSize: '13px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What happened?</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '32px' }}>
                    {issueTypes.map(type => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => setIssueType(type.id)}
                            className={`op-menu-item ${issueType === type.id ? 'active' : ''}`}
                            style={{
                                borderRadius: '12px',
                                border: issueType === type.id ? '1px solid #FFB800' : '1px solid var(--op-border)',
                                background: issueType === type.id ? 'rgba(255,184,0,0.05)' : 'var(--op-card-bg)',
                                color: issueType === type.id ? '#FFB800' : 'white'
                            }}
                        >
                            <div className="op-menu-icon" style={{
                                color: issueType === type.id ? '#FFB800' : '#949CA4',
                                background: 'rgba(255,255,255,0.05)'
                            }}>{type.icon}</div>
                            <div className="op-menu-text">
                                <span>{type.label}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div style={{ color: '#949CA4', fontSize: '13px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Details & Proof</div>

                <div style={{ background: 'var(--op-card-bg)', border: '1px solid var(--op-border)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                    <textarea
                        placeholder="Explain the situation briefly..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '15px',
                            resize: 'none',
                            minHeight: '100px',
                            outline: 'none'
                        }}
                    />

                    <div style={{ borderTop: '1px solid var(--op-border)', paddingTop: '16px', display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={() => toast.success("Camera ready (SIMULATED)")} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <FiCamera /> <span>Upload Photo</span>
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="op-btn-primary"
                    style={{ background: '#FFB800', width: '100%', border: 'none', padding: '18px' }}
                >
                    {isSubmitting ? 'Reporting...' : <><FiSend /> Submit Report</>}
                </button>
            </form>

            <br /><br /><br />
        </div>
    );
};

export default DeliveryIssueReport;
