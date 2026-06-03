import React from 'react';
import MitraDashboard from '../features/mitra/MitraDashboard/MitraDashboard';

/**
 * MitraDashboardPage — Page-level component
 * 
 * Wrapper untuk komponen MitraDashboard.
 * Akun mitra yang berhasil login akan di-redirect ke halaman ini.
 * Data dashboard di-fetch langsung dari backend API oleh MitraDashboard.
 */
const MitraDashboardPage = () => {
    return <MitraDashboard />;
};

export default MitraDashboardPage;
