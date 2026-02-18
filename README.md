# 🛒 Krishna Marketing - Grocery Delivery Platform

A full-stack grocery delivery platform built with Node.js, React.js, and MongoDB. Features real-time order tracking, loyalty points, payment gateway integration, and a comprehensive admin dashboard.

---

## 📁 Project Structure

```
Delivery app/
├── backend/           # Node.js + Express API server
├── web-app/           # React.js Customer Web App (Vite)
├── admin-panel/       # React.js Admin Dashboard (Vite)
└── mobile-app/        # React Native Mobile App (coming soon)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally (or MongoDB Atlas URI)
- **Git** installed

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your MongoDB URI, API keys, etc.

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

**Backend runs on:** `http://localhost:5000`

**Seed Data Credentials:**
- **Admin:** admin@krishnamarketing.com / Admin@123
- **Customer:** customer@test.com / Customer@123

### 2. Web App Setup

```bash
cd web-app

# Install dependencies (already installed)
npm install

# Start development server
npm run dev
```

**Web App runs on:** `http://localhost:5173`

### 3. Admin Panel Setup

```bash
cd admin-panel

# Install dependencies (already installed)
npm install

# Start development server
npm run dev
```

**Admin Panel runs on:** `http://localhost:5174`

---

## 🏗️ Architecture

### Backend (Node.js + Express)

| Component | Description |
|-----------|-------------|
| **Models** | User, Product, Category, Cart, Order, Payment, Address, DeliveryAgent, Offer, Coupon, Notification, LoyaltyPoints |
| **Authentication** | JWT-based with role-based access (customer, admin, delivery_agent) |
| **Real-time** | Socket.IO for order tracking and delivery location updates |
| **Payments** | Razorpay & Stripe integration (stubs ready for production keys) |
| **File Uploads** | Multer with UUID naming and image validation |
| **Security** | Helmet, CORS, Rate Limiting, bcrypt password hashing |

### API Endpoints

| Route | Description |
|-------|-------------|
| `POST /api/auth/register` | Customer registration |
| `POST /api/auth/login` | Email/password login |
| `POST /api/auth/admin/login` | Admin login |
| `GET /api/products` | Browse products (with filters, search, pagination) |
| `GET /api/products/categories` | All categories |
| `POST /api/cart/add` | Add to cart |
| `POST /api/orders` | Place order |
| `GET /api/orders/my-orders` | Customer order history |
| `GET /api/admin/dashboard` | Admin dashboard stats |
| `PUT /api/orders/admin/:id/status` | Update order status |
| `POST /api/payments/razorpay/create` | Create Razorpay order |
| `POST /api/payments/stripe/create` | Create Stripe payment intent |
| ...and many more! |

### Web App (React + Vite)

| Page | Features |
|------|----------|
| **Home** | Banner slider, categories, featured/popular products |
| **Products** | Filtering, sorting, search, pagination |
| **Product Detail** | Variants, quantity selector, add to cart |
| **Cart Sidebar** | Slide-out cart with order summary |
| **Checkout** | Address selection, payment method, coupon, loyalty points |
| **Orders** | Order history with status filters, cancel & reorder |
| **Profile** | Edit profile, loyalty points card, saved addresses |
| **Login/Register** | Toggle form with validation |

### Admin Panel (React + Vite)

| Page | Features |
|------|----------|
| **Dashboard** | 8 stat cards, revenue chart, orders chart, top products |
| **Products** | CRUD with search, stock alerts, featured toggle |
| **Categories** | CRUD with emoji icons |
| **Orders** | Status management, progressive actions, detail modal |
| **Customers** | Search, loyalty points, order counts |
| **Delivery Agents** | CRUD with availability and ratings |
| **Offers & Banners** | CRUD with date ranges and types |
| **Coupons** | CRUD with usage tracking and validation rules |
| **Notifications** | Push notification sender with templates |

---

## 🎨 Design Features

- **Premium UI** with Outfit + Inter Google Fonts
- **Green & Orange** brand colors (Krishna Marketing)
- **Glassmorphism** navbar with blur backdrop
- **Smooth animations** (fade-in, hover effects, slide transitions)
- **Dark sidebar** admin layout
- **Recharts** for beautiful data visualizations
- **Fully responsive** design (desktop, tablet, mobile)
- **Toast notifications** for user feedback

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Customer App | React 19, Vite, React Router, Axios |
| Admin Panel | React 19, Vite, Recharts, Lucide Icons |
| Real-time | Socket.IO |
| Auth | JWT, bcryptjs |
| Payments | Razorpay, Stripe |
| Notifications | Firebase Admin SDK |
| File Storage | Multer |
| Security | Helmet, CORS, Rate Limiting |

---

## 📱 Mobile App (Coming Soon)

The React Native mobile app will include:
- Customer browsing and ordering
- Real-time delivery tracking with maps
- Push notifications
- OTP-based login
- In-app payments

---

## 🛡️ Environment Variables

Copy `.env.example` to `.env` in the backend folder and configure:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/krishna_marketing
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
STRIPE_SECRET_KEY=your_stripe_key
```

---

## 📄 License

MIT License - Built with ❤️ for Krishna Marketing
