/* ============================================================
   GOOGLE APPS SCRIPT — Quiz Analytics Backend
   
   INSTRUCTIONS :
   1. Ouvre Google Sheets → crée un nouveau fichier
   2. Extensions → Apps Script
   3. Colle tout ce code dans le fichier Code.gs
   4. Clique "Déployer" → "Nouveau déploiement"
   5. Type = "Application Web"
   6. Accès = "Tout le monde"
   7. Clique "Déployer" → copie l'URL
   8. Colle l'URL dans quiz-funnel.js (variable TRACKING_URL)
   9. Colle l'URL dans dashboard.html (variable API_URL)
   ============================================================ */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('responses');
    if (!sheet) {
      sheet = ss.insertSheet('responses');
      sheet.appendRow(['timestamp', 'session_id', 'step', 'question', 'answer', 'user_agent']);
    }
    
    sheet.appendRow([
      new Date().toISOString(),
      data.session_id || '',
      data.step || '',
      data.question || '',
      data.answer || '',
      data.user_agent || ''
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ============================================================
   INIT PASSWORD — Lancer une seule fois manuellement
   depuis Apps Script (menu Exécuter → initPassword)
   ============================================================ */
function initPassword() {
  PropertiesService.getScriptProperties().setProperty('DASHBOARD_PWD', 'julie');
  Logger.log('Mot de passe enregistré dans les propriétés du script.');
}

function doGet(e) {
  var params = e ? e.parameter : {};
  var action = params.action || 'data';

  /* ---- LOGIN: verify password server-side ---- */
  if (action === 'login') {
    var pwd = params.pwd || '';
    var stored = PropertiesService.getScriptProperties().getProperty('DASHBOARD_PWD') || '';
    var status = (pwd === stored && pwd !== '') ? 'ok' : 'denied';
    return ContentService.createTextOutput(JSON.stringify({ status: status }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  /* ---- DATA or GUEST: return quiz responses ---- */
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('responses');

  if (!sheet || sheet.getLastRow() < 2) {
    var output = JSON.stringify({responses: [], sessions: 0});
    return ContentService.createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }

  // Count unique sessions
  var sessions = {};
  rows.forEach(function(r) { sessions[r.session_id] = true; });

  var output = JSON.stringify({
    responses: rows,
    sessions: Object.keys(sessions).length
  });

  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}
