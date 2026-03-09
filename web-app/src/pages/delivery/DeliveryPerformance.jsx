import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiClock, FiCalendar, FiCheckCircle, FiAlertTriangle, FiBarChart2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './DeliveryDashboard.css';

const DeliveryPerformance = () => {
    const { agentData, toggleBreakMode, isOnBreak } = useOutletContext();
    const perf = agentData?.performance || { onTimePercentage: 100, failedDeliveriesPercentage: 0, grade: 'A', complaintsCount: 0, returnedCount: 0 };

    const getGradeColor = (grade) => {
        if (grade === 'A') return '#00B14F';
        if (grade === 'B') return '#FFB800';
        return '#FA3E3E';
    };

    const getMetricColor = (val, thresholds) => {
        if (val >= thresholds[0]) return '#00B14F';
        if (val >= thresholds[1]) return '#FFB800';
        return '#FA3E3E';
    };

    const handleCheckInOut = () => {
        toast.error("Contact Hub Manager to manually override shift.");
    };

    const requestLeave = () => {
        toast.success("Leave request sent to Hub Manager.");
    };

    return (
        <div className="op-dashboard-container fade-in" style={{ paddingBottom: '90px' }}>

            <h2 className="op-section-title">Attendance & Shift</h2>
            <div className="op-welcome-card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #2C2F33', paddingBottom: '16px' }}>
                    <div>
                        <div style={{ color: '#949CA4', fontSize: '12px', marginBottom: '4px' }}>Current Shift Time</div>
                        <div style={{ color: 'white', fontSize: '18px', fontWeight: '800' }}>{agentData?.shiftTime || '09:00 AM - 06:00 PM'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#949CA4', fontSize: '12px', marginBottom: '4px' }}>Shift Hrs Logged</div>
                        <div style={{ color: '#00B14F', fontSize: '24px', fontWeight: '800' }}>
                            {(() => {
                                const todayStr = new Date().toISOString().split('T')[0];
                                const todayRec = agentData?.attendance?.find(a => a.date === todayStr);
                                if (!todayRec) return '0h';
                                const h = Math.floor(todayRec.hours || 0);
                                const m = Math.round(((todayRec.hours || 0) % 1) * 60);
                                return `${h}h ${m}m`;
                            })()}
                        </div>
                    </div>
                </div>

                {/* Attendance Heatmap Grid */}
                <div className="attendance-heatmap-container" style={{ marginBottom: '24px' }}>
                    <div style={{ color: '#949CA4', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Work History (Past 30 Days)</div>
                    <div className="heatmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px' }}>
                        {(() => {
                            const cells = [];
                            const today = new Date();
                            for (let i = 29; i >= 0; i--) {
                                const d = new Date();
                                d.setDate(today.getDate() - i);
                                const dStr = d.toISOString().split('T')[0];
                                const rec = agentData?.attendance?.find(a => a.date === dStr);

                                let status = 'absent';
                                let color = 'rgba(250, 62, 62, 0.15)';
                                if (rec) {
                                    if (rec.hours >= 6) { status = 'present'; color = '#00B14F'; }
                                    else if (rec.hours >= 3) { status = 'half-day'; color = '#FFB800'; }
                                    else { status = 'absent'; color = '#FA3E3E'; }
                                }

                                cells.push(
                                    <div
                                        key={dStr}
                                        className="heatmap-cell group relative"
                                        style={{
                                            aspectRatio: '1',
                                            background: color,
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            position: 'relative'
                                        }}
                                    >
                                        <div className="heatmap-tooltip">
                                            <div style={{ fontWeight: 800, marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                                                {new Date(dStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            </div>
                                            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span>Shift: <strong>{rec?.hours?.toFixed(1) || 0}h</strong></span>
                                                <span>Online: <strong>{rec?.onlineHours?.toFixed(1) || 0}h</strong></span>
                                                <span style={{ color: color }}>STATUS: {status.toUpperCase()}</span>
                                                {rec?.logs?.length > 0 && (
                                                    <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div style={{ color: '#949CA4', fontSize: '9px' }}>ACTIVITY LOG:</div>
                                                        {rec.logs.slice(-3).map((log, idx) => (
                                                            <div key={idx} style={{ fontSize: '9px', opacity: 0.8 }}>
                                                                • {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {log.event}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return cells;
                        })()}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <button onClick={handleCheckInOut} style={{ background: '#111315', color: 'white', border: '1px solid #2C2F33', padding: '16px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FiCheckCircle style={{ color: '#00B14F', fontSize: '18px' }} /> Check In/Out
                    </button>
                    <button onClick={toggleBreakMode} style={{ background: '#111315', color: isOnBreak ? '#FA3E3E' : 'white', border: '1px solid #2C2F33', padding: '16px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FiClock style={{ color: '#FFB800', fontSize: '18px' }} /> {isOnBreak ? 'End Break' : 'Start Break'}
                    </button>
                    <button onClick={requestLeave} style={{ background: '#111315', color: 'white', border: '1px solid #2C2F33', padding: '16px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', gridColumn: 'span 2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FiCalendar style={{ color: '#1A73E8', fontSize: '18px' }} /> Request Leave / Time Off
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', fontSize: '10px', color: '#949CA4' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#00B14F' }}></div> P</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#FFB800' }}></div> HD</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#FA3E3E' }}></div> A</div>
                </div>

                <div style={{ background: 'rgba(255, 184, 0, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,184,0,0.3)', color: '#FFB800', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: '1.4' }}>
                    <FiAlertTriangle style={{ fontSize: '16px', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <strong style={{ display: 'block', marginBottom: '2px' }}>Late Arrival Tracked</strong>
                        You checked in 12 minutes late today. Repeated late arrivals affect Performance Grade.
                    </div>
                </div>
            </div>

            <h2 className="op-section-title">Performance & KPI</h2>
            <div className="op-welcome-card" style={{ marginBottom: '24px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2C2F33', paddingBottom: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: getGradeColor(perf.grade) + '20', color: getGradeColor(perf.grade), width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '800', border: `2px solid ${getGradeColor(perf.grade)}` }}>
                            {perf.grade}
                        </div>
                        <div>
                            <div style={{ color: '#949CA4', fontSize: '14px', marginBottom: '4px' }}>Performance Grade</div>
                            <div style={{ color: 'white', fontWeight: '800', fontSize: '20px' }}>{perf.grade === 'A' ? 'Excellent Work' : perf.grade === 'B' ? 'Good' : 'Needs Improvement'}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                    <div style={{ background: '#111315', padding: '20px', borderRadius: '16px', border: '1px solid #2C2F33' }}>
                        <div style={{ color: '#949CA4', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiCheckCircle /> On-Time %</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '28px', fontWeight: '800', color: getMetricColor(perf.onTimePercentage, [95, 85]) }}>{perf.onTimePercentage}%</span>
                        </div>
                    </div>

                    <div style={{ background: '#111315', padding: '20px', borderRadius: '16px', border: '1px solid #2C2F33' }}>
                        <div style={{ color: '#949CA4', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiAlertTriangle /> Failed / Cancelled</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '28px', fontWeight: '800', color: perf.failedDeliveriesPercentage <= 2 ? '#00B14F' : perf.failedDeliveriesPercentage <= 5 ? '#FFB800' : '#FA3E3E' }}>{perf.failedDeliveriesPercentage}%</span>
                        </div>
                    </div>

                    <div style={{ background: '#111315', padding: '20px', borderRadius: '16px', border: '1px solid #2C2F33' }}>
                        <div style={{ color: '#949CA4', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiClock /> Avg Delivery Time</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>{agentData?.avgDeliveryTime || '14m'}</span>
                        </div>
                    </div>

                    <div style={{ background: '#111315', padding: '20px', borderRadius: '16px', border: '1px solid #2C2F33' }}>
                        <div style={{ color: '#949CA4', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiBarChart2 /> Customer Rating</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '28px', fontWeight: '800', color: '#00B14F' }}>⭐ {agentData?.rating?.average || '5.0'}</span>
                        </div>
                    </div>

                </div>

                <div style={{ borderTop: '1px solid #2C2F33', marginTop: '24px', paddingTop: '24px', display: 'flex', justifyContent: 'space-around' }}>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ color: '#949CA4', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Complaints Count</span>
                        <span style={{ color: perf.complaintsCount > 0 ? '#FA3E3E' : '#00B14F', fontWeight: '800', fontSize: '24px' }}>{perf.complaintsCount}</span>
                    </div>
                    <div style={{ width: '1px', background: '#2C2F33' }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ color: '#949CA4', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Damaged / Returned</span>
                        <span style={{ color: perf.returnedCount > 0 ? '#FA3E3E' : '#00B14F', fontWeight: '800', fontSize: '24px' }}>{perf.returnedCount}</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DeliveryPerformance;
