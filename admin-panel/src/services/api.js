import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('km_admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('km_admin_token');
            localStorage.removeItem('km_admin_user');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error);
    }
);

export const adminAPI = {
    login: (data) => api.post('/auth/admin/login', data),
    getDashboard: () => api.get('/admin/dashboard'),
    getSalesGraph: (period) => api.get(`/admin/sales-graph?period=${period}`),
    getTopProducts: () => api.get('/admin/top-products'),
    // Products
    getProducts: (params) => api.get('/products', { params }),
    createProduct: (data) => api.post('/products', data),
    updateProduct: (id, data) => api.put(`/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/products/${id}`),
    getLowStock: () => api.get('/products/admin/low-stock'),
    uploadImages: (id, formData) => api.post(`/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    // Categories
    getCategories: () => api.get('/products/categories'),
    createCategory: (data) => api.post('/products/categories/create', data),
    updateCategory: (id, data) => api.put(`/products/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/products/categories/${id}`),
    // Orders
    getOrders: (params) => api.get('/orders/admin/all', { params }),
    updateOrderStatus: (id, data) => api.put(`/orders/admin/${id}/status`, data),
    assignAgent: (id, data) => api.put(`/orders/admin/${id}/assign-agent`, data),
    // Delivery
    getAgents: (params) => api.get('/delivery', { params }),
    createAgent: (data) => api.post('/delivery', data),
    updateAgent: (id, data) => api.put(`/delivery/${id}`, data),
    deleteAgent: (id) => api.delete(`/delivery/${id}`),
    updateApplicationStatus: (id, data) => api.put(`/delivery/admin/application/${id}/status`, data),
    // Customers
    getCustomers: (params) => api.get('/admin/customers', { params }),
    // Offers
    getOffers: () => api.get('/admin/offers'),
    createOffer: (data) => api.post('/admin/offers', data),
    updateOffer: (id, data) => api.put(`/admin/offers/${id}`, data),
    deleteOffer: (id) => api.delete(`/admin/offers/${id}`),
    // Coupons
    getCoupons: () => api.get('/admin/coupons'),
    createCoupon: (data) => api.post('/admin/coupons', data),
    updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
    deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
    // Notifications
    sendNotification: (data) => api.post('/admin/notifications', data),
    // Festivals
    getFestivals: () => api.get('/festivals'),
    createFestival: (data) => api.post('/festivals', data),
    updateFestival: (id, data) => api.put(`/festivals/${id}`, data),
    deleteFestival: (id) => api.delete(`/festivals/${id}`),
    toggleFestivalStatus: (id) => api.patch(`/festivals/${id}/toggle`),
};

export default api;
