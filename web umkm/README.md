# Website Warung Nasi Krawu

Website warung nasi krawu dengan menu dinamis dari Google Spreadsheet dan fitur pemesanan yang langsung tersimpan ke spreadsheet.

---

## Panduan Integrasi Google Spreadsheet

### Langkah 1 — Buat Google Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com) dan buat spreadsheet baru
2. Beri nama spreadsheet, misalnya: **Warung Nasi Krawu**
3. Buat sheet bernama **Menu** (klik tab sheet di bawah, rename jadi `Menu`)
4. Isi baris pertama sebagai header, lalu isi data menu mulai baris kedua:

| A (Nama Menu) | B (Deskripsi) | C (Harga) | D (URL Gambar) | E (Tersedia) |
|---|---|---|---|---|
| Nasi Krawu Komplit | Nasi putih dengan daging sapi krawu... | 25000 | https://... | Ya |
| Nasi Krawu Biasa | Nasi putih dengan daging sapi krawu... | 20000 | https://... | Ya |

> **Penting:**
> - Kolom C (Harga) diisi angka saja, tanpa titik atau koma. Contoh: `25000`
> - Kolom E (Tersedia) diisi `Ya` atau `Tidak`
> - Kolom D (URL Gambar) boleh dikosongkan, akan pakai foto default

---

### Langkah 2 — Buka Apps Script Editor

1. Di spreadsheet, klik menu **Extensions** (atau **Ekstensi**)
2. Pilih **Apps Script**
3. Tab baru akan terbuka dengan editor kode

---

### Langkah 3 — Paste Kode Apps Script

1. Di editor Apps Script, **hapus semua kode** yang ada (Ctrl+A lalu Delete)
2. Buka file `apps-script.js` di project ini
3. **Copy semua isinya** lalu paste ke editor Apps Script
4. Klik ikon **Save** (💾) atau tekan **Ctrl+S**
5. Beri nama project jika diminta, misalnya: `Warung Nasi Krawu`

---

### Langkah 4 — Deploy sebagai Web App

1. Klik tombol **Deploy** (pojok kanan atas) → pilih **New deployment**
2. Klik ikon ⚙️ di sebelah "Select type" → pilih **Web app**
3. Isi konfigurasi:
   - **Description**: `Warung Nasi Krawu API` (bebas)
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Klik **Deploy**
5. Jika muncul popup **Authorization required**:
   - Klik **Authorize access**
   - Pilih akun Google Anda
   - Klik **Advanced** → **Go to ... (unsafe)** → **Allow**
6. Setelah berhasil, copy **Web app URL** yang muncul

   Contoh URL: `https://script.google.com/macros/s/AKfycb.../exec`

> **Simpan URL ini**, akan dipakai di langkah berikutnya.

---

### Langkah 5 — Hubungkan ke Website

1. Buka file `script.js` di project ini
2. Cari baris paling atas:

```javascript
const APPS_SCRIPT_URL = 'YOUR_WEB_APP_URL';
```

3. Ganti `YOUR_WEB_APP_URL` dengan URL yang sudah dicopy tadi:

```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```

4. Simpan file `script.js`

---

### Langkah 6 — Tes Website

1. Buka file `index.html` di browser
2. Menu seharusnya sudah muncul dari data spreadsheet
3. Coba klik **Pesan** pada salah satu menu, isi form, lalu konfirmasi
4. Cek spreadsheet — sheet **Pesanan** akan otomatis dibuat dan data pesanan masuk di sana

---

## Struktur Sheet di Spreadsheet

### Sheet: Menu
| Kolom | Isi |
|---|---|
| A | Nama Menu |
| B | Deskripsi |
| C | Harga (angka) |
| D | URL Gambar |
| E | Tersedia (Ya/Tidak) |

### Sheet: Pesanan (otomatis dibuat)
| Kolom | Isi |
|---|---|
| A | No. Pesanan (ORD-0001, dst.) |
| B | Tanggal & Jam |
| C | Nama Pemesan |
| D | No. WhatsApp |
| E | Tipe (Makan di Tempat / Bawa Pulang) |
| F | Item Pesanan |
| G | Total Harga |
| H | Catatan |
| I | Status (default: Baru) |

---

## Jika Ada Masalah

**Menu tidak muncul / loading terus**
- Pastikan URL di `script.js` sudah benar
- Pastikan saat deploy, "Who has access" diset ke **Anyone**
- Coba buka URL Apps Script langsung di browser, harus muncul JSON

**Pesanan tidak masuk ke spreadsheet**
- Setelah edit kode Apps Script, harus **deploy ulang** (Deploy → New deployment)
- Jangan pakai URL deployment lama setelah ada perubahan kode

**Muncul error "Authorization"**
- Ulangi proses authorize di langkah 4 poin 5

**Update menu tidak tampil**
- Edit data di sheet **Menu** langsung, tidak perlu deploy ulang
- Refresh halaman website

---

## Struktur File Project

```
├── index.html        # Halaman utama website
├── script.js         # Logic website + integrasi Apps Script
├── apps-script.js    # Kode yang di-paste ke Google Apps Script
└── README.md         # Panduan ini
```

---

## Tips Tambahan

- Untuk foto menu, bisa pakai URL dari Google Drive dengan format:
  `https://drive.google.com/uc?id=FILE_ID_DISINI`
- Kolom **Status** di sheet Pesanan bisa diubah manual menjadi `Diproses` atau `Selesai` untuk tracking pesanan
- Warna tema website bisa diubah di `index.html` dengan mengganti class Tailwind `orange-600` / `red-600`
