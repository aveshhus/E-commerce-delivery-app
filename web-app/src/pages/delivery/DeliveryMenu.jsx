import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiSettings, FiFileText, FiBook, FiBell, FiAlertCircle, FiTruck, FiChevronRight, FiPhoneCall, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './DeliveryDashboard.css';

const DeliveryMenu = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { agentData } = useOutletContext();
    const [showSOS, setShowSOS] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const notImplemented = (feature) => toast(`${feature} portal is currently managed manually by Hub Ops.`, { icon: '🏗️' });

    return (
        <div className="op-dashboard-container fade-in" style={{ paddingBottom: '90px' }}>
            <div className="op-welcome-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', border: '1px solid #2C2F33' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#111315', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', color: '#00B14F', border: '2px solid rgba(0, 177, 79, 0.3)' }}>
                    {agentData?.name?.charAt(0) || 'KM'}
                </div>
                <div>
                    <h3 style={{ color: 'white', margin: 0, fontSize: '22px' }}>{agentData?.name || 'Partner Agent'}</h3>
                    <p style={{ color: '#00B14F', fontSize: '14px', margin: '4px 0 0', fontWeight: '700' }}>EMP ID: {agentData?.employeeId || 'KM-PENDING'}</p>
                </div>
            </div>

            {/* 6. Notifications Panel */}
            <h3 className="op-section-title">Ops & Alerts</h3>
            <div className="op-menu-group">
                <button className="op-menu-item" onClick={() => notImplemented("Hub Announcements")}>
                    <div className="op-menu-icon" style={{ color: '#1A73E8', background: 'rgba(26,115,232,0.1)' }}><FiBell /></div>
                    <div className="op-menu-text">
                        <span>Hub Announcements</span>
                        <small>Shift reminders & Route changes</small>
                    </div>
                    <FiChevronRight className="op-menu-arrow" />
                </button>
            </div>

            {/* 7. Incident / Support System */}
            <h3 className="op-section-title">Field Support & SOS</h3>
            <div className="op-menu-group">
                <button className="op-menu-item" onClick={() => notImplemented("Incident Report")}>
                    <div className="op-menu-icon" style={{ color: '#FFB800', background: 'rgba(255,184,0,0.1)' }}><FiAlertCircle /></div>
                    <div className="op-menu-text">
                        <span>Report an Issue</span>
                        <small>Order damages, payments, vehicle breakdown</small>
                    </div>
                    <FiChevronRight className="op-menu-arrow" />
                </button>
                <button className="op-menu-item" onClick={() => setShowSOS(true)}>
                    <div className="op-menu-icon" style={{ color: '#FA3E3E', background: 'rgba(250,62,62,0.1)' }}><FiPhoneCall /></div>
                    <div className="op-menu-text">
                        <span style={{ color: '#FA3E3E', fontWeight: '800' }}>SOS Emergency</span>
                        <small>Immediate medical/police hub dispatch</small>
                    </div>
                    <FiChevronRight className="op-menu-arrow" />
                </button>
            </div>

            {/* 8. Vehicle & Asset Management */}
            <h3 className="op-section-title">Vehicle & Asset Management</h3>
            <div className="op-menu-group">
                <button className="op-menu-item" onClick={() => notImplemented("Vehicle Management")}>
                    <div className="op-menu-icon" style={{ color: '#00B14F', background: 'rgba(0,177,79,0.1)' }}><FiTruck /></div>
                    <div className="op-menu-text">
                        <span>My Assigned Vehicle</span>
                        <small>Fuel log, Insurance expiry, Maintenance</small>
                    </div>
                    <FiChevronRight className="op-menu-arrow" />
                </button>
            </div>

            {/* 9. Documents Section */}
            <h3 className="op-section-title">Compliance & Docs</h3>
            <div className="op-menu-group">
                <button className="op-menu-item" onClick={() => notImplemented("Document Upload")}>
                    <div className="op-menu-icon" style={{ color: '#949CA4', background: '#2C2F33' }}><FiFileText /></div>
                    <div className="op-menu-text">
                        <span>Identity & Documents</span>
                        <small>DL, Aadhar, Bank details</small>
                    </div>
                    <FiChevronRight className="op-menu-arrow" />
                </button>
                <button className="op-menu-item" onClick={() => notImplemented("Company Policies")}>
                    <div className="op-menu-icon" style={{ color: '#949CA4', background: '#2C2F33' }}><FiShield /></div>
                    <div className="op-menu-text">
                        <span>Company Policy</span>
                        <small>Contracts & Code of conduct</small>
                    </div>
                    <FiChevronRight className="op-menu-arrow" />
                </button>
            </div>

            {/* 10. Training & Guidelines */}
            <h3 className="op-section-title">Training & Guidelines</h3>
            <div className="op-menu-group" style={{ marginBottom: '32px' }}>
                <button className="op-menu-item" onClick={() => notImplemented("Training SOPs")}>
                    <div className="op-menu-icon" style={{ color: '#949CA4', background: '#2C2F33' }}><FiBook /></div>
                    <div className="op-menu-text">
                        <span>Training Center</span>
                        <small>Delivery SOPs & Customer safety videos</small>
                    </div>
                    <FiChevronRight className="op-menu-arrow" />
                </button>
            </div>

            <button className="op-logout-btn" onClick={handleLogout}>
                <FiLogOut /> Sign Off (End Shift)
            </button>

            {showSOS && (
                <div className="fail-modal-overlay">
                    <div className="fail-modal-content" style={{ textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(250,62,62,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <FiPhoneCall style={{ fontSize: '40px', color: '#FA3E3E' }} />
                        </div>
                        <h2 style={{ color: '#FA3E3E', marginBottom: '8px' }}>EMERGENCY SOS</h2>
                        <p style={{ color: '#949CA4', fontSize: '14px', marginBottom: '24px' }}>This will immediately dispatch Hub Ops security and emergency services to your live GPS coordinates.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button className="btn-v3" style={{ background: '#2C2F33', color: 'white', border: 'none' }} onClick={() => setShowSOS(false)}>CANCEL</button>
                            <button className="btn-v3" style={{ background: '#FA3E3E', color: 'white', border: 'none' }} onClick={() => { toast.success("SOS DISPATCHED."); setShowSOS(false); }}>TRIGGER SOS</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryMenu;
