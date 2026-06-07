import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './features/landing/LandingPage/LandingPage';
import Login from './features/auth/Login/Login';
import Register from './features/auth/Register/Register';
import LaundryPage from './pages/LaundryPage';
import GasGalonPage from './pages/GasGalonPage';
import DailyCleaningPage from './pages/DailyCleaningPage';
import TentangKamiPage from './features/tentang-kami/TentangKamiPage';
import MitraDashboardPage from './pages/MitraDashboardPage';
import ChatMitra from './features/mitra/ChatMitra/ChatMitra';
import ReviewMitra from './features/mitra/ReviewMitra/ReviewMitra';
import PengaturanMitra from './features/mitra/PengaturanMitra/PengaturanMitra';
import MitraFinance from './features/mitra/MitraFinance/MitraFinance';
import MitraInventory from './features/mitra/MitraInventory/MitraInventory';
import MitraOrders from './features/mitra/MitraOrders/MitraOrders';
import HelpSupportMitra from './features/mitra/HelpSupportMitra/HelpSupportMitra';

// Placeholder components for dashboard pages
const DashboardAdmin = () => <div style={{ padding: '20px' }}><h1>Dashboard Admin</h1></div>;
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
                <Route path="/tentang-kami" element={<TentangKamiPage />} />

                {/* Dashboard routes */}
                <Route path="/dashboard/admin" element={<DashboardAdmin />} />
                <Route path="/dashboard/mitra" element={<MitraDashboardPage />} />
                <Route path="/dashboard/mitra/chat" element={<ChatMitra />} />
                <Route path="/dashboard/mitra/reviews" element={<ReviewMitra />} />
                <Route path="/dashboard/mitra/settings" element={<PengaturanMitra />} />
                <Route path="/dashboard/mitra/finance" element={<MitraFinance />} />
                <Route path="/dashboard/mitra/inventory" element={<MitraInventory />} />
                <Route path="/dashboard/mitra/orders" element={<MitraOrders />} />
                <Route path="/dashboard/mitra/support" element={<HelpSupportMitra />} />

                {/* Profile routes */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Routes>
        </AuthProvider>
    );
};

export default App;
