import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    FiChevronLeft,
    FiUser,
    FiCreditCard,
    FiFileText,
    FiCalendar,
    FiMapPin,
    FiTruck,
    FiCheck
} from 'react-icons/fi';
import './DeliveryDashboard.css';

const DeliveryProfile = () => {
    const navigate = useNavigate();
    const { agentData } = useOutletContext();

    const sections = [
        {
            title: 'Personal Information',
            items: [
                { label: 'Full Name', value: agentData?.name, icon: <FiUser /> },
                { label: 'Employee ID', value: agentData?.employeeId || 'KM-PENDING', icon: <FiFileText /> },
                { label: 'Phone Number', value: agentData?.phone, icon: <FiUser /> },
                { label: 'Hub Location', value: agentData?.hubName || 'Main Hub', icon: <FiMapPin /> },
                { label: 'Joining Date', value: agentData?.createdAt ? new Date(agentData.createdAt).toLocaleDateString() : 'N/A', icon: <FiCalendar /> }
            ]
        },
        {
            title: 'Vehicle Details',
            items: [
                { label: 'Vehicle Type', value: agentData?.vehicleType?.toUpperCase() || 'BIKE', icon: <FiTruck /> },
                { label: 'Vehicle Number', value: agentData?.vehicleNumber || 'Pending Verification', icon: <FiTruck /> }
            ]
        },
        {
            title: 'Compliance & Documents',
            isDocs: true,
            items: [
                { label: 'Aadhaar Card', status: agentData?.aadhaarNumber ? 'Verified' : 'Action Required' },
                { label: 'Driving License', status: agentData?.licenseNumber ? 'Verified' : 'Action Required' },
                { label: 'PAN Card', status: agentData?.panNumber ? 'Verified' : 'Action Required' },
                { label: 'Bank Account', status: agentData?.bankDetails?.accountNumber ? 'Linked' : 'Action Required' }
            ]
        }
    ];

    return (
        <div className="op-dashboard-container fade-in" style={{ paddingBottom: '90px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <button onClick={() => navigate('/delivery/menu')} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', padding: 0 }}>
                    <FiChevronLeft />
                </button>
                <h2 className="op-section-title" style={{ margin: 0 }}>My Profile</h2>
            </div>

            <div className="op-welcome-card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(0,177,79,0.1)',
                    color: '#00B14F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '44px',
                    fontWeight: '900',
                    margin: '0 auto 16px',
                    border: '4px solid rgba(0,177,79,0.2)'
                }}>
                    {agentData?.name?.charAt(0) || 'D'}
                </div>
                <h3 style={{ fontSize: '24px', margin: '0 0 4px' }}>{agentData?.name}</h3>
                <span className="status-tag online" style={{ fontSize: '12px' }}>Active Partner</span>
            </div>

            {sections.map((section, sIdx) => (
                <div key={sIdx} style={{ marginBottom: '32px' }}>
                    <h3 className="op-section-title" style={{ fontSize: '14px', color: '#949CA4' }}>{section.title}</h3>
                    <div className="op-menu-group">
                        {section.items.map((item, iIdx) => (
                            <div key={iIdx} className="op-menu-item" style={{ cursor: 'default' }}>
                                {!section.isDocs && <div className="op-menu-icon" style={{ background: 'rgba(255,255,255,0.05)', color: '#949CA4' }}>{item.icon}</div>}
                                <div className="op-menu-text">
                                    <small>{item.label}</small>
                                    <span style={{ fontSize: '15px' }}>{item.value || item.status}</span>
                                </div>
                                {section.isDocs && (
                                    <div style={{
                                        color: (item.status === 'Verified' || item.status === 'Linked') ? '#00B14F' : '#FA3E3E',
                                        fontSize: '11px',
                                        fontWeight: '800',
                                        background: (item.status === 'Verified' || item.status === 'Linked') ? 'rgba(0,177,79,0.1)' : 'rgba(250,62,62,0.1)',
                                        padding: '4px 8px',
                                        borderRadius: '4px'
                                    }}>
                                        {(item.status === 'Verified' || item.status === 'Linked') ? <><FiCheck /> {item.status}</> : item.status}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <p style={{ textAlign: 'center', color: '#949CA4', fontSize: '12px' }}>
                To update sensitive information, please contact your Hub Manager.
            </p>

            <br /><br /><br />
        </div>
    );
};

export default DeliveryProfile;
