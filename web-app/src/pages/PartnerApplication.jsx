import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiUser,
    FiTruck,
    FiShield,
    FiCreditCard,
    FiCheckCircle,
    FiAlertCircle,
    FiClock,
    FiChevronRight,
    FiChevronLeft
} from 'react-icons/fi';
import deliveryService from '../services/deliveryService';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './PartnerApplication.css';

const STEPS = [
    { title: 'Personal Info', icon: FiUser },
    { title: 'Vehicle', icon: FiTruck },
    { title: 'Verification', icon: FiShield },
    { title: 'Bank Details', icon: FiCreditCard },
    { title: 'Review', icon: FiCheckCircle }
];

const PartnerApplication = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState(null); // 'checking', 'none', 'pending', 'approved', 'rejected'
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        vehicleType: 'bike',
        vehicleNumber: '',
        licenseNumber: '',
        aadhaarNumber: '',
        panNumber: '',
        bankDetails: {
            accountNumber: '',
            ifscCode: '',
            bankName: ''
        }
    });

    useEffect(() => {
        const checkStatus = async () => {
            try {
                setStatus('checking');
                const res = await deliveryService.getApplicationStatus();
                if (res.success && res.data.agent) {
                    setStatus(res.data.agent.status);
                } else {
                    setStatus('none');
                }
            } catch (err) {
                console.error('Failed to check application status:', err);
                setStatus('none');
            }
        };
        checkStatus();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('bank_')) {
            const bankField = name.split('_')[1];
            setFormData(prev => ({
                ...prev,
                bankDetails: {
                    ...prev.bankDetails,
                    [bankField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const res = await deliveryService.applyForPartner(formData);
            if (res.success) {
                toast.success('Application submitted successfully!');
                setStatus('pending');
            } else {
                toast.error(res.message || 'Failed to submit application');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error occurred during submission');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'checking') {
        return (
            <div className="application-container v-center">
                <div className="spinner"></div>
                <p>Loading application status...</p>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="application-container v-center">
                <div className="status-card glass pulse-border">
                    <FiClock className="status-icon waiting" />
                    <h2>Waiting for Approval</h2>
                    <p>Your application is currently under review by our admin team.</p>
                    <p className="status-sub">We usually review applications within 24-48 hours. You will be notified once a decision has been made.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>Return to Shopping</button>
                </div>
            </div>
        );
    }

    if (status === 'approved') {
        const handleGoToDashboard = async () => {
            try {
                setLoading(true);
                const res = await authAPI.getProfile();
                if (res.success && res.data.user) {
                    updateUser(res.data.user);
                } else {
                    updateUser({ ...user, role: 'delivery' });
                }
                // Force full page reload to clear any cached router state
                window.location.href = '/delivery';
            } catch (err) {
                updateUser({ ...user, role: 'delivery' });
                window.location.href = '/delivery';
            }
        };

        return (
            <div className="application-container v-center">
                <div className="status-card glass">
                    <FiCheckCircle className="status-icon approved" />
                    <h2>Application Approved!</h2>
                    <p>Congratulations, you are now a delivery partner.</p>
                    <button className="btn btn-primary" onClick={handleGoToDashboard} disabled={loading} style={{ marginTop: '20px' }}>
                        {loading ? <div className="mini-spinner"></div> : 'Go to Partner Dashboard'}
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="application-container v-center">
                <div className="status-card glass border-red">
                    <FiAlertCircle className="status-icon rejected" />
                    <h2>Application Denied</h2>
                    <p>Unfortunately, your application to become a delivery partner has been rejected.</p>
                    <button className="btn btn-outline" onClick={() => navigate('/support')} style={{ marginTop: '20px' }}>Contact Support</button>
                </div>
            </div>
        );
    }

    // "None" -> Application Form
    const renderStep = () => {
        switch (currentStep) {
            case 0: // Personal Info
                return (
                    <div className="form-step slide-in">
                        <h3>Personal Information</h3>
                        <p className="step-desc">This information is taken from your customer profile.</p>

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-input" type="text" value={user?.name || ''} disabled />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input className="form-input" type="text" value={user?.phone || ''} disabled />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-input" type="text" value={user?.email || ''} disabled />
                        </div>
                    </div>
                );
            case 1: // Vehicle
                return (
                    <div className="form-step slide-in">
                        <h3>Vehicle Details</h3>
                        <p className="step-desc">Tell us about the vehicle you will use for deliveries.</p>

                        <div className="form-group">
                            <label className="form-label">Vehicle Type</label>
                            <select className="form-select" name="vehicleType" value={formData.vehicleType} onChange={handleInputChange}>
                                <option value="bike">Motorcycle / Bike</option>
                                <option value="scooter">Scooter</option>
                                <option value="bicycle">Bicycle</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Vehicle Registration Number</label>
                            <input className="form-input" type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} placeholder="e.g. DL 01 AB 1234" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Driving License Number</label>
                            <input className="form-input" type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} placeholder="Required for Motorized Vehicles" />
                        </div>
                    </div>
                );
            case 2: // Verification
                return (
                    <div className="form-step slide-in">
                        <h3>Identity Verification</h3>
                        <p className="step-desc">Required for background checks & security.</p>

                        <div className="form-group">
                            <label className="form-label">Aadhaar / National ID Number</label>
                            <input className="form-input" type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} placeholder="Enter 12-digit Aadhaar Number" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">PAN Card Number</label>
                            <input className="form-input" type="text" name="panNumber" value={formData.panNumber} onChange={handleInputChange} placeholder="Enter 10-character PAN" style={{ textTransform: 'uppercase' }} />
                        </div>
                    </div>
                );
            case 3: // Bank Details
                return (
                    <div className="form-step slide-in">
                        <h3>Bank Details</h3>
                        <p className="step-desc">So we know where to send your payouts and earnings.</p>

                        <div className="form-group">
                            <label className="form-label">Bank Name</label>
                            <input className="form-input" type="text" name="bank_bankName" value={formData.bankDetails.bankName} onChange={handleInputChange} placeholder="e.g. State Bank of India" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Account Number</label>
                            <input className="form-input" type="text" name="bank_accountNumber" value={formData.bankDetails.accountNumber} onChange={handleInputChange} placeholder="Enter Account Number" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">IFSC Code</label>
                            <input className="form-input" type="text" name="bank_ifscCode" value={formData.bankDetails.ifscCode} onChange={handleInputChange} placeholder="e.g. SBIN0001234" style={{ textTransform: 'uppercase' }} />
                        </div>
                    </div>
                );
            case 4: // Review
                return (
                    <div className="form-step slide-in">
                        <h3>Review & Submit</h3>
                        <p className="step-desc">Please verify all information before applying.</p>

                        <div className="review-list">
                            <div className="review-item">
                                <span>Vehicle:</span>
                                <strong>{formData.vehicleType.toUpperCase()} - {formData.vehicleNumber}</strong>
                            </div>
                            <div className="review-item">
                                <span>Aadhaar:</span>
                                <strong>{formData.aadhaarNumber || 'Not provided'}</strong>
                            </div>
                            <div className="review-item">
                                <span>PAN:</span>
                                <strong>{formData.panNumber || 'Not provided'}</strong>
                            </div>
                            <div className="review-item">
                                <span>Bank Account:</span>
                                <strong>{formData.bankDetails.accountNumber ? '********' + formData.bankDetails.accountNumber.slice(-4) : 'Not provided'}</strong>
                            </div>
                        </div>

                        <div className="terms-box">
                            <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px' }}>
                                <input type="checkbox" required />
                                <span>I confirm that all information provided is accurate and I agree to the <a href="#">Partner Terms & Conditions</a>.</span>
                            </label>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="application-page">
            <div className="application-container">
                <div className="application-header">
                    <h1>Become a Delivery Partner</h1>
                    <p>Earn money on your own schedule. Complete the form to apply.</p>
                </div>

                <div className="form-wrapper glass">
                    {/* Stepper Header */}
                    <div className="stepper-header">
                        {STEPS.map((step, index) => (
                            <div key={index} className={`step-item ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}>
                                <div className="step-icon">
                                    <step.icon size={18} />
                                </div>
                                <span className="step-label">{step.title}</span>
                                {index < STEPS.length - 1 && <div className="step-line"></div>}
                            </div>
                        ))}
                    </div>

                    <div className="form-content">
                        {renderStep()}
                    </div>

                    <div className="form-footer">
                        {currentStep > 0 ? (
                            <button className="btn btn-outline" onClick={handleBack}>
                                <FiChevronLeft /> Back
                            </button>
                        ) : <div></div>}

                        {currentStep < STEPS.length - 1 ? (
                            <button className="btn btn-primary btn-next" onClick={handleNext}>
                                Next <FiChevronRight />
                            </button>
                        ) : (
                            <button className="btn btn-primary submit-btn pulse-glow" onClick={handleSubmit} disabled={loading}>
                                {loading ? <div className="mini-spinner"></div> : 'Submit Application'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerApplication;
