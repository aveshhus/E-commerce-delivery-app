import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('km_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('km_token');
            localStorage.removeItem('km_user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error.response?.data || error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    sendOTP: (data) => api.post('/auth/send-otp', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.post('/auth/change-password', data),
};

// User APIs
export const userAPI = {
    getWallet: () => api.get('/user/wallet'),
    addMoney: (data) => api.post('/user/wallet/add', data),
    getNotifications: () => api.get('/user/notifications'),
    getFavorites: () => api.get('/user/favorites'),
    toggleFavorite: (productId) => api.post('/user/favorites/toggle', { productId }),
};

// Product APIs
export const productAPI = {
    getProducts: (params) => api.get('/products', { params }),
    getProduct: (id) => api.get(`/products/${id}`),
    getFeatured: () => api.get('/products/featured'),
    getPopular: () => api.get('/products/popular'),
    getCategories: () => api.get('/products/categories'),
    getCategory: (id) => api.get(`/products/categories/${id}`),
};

// Cart APIs
export const cartAPI = {
    getCart: () => api.get('/cart'),
    addToCart: (data) => api.post('/cart/add', data),
    updateItem: (itemId, data) => api.put(`/cart/item/${itemId}`, data),
    removeItem: (itemId) => api.delete(`/cart/item/${itemId}`),
    clearCart: () => api.delete('/cart/clear'),
    applyCoupon: (data) => api.post('/cart/coupon/apply', data),
    removeCoupon: () => api.delete('/cart/coupon/remove'),
};

// Order APIs
export const orderAPI = {
    createOrder: (data) => api.post('/orders', data),
    getOrders: (params) => api.get('/orders/my-orders', { params }),
    getOrder: (id) => api.get(`/orders/my-orders/${id}`),
    cancelOrder: (id, data) => api.put(`/orders/${id}/cancel`, data),
    reorder: (id) => api.post(`/orders/${id}/reorder`),
};

// Address APIs
export const addressAPI = {
    getAddresses: () => api.get('/addresses'),
    addAddress: (data) => api.post('/addresses', data),
    updateAddress: (id, data) => api.put(`/addresses/${id}`, data),
    deleteAddress: (id) => api.delete(`/addresses/${id}`),
    setDefault: (id) => api.put(`/addresses/${id}/default`),
};

// Public APIs
export const publicAPI = {
    getOffers: () => api.get('/offers/active'),
    getBanners: () => api.get('/banners'),
    validateCoupon: (data) => api.post('/coupons/validate', data),
    getNotifications: () => api.get('/notifications'),
    getLoyalty: () => api.get('/loyalty/history'),
    getFestival: () => api.get('/festivals/active'),
};

// Payment APIs
export const paymentAPI = {
    createRazorpay: (data) => api.post('/payments/razorpay/create', data),
    verifyRazorpay: (data) => api.post('/payments/razorpay/verify', data),
    createStripe: (data) => api.post('/payments/stripe/create', data),
    getHistory: () => api.get('/payments/history'),
};

export default api;
