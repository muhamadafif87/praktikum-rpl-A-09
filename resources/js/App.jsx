import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';

const App = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Default redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default App;
