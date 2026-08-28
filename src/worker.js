import { sanitizeTagId, parseAndNormalizeGoogleReviewUrl } from './utils/googleReview.js';

// HTML Template View Injections
const SETUP_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aktivasi Google Review Stand</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    body {
      background-color: #f1f5f9;
      color: #1e293b;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 16px;
    }
    .card {
      width: 100%;
      max-width: 420px;
      background: #ffffff;
      border-radius: 16px;
      padding: 28px 24px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }
    .badge {
      display: inline-block;
      background: #e2e8f0;
      color: #475569;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    .stars {
      color: #f59e0b;
      font-size: 24px;
      margin-bottom: 8px;
    }
    h1 {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }
    p.desc {
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 16px;
      text-align: left;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 6px;
      color: #334155;
    }
    input[type="text"] {
      width: 100%;
      padding: 12px 14px;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      font-size: 14px;
      color: #0f172a;
      outline: none;
    }
    input[type="text"]:focus {
      border-color: #2563eb;
    }
    .helper {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 10px;
      padding: 12px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
      margin-bottom: 18px;
    }
    .helper a {
      color: #2563eb;
      font-weight: 700;
      text-decoration: none;
      display: inline-block;
      margin-top: 6px;
    }
    .btn-submit {
      width: 100%;
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 14px;
      font-size: 15px;
      font-weight: 700;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }
    .btn-submit:active {
      background: #1d4ed8;
    }
    .btn-submit:disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }

    /* Success View */
    #successView {
      display: none;
      text-align: center;
    }
    .icon-success {
      width: 56px;
      height: 56px;
      background: #dcfce7;
      color: #16a34a;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      margin-bottom: 14px;
    }
    .btn-review-link {
      display: block;
      width: 100%;
      background: #16a34a;
      color: #ffffff;
      padding: 14px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      margin-top: 20px;
    }
  </style>
</head>
<body>

  <div class="card">
    <div id="setupView">
      <div class="badge">ID: {{TAG_ID}}</div>
      <div class="stars">★★★★★</div>
      <h1>Aktivasi Stand Google Review</h1>
      <p class="desc">Masukkan nama toko dan Place ID untuk mengaktifkan pop-up ulasan rating 5 bintang toko Anda.</p>

      <form id="claimForm">
        <div class="form-group">
          <label for="bizName">1. Nama Toko / Bisnis</label>
          <input type="text" id="bizName" placeholder="Contoh: Alun alun cimahi" required autocomplete="off" />
        </div>

        <div class="form-group">
          <label for="bizPlace">2. Google Place ID / Link Ulasan</label>
          <input type="text" id="bizPlace" placeholder="ChIJ... atau link review" required autocomplete="off" />
        </div>

        <div class="helper">
          <b>💡 Cara dapatkan Place ID Toko:</b><br>
          Ketik nama toko Anda di web resmi Google, lalu salin kodenya.<br>
          <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank">
            🔍 Buka Pencari Place ID Google (Gratis) &rarr;
          </a>
        </div>

        <button type="submit" id="submitBtn" class="btn-submit">
          🔒 Simpan & Kunci Kartu Ini
        </button>
      </form>
    </div>

    <div id="successView">
      <div class="icon-success">✓</div>
      <h1 style="color: #16a34a; margin-bottom: 6px;">Kartu Berhasil Terkunci!</h1>
      <p class="desc">Stand review untuk <b id="resultName" style="color: #0f172a;"></b> sudah aktif.</p>

      <a href="#" id="resultLink" target="_blank" class="btn-review-link">
        🚀 Buka Google Review Sekarang
      </a>
    </div>
  </div>

  <script>
    var TAG_ID = "{{TAG_ID}}";
    var claimForm = document.getElementById('claimForm');
    var submitBtn = document.getElementById('submitBtn');
    var setupView = document.getElementById('setupView');
    var successView = document.getElementById('successView');
    var resultName = document.getElementById('resultName');
    var resultLink = document.getElementById('resultLink');

    claimForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      var name = document.getElementById('bizName').value.trim();
      var place = document.getElementById('bizPlace').value.trim();

      if (!name || !place) {
        alert('Mohon isi semua data.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerText = 'Menyimpan & Mengunci...';

      try {
        var response = await fetch('/api/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tagId: TAG_ID,
            businessName: name,
            reviewUrl: place
          })
        });

        var result = await response.json();

        if (response.ok && result.success) {
          setupView.style.display = 'none';
          resultName.innerText = name;
          resultLink.href = result.targetUrl;
          successView.style.display = 'block';
        } else {
          alert(result.error || 'Gagal menyimpan.');
          submitBtn.disabled = false;
          submitBtn.innerText = '🔒 Simpan & Kunci Kartu Ini';
        }
      } catch (err) {
        alert('Gagal terhubung ke server: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = '🔒 Simpan & Kunci Kartu Ini';
      }
    });
  </script>
</body>
</html>`;

const SUCCESS_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Kartu Berhasil Diaktifkan!</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1a73e8;
      --google-green: #34a853;
      --dark: #1e293b;
      --text-muted: #64748b;
      --radius: 18px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background: radial-gradient(120% 120% at 50% 0%, #ffffff 0%, #f0fdf4 100%); color: #334155; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 16px; text-align: center; }
    .container { width: 100%; max-width: 440px; background: #fff; border-radius: var(--radius); box-shadow: 0 20px 40px -15px rgba(22, 101, 52, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04); padding: 36px 24px; }
    .success-icon { width: 72px; height: 72px; background: #dcfce7; color: var(--google-green); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 34px; margin-bottom: 20px; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    h1 { font-size: 22px; font-weight: 800; color: var(--dark); margin-bottom: 8px; }
    p.desc { font-size: 14px; color: var(--text-muted); line-height: 1.5; margin-bottom: 24px; }
    .info-card { background: #f8fafc; border-radius: 12px; padding: 16px; text-align: left; margin-bottom: 24px; border: 1px solid #e2e8f0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { color: var(--text-muted); }
    .info-value { font-weight: 700; color: var(--dark); max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .btn-test-now { display: block; width: 100%; padding: 15px; background: var(--primary); color: #fff; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 12px; box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3); }
    .notice { margin-top: 18px; font-size: 12px; color: #94a3b8; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">✓</div>
    <h1>Kartu Berhasil Diaktifkan!</h1>
    <p class="desc">Kartu NFC & QR Review ini sekarang <b>terkunci permanen</b> untuk bisnis Anda.</p>
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Nama Bisnis:</span>
        <span class="info-value">{{BUSINESS_NAME}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">ID Kartu:</span>
        <span class="info-value">{{TAG_ID}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status:</span>
        <span class="info-value" style="color: #16a34a;">● Aktif & Terkunci</span>
      </div>
    </div>
    <a href="{{TARGET_URL}}" class="btn-test-now">🚀 Buka Halaman Review Sekarang</a>
    <p class="notice">Mulai sekarang, setiap scan atau tap NFC oleh pelanggan akan langsung membuka halaman Google Review toko Anda.</p>
  </div>
</body>
</html>`;

const GENERATOR_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Batch QR Stand Generator - Google Style</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <style>
    :root {
      --primary: #1a73e8;
      --google-red: #ea4335;
      --google-yellow: #fbbc04;
      --google-green: #34a853;
      --google-blue: #4285f4;
      --dark: #0f172a;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background: #f1f5f9; color: #1e293b; padding: 24px 16px; min-height: 100vh; }
    .container { max-width: 1100px; margin: 0 auto; }
    
    .control-panel {
      background: #ffffff;
      padding: 24px;
      border-radius: 18px;
      border: 1px solid var(--border);
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);
      margin-bottom: 24px;
    }
    h1 { font-size: 22px; font-weight: 900; color: var(--dark); margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
    p.subtitle { color: #64748b; font-size: 13.5px; margin-bottom: 20px; }
    
    .grid-inputs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
      margin-bottom: 20px;
    }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px; }
    .form-group input, .form-group select {
      width: 100%;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1.5px solid var(--border);
      font-size: 13.5px;
      outline: none;
      background: #fff;
    }
    .form-group input:focus, .form-group select:focus { border-color: var(--primary); }

    .btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn {
      padding: 12px 20px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 13.5px;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-primary { background: var(--primary); color: #fff; box-shadow: 0 4px 12px rgba(26,115,232,0.3); }
    .btn-primary:hover { background: #1557b0; }
    .btn-secondary { background: #e2e8f0; color: var(--dark); }
    .btn-secondary:hover { background: #cbd5e1; }

    .stands-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
      justify-content: center;
    }

    .stand-wrapper {
      position: relative;
      border-radius: 24px;
      padding: 24px 18px;
      background: radial-gradient(circle at 10% 20%, rgba(66, 133, 244, 0.25) 0%, transparent 40%),
                  radial-gradient(circle at 90% 10%, rgba(234, 67, 53, 0.25) 0%, transparent 40%),
                  radial-gradient(circle at 10% 90%, rgba(52, 168, 83, 0.25) 0%, transparent 40%),
                  radial-gradient(circle at 90% 90%, rgba(251, 188, 4, 0.25) 0%, transparent 40%),
                  #ffffff;
      box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      align-items: center;
      page-break-inside: avoid;
    }

    .stand-card {
      width: 100%;
      background: #ffffff;
      border-radius: 18px;
      padding: 20px 16px;
      box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
      text-align: center;
      position: relative;
    }

    .stand-title {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .qr-box-container {
      position: relative;
      display: inline-flex;
      padding: 14px;
      margin-bottom: 12px;
    }

    .corner-bracket {
      position: absolute;
      width: 28px;
      height: 28px;
      pointer-events: none;
    }

    .corner-tl {
      top: 0;
      left: 0;
      border-top: 5px solid var(--google-red);
      border-left: 5px solid var(--google-red);
      border-top-left-radius: 6px;
    }
    .corner-tl::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      border-top: 2px solid var(--google-red);
      border-left: 2px solid var(--google-red);
    }

    .corner-tr {
      top: 0;
      right: 0;
      border-top: 5px solid var(--google-yellow);
      border-right: 5px solid var(--google-yellow);
      border-top-right-radius: 6px;
    }
    .corner-tr::after {
      content: '';
      position: absolute;
      top: 3px;
      right: 3px;
      width: 18px;
      height: 18px;
      border-top: 2px solid var(--google-yellow);
      border-right: 2px solid var(--google-yellow);
    }

    .corner-bl {
      bottom: 0;
      left: 0;
      border-bottom: 5px solid var(--google-green);
      border-left: 5px solid var(--google-green);
      border-bottom-left-radius: 6px;
    }
    .corner-bl::after {
      content: '';
      position: absolute;
      bottom: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      border-bottom: 2px solid var(--google-green);
      border-left: 2px solid var(--google-green);
    }

    .corner-br {
      bottom: 0;
      right: 0;
      border-bottom: 5px solid var(--google-blue);
      border-right: 5px solid var(--google-blue);
      border-bottom-right-radius: 6px;
    }
    .corner-br::after {
      content: '';
      position: absolute;
      bottom: 3px;
      right: 3px;
      width: 18px;
      height: 18px;
      border-bottom: 2px solid var(--google-blue);
      border-right: 2px solid var(--google-blue);
    }

    .qr-canvas-holder {
      background: #ffffff;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-canvas-holder img, .qr-canvas-holder canvas {
      display: block;
      width: 140px !important;
      height: 140px !important;
    }

    .stand-stars {
      color: var(--google-yellow);
      font-size: 20px;
      letter-spacing: 3px;
      margin-bottom: 6px;
    }

    .nfc-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 800;
      color: #1e293b;
      letter-spacing: 0.5px;
    }

    .stand-footer {
      margin-top: 14px;
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
    }

    .tag-subtext {
      margin-top: 6px;
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      font-family: monospace;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .control-panel { display: none !important; }
      .stands-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        padding: 10px;
      }
      .stand-wrapper {
        border: 1px dashed #cbd5e1;
        box-shadow: none;
        padding: 14px 10px;
      }
    }
  </style>
</head>
<body>

  <div class="container">
    <div class="control-panel">
      <h1>⭐ Batch QR Stand Generator (Google 4-Color Style)</h1>
      <p class="subtitle">Generate otomatis desain stand akrilik ulasan bintang 5 Google siap cetak / download.</p>

      <div class="grid-inputs">
        <div class="form-group">
          <label>Mode Cetak</label>
          <select id="modeSelect" onchange="handleModeChange()">
            <option value="single">🎯 1 QR Sama (Paket Meja Kafe / 1 Toko)</option>
            <option value="batch">🔢 ID Berurutan (Stiker Beda ID untuk Klien Berbeda)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Domain / Link Worker</label>
          <input type="text" id="domainInput" value="" placeholder="https://qr-review-business.vercel.app" />
        </div>

        <div class="form-group" id="tagIdGroup">
          <label>ID Kartu / QR</label>
          <input type="text" id="singleTagId" value="REV-CIMAHI-01" placeholder="REV-001" />
        </div>

        <div class="form-group" id="prefixGroup" style="display: none;">
          <label>Prefix ID Kartu</label>
          <input type="text" id="prefixInput" value="REV" placeholder="REV" />
        </div>

        <div class="form-group" id="startNumGroup" style="display: none;">
          <label>Nomor Mulai</label>
          <input type="number" id="startNum" value="101" min="1" />
        </div>

        <div class="form-group">
          <label>Judul Atas Stand</label>
          <input type="text" id="headerText" value="REVIEW HERE" placeholder="REVIEW HERE / ULAS KAMI" />
        </div>

        <div class="form-group">
          <label>Teks Footer / Brand</label>
          <input type="text" id="footerText" value="Powered by Codengine" placeholder="Powered by NamaBrand" />
        </div>

        <div class="form-group">
          <label>Jumlah Stand Dicetak</label>
          <input type="number" id="qtyInput" value="6" min="1" max="60" />
        </div>
      </div>

      <div class="btn-row">
        <button class="btn btn-primary" onclick="generateStands()">⚡ Generate Stand Preview</button>
        <button class="btn btn-secondary" onclick="window.print()">🖨️ Cetak Lembar A4 (Print)</button>
      </div>
    </div>

    <div class="stands-grid" id="standsContainer"></div>
  </div>

  <script>
    document.getElementById('domainInput').value = window.location.origin;

    function handleModeChange() {
      var isSingle = document.getElementById('modeSelect').value === 'single';
      document.getElementById('tagIdGroup').style.display = isSingle ? 'block' : 'none';
      document.getElementById('prefixGroup').style.display = isSingle ? 'none' : 'block';
      document.getElementById('startNumGroup').style.display = isSingle ? 'none' : 'block';
    }

    function generateStands() {
      var container = document.getElementById('standsContainer');
      container.innerHTML = '';

      var domain = document.getElementById('domainInput').value.trim().replace(/\/+$/, '');
      var mode = document.getElementById('modeSelect').value;
      var headerText = document.getElementById('headerText').value.trim() || 'REVIEW HERE';
      var footerText = document.getElementById('footerText').value.trim() || 'Powered by Codengine';
      var qty = parseInt(document.getElementById('qtyInput').value, 10) || 1;

      var tagList = [];

      if (mode === 'single') {
        var tag = document.getElementById('singleTagId').value.trim() || 'REV-001';
        for (var i = 0; i < qty; i++) {
          tagList.push(tag);
        }
      } else {
        var prefix = document.getElementById('prefixInput').value.trim() || 'REV';
        var start = parseInt(document.getElementById('startNum').value, 10) || 101;
        for (var j = 0; j < qty; j++) {
          tagList.push(prefix + '-' + (start + j));
        }
      }

      tagList.forEach(function(tagId, idx) {
        var targetUrl = domain + '/t/' + tagId;

        var wrapper = document.createElement('div');
        wrapper.className = 'stand-wrapper';

        var card = document.createElement('div');
        card.className = 'stand-card';

        var title = document.createElement('div');
        title.className = 'stand-title';
        title.textContent = headerText;
        card.appendChild(title);

        var qrBox = document.createElement('div');
        qrBox.className = 'qr-box-container';

        var cTL = document.createElement('div'); cTL.className = 'corner-bracket corner-tl';
        var cTR = document.createElement('div'); cTR.className = 'corner-bracket corner-tr';
        var cBL = document.createElement('div'); cBL.className = 'corner-bracket corner-bl';
        var cBR = document.createElement('div'); cBR.className = 'corner-bracket corner-br';

        qrBox.appendChild(cTL);
        qrBox.appendChild(cTR);
        qrBox.appendChild(cBL);
        qrBox.appendChild(cBR);

        var qrHolder = document.createElement('div');
        qrHolder.className = 'qr-canvas-holder';
        qrHolder.id = 'qr-' + idx;
        qrBox.appendChild(qrHolder);

        card.appendChild(qrBox);

        var stars = document.createElement('div');
        stars.className = 'stand-stars';
        stars.textContent = '★★★★★';
        card.appendChild(stars);

        var nfc = document.createElement('div');
        nfc.className = 'nfc-badge';
        nfc.innerHTML = '((((&nbsp;<b>NFC</b>&nbsp;))))';
        card.appendChild(nfc);

        wrapper.appendChild(card);

        var footer = document.createElement('div');
        footer.className = 'stand-footer';
        footer.textContent = footerText;
        wrapper.appendChild(footer);

        var idSub = document.createElement('div');
        idSub.className = 'tag-subtext';
        idSub.textContent = 'ID: ' + tagId;
        wrapper.appendChild(idSub);

        container.appendChild(wrapper);

        new QRCode(qrHolder, {
          text: targetUrl,
          width: 140,
          height: 140,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      });
    }

    window.addEventListener('DOMContentLoaded', function() {
      document.getElementById('domainInput').value = window.location.origin;
      generateStands();
    });
  </script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Root & Admin Tools Routing
    if (path === '/' || path === '' || path === '/tools/generator' || path === '/tools/qr') {
      return new Response(GENERATOR_HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 2. Place Search Autocomplete API: GET /api/places/search?q=...
    if (path === '/api/places/search') {
      const q = url.searchParams.get('q') || '';
      if (!q || q.length < 2) {
        return Response.json({ results: [] });
      }

      try {
        // Query Photon OSM search proxy for fast global & Indonesian POIs
        const searchUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6`;
        const res = await fetch(searchUrl, {
          headers: { 'User-Agent': 'QRReviewPlatform/1.0' }
        });
        const data = await res.json();

        const results = (data.features || []).map(f => {
          const p = f.properties || {};
          const name = p.name || q;
          const parts = [p.street, p.district, p.city || p.county, p.state, p.country].filter(Boolean);
          const address = parts.join(', ');
          const queryParam = encodeURIComponent(`${name} ${address}`);
          return {
            name,
            address,
            directReviewUrl: `https://www.google.com/maps/search/?api=1&query=${queryParam}`
          };
        });

        return Response.json({ results });
      } catch (err) {
        return Response.json({ results: [] });
      }
    }

    // 3. Tag Route: /t/:tagId
    if (path.startsWith('/t/')) {
      const rawTagId = path.substring(3);
      const tagId = sanitizeTagId(rawTagId);

      if (!tagId) {
        return new Response('Invalid Tag ID', { status: 400 });
      }

      // 1. Check if tag is already configured in KV
      let tagData = null;
      if (env.REVIEW_TAGS) {
        try {
          tagData = await env.REVIEW_TAGS.get(tagId, { type: 'json' });
        } catch (e) {
          console.error('KV Read Error:', e);
        }
      }

      // 2. Cookie fallback for edge cold-starts
      if (!tagData) {
        const cookieHeader = request.headers.get('Cookie') || '';
        const cookieMatch = cookieHeader.match(new RegExp(`tag_${tagId}=([^;]+)`));
        if (cookieMatch) {
          try {
            tagData = JSON.parse(decodeURIComponent(cookieMatch[1]));
          } catch (e) {}
        }
      }

      // If already configured and locked -> Instant Edge HTTP 302 Redirect to Google Review!
      if (tagData && tagData.isLocked && tagData.targetUrl) {
        if (ctx && ctx.waitUntil && env.REVIEW_TAGS) {
          ctx.waitUntil(
            (async () => {
              try {
                tagData.totalTaps = (tagData.totalTaps || 0) + 1;
                tagData.lastTappedAt = new Date().toISOString();
                await env.REVIEW_TAGS.put(tagId, JSON.stringify(tagData));
              } catch (err) {
                console.error('Tap count update error:', err);
              }
            })()
          );
        }

        return Response.redirect(tagData.targetUrl, 302);
      }

      // If NOT yet configured -> Render First-Tap Setup Page
      const setupHtml = SETUP_HTML.replace(/{{TAG_ID}}/g, tagId);
      return new Response(setupHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
        }
      });
    }

    // 4. API Route: POST /api/claim
    if (path === '/api/claim' && request.method === 'POST') {
      try {
        const body = await request.json();
        const tagId = sanitizeTagId(body.tagId);
        const businessName = (body.businessName || '').trim();
        const reviewUrl = (body.reviewUrl || '').trim();

        if (!tagId) {
          return Response.json({ success: false, error: 'Tag ID tidak valid' }, { status: 400 });
        }

        if (!businessName) {
          return Response.json({ success: false, error: 'Nama bisnis wajib diisi' }, { status: 400 });
        }

        const parsedUrl = await parseAndNormalizeGoogleReviewUrl(reviewUrl, businessName);
        if (!parsedUrl.valid) {
          return Response.json({ success: false, error: parsedUrl.error }, { status: 400 });
        }

        const tagRecord = {
          tagId,
          businessName,
          targetUrl: parsedUrl.url,
          rawInput: reviewUrl,
          urlType: parsedUrl.type,
          isLocked: true,
          claimedAt: new Date().toISOString(),
          totalTaps: 0
        };

        // Check if already claimed & locked in KV
        if (env.REVIEW_TAGS) {
          const existing = await env.REVIEW_TAGS.get(tagId, { type: 'json' });
          if (existing && existing.isLocked) {
            return Response.json({
              success: false,
              error: 'Kartu ini sudah pernah diaktifkan dan dikunci permanen.'
            }, { status: 409 });
          }

          // Save to KV permanently
          await env.REVIEW_TAGS.put(tagId, JSON.stringify(tagRecord));
        }

        const responseObj = {
          success: true,
          tagId,
          businessName,
          targetUrl: parsedUrl.url
        };

        const cookieVal = encodeURIComponent(JSON.stringify(tagRecord));
        const res = Response.json(responseObj);
        res.headers.set('Set-Cookie', `tag_${tagId}=${cookieVal}; Path=/; Max-Age=315360000; SameSite=Lax`);
        return res;
      } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
