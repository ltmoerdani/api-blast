# WhatsApp QR Code Debug Guide

## 🚀 Tools yang Telah Dibuat

### 1. Debug HTML Tool
**File:** `debug-qr.html`
**URL:** `http://localhost:8000/debug-qr.html` (atau sesuai server Anda)

**Fitur:**
- ✅ Interface yang user-friendly
- ✅ Auto-save credentials di localStorage 
- ✅ Real-time debug information
- ✅ Multiple testing endpoints
- ✅ QR code display dengan instruksi

### 2. PHP API Debug Tool  
**File:** `debug-api.php`
**URL:** `http://localhost:8000/debug-api.php`

**Endpoints:**
- `?action=debug` - Debug status session
- `?action=qrcode` - Generate QR code
- `?action=info` - Get account info
- `?action=reset` - Reset session
- `?action=test_all` - Test semua endpoint

## 🔧 Cara Testing untuk Instance ID: 675AAEEF1ED2D

### Step 1: Persiapan
1. **Pastikan API server berjalan** di `https://api-blast.myarchery.id`
2. **Dapatkan access_token yang valid** dari database
3. **Pastikan instance_id `675AAEEF1ED2D` terdaftar** di database

### Step 2: Menggunakan HTML Debug Tool

1. **Buka file:** `debug-qr.html`
2. **Isi form:**
   ```
   Base URL: https://api-blast.myarchery.id
   Access Token: [ISI_TOKEN_YANG_VALID]
   Instance ID: 675AAEEF1ED2D
   ```
3. **Klik "Debug Status"** untuk cek kondisi session
4. **Analisa hasilnya:**
   - 🟢 **Online & Logged In** = Sudah login, gunakan "Get Info"
   - 🟡 **Connected (Waiting)** = Siap untuk QR code
   - 🔴 **Offline** = Perlu reset session

### Step 3: Generate QR Code

**Jika status "Connected (Waiting)":**
1. Klik **"Generate QR Code"**
2. Tunggu QR code muncul
3. Scan dengan WhatsApp: Menu → Linked Devices → Link a Device

**Jika status "Offline":**
1. Klik **"Reset Session"** dulu
2. Tunggu 2-3 detik
3. Klik **"Generate QR Code"**

### Step 4: Testing dengan CURL

```bash
# 1. Debug Status
curl "https://api-blast.myarchery.id/debug_qr_status?access_token=YOUR_TOKEN&instance_id=675AAEEF1ED2D"

# 2. Generate QR Code
curl "https://api-blast.myarchery.id/get_qrcode?access_token=YOUR_TOKEN&instance_id=675AAEEF1ED2D"

# 3. Get Info (jika sudah login)
curl "https://api-blast.myarchery.id/instance?access_token=YOUR_TOKEN&instance_id=675AAEEF1ED2D"

# 4. Reset Session
curl -X POST "https://api-blast.myarchery.id/reset_session?access_token=YOUR_TOKEN&instance_id=675AAEEF1ED2D"
```

### Step 5: Testing dengan PHP Tool

```bash
# Test semua endpoint sekaligus
curl "http://localhost/debug-api.php?action=test_all&access_token=YOUR_TOKEN&instance_id=675AAEEF1ED2D"

# Test debug saja
curl "http://localhost/debug-api.php?action=debug&access_token=YOUR_TOKEN&instance_id=675AAEEF1ED2D"
```

## 🔍 Troubleshooting Common Issues

### Issue 1: "The authentication process has failed"
**Penyebab:** Access token tidak valid/tidak ada di database
**Solusi:**
```sql
-- Cek token di database
SELECT * FROM sp_team WHERE ids = 'YOUR_ACCESS_TOKEN';
```

### Issue 2: "The Instance ID provided has been invalidated"
**Penyebab:** Instance ID tidak terdaftar atau tidak sesuai team
**Solusi:**
```sql
-- Cek instance di database
SELECT ws.*, st.ids as access_token 
FROM sp_whatsapp_sessions ws
JOIN sp_team st ON ws.team_id = st.id 
WHERE ws.instance_id = '675AAEEF1ED2D';
```

### Issue 3: "Cannot generate WhatsApp QR code"
**Penyebab:** Session belum siap/stuck
**Solusi:**
1. Reset session terlebih dahulu
2. Tunggu 2-3 detik
3. Generate QR code lagi

### Issue 4: "License not valid"
**Penyebab:** License verification gagal
**Solusi:**
```sql
-- Cek license di database
SELECT * FROM sp_purchases WHERE item_id IN ('32290038', '32399061');

-- Cek base_url setting
SELECT * FROM sp_options WHERE name = 'base_url';
```

## 📋 Database Query untuk Debugging

```sql
-- 1. Cek semua data terkait instance
SELECT 
    a.id,
    a.token as instance_id,
    a.name,
    a.status,
    t.ids as access_token,
    ws.status as session_status
FROM sp_accounts a
LEFT JOIN sp_team t ON a.team_id = t.id
LEFT JOIN sp_whatsapp_sessions ws ON a.token = ws.instance_id
WHERE a.token = '675AAEEF1ED2D';

-- 2. Cek session aktif
SELECT * FROM sp_whatsapp_sessions 
WHERE instance_id = '675AAEEF1ED2D';

-- 3. Cek team dan token
SELECT * FROM sp_team WHERE ids = 'YOUR_ACCESS_TOKEN';

-- 4. Cek license
SELECT * FROM sp_purchases;
SELECT * FROM sp_options WHERE name = 'base_url';
```

## 💡 Tips untuk Success

1. **Selalu mulai dengan debug status** sebelum generate QR
2. **Gunakan reset session** jika ada masalah
3. **Pastikan database lengkap** (team, account, session)
4. **Cek license dan base_url** di sp_options
5. **Monitor session folder** di `sessions/675AAEEF1ED2D/`

## 🎯 Expected Results

**Success Response untuk QR Code:**
```json
{
    "status": "success",
    "message": "Success",
    "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Success Response untuk Debug:**
```json
{
    "status": "success",
    "debug_info": {
        "has_client": true,
        "has_qrcode": true,
        "qrcode_value": "Present",
        "user_info": "Not logged in",
        "connection_state": 1
    }
}
```

Gunakan tools ini untuk debugging sistematis dan identifikasi masalah dengan instance `675AAEEF1ED2D`!
