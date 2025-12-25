'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = Cookies.get('token');
            const storedUser = Cookies.get('user');

            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
                // Fetch updated user info
                const response = await api.get('/auth/me');
                if (response.data.success) {
                    setUser(response.data.data.user);
                    setProfile(response.data.data.profile);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.success) {
                const { token, ...userData } = response.data.data;
                Cookies.set('token', token, { expires: 30 });
                Cookies.set('user', JSON.stringify(userData), { expires: 30 });
                setUser(userData);

                toast.success('Login successful!');

                // Redirect based on role
                switch (userData.role) {
                    case 'admin':
                        router.push('/admin/dashboard');
                        break;
                    case 'company':
                        router.push('/company/dashboard');
                        break;
                    case 'worker':
                        router.push('/worker/dashboard');
                        break;
                    default:
                        router.push('/');
                }

                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);

            if (response.data.success) {
                const { token, ...user } = response.data.data;
                Cookies.set('token', token, { expires: 30 });
                Cookies.set('user', JSON.stringify(user), { expires: 30 });
                setUser(user);

                toast.success('Registration successful!');

                // Redirect based on role
                switch (user.role) {
                    case 'company':
                        router.push('/company/dashboard');
                        break;
                    case 'worker':
                        router.push('/worker/dashboard');
                        break;
                    default:
                        router.push('/');
                }

                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const logout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        setUser(null);
        setProfile(null);
        router.push('/login');
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        profile,
        loading,
        login,
        register,
        logout,
        checkAuth,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isCompany: user?.role === 'company',
        isWorker: user?.role === 'worker',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
