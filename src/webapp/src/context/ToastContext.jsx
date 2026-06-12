import React, { createContext, useContext, useState, useCallback } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="kh-toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`kh-toast kh-toast-${toast.type}`}>
                        {toast.type === 'success' && <span className="material-symbols-outlined">check_circle</span>}
                        {toast.type === 'error' && <span className="material-symbols-outlined">error</span>}
                        {toast.type === 'info' && <span className="material-symbols-outlined">info</span>}
                        
                        <p>{toast.message}</p>
                        
                        <button className="kh-toast-close" onClick={() => removeToast(toast.id)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
