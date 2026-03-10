import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    FiCalendar,
    FiClock,
    FiActivity,
    FiCoffee,
    FiUserCheck,
    FiUserX,
    FiChevronLeft,
    FiInfo,
    FiAlertCircle,
    FiArrowRight
} from 'react-icons/fi';
import deliveryService from '../../services/deliveryService';
import './DeliveryAttendance.css';

const DeliveryAttendance = () => {
    const navigate = useNavigate();
    const { agentData: contextAgent } = useOutletContext();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);
    const [stats, setStats] = useState({
        present: 0,
        halfDay: 0,
        absent: 0,
        avgHours: 0
    });

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await deliveryService.getProfile();
            if (res.success) {
                const attData = res.data.agent.attendance || [];
                // Sort by date descending
                const sorted = [...attData].sort((a, b) => new Date(b.date) - new Date(a.date));
                setAttendance(sorted);
                calculateStats(sorted);
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        let p = 0, h = 0, a = 0, totalHrs = 0;
        data.forEach(day => {
            if (day.status === 'present') p++;
            else if (day.status === 'half-day') h++;
            else a++;
            totalHrs += day.hours || 0;
        });
        setStats({
            present: p,
            halfDay: h,
            absent: a,
            avgHours: data.length > 0 ? (totalHrs / data.length).toFixed(1) : 0
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return '#00B14F';
            case 'half-day': return '#FFB800';
            case 'absent': return '#FA3E3E';
            default: return '#949CA4';
        }
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div><p>Fetching shift history...</p></div>;

    return (
        <div className="att-history-container fade-in">
            <header className="att-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FiChevronLeft />
                </button>
                <h1 className="page-title">Attendance & Shifts</h1>
                <div style={{ width: '40px' }}></div>
            </header>

            {/* Monthly Summary Cards */}
            <div className="att-summary-grid">
                <div className="att-stat-card">
                    <span className="label">Present</span>
                    <span className="value" style={{ color: '#00B14F' }}>{stats.present}</span>
                </div>
                <div className="att-stat-card">
                    <span className="label">Half-Day</span>
                    <span className="value" style={{ color: '#FFB800' }}>{stats.halfDay}</span>
                </div>
                <div className="att-stat-card">
                    <span className="label">Absent</span>
                    <span className="value" style={{ color: '#FA3E3E' }}>{stats.absent}</span>
                </div>
                <div className="att-stat-card">
                    <span className="label">Avg Hrs</span>
                    <span className="value">{stats.avgHours}h</span>
                </div>
            </div>

            {/* Yearly Contribution-style Grid */}
            <div className="yearly-grid-container">
                <div className="yearly-grid-header">
                    <h3 className="section-title">Yearly Performance Grid</h3>
                    <div className="grid-legend">
                        <div className="legend-item"><div className="sq present"></div> Present</div>
                        <div className="legend-item"><div className="sq half"></div> Half</div>
                        <div className="legend-item"><div className="sq absent"></div> Absent</div>
                    </div>
                </div>

                <div className="yearly-grid-scroll">
                    <div className="yearly-grid">
                        {(() => {
                            const cells = [];
                            const today = new Date();
                            // Go back 364 days to show a full year including today
                            for (let i = 364; i >= 0; i--) {
                                const d = new Date();
                                d.setDate(today.getDate() - i);
                                d.setHours(0, 0, 0, 0);
                                const dStr = d.toISOString().split('T')[0];
                                const rec = attendance.find(a => a.date === dStr);

                                let status = 'none';
                                if (rec) {
                                    status = rec.status;
                                }

                                cells.push(
                                    <div
                                        key={dStr}
                                        className={`grid-cell ${status}`}
                                        title={`${new Date(dStr).toLocaleDateString()}: ${status.replace('-', ' ')}`}
                                    >
                                        <div className="cell-tooltip">
                                            <strong>{new Date(dStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                                            <span>{status.toUpperCase()}</span>
                                            {rec && <span>{rec.hours?.toFixed(1)} hrs</span>}
                                        </div>
                                    </div>
                                );
                            }
                            return cells;
                        })()}
                    </div>
                </div>
            </div>

            <div className="att-list-section">
                <h3 className="section-title">Historic Activity</h3>

                {attendance.length === 0 ? (
                    <div className="empty-state">
                        <FiCalendar className="empty-icon" />
                        <p>No shift records found</p>
                    </div>
                ) : (
                    <div className="att-records-list">
                        {attendance.map((day, index) => (
                            <div
                                key={day.date}
                                className={`att-record-item ${selectedDay === day.date ? 'expanded' : ''}`}
                                onClick={() => setSelectedDay(selectedDay === day.date ? null : day.date)}
                            >
                                <div className="record-main">
                                    <div className="date-box">
                                        <span className="day">{new Date(day.date).getDate()}</span>
                                        <span className="month">{new Date(day.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                    </div>
                                    <div className="info-box">
                                        <div className="top-row">
                                            <span className="status-indicator" style={{ background: getStatusColor(day.status) }}></span>
                                            <span className="status-text">{day.status.toUpperCase()}</span>
                                        </div>
                                        <div className="time-row">
                                            <FiClock /> {day.hours.toFixed(1)} hrs total
                                        </div>
                                    </div>
                                    <div className="arrow-box">
                                        <FiArrowRight />
                                    </div>
                                </div>

                                {selectedDay === day.date && (
                                    <div className="record-details fade-in">
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <FiUserCheck className="icon check-in" />
                                                <div className="text">
                                                    <span className="lbl">Shift Start</span>
                                                    <span className="val">{day.logs?.find(l => l.event === 'check-in')?.time ? new Date(day.logs.find(l => l.event === 'check-in').time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                                </div>
                                            </div>
                                            <div className="detail-item">
                                                <FiUserX className="icon check-out" />
                                                <div className="text">
                                                    <span className="lbl">Shift End</span>
                                                    <span className="val">{day.logs?.find(l => l.event === 'check-out')?.time ? new Date(day.logs.find(l => l.event === 'check-out').time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                                </div>
                                            </div>
                                            <div className="detail-item">
                                                <FiActivity className="icon online" />
                                                <div className="text">
                                                    <span className="lbl">Online Time</span>
                                                    <span className="val">{(day.onlineHours || 0).toFixed(1)} hrs</span>
                                                </div>
                                            </div>
                                            <div className="detail-item">
                                                <FiCoffee className="icon break" />
                                                <div className="text">
                                                    <span className="lbl">Break Taken</span>
                                                    <span className="val">{(day.breakMinutes || 0).toFixed(0)} mins</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="logs-timeline">
                                            <p className="log-title">Chronological Activity</p>
                                            {day.logs?.map((log, lIdx) => (
                                                <div key={lIdx} className="log-entry">
                                                    <span className="log-time">{log.time ? new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                                    <span className="log-event">{log.event?.replace('-', ' ')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="att-footer-info">
                <FiInfo />
                <p>Status is calculated automatically based on total shift hours (Present: 6h+, Half-Day: 3h+)</p>
            </div>
        </div>
    );
};

export default DeliveryAttendance;
