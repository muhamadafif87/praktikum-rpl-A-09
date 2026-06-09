import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [guard, setGuard] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedGuard = localStorage.getItem('guard');

        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
                setGuard(storedGuard);
            } catch (error) {
                console.error("Failed to parse user from localStorage", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('guard');
            }
        }

        setIsLoading(false);
    }, []);

    const login = (userData, token, userGuard) => {
        setUser(userData);
        setToken(token);
        setGuard(userGuard);

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('guard', userGuard);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setGuard(null);

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('guard');
    };

    const updateUser = (newData) => {
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{ user, guard, token, isLoading, login, logout, updateUser, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
