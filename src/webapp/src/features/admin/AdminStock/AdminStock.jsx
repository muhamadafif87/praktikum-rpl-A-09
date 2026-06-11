import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminStock.css';

// --- Sub-components ---

const TopNavBar = ({ onLogout }) => (
  <nav className="admin-top-nav">
    <div className="flex items-center space-x-4">
      <a className="admin-top-nav-logo" href="#">
        KostHub<span>.</span>
      </a>
    </div>
    <div className="admin-top-nav-actions">
      <button className="admin-top-nav-icon-btn">
        <span className="material-symbols-outlined">notifications</span>
      </button>
      <button className="admin-top-nav-icon-btn">
        <span className="material-symbols-outlined">help</span>
      </button>
      <div className="admin-top-nav-profile">
        <img
          alt="Partner Profile"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT0AdV5Z5MUcPbHK72cL-plOTymvr7uuBk_yFfOKmFw6N8eFX5bLkJvVmL36BnchaNyQQvKniLE6v3dRpZ9fGAII4TxeHz_SQr9qp5-Ozy-EvMWWxwAVJlQJjVI8PgAwxi4iKwYgjuIwrgOIF89jQag9GTQwZNhx50L8lKH2qCyr_AKiZ9sxJ3Mw2dzts4Glv4-kKTMPrDGQJMBGYptN6XAlTDbWX7y2MPHrMDHiI4Vq573jjkeF_4shWpCCn2_9J1WE7UPgVAHOw"
        />
        <span className="text-label-md admin-top-nav-profile-name">Admin Central</span>
      </div>
      <button className="admin-logout-btn" onClick={onLogout} title="Logout">
        <span className="material-symbols-outlined">logout</span>
      </button>
    </div>
  </nav>
);

const SideNavBar = () => (
  <aside className="admin-side-nav">
    <div className="admin-side-nav-header">
      <img
        alt="KostHub Admin"
        className="admin-side-nav-profile-img"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGYjeqX8fHQwiwWoGM55Tn_S265O77UcwSQ3I9oxzC6VEKAGOGmw5DlCMtPIJOrkS8hlluH2N6Qkd9h0nhOGuzQTCOngYr6OBPYGqHFog3-ALhupmVMNuC--NVRSQPHp8G-TJ-jLE02ulMXaS2ung3sH358WWxnDijTa7VKK4-dL2vI0n3-wrlT8unw7tsQcrAR7c_SPpSumAqsqPGAVMj9n0qzdPFCSJclO3iNv06yRgnW9bD94wiVS0wjKVWW3u-uJJ22gppitU"
      />
      <div className="admin-side-nav-title text-label-md">Admin Panel</div>
      <div className="admin-side-nav-subtitle text-label-sm">System Control</div>
    </div>
    <nav className="admin-side-nav-menu">
      <Link className="admin-side-nav-link" to="/dashboard/admin">
        <span className="material-symbols-outlined admin-side-nav-icon">dashboard</span>
        <span className="text-label-md">Overview</span>
      </Link>
      <Link className="admin-side-nav-link active" to="/dashboard/admin/stock">
        <span className="material-symbols-outlined admin-side-nav-icon">inventory_2</span>
        <span className="text-label-md">Inventory</span>
      </Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/partners">
        <span className="material-symbols-outlined admin-side-nav-icon">group</span>
        <span className="text-label-md">Partners List</span>
      </Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/security">
        <span className="material-symbols-outlined admin-side-nav-icon">security</span>
        <span className="text-label-md">Security</span>
      </Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/maintenance">
        <span className="material-symbols-outlined admin-side-nav-icon">build</span>
        <span className="text-label-md">Maintenance</span>
      </Link>
      <Link className="admin-side-nav-link" to="/dashboard/admin/settings">
        <span className="material-symbols-outlined admin-side-nav-icon">settings</span>
        <span className="text-label-md">Settings</span>
      </Link>
    </nav>
    <div className="admin-side-nav-footer">
      <button className="admin-support-btn text-label-md">Quick Support</button>
    </div>
  </aside>
);

const Footer = () => (
  <footer className="admin-footer">
    <div className="admin-footer-left">
      <span className="admin-footer-logo">
        KostHub<span>.</span>
      </span>
      <p className="admin-footer-copyright text-label-sm">© 2024 KostHub Hyperlocal Marketplace</p>
    </div>
    <div className="admin-footer-links">
      <a className="admin-footer-link text-label-sm" href="#">Privacy Policy</a>
      <a className="admin-footer-link text-label-sm" href="#">Terms of Service</a>
      <a className="admin-footer-link text-label-sm" href="#">Partner Support</a>
    </div>
  </footer>
);

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="admin-stats-grid">
      <div className="admin-stat-card">
        <span className="text-label-md admin-stat-title">Total Produk Aktif</span>
        <div className="text-headline-lg admin-stat-value">{stats.activeProducts}</div>
        <div className="text-label-sm admin-stat-desc">Di seluruh mitra aktif</div>
      </div>
      <div className="admin-stat-card warning">
        <div className="admin-stat-header">
          <span className="text-label-md admin-stat-title">Peringatan Stok Rendah</span>
          <span className="material-symbols-outlined admin-stat-icon warning">warning</span>
        </div>
        <div className="text-headline-lg admin-stat-value">{stats.lowStock}</div>
        <div className="text-label-sm admin-stat-desc warning">Butuh perhatian</div>
      </div>
      <div className="admin-stat-card critical">
        <div className="admin-stat-header">
          <span className="text-label-md admin-stat-title">Stok Habis</span>
          <span className="material-symbols-outlined admin-stat-icon critical">error</span>
        </div>
        <div className="text-headline-lg admin-stat-value critical">{stats.outOfStock}</div>
        <div className="text-label-sm admin-stat-desc critical">Peringatan Kritis</div>
      </div>
      <div className="admin-stat-card">
        <span className="text-label-md admin-stat-title">Ketersediaan Layanan</span>
        <div className="text-headline-lg admin-stat-value">{stats.serviceAvailability}%</div>
        <div className="text-label-sm admin-stat-desc success">
          <span className="material-symbols-outlined admin-stat-icon-small">check_circle</span> Level Layanan Sehat
        </div>
      </div>
    </div>
  );
};

const InventoryTable = ({ data }) => {
  if (!data) return null;

  return (
    <section className="admin-inventory-section">
      <div className="admin-inventory-header">
        <h2 className="text-headline-sm admin-inventory-title">Status Inventaris Lintas Mitra</h2>
        <div className="admin-inventory-filters">
          <select className="admin-select text-label-md">
            <option>All Partners</option>
            <option>Kost Sejahtera</option>
            <option>Laundry Bersih</option>
          </select>
          <select className="admin-select text-label-md">
            <option>Stock Status</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr className="text-label-sm">
              <th>Detail Produk</th>
              <th>Nama Mitra</th>
              <th>Stok Saat Ini</th>
              <th>Ambang Batas</th>
              <th>Status</th>
              <th className="right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-body-sm">
            {data.map((item, index) => {
              let statusClass = 'available';
              let stockValueClass = '';
              let actionText = 'Lihat Detail';

              if (item.status === 'Stok Habis') {
                statusClass = 'out-of-stock';
                stockValueClass = 'critical';
                actionText = 'Kirim Pengingat';
              } else if (item.status === 'Stok Rendah') {
                statusClass = 'low-stock';
                stockValueClass = 'warning';
                actionText = 'Kirim Pengingat';
              }

              return (
                <tr key={index}>
                  <td>
                    <div>
                      <p className="admin-product-name">{item.productName}</p>
                      <p className="text-label-sm admin-product-sku">SKU: {item.sku}</p>
                    </div>
                  </td>
                  <td>{item.partnerName}</td>
                  <td className={`admin-td-value ${stockValueClass}`}>{item.currentStock} Units</td>
                  <td className="admin-td-threshold">{item.threshold} Units</td>
                  <td>
                    <span className={`admin-status-badge text-label-sm ${statusClass}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="right">
                    <button className="admin-action-btn text-label-md">{actionText}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// --- Main Component ---

const AdminStock = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try { await axios.post('/api/v1/auth/logout', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); } catch (err) { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Attempt to fetch from backend (replace with actual endpoint if needed)
        const response = await axios.get('/v1/dashboard/admin/stock');
        if (!response.data || !response.data.stats || !response.data.inventory) {
          throw new Error("Invalid data structure received");
        }
        setStatsData(response.data.stats);
        setInventoryData(response.data.inventory);
      } catch (error) {
        console.warn('Failed to fetch from backend, using dummy data', error);
        // Fallback to dummy data exactly as in the HTML
        setStatsData({
          activeProducts: '1,248',
          lowStock: 14,
          outOfStock: 3,
          serviceAvailability: 92
        });
        
        setInventoryData([
          {
            productName: 'Galon Aqua 19L',
            sku: 'GLN-AQ-19',
            partnerName: 'Kost Sejahtera Raya',
            currentStock: 85,
            threshold: 20,
            status: 'Tersedia'
          },
          {
            productName: 'Gas Elpiji 3kg',
            sku: 'GAS-ELP-03',
            partnerName: 'Kost Amanah',
            currentStock: 4,
            threshold: 10,
            status: 'Stok Rendah'
          },
          {
            productName: 'Galon Le Minerale 15L',
            sku: 'GLN-LM-15',
            partnerName: 'Laundry Bersih Selalu',
            currentStock: 0,
            threshold: 5,
            status: 'Stok Habis'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-stock-page">
      <TopNavBar onLogout={handleLogout} />
      <SideNavBar />
      
      <main className="admin-main-content">
        <div className="admin-container">
          <section className="admin-header-section">
            <h1 className="text-headline-lg admin-header-title">Monitoring Stok Mitra</h1>
            <p className="text-body-md admin-header-desc">Pemantauan stok lintas mitra dan performa ketersediaan layanan.</p>
          </section>

          {loading ? (
            <div className="admin-loading-container">
              <span className="material-symbols-outlined admin-spinner">progress_activity</span>
            </div>
          ) : (
            <>
              <StatsCards stats={statsData} />
              <InventoryTable data={inventoryData} />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminStock;
