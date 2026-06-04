// ============================================================
// File ini untuk di-paste ke Google Apps Script Editor
// Extensions → Apps Script di Google Sheets
// ============================================================

// GET: Ambil data menu
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Menu');
    if (!sheet) throw new Error('Sheet "Menu" tidak ditemukan');

    const data = sheet.getDataRange().getValues();
    const menuItems = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
      menuItems.push({
        name: row[0] ? String(row[0]).trim() : '',
        description: row[1] ? String(row[1]).trim() : '',
        price: row[2] || 0,
        image: row[3] ? String(row[3]).trim() : '',
        isAvailable: row[4] ? String(row[4]).trim() : 'Ya'
      });
    }

    return jsonResponse({ success: true, data: menuItems });

  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// POST: Simpan pesanan baru ke sheet "Pesanan"
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    // Buat sheet "Pesanan" jika belum ada
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Pesanan');
    if (!sheet) {
      sheet = ss.insertSheet('Pesanan');
      // Buat header
      sheet.appendRow(['No. Pesanan', 'Tanggal', 'Nama', 'No. WhatsApp', 'Tipe', 'Item Pesanan', 'Total', 'Catatan', 'Status']);
      // Format header
      const headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setBackground('#EA580C');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
    }

    // Generate nomor pesanan
    const lastRow = sheet.getLastRow();
    const orderNumber = 'ORD-' + String(lastRow).padStart(4, '0');

    // Format tanggal
    const now = new Date();
    const tanggal = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');

    // Simpan pesanan
    sheet.appendRow([
      orderNumber,
      tanggal,
      payload.name || '',
      payload.phone || '',
      payload.type || '',
      payload.items || '',
      payload.total || 0,
      payload.note || '',
      'Baru'
    ]);

    // Format kolom Total sebagai currency
    const newRow = sheet.getLastRow();
    sheet.getRange(newRow, 7).setNumberFormat('"Rp "#,##0');

    return jsonResponse({ success: true, orderNumber });

  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// Helper: return JSON response dengan CORS header
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Fungsi testing manual
function testGetData() {
  Logger.log(doGet().getContent());
}

function testPostData() {
  const mockPost = {
    postData: {
      contents: JSON.stringify({
        action: 'order',
        name: 'Budi',
        phone: '08123456789',
        type: 'Makan di Tempat',
        items: 'Nasi Krawu Komplit x2, Es Teh Manis x1',
        total: 55000,
        note: 'Tidak pedas'
      })
    }
  };
  Logger.log(doPost(mockPost).getContent());
}
