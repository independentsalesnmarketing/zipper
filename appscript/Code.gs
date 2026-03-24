var RESEND_API_KEY = (function() {
  try {
    return PropertiesService.getScriptProperties().getProperty('RESEND_API_KEY') || 're_NTZ43Rgx_46UM8PmK4PA3cURQ9dwRa795';
  } catch (e) { return 're_NTZ43Rgx_46UM8PmK4PA3cURQ9dwRa795'; }
})();

var SPREADSHEET_ID = (function() {
  try {
    return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';
  } catch (e) { return ''; }
})();

var NOTIFY_EMAIL = (function() {
  try {
    return PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL') || 'gamblerspassion@gmail.com';
  } catch (e) { return 'gamblerspassion@gmail.com'; }
})();

var FROM_EMAIL = 'Internet 4 ALL <onboarding@resend.dev>';
var SHEET_NAME = 'Leads';

var HEADERS = [
  'timestamp',
  'first_name',
  'last_name',
  'address',
  'city',
  'state',
  'zip',
  'email',
  'phone',
  'dob',
  'ssn',
  'install_date',
  'provider',
  'plan',
  'need',
  'form_type',
  'requested_provider',
  'subject',
  'message',
  'page_url',
  'order_ref'
];

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

function getOrCreateSheet() {
  var ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No spreadsheet found. Set SPREADSHEET_ID in Script Properties.');
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  var existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), HEADERS.length)).getValues()[0] || [];
  var needsHeaderUpdate = false;
  for (var h = 0; h < HEADERS.length; h++) {
    if (existingHeaders[h] !== HEADERS[h]) {
      needsHeaderUpdate = true;
      break;
    }
  }

  if (needsHeaderUpdate) {
    sheet.getRange(1, 1, 1, HEADERS.length).clearContent();
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#0052ff')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
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
    return getColumnValue(data, col);
  });
  sheet.appendRow(row);
}

function getColumnValue(data, col) {
  if (col === 'dob' || col === 'install_date') {
    return formatDateToMdy(data[col]);
  }
  if (col === 'address') {
    return data.address || '';
  }
  return data[col] || '';
}

function formatDateToMdy(value) {
  if (!value) return '';
  var str = String(value).trim();
  var m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return m[2] + '/' + m[3] + '/' + m[1];
  return str;
}

function sendNotification(data) {
  if (!RESEND_API_KEY || RESEND_API_KEY === 'YOUR_RESEND_API_KEY') return;

  var formType = data.form_type || 'unknown';
  var subjectLine = 'New ' + capitalize(formType) + ' Lead';
  if (data.first_name) subjectLine += ' - ' + data.first_name + (data.last_name ? ' ' + data.last_name : '');
  var displayProvider = (data.provider || '').trim();
  if (data.requested_provider && displayProvider === 'Other / Not sure yet') {
    displayProvider = data.requested_provider + ' (non-partner)';
  }
  if (displayProvider && displayProvider !== 'Other / Not sure yet') subjectLine += ' (' + displayProvider + ')';

  var htmlBody = '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">';
  htmlBody += '<div style="background:#0052ff;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0;">';
  htmlBody += '<h2 style="margin:0;font-size:18px;">Internet 4 ALL - New Lead</h2></div>';
  htmlBody += '<div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">';
  htmlBody += '<table style="width:100%;border-collapse:collapse;">';

  HEADERS.forEach(function(col) {
    var val = (col === 'timestamp')
      ? Utilities.formatDate(new Date(), 'America/New_York', 'MM/dd/yyyy hh:mm:ss a') + ' EST'
      : getColumnValue(data, col);
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

  var response = UrlFetchApp.fetch('https://api.resend.com/emails', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var statusCode = response.getResponseCode();
  var responseBody = response.getContentText();
  Logger.log('[Resend] status=' + statusCode + ' body=' + responseBody);
}

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
  Logger.log('Email sent - check ' + NOTIFY_EMAIL);
}
