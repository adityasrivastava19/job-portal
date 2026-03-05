import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            if (token && userId) {
                try {
                    const response = await api.get(`/users/profile/${userId}`);
                    setUser(response.data);
                } catch (error) {
                    console.error('Session expired or invalid token');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                }
            }
            setLoading(false);
        };

        checkToken();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/users/login', { email, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user._id);
        setUser(response.data.user);
        return response.data;
    };

    const register = async (userData) => {
        const response = await api.post('/users/register', userData);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user._id);
        setUser(response.data.user);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
