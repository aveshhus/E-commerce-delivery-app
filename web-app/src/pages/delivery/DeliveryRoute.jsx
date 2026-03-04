import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiMap, FiNavigation, FiClock, FiMapPin, FiCrosshair, FiAlertCircle } from 'react-icons/fi';
import deliveryService from '../../services/deliveryService';
import './DeliveryDashboard.css';

const DeliveryRoute = () => {
    const { isOnline, isOnBreak } = useOutletContext();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNav = async () => {
            try {
                const res = await deliveryService.getCurrentDelivery();
                if (res.success) setOrder(res.data.order);
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchNav();
        const int = setInterval(fetchNav, 10000);
        return () => clearInterval(int);
    }, []);

    if (loading) return <div className="loading-state-v3"><div className="loader-v3"></div></div>;

    if (!isOnline || isOnBreak || !order) {
        return (
            <div className="op-dashboard-container fade-in">
                <h2 className="op-section-title">Navigation System</h2>
                <div className="op-welcome-card" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '20px' }}>
                    <FiMap style={{ fontSize: '48px', color: '#535665', marginBottom: '16px' }} />
                    <h3>No Active Route Plan</h3>
                    <p style={{ color: '#949CA4', fontSize: '14px', marginTop: '8px' }}>
                        {isOnBreak ? "You are on break." : !isOnline ? "Go online to receive routes." : "Awaiting next assignment from Hub to calculate optimized path."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="op-dashboard-container fade-in">
            <h2 className="op-section-title">Navigation System</h2>

            <div className="op-welcome-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #00B14F' }}>
                {/* Simulated Ops GPS Map Interface */}
                <div style={{ height: '350px', background: '#111315', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#00B14F 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                    {/* Simulated SVG Route Path */}
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                        <path d="M 45% 75% Q 30% 50% 65% 35%" stroke="#00B14F" strokeWidth="4" fill="none" strokeDasharray="8 8" className="route-anim" />
                    </svg>

                    <FiCrosshair style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '24px', color: 'white', background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '50%' }} />

                    {/* Live Tracker Ping (Agent) */}
                    <div style={{ position: 'absolute', bottom: '25%', left: '45%', transform: 'translate(-50%, 50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="pulse-ping" style={{ width: '16px', height: '16px', background: '#1A73E8', borderRadius: '50%', border: '2px solid white' }}></div>
                    </div>

                    {/* Destination Marker */}
                    <div style={{ position: 'absolute', top: '35%', left: '65%', transform: 'translate(-50%, -100%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <FiMapPin style={{ fontSize: '32px', color: '#FA3E3E', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />
                    </div>

                    <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,177,79,0.15)', color: '#00B14F', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', border: '1px solid rgba(0,177,79,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="pulse-dot"></div> LIVE TRACKING ACTIVE
                    </div>
                </div>

                <div style={{ padding: '20px', background: '#1C1E20' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>
                            <p style={{ color: '#949CA4', fontSize: '12px', marginBottom: '4px' }}>Dest: {order.deliveryAddress.fullName}</p>
                            <h3 style={{ color: 'white', fontSize: '18px', margin: 0 }}>{order.deliveryAddress.addressLine1}</h3>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ background: '#111315', padding: '16px', borderRadius: '12px', border: '1px solid #2C2F33' }}>
                            <FiNavigation style={{ color: '#1A73E8', marginBottom: '8px', fontSize: '20px' }} />
                            <div style={{ color: '#949CA4', fontSize: '12px' }}>Total Distance</div>
                            <div style={{ color: 'white', fontSize: '18px', fontWeight: '800', marginTop: '2px' }}>3.2 KM</div>
                        </div>
                        <div style={{ background: '#111315', padding: '16px', borderRadius: '12px', border: '1px solid #2C2F33' }}>
                            <FiClock style={{ color: '#FFB800', marginBottom: '8px', fontSize: '20px' }} />
                            <div style={{ color: '#949CA4', fontSize: '12px' }}>Est. Arrival</div>
                            <div style={{ color: 'white', fontSize: '18px', fontWeight: '800', marginTop: '2px' }}>~12 Mins</div>
                        </div>
                    </div>

                    <button className="op-btn-primary" style={{ width: '100%', padding: '16px', background: '#1A73E8', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.deliveryAddress.addressLine1}, ${order.deliveryAddress.city}`)}`, '_blank')}>
                        <FiNavigation /> Open in Google Maps
                    </button>
                    <p style={{ textAlign: 'center', color: '#535665', fontSize: '11px', marginTop: '12px' }}>This route data is visible in real-time to the Hub Ops Admin.</p>
                </div>
            </div>

        </div>
    );
};
export default DeliveryRoute;
