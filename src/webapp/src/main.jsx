import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext';
import App from './App';
import './index.css';

// Mount the React application
const container = document.getElementById('app');

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <LocationProvider>
                    <App />
                </LocationProvider>
            </BrowserRouter>
        </React.StrictMode>
    );
}

