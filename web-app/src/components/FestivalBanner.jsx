import { useState, useEffect } from 'react';
import { publicAPI } from '../services/api';
import { X, Sparkles, MapPin, ChevronRight, Gift } from 'lucide-react';

const FestivalBanner = () => {
    const [festival, setFestival] = useState(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchFestival = async () => {
            try {
                const res = await publicAPI.getFestival();
                if (res.success && res.data.festival) {
                    setFestival(res.data.festival);
                }
            } catch (err) {
                console.error("Failed to fetch festival", err);
            }
        };
        fetchFestival();
    }, []);

    if (!festival || !visible) return null;

    // Determine "best fit" contrasting color for icon/text if needed.
    // Assuming admin picks a background color that works with white text (usually dark/saturated)
    // or we can force a text shadow.

    return (
        <div
            className="festival-banner-container"
            style={{
                '--festival-color': festival.themeColor || '#1a1a2e',
                backgroundImage: festival.imageUrl ? `url(${festival.imageUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Pattern Overlay */}
            <div className="festival-banner-bg"></div>

            {/* Gradient Overlay */}
            <div className="festival-banner-gradient"></div>

            {/* Content Content */}
            <div className="festival-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                    <Gift size={18} className="festival-sparkle" fill="#FFD700" strokeWidth={1.5} />

                    <span className="festival-text">
                        {festival.message}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', marginLeft: '4px' }}>
                        <span>Shop Now</span>
                        <ChevronRight size={12} />
                    </div>
                </div>
            </div>

            {/* Close Button */}
            <button className="festival-close" onClick={() => setVisible(false)} aria-label="Close festival banner">
                <X size={16} />
            </button>
        </div>
    );
};

export default FestivalBanner;
