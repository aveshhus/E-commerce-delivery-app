import React, { useState, useEffect, useRef } from 'react';
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
    const scrollRef = useRef(null);
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

                // Auto-scroll to end of grid after data load
                setTimeout(() => {
                    if (scrollRef.current) {
                        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
                    }
                }, 100);
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

            {/* Yearly Performance Command Center */}
            <div className="yearly-grid-container premium-card">
                <div className="yearly-grid-header">
                    <div className="title-group">
                        <FiActivity className="pulse-icon" />
                        <h3 className="section-title">Professional Work Grid</h3>
                    </div>
                    <div className="grid-legend">
                        <div className="legend-item"><div className="sq present"></div> <span className="lbl-mini">6h+</span></div>
                        <div className="legend-item"><div className="sq half-day"></div> <span className="lbl-mini">3h+</span></div>
                        <div className="legend-item"><div className="sq absent"></div> <span className="lbl-mini">Absent</span></div>
                    </div>
                </div>

                <div className="grid-wrapper-v2">
                    <div className="yearly-grid-scroll" ref={scrollRef}>
                        <div className="month-labels-container">
                            <div className="month-labels">
                                {(() => {
                                    const months = [];
                                    const today = new Date();
                                    // Start from 53 weeks ago Sunday
                                    const lastSat = new Date(today);
                                    lastSat.setDate(today.getDate() + (6 - today.getDay()));
                                    const start = new Date(lastSat);
                                    start.setDate(lastSat.getDate() - 370); // 371 days total (0 to 370)

                                    let currentMonth = -1;
                                    for (let i = 0; i <= 370; i++) {
                                        const d = new Date(start);
                                        d.setDate(start.getDate() + i);
                                        if (d.getDay() === 0 && d.getMonth() !== currentMonth) { // If it's a Sunday and a new month
                                            months.push(<span key={i} className="m-lbl" style={{ gridColumn: Math.floor(i / 7) + 1 }}>{d.toLocaleDateString('en-US', { month: 'short' })}</span>);
                                            currentMonth = d.getMonth();
                                        }
                                    }
                                    return months;
                                })()}
                            </div>
                        </div>

                        <div className="grid-main-layout">
                            {/* Day Labels */}
                            <div className="day-labels">
                                <span>S</span>
                                <span>M</span>
                                <span>T</span>
                                <span>W</span>
                                <span>T</span>
                                <span>F</span>
                                <span>S</span>
                            </div>

                            <div className="yearly-grid-v2">
                                {(() => {
                                    const cells = [];
                                    const today = new Date();

                                    // To align with 7 rows (Sun-Sat), we find the most recent Saturday
                                    // and go back 371 days (53 weeks) from there to ensure full columns.
                                    const lastSat = new Date(today);
                                    lastSat.setDate(today.getDate() + (6 - today.getDay()));

                                    for (let i = 370; i >= 0; i--) {
                                        const d = new Date(lastSat);
                                        d.setDate(lastSat.getDate() - i);
                                        d.setHours(0, 0, 0, 0);

                                        // Use YYYY-MM-DD format in LOCAL time
                                        const dStr = d.getFullYear() + '-' +
                                            String(d.getMonth() + 1).padStart(2, '0') + '-' +
                                            String(d.getDate()).padStart(2, '0');

                                        const rec = attendance.find(a => a.date === dStr);

                                        let status = 'none';
                                        if (rec) status = rec.status;

                                        // Hide future dates
                                        const isFuture = d > today;

                                        cells.push(
                                            <div
                                                key={dStr}
                                                id={`cell-${dStr}`}
                                                className={`grid-cell-v2 ${status} ${selectedDay === dStr ? 'active' : ''} ${isFuture ? 'future' : ''}`}
                                                onClick={() => {
                                                    if (isFuture) return;
                                                    setSelectedDay(dStr);
                                                    document.getElementById(`record-${dStr}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }}
                                            >
                                                {!isFuture && (
                                                    <div className="cell-tooltip-v2">
                                                        <div className="t-head">{d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                        <div className="t-body">
                                                            <span className={`t-status ${status}`}>{status.toUpperCase()}</span>
                                                            {rec && <span className="t-hrs">{(rec.hours || 0).toFixed(1)} hrs logged</span>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    return cells;
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid-footer-stats">
                    <div className="g-stat">
                        <strong>{attendance.filter(a => a.status === 'present').length}</strong>
                        <span>Full Days</span>
                    </div>
                    <div className="g-stat">
                        <strong>{attendance.reduce((acc, curr) => acc + (curr.hours || 0), 0).toFixed(0)}h</strong>
                        <span>Total Year</span>
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
                                id={`record-${day.date}`}
                                className={`att-record-item ${selectedDay === day.date ? 'expanded active-highlight' : ''}`}
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
                                            <FiClock /> {(day.hours || 0).toFixed(1)} hrs total
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
