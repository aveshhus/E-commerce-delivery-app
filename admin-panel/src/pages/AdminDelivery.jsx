import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
    Plus,
    Edit,
    X,
    Trash2,
    CheckCircle,
    XCircle,
    DollarSign,
    Clock,
    MapPin,
    FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDelivery = () => {
    const [agents, setAgents] = useState([]);
    const [applications, setApplications] = useState([]);
    const [activeTab, setActiveTab] = useState('agents');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [showAnnModal, setShowAnnModal] = useState(false);
    const [viewingLogs, setViewingLogs] = useState(null);
    const [viewingPerformance, setViewingPerformance] = useState(null);
    const [detailedPerformance, setDetailedPerformance] = useState({ logs: [], agent: null });
    const [perfDateRange, setPerfDateRange] = useState({ start: '', end: '' });
    const [perfTab, setPerfTab] = useState('overview'); // 'overview' or 'logs'
    const [annForm, setAnnForm] = useState({ title: '', content: '', targetAudience: 'delivery' });
    const [form, setForm] = useState({ name: '', phone: '', email: '', vehicleType: 'bike', vehicleNumber: '', dailyTarget: 20 });

    // Shifts State
    // Shifts Computed Data
    const shiftList = [
        { id: 'morning', name: 'Morning Shift', time: '9:00 AM - 6:00 PM' },
        { id: 'evening', name: 'Evening Shift', time: '2:00 PM - 11:00 PM' },
        { id: 'night', name: 'Night Owl', time: '11:00 PM - 7:00 AM' }
    ];

    const getShiftAgentsCount = (timeRange) => {
        return agents.filter(a => a.shiftTime === timeRange).length;
    };

    const getAttendanceStats = (attendance = []) => {
        const stats = { full: 0, half: 0, absent: 0 };
        attendance.forEach(a => {
            if (a.status === 'present') stats.full++;
            else if (a.status === 'half-day') stats.half++;
            else stats.absent++;
        });
        return stats;
    };

    useEffect(() => {
        fetchAgents();
        fetchApplications();
        fetchAnnouncements();
    }, []);

    const fetchAgents = async () => {
        try {
            const res = await adminAPI.getAgents({ status: 'approved' });
            if (res.success) setAgents(res.data.agents);
        } catch (err) { console.error(err); }
    };

    const fetchApplications = async () => {
        try {
            const res = await adminAPI.getAgents({ status: 'pending' });
            if (res.success) setApplications(res.data.agents);
        } catch (err) { console.error(err); }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await adminAPI.getAnnouncements();
            if (res.success) setAnnouncements(res.data.announcements);
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this agent?')) return;
        try {
            await adminAPI.deleteAgent(id);
            toast.success('Agent removed');
            fetchAgents();
        } catch (err) { toast.error(err.message); }
    };

    const handleApplicationAction = async (id, status) => {
        try {
            await adminAPI.updateApplicationStatus(id, { status });
            toast.success(`Application ${status}`);
            fetchApplications();
            fetchAgents();
        } catch (err) { toast.error(err.message); }
    };

    const handleVerifyDocument = async (agentId, docType, status) => {
        try {
            const res = await adminAPI.verifyDocument(agentId, { docType, status });
            if (res.success) {
                toast.success(`${docType.toUpperCase()} ${status}`);
                if (viewingPerformance && viewingPerformance._id === agentId) {
                    setViewingPerformance(res.data.agent);
                }
                fetchAgents();
            }
        } catch (err) { toast.error(err.message); }
    };

    const fetchDetailedPerformance = async (agentId) => {
        try {
            const res = await adminAPI.getAgentPerformance(agentId, {
                startDate: perfDateRange.start,
                endDate: perfDateRange.end
            });
            if (res.success) {
                setDetailedPerformance(res.data);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (viewingPerformance) {
            fetchDetailedPerformance(viewingPerformance._id);
        }
    }, [viewingPerformance, perfDateRange]);

    const openNew = () => { setEditing(null); setForm({ name: '', phone: '', email: '', vehicleType: 'bike', vehicleNumber: '', dailyTarget: 20 }); setShowModal(true); };
    const openEdit = (a) => { setEditing(a._id); setForm({ name: a.name, phone: a.phone, email: a.email || '', vehicleType: a.vehicleType, vehicleNumber: a.vehicleNumber || '', dailyTarget: a.dailyTarget || 20 }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) await adminAPI.updateAgent(editing, form);
            else await adminAPI.createAgent(form);
            setShowModal(false); fetchAgents();
            toast.success(editing ? 'Updated' : 'Added');
        } catch (err) { toast.error(err.message); }
    };

    const handleAnnSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createAnnouncement(annForm);
            toast.success('Broadcasted');
            setShowAnnModal(false);
            fetchAnnouncements();
        } catch (err) { toast.error(err.message); }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '24px', margin: 0 }}>Delivery Operations</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Manage partners, shifts, and logistics payroll</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={() => setShowAnnModal(true)}>📣 Broadcast</button>
                    <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> New Agent</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'white', padding: '6px', borderRadius: '12px', boxShadow: 'var(--shadow)', width: 'fit-content' }}>
                {[
                    { id: 'agents', name: 'Riders' },
                    { id: 'applications', name: 'Portal Entries' },
                    { id: 'payroll', name: 'Payroll' },
                    { id: 'shifts', name: 'Shifts' },
                    { id: 'tracking', name: 'Live Map' },
                    { id: 'issues', name: 'Field Issues' },
                    { id: 'attendance', name: 'Attendance' },
                    { id: 'announcements', name: 'Notices' }
                ].map(t => (
                    <button
                        key={t.id}
                        style={{
                            background: activeTab === t.id ? 'var(--primary)' : 'transparent',
                            border: 'none',
                            color: activeTab === t.id ? 'white' : 'var(--text-secondary)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => setActiveTab(t.id)}
                    >
                        {t.name}
                    </button>
                ))}
            </div>

            <div className="card">
                {activeTab === 'agents' && (
                    <table className="admin-table">
                        <thead><tr><th>Agent</th><th>Status</th><th>Target</th><th>Performance</th><th>Actions</th></tr></thead>
                        <tbody>
                            {agents.map(a => (
                                <tr key={a._id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{a.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>EMP: {a.employeeId || 'KM-PENDING'}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${a.isOnline ? (a.isOnBreak ? 'badge-warning' : 'badge-success') : 'badge-outline'}`}>
                                            {a.isOnline ? (a.currentOrder ? 'ON DELIVERY' : (a.isOnBreak ? 'ON BREAK' : 'ONLINE')) : 'OFFLINE'}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{a.dailyTarget || 20}</td>
                                    <td>
                                        <div style={{ fontSize: '12px' }}>On-Time: <strong>{a.performance?.onTimePercentage}%</strong></div>
                                        <div style={{ fontSize: '11px', color: 'var(--success)' }}>Grade: {a.performance?.grade}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => setViewingPerformance(a)} title="View Performance"><FileText size={14} /></button>
                                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}><Edit size={14} /></button>
                                            <button className="btn btn-outline btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleDelete(a._id)}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'payroll' && (
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h4 style={{ margin: 0 }}>Monthly Salary Disbursement (March 2026)</h4>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Logic: Full Day (+₹50) | Half Day (+₹25) | Absent (₹0)</div>
                            <button className="btn btn-primary btn-sm">Generate All Slips</button>
                        </div>
                        <table className="admin-table">
                            <thead><tr><th>Agent</th><th>Base Pay</th><th>Work Summary</th><th>Attendance Bonus</th><th>Delivery Bonus</th><th>Net Payable</th></tr></thead>
                            <tbody>
                                {agents.map(a => {
                                    const attStats = getAttendanceStats(a.attendance);
                                    const attBonus = (attStats.full * 50) + (attStats.half * 25);
                                    const base = a.earnings?.baseSalary || 15000;
                                    const deliveryBonus = a.earnings?.monthly || 0;

                                    return (
                                        <tr key={a._id}>
                                            <td>
                                                <strong>{a.name}</strong>
                                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{a.employeeId}</div>
                                            </td>
                                            <td>₹{base}</td>
                                            <td>
                                                <div style={{ fontSize: '12px' }}>
                                                    <span style={{ color: 'var(--success)' }}>{attStats.full} Days Full</span> |
                                                    <span style={{ color: 'var(--warning)', marginLeft: '4px' }}>{attStats.half} Half</span>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--success)', fontWeight: 600 }}>+₹{attBonus}</td>
                                            <td style={{ color: 'var(--success)' }}>+₹{deliveryBonus}</td>
                                            <td style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary)' }}>₹{base + attBonus + deliveryBonus}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'shifts' && (
                    <div style={{ padding: '24px' }}>
                        <div className="grid-3">
                            {shiftList.map(s => (
                                <div key={s.id} className="card" style={{ padding: '20px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ background: 'var(--primary-50)', color: 'var(--primary)', padding: '6px', borderRadius: '8px' }}><Clock size={20} /></div>
                                        <span className="badge badge-info">{getShiftAgentsCount(s.time)} Active</span>
                                    </div>
                                    <h5 style={{ fontSize: '16px', margin: '0 0 4px' }}>{s.name}</h5>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 16px' }}>{s.time}</p>
                                    <button className="btn btn-outline btn-sm" style={{ width: '100%' }}>Manage Roster</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'tracking' && (
                    <div style={{ height: '500px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                        <MapPin size={48} color="var(--primary)" />
                        <div style={{ textAlign: 'center' }}>
                            <h4 style={{ margin: 0 }}>Live Rider Tracking</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Visualizing {agents.filter(a => a.isOnline).length} active riders on the field</p>
                        </div>
                        <div style={{ width: '80%', height: '300px', border: '2px dashed var(--border)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                            <div style={{ opacity: 0.3, textAlign: 'center' }}>
                                [ Interactive Map Engine Initializing... ]
                                <br />
                                <small>Using Google Maps API v3</small>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'issues' && (
                    <div style={{ padding: '24px' }}>
                        <table className="admin-table">
                            <thead><tr><th>Agent</th><th>Type</th><th>Severity</th><th>Description</th><th>Status</th></tr></thead>
                            <tbody>
                                {/* Mock data for now since we just created the table */}
                                <tr>
                                    <td><strong>Rahul Sharma</strong><br /><small>KM-7FF28A</small></td>
                                    <td><span className="badge badge-error">VEHICLE</span></td>
                                    <td><span style={{ color: 'var(--error)', fontWeight: 800 }}>CRITICAL</span></td>
                                    <td>Flat tire near Sector 15. Need backup for current order.</td>
                                    <td><span className="badge badge-warning">OPEN</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                    <table className="admin-table">
                        <thead><tr><th>Applicant</th><th>Documents</th><th>Vehicle</th><th>Actions</th></tr></thead>
                        <tbody>
                            {applications.map(a => (
                                <tr key={a._id}>
                                    <td><strong>{a.name}</strong><br /><small>{a.phone}</small></td>
                                    <td><div style={{ fontSize: '11px' }}>ID: {a.aadhaarNumber || 'PENDING'}</div></td>
                                    <td>{a.vehicleType?.toUpperCase()} ({a.vehicleNumber || 'N/A'})</td>
                                    <td>
                                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--success)', marginRight: '8px' }} onClick={() => handleApplicationAction(a._id, 'approved')}>Approve</button>
                                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleApplicationAction(a._id, 'rejected')}>Reject</button>
                                    </td>
                                </tr>
                            ))}
                            {applications.length === 0 && <tr><td colSpan={4} className="empty-state">No pending applications</td></tr>}
                        </tbody>
                    </table>
                )}

                {/* Attendance Tab */}
                {activeTab === 'attendance' && (
                    <div style={{ padding: '24px' }}>
                        <table className="admin-table">
                            <thead><tr><th>Agent</th><th>Date</th><th>Logged Hours</th><th>Breaks</th><th>Status</th></tr></thead>
                            <tbody>
                                {agents.flatMap(agent => (agent.attendance || []).toReversed().map((att, idx) => (
                                    <tr key={`${agent._id}-${idx}`}>
                                        <td><strong>{agent.name}</strong></td>
                                        <td>{att.date}</td>
                                        <td>{att.hours?.toFixed(2) || 0}h</td>
                                        <td>{att.breakMinutes?.toFixed(0) || 0}m</td>
                                        <td><span className={`badge ${att.status === 'present' ? 'badge-success' :
                                            att.status === 'half-day' ? 'badge-warning' : 'badge-error'
                                            }`}>{att.status}</span></td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Announcements Tab */}
                {activeTab === 'announcements' && (
                    <table className="admin-table">
                        <thead><tr><th>Title</th><th>Message</th><th>Target</th><th>Date</th></tr></thead>
                        <tbody>
                            {announcements.map(ann => (
                                <tr key={ann._id}>
                                    <td><strong>{ann.title}</strong></td>
                                    <td><small>{ann.content}</small></td>
                                    <td><span className="badge badge-outline">{ann.targetAudience}</span></td>
                                    <td>{new Date(ann.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modals skipped for brevity in write, but should be preserved if possible */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>{editing ? 'Edit Agent' : 'Add Agent'}</h3></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group"><label className="form-label">Name</label><input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                                <div className="form-group">
                                    <label className="form-label">Daily Target</label>
                                    <input className="form-input" type="number" value={form.dailyTarget} onChange={e => setForm({ ...form, dailyTarget: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Partner</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAnnModal && (
                <div className="modal-overlay" onClick={() => setShowAnnModal(false)}>
                    <div className="modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>Broadcast Message</h3></div>
                        <form onSubmit={handleAnnSubmit}>
                            <div className="modal-body">
                                <div className="form-group"><label className="form-label">Title</label><input className="form-input" required value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Message</label><textarea className="form-input" required rows="4" value={annForm.content} onChange={e => setAnnForm({ ...annForm, content: e.target.value })} /></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowAnnModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Send Broadcast</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Performance Dashboard Modal */}
            {viewingPerformance && (
                <div className="modal-overlay" onClick={() => setViewingPerformance(null)}>
                    <div className="performance-modal" onClick={e => e.stopPropagation()}>
                        <div className="p-modal-header">
                            <div>
                                <h3>Agent Performance Intelligence</h3>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                                    <button 
                                        className={`p-tab-btn ${perfTab === 'overview' ? 'active' : ''}`} 
                                        onClick={() => setPerfTab('overview')}
                                    >Overview</button>
                                    <button 
                                        className={`p-tab-btn ${perfTab === 'logs' ? 'active' : ''}`} 
                                        onClick={() => setPerfTab('logs')}
                                    >Activity Log</button>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setViewingPerformance(null)}><X size={20} /></button>
                        </div>

                        <div className="p-modal-body">
                            {perfTab === 'overview' ? (
                                <>
                                    <div className="perf-grade-card">
                                        <div className="grade-circle">
                                            <span>{viewingPerformance.performance?.grade || 'A'}</span>
                                        </div>
                                        <div className="grade-info">
                                            <span className="g-label">Performance Grade</span>
                                            <h2 className="g-status">
                                                {viewingPerformance.performance?.grade === 'A' ? 'Excellent Work' :
                                                    viewingPerformance.performance?.grade === 'B' ? 'Good Standing' :
                                                        viewingPerformance.performance?.grade === 'C' ? 'Needs Improvement' : 'Critical Warning'}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="perf-stats-grid">
                                        <div className="p-stat-box">
                                            <div className="p-stat-icon green"><CheckCircle size={18} /></div>
                                            <div className="p-stat-content">
                                                <span className="p-lbl">On-Time %</span>
                                                <h3 className="p-val green">{viewingPerformance.performance?.onTimePercentage || 0}%</h3>
                                            </div>
                                        </div>
                                        <div className="p-stat-box">
                                            <div className="p-stat-icon red"><XCircle size={18} /></div>
                                            <div className="p-stat-content">
                                                <span className="p-lbl">Failed / Cancelled</span>
                                                <h3 className="p-val red">{viewingPerformance.performance?.failedDeliveriesPercentage || 0}%</h3>
                                            </div>
                                        </div>
                                        <div className="p-stat-box">
                                            <div className="p-stat-icon blue"><Clock size={18} /></div>
                                            <div className="p-stat-content">
                                                <span className="p-lbl">Avg Delivery Time</span>
                                                <h3 className="p-val dark">24 mins</h3>
                                            </div>
                                        </div>
                                        <div className="p-stat-box">
                                            <div className="p-stat-icon yellow">⭐</div>
                                            <div className="p-stat-content">
                                                <span className="p-lbl">Customer Rating</span>
                                                <h3 className="p-val dark">{viewingPerformance.rating?.average?.toFixed(1) || '5.0'}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="compliance-section">
                                        <h4 className="section-title">COMPLIANCE & DOCUMENTS</h4>
                                        <div className="compliance-list">
                                            {[
                                                { id: 'aadhaar', label: 'Aadhaar Card', key: 'aadhaar' },
                                                { id: 'license', label: 'Driving License', key: 'license' },
                                                { id: 'pan', label: 'PAN Card', key: 'pan' },
                                                { id: 'bank', label: 'Bank Account', key: 'bank', isLinked: true }
                                            ].map(doc => {
                                                const docData = viewingPerformance.documents?.[doc.key] || {};
                                                const status = docData.status || 'unverified';
                                                const isVerified = status === 'verified';
                                                
                                                return (
                                                    <div key={doc.id} className="compliance-item">
                                                        <div className="doc-info">
                                                            <span className="doc-label">{doc.label}</span>
                                                            <h4 className="doc-status-text">{isVerified ? (doc.isLinked ? 'Linked' : 'Verified') : status.toUpperCase()}</h4>
                                                        </div>
                                                        <div className="doc-actions">
                                                            {docData.file && <a href={`http://${window.location.hostname}:5000${docData.file}`} target="_blank" rel="noreferrer" className="view-link">View</a>}
                                                            {!isVerified && (
                                                                <div className="verify-btn-group">
                                                                    <button className="v-btn approve" onClick={() => handleVerifyDocument(viewingPerformance._id, doc.key, 'verified')}><CheckCircle size={14} /></button>
                                                                    <button className="v-btn reject" onClick={() => handleVerifyDocument(viewingPerformance._id, doc.key, 'rejected')}><XCircle size={14} /></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="perf-logs-container">
                                    <div className="perf-filter-bar">
                                        <div className="p-date-input">
                                            <label>From</label>
                                            <input type="date" value={perfDateRange.start} onChange={e => setPerfDateRange({ ...perfDateRange, start: e.target.value })} />
                                        </div>
                                        <div className="p-date-input">
                                            <label>To</label>
                                            <input type="date" value={perfDateRange.end} onChange={e => setPerfDateRange({ ...perfDateRange, end: e.target.value })} />
                                        </div>
                                        <button className="btn btn-primary" onClick={() => fetchDetailedPerformance(viewingPerformance._id)}>Filter</button>
                                    </div>

                                    <table className="perf-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Orders</th>
                                                <th>Earnings</th>
                                                <th>Attendance</th>
                                                <th>Efficiency</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailedPerformance.logs.map((log, i) => (
                                                <tr key={i}>
                                                    <td>{new Date(log.date).toLocaleDateString()}</td>
                                                    <td><strong>{log.orders}</strong> pkts</td>
                                                    <td>₹{log.earnings}</td>
                                                    <td>
                                                        <span className={`p-att-badge ${log.attendance}`}>
                                                            {log.attendance.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="p-eff-bar">
                                                            <div className="p-eff-fill" style={{ width: `${(log.onTime / (log.orders || 1)) * 100}%` }}></div>
                                                        </div>
                                                        <small>{Math.round((log.onTime / (log.orders || 1)) * 100)}% On-time</small>
                                                    </td>
                                                </tr>
                                            ))}
                                            {detailedPerformance.logs.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No logs found for selected period</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .performance-modal {
                    background: #121212;
                    color: white;
                    width: 100%;
                    max-width: 800px;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                }
                .p-tab-btn {
                    background: transparent;
                    border: none;
                    color: #666;
                    font-size: 13px;
                    font-weight: 700;
                    padding: 4px 0;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }
                .p-tab-btn.active {
                    color: #00B14F;
                    border-bottom-color: #00B14F;
                }
                .p-modal-header {
                    padding: 24px;
                    background: #1a1a1a;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #333;
                }
                .p-modal-header h3 { margin: 0; font-size: 18px; color: #fff; }
                .p-modal-header p { margin: 4px 0 0; font-size: 13px; color: #888; }
                .close-btn { background: none; border: none; color: #666; cursor: pointer; }

                .p-modal-body { padding: 24px; }

                .perf-grade-card {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    background: #1a1a1a;
                    padding: 24px;
                    border-radius: 20px;
                    margin-bottom: 24px;
                    border: 1px solid #2a2a2a;
                }
                .grade-circle {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background: #00B14F22;
                    border: 3px solid #00B14F;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    font-weight: 900;
                    color: #00B14F;
                }
                .g-label { display: block; font-size: 14px; color: #888; }
                .g-status { margin: 4px 0 0; font-size: 26px; font-weight: 800; color: #fff; }

                .perf-stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .p-stat-box {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: 1px solid #2a2a2a;
                }
                .p-stat-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #252525;
                }
                .p-stat-icon.green { color: #00B14F; }
                .p-stat-icon.red { color: #FA3E3E; }
                .p-stat-icon.blue { color: #3B82F6; }
                .p-stat-icon.yellow { color: #FFB800; }

                .p-lbl { display: block; font-size: 12px; color: #888; font-weight: 600; }
                .p-val { margin: 2px 0 0; font-size: 22px; font-weight: 800; }
                .p-val.green { color: #00B14F; }
                .p-val.red { color: #FA3E3E; }
                .p-val.dark { color: #fff; }

                .perf-footer-metrics {
                    display: flex;
                    background: #1a1a1a;
                    border-radius: 20px;
                    padding: 20px;
                    border: 1px solid #2a2a2a;
                    margin-bottom: 24px;
                }
                .footer-metric-item { flex: 1; text-align: center; }
                .f-lbl { display: block; font-size: 13px; color: #888; margin-bottom: 4px; }
                .f-val { margin: 0; font-size: 24px; font-weight: 800; color: #00B14F; }
                .divider { width: 1px; background: #333; margin: 0 20px; }

                .p-attendance-preview {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 20px;
                    border: 1px solid #2a2a2a;
                }
                .p-attendance-preview h4 { margin: 0 0 16px; font-size: 14px; color: #888; }
                .mini-github-grid { display: flex; flex-wrap: wrap; gap: 4px; }
                .mini-cell { width: 12px; height: 12px; border-radius: 2px; }
                .mini-cell.filled { background: #00B14F; }
                .mini-cell.empty { background: #252525; }
                .mini-hint { margin: 10px 0 0; font-size: 11px; color: #666; }

                /* Compliance Section */
                .compliance-section {
                    margin-top: 24px;
                }
                .section-title {
                    font-size: 12px;
                    font-weight: 800;
                    color: #666;
                    margin-bottom: 16px;
                    letter-spacing: 1px;
                }
                .compliance-list {
                    background: #1a1a1a;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid #2a2a2a;
                }
                .compliance-item {
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #2a2a2a;
                }
                .compliance-item:last-child { border-bottom: none; }
                .doc-label { font-size: 12px; color: #888; display: block; margin-bottom: 4px; }
                .doc-status-text { font-size: 18px; font-weight: 800; color: #fff; margin: 0; }
                .doc-number { font-size: 11px; color: #555; font-family: monospace; }
                
                .doc-actions { display: flex; align-items: center; gap: 16px; }
                .view-link { font-size: 11px; color: #3B82F6; text-decoration: none; font-weight: 600; }
                .view-link:hover { text-decoration: underline; }

                .status-badge-v2 {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                }
                .status-badge-v2.verified { background: rgba(0, 177, 79, 0.1); color: #00B14F; border: 1px solid rgba(0, 177, 79, 0.2); }
                .status-badge-v2.pending { background: rgba(255, 184, 0, 0.1); color: #FFB800; border: 1px solid rgba(255, 184, 0, 0.2); }
                .status-badge-v2.rejected { background: rgba(250, 62, 62, 0.1); color: #FA3E3E; border: 1px solid rgba(250, 62, 62, 0.2); }
                .status-badge-v2.unverified { background: #252525; color: #666; }

                .verify-btn-group { display: flex; gap: 4px; }
                .v-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: 1px solid #333;
                    background: #252525;
                    color: #fff;
                    transition: all 0.2s;
                }
                .v-btn.approve:hover { background: #00B14F; color: white; border-color: #00B14F; }
                .v-btn.reject:hover { background: #FA3E3E; color: white; border-color: #FA3E3E; }

                /* Logs View Styling */
                .perf-logs-container { animation: fadeIn 0.3s ease; }
                .perf-filter-bar {
                    display: flex;
                    gap: 16px;
                    align-items: flex-end;
                    margin-bottom: 24px;
                    background: #1a1a1a;
                    padding: 16px;
                    border-radius: 12px;
                }
                .p-date-input { display: flex; flex-direction: column; gap: 4px; }
                .p-date-input label { font-size: 11px; color: #666; font-weight: 700; }
                .p-date-input input {
                    background: #252525;
                    border: 1px solid #333;
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    font-size: 13px;
                }
                .perf-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .perf-table th { text-align: left; padding: 12px; font-size: 11px; color: #666; text-transform: uppercase; border-bottom: 1px solid #333; }
                .perf-table td { padding: 16px 12px; font-size: 14px; border-bottom: 1px solid #222; }
                .p-att-badge { font-size: 10px; padding: 4px 8px; border-radius: 4px; font-weight: 800; }
                .p-att-badge.present { background: rgba(0, 177, 79, 0.1); color: #00B14F; }
                .p-att-badge.half-day { background: rgba(255, 184, 0, 0.1); color: #FFB800; }
                .p-att-badge.absent { background: rgba(250, 62, 62, 0.1); color: #FA3E3E; }
                .p-eff-bar { width: 60px; height: 4px; background: #333; border-radius: 2px; margin-bottom: 4px; overflow: hidden; }
                .p-eff-fill { height: 100%; background: #00B14F; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default AdminDelivery;
