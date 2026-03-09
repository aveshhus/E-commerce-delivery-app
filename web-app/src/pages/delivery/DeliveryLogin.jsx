import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiPhone,
    FiLock,
    FiUser,
    FiCheckCircle,
    FiShield,
    FiSmartphone,
    FiChevronRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './DeliveryDashboard.css';

const DeliveryLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: EmpID
    const [form, setForm] = useState({
        phone: '',
        otp: '',
        empId: '',
        email: 'delivery@km.com', // fallback for multi-auth
        password: 'password123'
    });
    const [loading, setLoading] = useState(false);

    const handleNext = (e) => {
        if (e) e.preventDefault();
        if (step === 1) {
            if (form.phone.length < 10) return toast.error("Enter valid phone number");
            setStep(2);
            toast.success("OTP Sent: 1234 (Demo)");
        } else if (step === 2) {
            if (form.otp !== '1234') return toast.error("Invalid OTP");
            setStep(3);
        }
    };

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            // Demo logic: using hardcoded credentials for the delivery bypass
            // In a real app, this would verify phone + OTP + EmpID
            const success = await login(form.email, form.password);
            if (success) {
                toast.success("Identity Verified. Welcome Partner.");
                navigate('/delivery');
            }
        } catch (error) {
            toast.error("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="op-dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#0B0D0E' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ background: '#00B14F', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '30px', fontWeight: '900', color: 'white', border: '3px solid rgba(255,255,255,0.2)' }}>K</div>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'white', margin: 0 }}>Partner Portal</h1>
                <p style={{ color: '#949CA4', fontSize: '14px', marginTop: '4px' }}>Logistics Division • Identity Verification</p>
            </div>

            <div className="op-welcome-card" style={{ padding: '32px 24px', margin: '0 20px', border: '1px solid #2C2F33' }}>
                {step === 1 && (
                    <div className="fade-in">
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00B14F', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                                <FiSmartphone /> Step 1 of 3
                            </div>
                            <h2 style={{ fontSize: '20px', color: 'white', margin: 0 }}>Enter Phone Number</h2>
                        </div>
                        <div className="op-input-group" style={{ position: 'relative', marginBottom: '24px' }}>
                            <FiPhone style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#949CA4' }} />
                            <input
                                type="tel"
                                placeholder="98765-43210"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                style={{ width: '100%', background: '#111315', border: '1px solid #2C2F33', color: 'white', padding: '16px 16px 16px 48px', borderRadius: '12px', fontSize: '16px' }}
                            />
                        </div>
                        <button className="op-btn-primary" onClick={handleNext} style={{ width: '100%' }}>Send Verification Code</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="fade-in">
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFB800', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                                <FiLock /> Step 2 of 3
                            </div>
                            <h2 style={{ fontSize: '20px', color: 'white', margin: 0 }}>Code Verification</h2>
                            <p style={{ color: '#949CA4', fontSize: '13px', marginTop: '4px' }}>Sent to +91 {form.phone}</p>
                        </div>
                        <div className="op-input-group" style={{ marginBottom: '24px' }}>
                            <input
                                type="text"
                                placeholder="Enter 4-digit code"
                                value={form.otp}
                                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                                maxLength="4"
                                style={{ width: '100%', background: '#111315', border: '1px solid #2C2F33', color: 'white', padding: '16px', borderRadius: '12px', fontSize: '24px', textAlign: 'center', letterSpacing: '12px', fontWeight: '800' }}
                            />
                        </div>
                        <button className="op-btn-primary" onClick={handleNext} style={{ width: '100%', background: '#FFB800' }}>Verify OTP</button>
                    </div>
                )}

                {step === 3 && (
                    <div className="fade-in">
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1A73E8', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                                <FiUser /> Last Step
                            </div>
                            <h2 style={{ fontSize: '20px', color: 'white', margin: 0 }}>Employee ID Option</h2>
                            <p style={{ color: '#949CA4', fontSize: '13px', marginTop: '4px' }}>Linking device to your corporate profile</p>
                        </div>
                        <div className="op-input-group" style={{ position: 'relative', marginBottom: '24px' }}>
                            <FiShield style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#949CA4' }} />
                            <input
                                type="text"
                                placeholder="KM-2026-XXXX"
                                value={form.empId}
                                onChange={(e) => setForm({ ...form, empId: e.target.value })}
                                style={{ width: '100%', background: '#111315', border: '1px solid #2C2F33', color: 'white', padding: '16px 16px 16px 48px', borderRadius: '12px', fontSize: '16px' }}
                            />
                        </div>
                        <button
                            className="op-btn-primary"
                            disabled={loading}
                            onClick={handleLogin}
                            style={{ width: '100%', background: '#1A73E8' }}
                        >
                            {loading ? 'Authenticating...' : 'Start Duty'}
                        </button>
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', color: '#535665', fontSize: '12px', padding: '0 40px' }}>
                <FiCheckCircle style={{ color: '#00B14F', marginRight: '4px' }} /> Device verification ensures only authorized partners can access active shipments.
                <br /><br />
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#1A73E8', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Switch to Customer App</button>
            </div>
        </div>
    );
};

export default DeliveryLogin;
