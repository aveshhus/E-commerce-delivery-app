import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <h3>🛒 Krishna Marketing</h3>
                    <p>
                        Your trusted neighborhood grocery store, now delivering fresh groceries
                        to your doorstep within 20 minutes. Quality products at the best prices!
                    </p>
                </div>

                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <Link to="/">Home</Link>
                    <Link to="/products">All Products</Link>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/profile">My Account</Link>
                </div>

                <div className="footer-section">
                    <h4>Categories</h4>
                    <Link to="/products?category=fruits-vegetables">Fruits & Vegetables</Link>
                    <Link to="/products?category=dairy-bread">Dairy & Bread</Link>
                    <Link to="/products?category=snacks-beverages">Snacks & Beverages</Link>
                    <Link to="/products?category=staples">Staples</Link>
                </div>

                <div className="footer-section">
                    <h4>Contact</h4>
                    <a href="tel:+919999999999">📞 +91 99999 99999</a>
                    <a href="mailto:support@krishnamarketing.com">📧 support@krishnamarketing.com</a>
                    <a>📍 Krishna Nagar, Delhi</a>
                    <a>🕐 Open 7AM - 11PM</a>
                </div>
            </div>
            <div className="footer-bottom">
                © 2026 Krishna Marketing. All rights reserved. | Built with ❤️ for fresh groceries
            </div>
        </footer>
    );
};

export default Footer;
