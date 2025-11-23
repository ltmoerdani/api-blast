# 🚀 API Blast - WhatsApp Gateway API

API Gateway untuk WhatsApp Business menggunakan Baileys library. Mendukung multiple instance WhatsApp dengan fitur multi-tenant.

## 📋 Fitur

- ✅ Multiple WhatsApp Instance Management
- ✅ QR Code Generation untuk Login
- ✅ Send Message (Text, Image, Document)
- ✅ Group Management
- ✅ Session Management
- ✅ Auto Reconnect dengan Exponential Backoff
- ✅ WebSocket Connection Monitoring
- ✅ Debug Tools & Utilities

## 🏗️ Struktur Project

```
api-blast/
├── app.js                      # Main application entry point
├── config.js                   # Database & CORS configuration
├── package.json                # NPM dependencies
├── README.md                   # Dokumentasi utama (file ini)
│
├── waziper/                    # Core WhatsApp module
│   ├── waziper.js             # Main WhatsApp handler
│   └── common.js              # Common utilities
│
├── sessions/                   # WhatsApp session storage
│   └── [instance_id]/         # Per-instance session data
│
├── debug-tools/                # Debug & Testing tools
│   ├── debug-qr.html          # HTML interface untuk QR debugging
│   ├── debug-dev.html         # Development debug tool
│   └── debug-api.php          # PHP API testing tool
│
└── docs/                       # Dokumentasi
    ├── DEBUG_GUIDE.md         # Guide debugging QR code
    ├── WEBSOCKET_FIX_REPORT.md # Laporan fix ETIMEDOUT error
    ├── QR_CODE_ANALYSIS.md    # Analisis masalah QR code
    ├── FOUND_TOKEN.md         # Database query & testing
    └── FINAL_REPORT.md        # Laporan diagnosis lengkap
```

## 🔧 Installation

### Prerequisites
- Node.js >= 16.x
- MySQL/MariaDB
- npm atau yarn

### Setup

1. **Clone repository**
```bash
git clone https://github.com/ltmoerdani/api-blast.git
cd api-blast
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure database**

Edit `config.js`:
```javascript
database: {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "blast"
}
```

4. **Import database schema**
```sql
-- Tabel yang diperlukan:
-- sp_team, sp_accounts, sp_whatsapp_sessions, 
-- sp_purchases, sp_options
```

5. **Start server**
```bash
# Development
node app.js

# Production dengan PM2
pm2 start app.js --name api-blast
pm2 save
```

Server akan berjalan di: `http://localhost:8000`

## 📡 API Endpoints

### Authentication
Semua endpoint memerlukan `access_token` dan `instance_id`:
```
?access_token=YOUR_TOKEN&instance_id=YOUR_INSTANCE
```

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/instance` | Get WhatsApp instance info |
| GET | `/get_qrcode` | Generate QR code untuk login |
| GET | `/get_groups` | Get list group WhatsApp |
| GET | `/logout` | Logout WhatsApp session |
| POST | `/send_message` | Kirim pesan WhatsApp |

### Debug Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/debug` | HTML debug interface |
| GET | `/debug-qr.html` | QR code debug tool |
| GET | `/debug-dev.html` | Development debug (bypass license) |
| GET | `/debug_qr_status` | Debug status QR code |
| POST | `/reset_session` | Reset WhatsApp session |
| GET | `/tools` | List available debug tools |
| GET | `/docs` | Debug documentation |

### Development Endpoints (License Bypassed)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/get_qrcode_dev` | QR code (no license check) |
| GET | `/debug_qr_status_dev` | Debug status (no license check) |
| POST | `/reset_session_dev` | Reset session (no license check) |

## 🧪 Testing & Debug

### 1. HTML Debug Tool
```
http://localhost:8000/debug
```
Interface grafis untuk testing QR code generation.

### 2. cURL Testing
```bash
# Get QR Code
curl "http://localhost:8000/get_qrcode?access_token=YOUR_TOKEN&instance_id=YOUR_INSTANCE"

# Debug Status
curl "http://localhost:8000/debug_qr_status?access_token=YOUR_TOKEN&instance_id=YOUR_INSTANCE"

# Send Message
curl -X POST "http://localhost:8000/send_message?access_token=YOUR_TOKEN&instance_id=YOUR_INSTANCE" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "6281234567890",
    "message": "Hello from API Blast!"
  }'
```

### 3. Check Available Tools
```bash
curl http://localhost:8000/tools
```

## 🔍 Troubleshooting

### Issue: Cannot generate QR code
**Solusi:**
1. Cek status: `GET /debug_qr_status`
2. Reset session: `POST /reset_session`
3. Generate QR ulang: `GET /get_qrcode`

### Issue: ETIMEDOUT error
**Penyebab:** Network timeout atau WebSocket connection issue

**Solusi:**
- Restart aplikasi
- Check network connectivity
- Review logs: `pm2 logs api-blast`
- Baca: [docs/WEBSOCKET_FIX_REPORT.md](docs/WEBSOCKET_FIX_REPORT.md)

### Issue: Authentication failed
**Penyebab:** Invalid access_token atau instance_id

**Solusi:**
```sql
-- Cek token & instance di database
SELECT t.ids as access_token, a.token as instance_id, a.name
FROM sp_accounts a
JOIN sp_team t ON a.team_id = t.id
WHERE a.token = 'YOUR_INSTANCE_ID';
```

### Issue: Session corruption
**Solusi:**
```bash
# Hapus session files
rm -rf sessions/YOUR_INSTANCE_ID/*

# Reset via API
curl -X POST "http://localhost:8000/reset_session?access_token=TOKEN&instance_id=INSTANCE"
```

## 📚 Documentation

Dokumentasi lengkap tersedia di folder `docs/`:

- **[DEBUG_GUIDE.md](docs/DEBUG_GUIDE.md)** - Panduan debug QR code
- **[WEBSOCKET_FIX_REPORT.md](docs/WEBSOCKET_FIX_REPORT.md)** - Fix ETIMEDOUT & reconnection
- **[QR_CODE_ANALYSIS.md](docs/QR_CODE_ANALYSIS.md)** - Analisis masalah QR code loop
- **[FOUND_TOKEN.md](docs/FOUND_TOKEN.md)** - Database queries & testing
- **[FINAL_REPORT.md](docs/FINAL_REPORT.md)** - Diagnosis & resolution report

## ⚙️ Configuration

### Database Pool Settings
```javascript
// config.js
database: {
    connectionLimit: 500,
    waitForConnections: true,
    queueLimit: 0,
    connectTimeout: 10000
}
```

### WebSocket Timeouts
```javascript
// waziper/waziper.js
connectTimeoutMs: 60000,         // 60 detik
defaultQueryTimeoutMs: 60000,
keepaliveIntervalMs: 30000,
retryRequestDelayMs: 5000
```

### Retry Configuration
```javascript
MAX_RETRY_ATTEMPTS: 5
BASE_RETRY_DELAY: 5000    // 5 detik
MAX_RETRY_DELAY: 60000    // 60 detik
```

## 🚀 Production Deployment

### 1. Setup PM2
```bash
npm install -g pm2

# Start with PM2
pm2 start app.js --name api-blast --max-memory-restart 500M

# Setup auto-start on reboot
pm2 startup
pm2 save
```

### 2. Setup Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name api-blast.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. SSL dengan Let's Encrypt
```bash
sudo certbot --nginx -d api-blast.yourdomain.com
```

### 4. Monitoring
```bash
# Monitor logs
pm2 logs api-blast --lines 100

# Monitor resources
pm2 monit

# Check status
pm2 status
```

## 📊 Database Schema

### Required Tables

```sql
-- sp_team: Team management
CREATE TABLE sp_team (
    id INT PRIMARY KEY,
    ids VARCHAR(255) UNIQUE, -- access_token
    name VARCHAR(255)
);

-- sp_accounts: WhatsApp accounts/instances
CREATE TABLE sp_accounts (
    id INT PRIMARY KEY,
    token VARCHAR(255) UNIQUE, -- instance_id
    team_id INT,
    name VARCHAR(255),
    username VARCHAR(50),
    status TINYINT DEFAULT 0
);

-- sp_whatsapp_sessions: Session storage
CREATE TABLE sp_whatsapp_sessions (
    id INT PRIMARY KEY,
    instance_id VARCHAR(255),
    team_id INT,
    status TINYINT DEFAULT 0,
    session_data TEXT
);

-- sp_purchases: License validation
CREATE TABLE sp_purchases (
    id INT PRIMARY KEY,
    item_id VARCHAR(50),
    purchase_code VARCHAR(255)
);
```

## 🔐 Security Notes

- Jangan commit file `config.js` ke repository
- Gunakan environment variables untuk credentials
- Tambahkan IP whitelist jika diperlukan
- Regular backup folder `sessions/`
- Monitor failed authentication attempts

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📝 License

Copyright © 2025 - API Blast

## 📞 Support

- **Issues:** https://github.com/ltmoerdani/api-blast/issues
- **Documentation:** [docs/](docs/)
- **Email:** support@myarchery.id

## 🎉 Credits

- **Baileys Library:** [@WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys)
- **Express.js:** https://expressjs.com/
- **Socket.io:** https://socket.io/

---

**Made with ❤️ for MyArchery**
