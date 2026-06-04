import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './features/landing/LandingPage/LandingPage';
import Login from './features/auth/Login/Login';
import Register from './features/auth/Register/Register';
import LaundryPage from './pages/LaundryPage';
import GasGalonPage from './pages/GasGalonPage';
import DailyCleaningPage from './pages/DailyCleaningPage';

// Placeholder components for dashboard pages
const DashboardAdmin = () => <div style={{ padding: '20px' }}><h1>Dashboard Admin</h1></div>;
const DashboardMitra = () => <div style={{ padding: '20px' }}><h1>Dashboard Mitra</h1></div>;
const ProfilePage = () => <div style={{ padding: '20px' }}><h1>Profil Saya</h1></div>;
const SettingsPage = () => <div style={{ padding: '20px' }}><h1>Pengaturan</h1></div>;

const App = () => {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/laundry" element={<LaundryPage />} />
                <Route path="/gas-galon" element={<GasGalonPage />} />
                <Route path="/daily-cleaning" element={<DailyCleaningPage />} />

                {/* Dashboard routes */}
                <Route path="/dashboard/admin" element={<DashboardAdmin />} />
                <Route path="/dashboard/mitra" element={<DashboardMitra />} />

                {/* Profile routes */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Routes>
        </AuthProvider>
    );
};

export default App;
