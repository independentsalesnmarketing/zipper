/**
 * Internet 4 ALL — Google Apps Script Web App
 * 
 * Receives form submissions from the website, appends them to the active sheet,
 * and sends an email notification via Resend API.
 *
 * SETUP:
 * 1. Open Google Sheets → Extensions → Apps Script
 * 2. Paste this entire file into Code.gs
 * 3. Set RESEND_API_KEY below (get one at https://resend.com)
 * 4. Set NOTIFY_EMAIL to the address that should receive alerts
 * 5. Deploy → New deployment → Web app → Execute as: Me, Access: Anyone
 * 6. Copy the deploy URL and paste it into src/lib/client/submit-lead.ts
 */

// ── CONFIG ──────────────────────────────────────────────────────────────────
var RESEND_API_KEY = 're_C44BFJQZ_DdpivF57tpmmrG5nGsXv2zeT';
var NOTIFY_EMAIL   = 'leads@internet-4-all.com';     // where notifications go
var FROM_EMAIL     = 'Internet 4 ALL <onboarding@resend.dev>'; // Resend test sender (works without domain verification)
var SHEET_NAME     = 'Leads';                      // tab name (created automatically)

// ── COLUMN HEADERS (order matters — matches the sheet) ──────────────────────
var HEADERS = [
  'timestamp',
  'form_type',
  'order_ref',
  'first_name',
  'last_name',
  'email',
  'address',
  'zip',
  'provider',
  'plan',
  'need',
  'dob',
  'install_date',
  'subject',
  'message',
  'page_url'
];

// ── WEB APP ENTRY POINTS ────────────────────────────────────────────────────

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();
    appendRow(sheet, data);
    sendNotification(data);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Internet 4 ALL lead endpoint is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── SHEET HELPERS ───────────────────────────────────────────────────────────

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  // Ensure headers exist on row 1
  var firstCell = sheet.getRange('A1').getValue();
  if (!firstCell || firstCell !== HEADERS[0]) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#0052ff')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    // Auto-resize
    for (var i = 1; i <= HEADERS.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
  return sheet;
}

function appendRow(sheet, data) {
  var now = new Date();
  var timestamp = Utilities.formatDate(now, 'America/New_York', 'MM/dd/yyyy hh:mm:ss a') + ' EST';
  var row = HEADERS.map(function(col) {
    if (col === 'timestamp') return timestamp;
    return data[col] || '';
  });
  sheet.appendRow(row);
}

// ── EMAIL NOTIFICATION VIA RESEND ───────────────────────────────────────────

function sendNotification(data) {
  if (!RESEND_API_KEY || RESEND_API_KEY === 'YOUR_RESEND_API_KEY') return;

  var formType = data.form_type || 'unknown';
  var subjectLine = 'New ' + capitalize(formType) + ' Lead';
  if (data.first_name) subjectLine += ' — ' + data.first_name + (data.last_name ? ' ' + data.last_name : '');
  if (data.provider && data.provider !== 'Other / Not sure yet') subjectLine += ' (' + data.provider + ')';

  var htmlBody = '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">';
  htmlBody += '<div style="background:#0052ff;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0;">';
  htmlBody += '<h2 style="margin:0;font-size:18px;">Internet 4 ALL — New Lead</h2></div>';
  htmlBody += '<div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">';
  htmlBody += '<table style="width:100%;border-collapse:collapse;">';

  HEADERS.forEach(function(col) {
    var val = (col === 'timestamp') ? new Date().toISOString() : (data[col] || '');
    if (val) {
      htmlBody += '<tr><td style="padding:6px 12px 6px 0;font-weight:600;color:#374151;white-space:nowrap;vertical-align:top;">'
        + capitalize(col.replace(/_/g, ' '))
        + '</td><td style="padding:6px 0;color:#111827;">' + escapeHtml(String(val)) + '</td></tr>';
    }
  });

  htmlBody += '</table></div></div>';

  var payload = {
    from: FROM_EMAIL,
    to: [NOTIFY_EMAIL],
    subject: subjectLine,
    html: htmlBody
  };

  UrlFetchApp.fetch('https://api.resend.com/emails', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

// ── UTILITIES ───────────────────────────────────────────────────────────────

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── RUN THIS FROM APPS SCRIPT EDITOR TO TEST EMAIL ─────────────────────────
function testEmail() {
  var testData = {
    form_type: 'signup',
    order_ref: 'IA-EMAILTEST',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    provider: 'AT&T Fiber',
    page_url: 'https://internet-4-all.com'
  };
  sendNotification(testData);
  Logger.log('Email sent — check ' + NOTIFY_EMAIL);
}
