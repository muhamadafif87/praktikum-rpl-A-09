# Setup Guide: React + Laravel API

## ⚙️ Struktur Aplikasi

```
praktikum-rpl-A-9/
├── src/
│   ├── backend/        (Laravel - Port 8000)
│   └── webapp/         (React Vite - Port 5173)
```

## 🚀 Cara Menjalankan

### 1. Backend (Laravel)

```bash
cd src/backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Setup database
php artisan migrate

# Run server (Port 8000)
php artisan serve
```

### 2. Frontend (React)

```bash
cd src/webapp

# Install dependencies  
npm install

# Run development server (Port 5173)
npm run dev
```

## 🔧 Konfigurasi API

### Development (Port 5173 → 8000)

File `.env` di `src/webapp`:
```
VITE_API_URL=http://localhost:8000/api
```

**Vite Proxy** (`vite.config.js`):
- Otomatis proxy request `/api/*` ke `http://localhost:8000`
- Tidak ada CORS issues di dev

### Production

File `.env.production` di `src/webapp`:
```
VITE_API_URL=/api
```

**CORS** di Laravel (`config/cors.php`):
- Middleware di `bootstrap/app.php`
- Allowed origins sudah dikonfigurasi

## 🧪 Testing

### 1. Buka React app di browser
```
http://localhost:5173
```

### 2. Coba login
- Should hit `/api/v1/auth/login` endpoint
- Check Network tab di DevTools untuk verify request

### 3. Debug jika ada error

**Network Error (502, 500)?**
- Pastikan Laravel server running: `php artisan serve`
- Check Laravel logs: `tail -f storage/logs/laravel.log`

**CORS Error?**
- Frontend harus request ke `/api` (proxy handle)
- Atau gunakan full URL: `http://localhost:8000/api`

**Token Not Sent?**
- Check if localStorage punya token
- Verify interceptor di `src/services/api.js` bekerja

## 📝 File yang Diubah

✅ `src/webapp/.env` - Environment variable untuk dev
✅ `src/webapp/.env.production` - Environment variable untuk prod
✅ `src/webapp/vite.config.js` - Setup proxy API
✅ `src/webapp/src/services/api.js` - Use env variable
✅ `src/backend/config/cors.php` - CORS configuration (NEW)
✅ `src/backend/bootstrap/app.php` - Add CORS middleware

## 🎯 Checklist

- [ ] Laravel server running (Port 8000)
- [ ] React dev server running (Port 5173)
- [ ] `.env` file ada di `src/webapp/`
- [ ] Can access http://localhost:5173
- [ ] Login form bisa submit request ke API
- [ ] Token berhasil disimpan di localStorage
- [ ] Redirect sesuai role (user/admin/mitra)

---

**Problèm?** Hubungi tim dev atau check browser DevTools → Network tab!
