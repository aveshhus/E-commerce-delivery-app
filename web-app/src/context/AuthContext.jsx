import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('km_token');
        const savedUser = localStorage.getItem('km_user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await authAPI.login({ email, password });
            if (res.success) {
                localStorage.setItem('km_token', res.data.token);
                localStorage.setItem('km_user', JSON.stringify(res.data.user));
                setUser(res.data.user);
                setIsAuthenticated(true);
                toast.success('Welcome back!');
                return true;
            }
        } catch (err) {
            toast.error(err.message || 'Login failed');
            return false;
        }
    };

    const register = async (data) => {
        try {
            const res = await authAPI.register(data);
            if (res.success) {
                localStorage.setItem('km_token', res.data.token);
                localStorage.setItem('km_user', JSON.stringify(res.data.user));
                setUser(res.data.user);
                setIsAuthenticated(true);
                toast.success('Registration successful!');
                return true;
            }
        } catch (err) {
            toast.error(err.message || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('km_token');
        localStorage.removeItem('km_user');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('km_user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
