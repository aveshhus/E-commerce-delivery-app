import { useState, useEffect } from 'react';
import { Tag, Copy, Check, TicketPercent } from 'lucide-react';
import toast from 'react-hot-toast';
import { publicAPI } from '../../services/api';

const Offers = () => {
    // Professional empty state - no mocked data
    const [offers, setOffers] = useState([]);
    const [copied, setCopied] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await publicAPI.getOffers();
                if (res.success) {
                    setOffers(res.data.offers);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        toast.success(`Coupon code ${code} copied!`);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="profile-section fade-in">
            <h2 className="section-title">Exclusive Offers & Coupons</h2>

            {offers.length === 0 ? (
                <div className="profile-empty-state">
                    <div className="empty-icon-container" style={{ background: '#fff3e0', color: '#ff9800' }}>
                        <TicketPercent size={32} />
                    </div>
                    <h3 className="empty-title">No Active Offers</h3>
                    <p className="empty-desc">
                        There are no active coupons or offers available at the moment. Please check back later for exciting deals!
                    </p>
                </div>
            ) : (
                <div className="offers-grid">
                    {offers.map(offer => (
                        <div key={offer.id} className="offer-card-item">
                            <div className="offer-tag">
                                {offer.discount}
                            </div>
                            <div className="offer-header">
                                <div className="offer-icon">
                                    <Tag size={24} />
                                </div>
                                <div>
                                    <h3 className="offer-code">{offer.code}</h3>
                                    <p className="offer-exp">{offer.exp}</p>
                                </div>
                            </div>
                            <p className="offer-desc">{offer.desc}</p>
                            <button
                                onClick={() => copyCode(offer.code)}
                                className={`copy-btn ${copied === offer.code ? 'copied' : ''}`}
                            >
                                {copied === offer.code ? <Check size={18} /> : <Copy size={18} />}
                                {copied === offer.code ? 'Copied!' : 'Copy Code'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Offers;
