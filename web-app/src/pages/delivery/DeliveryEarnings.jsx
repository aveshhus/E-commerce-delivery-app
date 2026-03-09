import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    FiDollarSign,
    FiTrendingUp,
    FiCalendar,
    FiGift,
    FiAlertCircle,
    FiDownload,
    FiPieChart
} from 'react-icons/fi';
import './DeliveryDashboard.css';

const DeliveryEarnings = () => {
    const { agentData } = useOutletContext();
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));

    const earnings = agentData?.earnings || {
        baseSalary: 15000,
        perDeliveryBonus: 20,
        attendanceBonus: 50,
        today: 0,
        monthly: 0,
        total: 0
    };

    // Mock calculations based on actual data
    const completedOrders = agentData?.totalDeliveries || 0;
    const daysPresent = agentData?.attendance?.filter(a => a.status === 'present').length || 0;

    const deliveryBonusTotal = completedOrders * earnings.perDeliveryBonus;
    const attBonusTotal = daysPresent * earnings.attendanceBonus;
    const projectedTotal = earnings.baseSalary + deliveryBonusTotal + attBonusTotal;

    return (
        <div className="op-dashboard-container fade-in" style={{ paddingBottom: '90px' }}>
            <h2 className="op-section-title">Earnings & Payroll</h2>

            {/* Main Wallet Card */}
            <div className="op-earnings-card" style={{
                background: 'linear-gradient(135deg, #00B14F 0%, #00823A 100%)',
                padding: '24px',
                borderRadius: '20px',
                color: 'white',
                marginBottom: '24px',
                boxShadow: '0 8px 32px rgba(0, 177, 79, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <span style={{ fontSize: '13px', opacity: 0.9, fontWeight: '600' }}>Balance for {selectedMonth}</span>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', margin: '4px 0' }}>₹{projectedTotal.toLocaleString()}</h1>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                        <FiPieChart size={24} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ flex: 1 }}>
                        <small style={{ opacity: 0.8, fontSize: '11px', display: 'block' }}>Today's Earning</small>
                        <strong style={{ fontSize: '16px' }}>₹{earnings.today}</strong>
                    </div>
                    <div style={{ flex: 1 }}>
                        <small style={{ opacity: 0.8, fontSize: '11px', display: 'block' }}>Bonus Earned</small>
                        <strong style={{ fontSize: '16px' }}>₹{deliveryBonusTotal}</strong>
                    </div>
                </div>
            </div>

            {/* Breakdown Section */}
            <h3 className="op-section-title">Structure Breakdown</h3>
            <div className="op-menu-group" style={{ marginBottom: '24px' }}>
                <div className="op-menu-item" style={{ borderBottom: '1px solid var(--op-border)' }}>
                    <div className="op-menu-icon" style={{ background: 'rgba(255,255,255,0.05)', color: '#949CA4' }}><FiDollarSign /></div>
                    <div className="op-menu-text">
                        <span>Base Salary</span>
                        <small>Fixed monthly pay</small>
                    </div>
                    <div style={{ fontWeight: '800', color: 'white' }}>₹{earnings.baseSalary.toLocaleString()}</div>
                </div>
                <div className="op-menu-item" style={{ borderBottom: '1px solid var(--op-border)' }}>
                    <div className="op-menu-icon" style={{ background: 'rgba(0,177,79,0.1)', color: '#00B14F' }}><FiGift /></div>
                    <div className="op-menu-text">
                        <span>Delivery Bonus</span>
                        <small>₹{earnings.perDeliveryBonus} per successful order</small>
                    </div>
                    <div style={{ fontWeight: '800', color: '#00B14F' }}>+₹{deliveryBonusTotal.toLocaleString()}</div>
                </div>
                <div className="op-menu-item">
                    <div className="op-menu-icon" style={{ background: 'rgba(255,184,0,0.1)', color: '#FFB800' }}><FiTrendingUp /></div>
                    <div className="op-menu-text">
                        <span>Attendance Bonus</span>
                        <small>₹{earnings.attendanceBonus} per day present</small>
                    </div>
                    <div style={{ fontWeight: '800', color: '#FFB800' }}>+₹{attBonusTotal.toLocaleString()}</div>
                </div>
            </div>

            {/* Performance Deductions */}
            <h3 className="op-section-title">Adjustments</h3>
            <div className="op-welcome-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
                <div style={{ background: 'rgba(250,62,62,0.1)', color: '#FA3E3E', padding: '12px', borderRadius: '12px' }}>
                    <FiAlertCircle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', display: 'block' }}>No Deductions</span>
                    <small style={{ color: '#949CA4' }}>Maintain Grade A to avoid penalties.</small>
                </div>
            </div>

            <button className="op-logout-btn" style={{ background: 'transparent', borderColor: 'var(--op-border)' }}>
                <FiDownload /> Download Salary Slip
            </button>

            <br /><br /><br />
        </div>
    );
};

export default DeliveryEarnings;
