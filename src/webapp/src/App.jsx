import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './features/landing/LandingPage/LandingPage';
import Login from './features/auth/Login/Login';
import Register from './features/auth/Register/Register';
import LaundryPage from './pages/LaundryPage';
import GasGalonPage from './pages/GasGalonPage';
import DailyCleaningPage from './pages/DailyCleaningPage';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/laundry" element={<LaundryPage />} />
            <Route path="/gas-galon" element={<GasGalonPage />} />
            <Route path="/daily-cleaning" element={<DailyCleaningPage />} />
        </Routes>
    );
};

export default App;
