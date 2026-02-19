import { useState } from 'react';
import { Share2, Users, Gift, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Referral = () => {
    const [referralCode] = useState('INSPIRE2026');
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        toast.success("Referral code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const shareReferral = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join me on GroceryApp!',
                    text: `Use my code ${referralCode} to get ₹100 off your first order!`,
                    url: window.location.origin
                });
            } catch (err) {
                console.error(err);
            }
        } else {
            copyCode();
        }
    };

    return (
        <div className="profile-section fade-in">
            <h2 className="section-title">Referral Program</h2>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-8 text-white text-center mb-8 relative overflow-hidden">
                <Gift size={120} className="opacity-10 absolute top-0 right-0 transform rotate-12" />
                <h3 className="text-3xl font-bold mb-2 relative z-10">Refer & Earn</h3>
                <p className="opacity-90 mb-6 relative z-10 text-lg">Invite your friends and get ₹100 each!</p>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 inline-flex items-center gap-4 border border-white/30 relative z-10">
                    <span className="font-mono text-xl font-bold tracking-wider">{referralCode}</span>
                    <button onClick={copyCode} className="hover:bg-white/20 p-2 rounded transition-colors">
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>
            </div>

            <h4 className="text-lg font-bold mb-4">How it works?</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Share2 size={24} />
                    </div>
                    <h5 className="font-semibold mb-2">Share Code</h5>
                    <p className="text-sm text-gray-500">Share your unique code with friends via WhatsApp/SMS</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={24} />
                    </div>
                    <h5 className="font-semibold mb-2">Friend Joins</h5>
                    <p className="text-sm text-gray-500">Your friend signs up and places their first order</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift size={24} />
                    </div>
                    <h5 className="font-semibold mb-2">You Earn</h5>
                    <p className="text-sm text-gray-500">Get ₹100 wallet credit instantly!</p>
                </div>
            </div>

            <button onClick={shareReferral} className="btn w-full py-4 text-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-xl shadow-lg transition-transform transform active:scale-95">
                Invite Friends Now
            </button>
        </div>
    );
};

export default Referral;
