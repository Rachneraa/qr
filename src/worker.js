import { sanitizeTagId, parseAndNormalizeGoogleReviewUrl, ftidToPlaceId } from './utils/googleReview.js';

// HTML Template View Injections
const SETUP_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Aktivasi Stand Google Review</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1a73e8;
      --primary-hover: #1557b0;
      --primary-light: #e8f0fe;
      --google-yellow: #fbbc04;
      --google-red: #ea4335;
      --google-green: #34a853;
      --dark: #0f172a;
      --text: #334155;
      --text-muted: #64748b;
      --bg: #f8fafc;
      --card: #ffffff;
      --border: #e2e8f0;
      --radius: 18px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
    body { background: radial-gradient(120% 120% at 50% 0%, #ffffff 0%, #f1f5f9 100%); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 16px; }
    .container { width: 100%; max-width: 460px; background: var(--card); border-radius: var(--radius); box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(0, 0, 0, 0.04); padding: 28px 24px; position: relative; overflow: hidden; }
    .container::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #4285f4 0%, #ea4335 25%, #fbbc05 50%, #34a853 75%, #4285f4 100%); }
    .badge-tag { display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px; margin-bottom: 16px; }
    .badge-tag span.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--google-green); display: inline-block; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.3); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.8; } }
    .header { text-align: center; margin-bottom: 20px; }
    .google-stars { display: flex; justify-content: center; gap: 4px; font-size: 24px; color: var(--google-yellow); margin-bottom: 8px; }
    h1 { font-size: 22px; font-weight: 800; color: var(--dark); line-height: 1.3; margin-bottom: 6px; }
    p.subtitle { font-size: 13.5px; color: var(--text-muted); line-height: 1.5; }

    .form-group { margin-bottom: 18px; text-align: left; position: relative; }
    label { display: block; font-size: 13px; font-weight: 700; color: var(--dark); margin-bottom: 8px; }
    input[type="text"] { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1.5px solid var(--border); font-size: 14px; color: var(--dark); background: #fcfdfe; transition: all 0.2s ease; outline: none; }
    input[type="text"]:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 4px var(--primary-light); }

    .auto-status {
      display: none;
      font-size: 12px;
      font-weight: 600;
      color: var(--primary);
      margin-top: 6px;
      align-items: center;
      gap: 6px;
    }
    .auto-status.active {
      display: flex;
    }

    .preview-box { display: none; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 14px; padding: 14px 16px; margin-bottom: 20px; text-align: left; }
    .preview-box.active { display: block; }
    .preview-badge { background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 100px; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 6px; }
    .preview-url { font-size: 12px; color: #166534; font-family: monospace; word-break: break-all; margin-bottom: 8px; }
    .btn-test { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--primary); text-decoration: none; padding: 6px 10px; border-radius: 8px; background: rgba(26, 115, 232, 0.08); }

    .btn-submit { width: 100%; padding: 16px; border-radius: 14px; border: none; background: var(--primary); color: #ffffff; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(26, 115, 232, 0.35); }
    .btn-submit:hover { background: var(--primary-hover); transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .warning-lock { margin-top: 14px; font-size: 11.5px; color: #94a3b8; text-align: center; display: flex; align-items: center; justify-content: center; gap: 5px; }

    .status-msg { display: none; padding: 12px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; text-align: center; }
    .status-msg.error { display: block; background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge-tag">
        <span class="dot"></span>
        ID KARTU: <span id="tagDisplay">{{TAG_ID}}</span>
      </div>
      <div class="google-stars">★★★★★</div>
      <h1>Aktivasi Stand Google Review</h1>
      <p class="subtitle">Paste link Google Maps toko Anda, sistem otomatis mengambil Place ID dan menguncinya ke form bintang 5.</p>
    </div>

    <div id="statusMsg" class="status-msg"></div>

    <form id="setupForm">
      <div class="form-group">
        <label for="mapsLinkInput">📍 Link Google Maps Toko / Place ID</label>
        <input type="text" id="mapsLinkInput" placeholder="Paste link maps.app.goo.gl/... atau Place ID" required autocomplete="off" />
        <div class="auto-status" id="autoStatus">
          <span>⏳</span> Mendeteksi Place ID & Nama Toko secara otomatis...
        </div>
      </div>

      <div class="form-group">
        <label for="businessName">🏬 Nama Toko / Bisnis (Otomatis)</label>
        <input type="text" id="businessName" placeholder="Akan terisi otomatis setelah paste link" required autocomplete="off" />
      </div>

      <div class="preview-box" id="previewBox">
        <span class="preview-badge">✓ Target Direct 5-Star Review Siap</span>
        <div class="preview-url" id="previewUrlText"></div>
        <a href="#" target="_blank" class="btn-test" id="btnTestLink">
          👀 Uji Coba Buka Pop-up Bintang 5 di Tab Baru
        </a>
      </div>

      <button type="submit" class="btn-submit" id="btnSubmit">
        🔒 Simpan & Kunci Kartu Ini
      </button>

      <div class="warning-lock">
        <span>⚠️</span> Kartu ini akan terkunci permanen untuk toko Anda.
      </div>
    </form>
  </div>

  <script>
    const TAG_ID = "{{TAG_ID}}";
    const setupForm = document.getElementById('setupForm');
    const mapsLinkInput = document.getElementById('mapsLinkInput');
    const nameInput = document.getElementById('businessName');
    const previewBox = document.getElementById('previewBox');
    const previewUrlText = document.getElementById('previewUrlText');
    const btnTestLink = document.getElementById('btnTestLink');
    const btnSubmit = document.getElementById('btnSubmit');
    const autoStatus = document.getElementById('autoStatus');
    const statusMsg = document.getElementById('statusMsg');

    let resolvedPlaceId = '';
    let finalDirectUrl = '';

    let resolveTimer = null;
    mapsLinkInput.addEventListener('input', () => {
      clearTimeout(resolveTimer);
      const raw = mapsLinkInput.value.trim();
      if (!raw) {
        previewBox.classList.remove('active');
        autoStatus.classList.remove('active');
        return;
      }

      const match = raw.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
      if (match) {
        resolvedPlaceId = match[0];
        finalDirectUrl = 'https://search.google.com/local/writereview?placeid=' + resolvedPlaceId;
        previewUrlText.textContent = finalDirectUrl;
        btnTestLink.href = finalDirectUrl;
        previewBox.classList.add('active');
        autoStatus.classList.remove('active');
        if (!nameInput.value.trim()) nameInput.value = 'Toko Anda';
        return;
      }

      if (raw.includes('maps.app.goo.gl') || raw.includes('goo.gl/maps') || raw.includes('google.com/maps')) {
        autoStatus.classList.add('active');
        resolveTimer = setTimeout(async () => {
          try {
            const res = await fetch('/api/resolve-maps', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: raw })
            });
            const data = await res.json();
            if (data.success && data.placeId) {
              resolvedPlaceId = data.placeId;
              if (data.businessName && !nameInput.value.trim()) {
                nameInput.value = data.businessName;
              }
              finalDirectUrl = 'https://search.google.com/local/writereview?placeid=' + data.placeId;
              previewUrlText.textContent = finalDirectUrl;
              btnTestLink.href = finalDirectUrl;
              previewBox.classList.add('active');
            }
          } catch (e) {
            console.warn('Auto resolve error:', e);
          } finally {
            autoStatus.classList.remove('active');
          }
        }, 300);
      }
    });

    setupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusMsg.className = 'status-msg';
      statusMsg.style.display = 'none';

      const name = nameInput.value.trim() || 'Toko Anda';
      const inputVal = mapsLinkInput.value.trim();

      if (!inputVal) {
        statusMsg.className = 'status-msg error';
        statusMsg.textContent = 'Mohon paste link Google Maps toko Anda.';
        mapsLinkInput.focus();
        return;
      }

      btnSubmit.disabled = true;
      btnSubmit.textContent = '⏳ Menyimpan & Mengunci...';

      try {
        const payload = {
          tagId: TAG_ID,
          businessName: name,
          reviewUrl: resolvedPlaceId || inputVal
        };

        const res = await fetch('/api/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          window.location.href = '/t/' + TAG_ID + '?activated=true';
        } else {
          statusMsg.className = 'status-msg error';
          statusMsg.textContent = data.error || 'Terjadi kesalahan saat mengunci kartu.';
          btnSubmit.disabled = false;
          btnSubmit.textContent = '🔒 Simpan & Kunci Kartu Ini';
        }
      } catch (err) {
        statusMsg.className = 'status-msg error';
        statusMsg.textContent = 'Gagal terhubung ke server: ' + err.message;
        btnSubmit.disabled = false;
        btnSubmit.textContent = '🔒 Simpan & Kunci Kartu Ini';
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
  <title>Batch QR & NFC Stand Generator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <style>
    :root {
      --primary: #1a73e8;
      --dark: #0f172a;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --google-yellow: #fbbc04;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background: #f8fafc; color: #334155; padding: 30px 20px; }
    .container { max-width: 1000px; margin: 0 auto; }
    .header-card { background: #fff; padding: 28px; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 24px; }
    h1 { font-size: 24px; font-weight: 800; color: var(--dark); margin-bottom: 6px; }
    p.subtitle { color: #64748b; font-size: 14px; margin-bottom: 20px; }
    .controls-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .form-group label { display: block; font-size: 12.5px; font-weight: 700; color: var(--dark); margin-bottom: 6px; }
    .form-group input, .form-group select { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border); font-size: 13.5px; outline: none; }
    .form-group input:focus { border-color: var(--primary); }
    .btn-bar { display: flex; gap: 12px; }
    .btn { padding: 12px 20px; border-radius: 10px; font-weight: 700; font-size: 13.5px; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: #1557b0; }
    .btn-secondary { background: #e2e8f0; color: var(--dark); }
    .btn-secondary:hover { background: #cbd5e1; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
    .stand-card { background: #fff; border: 2px solid #e2e8f0; border-radius: 18px; padding: 20px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03); position: relative; page-break-inside: avoid; }
    .stand-header { font-size: 13px; font-weight: 800; letter-spacing: 0.5px; color: #475569; margin-bottom: 4px; text-transform: uppercase; }
    .stand-stars { color: var(--google-yellow); font-size: 18px; margin-bottom: 12px; letter-spacing: 2px; }
    .qr-frame { background: #fff; display: inline-flex; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 12px; }
    .tag-badge { display: inline-block; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #475569; font-family: monospace; margin-bottom: 6px; }
    .nfc-hint { font-size: 11px; font-weight: 600; color: #64748b; display: flex; align-items: center; justify-content: center; gap: 4px; }
    @media print {
      body { background: #fff; padding: 0; }
      .header-card, .btn-bar { display: none !important; }
      .cards-grid { grid-template-columns: repeat(3, 1fr); gap: 15px; }
      .stand-card { border: 1px dashed #94a3b8; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-card">
      <h1>🖨️ Batch QR Code & NFC Generator</h1>
      <p class="subtitle">Generate Tag ID unik dan QR Code siap cetak untuk kartu/stand akrilik Google Review Anda.</p>
      <div class="controls-grid">
        <div class="form-group">
          <label>Mode Cetak</label>
          <select id="modeSelect" onchange="toggleMode()">
            <option value="single">🎯 1 QR Sama (Cetak Banyak untuk Meja/Cabang yang Sama)</option>
            <option value="batch">🔢 ID Berurutan (Tiap Stiker Beda ID untuk Klien Berbeda)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Domain / URL Worker Anda</label>
          <input type="text" id="domainInput" value="" placeholder="https://domain-anda.com" />
        </div>
        <div class="form-group" id="tagIdGroup">
          <label>ID Kartu / QR</label>
          <input type="text" id="singleTagId" value="REV-TOKO-01" placeholder="REV-TOKO-01" />
        </div>
        <div class="form-group" id="prefixGroup" style="display: none;">
          <label>Prefix ID Kartu</label>
          <input type="text" id="prefixInput" value="REV" placeholder="REV / CARD / STAND" />
        </div>
        <div class="form-group" id="startNumGroup" style="display: none;">
          <label>Nomor Mulai</label>
          <input type="number" id="startNum" value="101" min="1" />
        </div>
        <div class="form-group">
          <label>Jumlah Stiker Dicetak</label>
          <input type="number" id="qtyInput" value="10" min="1" max="100" />
        </div>
      </div>
      <div class="btn-bar">
        <button class="btn btn-primary" onclick="generateBatch()">⚡ Generate QR Codes</button>
        <button class="btn btn-secondary" onclick="window.print()">🖨️ Cetak / Print Lembar (A4)</button>
      </div>
    </div>
    <div class="cards-grid" id="cardsContainer"></div>
  </div>
  <script>
    function toggleMode() {
      const mode = document.getElementById('modeSelect').value;
      const isSingle = mode === 'single';
      document.getElementById('tagIdGroup').style.display = isSingle ? 'block' : 'none';
      document.getElementById('prefixGroup').style.display = isSingle ? 'none' : 'block';
      document.getElementById('startNumGroup').style.display = isSingle ? 'none' : 'block';
    }

    function generateBatch() {
      const container = document.getElementById('cardsContainer');
      container.innerHTML = '';
      let domain = document.getElementById('domainInput').value.trim() || window.location.origin;
      if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        domain = 'https://' + domain;
      }
      domain = domain.replace(/\\/+$/, '');

      const mode = document.getElementById('modeSelect').value;
      const qty = parseInt(document.getElementById('qtyInput').value, 10) || 1;

      for (let i = 0; i < qty; i++) {
        let tagId = '';
        if (mode === 'single') {
          tagId = document.getElementById('singleTagId').value.trim() || 'REV-TOKO-01';
        } else {
          const prefix = document.getElementById('prefixInput').value.trim() || 'REV';
          const start = parseInt(document.getElementById('startNum').value, 10) || 1;
          tagId = prefix + '-' + (start + i);
        }

        const targetUrl = domain + '/t/' + tagId;
        const card = document.createElement('div');
        card.className = 'stand-card';
        card.innerHTML = '<div class="stand-header">Ulas Kami di Google</div>' +
          '<div class="stand-stars">★★★★★</div>' +
          '<div class="qr-frame" id="qr-' + tagId + '-' + i + '"></div>' +
          '<div><div class="tag-badge">ID: ' + tagId + ' ' + (mode === 'single' ? '(Stiker #' + (i + 1) + ')' : '') + '</div>' +
          '<div class="nfc-hint">📲 Tap NFC atau Scan QR</div></div>';
        container.appendChild(card);

        new QRCode(document.getElementById('qr-' + tagId + '-' + i), {
          text: targetUrl,
          width: 140,
          height: 140,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      document.getElementById('domainInput').value = window.location.origin;
      generateBatch();
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

    // 2. Auto Resolve Google Maps URL: POST /api/resolve-maps
    if (path === '/api/resolve-maps' && request.method === 'POST') {
      try {
        const { url: rawMapsUrl } = await request.json();
        if (!rawMapsUrl) {
          return Response.json({ success: false, error: 'URL kosong' }, { status: 400 });
        }

        const cleanInput = rawMapsUrl.trim();
        const res = await fetch(cleanInput, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        const finalUrl = res.url;
        const text = await res.text();

        const placeIdMatch = text.match(/ChIJ[a-zA-Z0-9_-]{20,}/) || finalUrl.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
        const ftidMatch = finalUrl.match(/ftid=([0-9a-fx:]+)/i);

        let name = '';
        const titleMatch = text.match(/<title>([^<]+) - Google Maps<\/title>/i);
        if (titleMatch) {
          name = titleMatch[1].replace(/^[0-9A-Z+]+\s+/, '').trim();
        } else {
          const qMatch = finalUrl.match(/q=([^&]+)/);
          if (qMatch) {
            name = decodeURIComponent(qMatch[1].replace(/\+/g, ' ')).split(',')[0].replace(/^[0-9A-Z+]+\s+/, '').trim();
          }
        }

        let placeId = placeIdMatch ? placeIdMatch[0] : null;
        if (!placeId && ftidMatch) {
          placeId = ftidToPlaceId(ftidMatch[1]);
        }

        if (!placeId) {
          return Response.json({ success: false, error: 'Tidak dapat mendeteksi Place ID' }, { status: 404 });
        }

        return Response.json({
          success: true,
          placeId,
          businessName: name || 'Toko Anda',
          directReviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`
        });
      } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
      }
    }

    // 3. Tag Route: /t/:tagId
    if (path.startsWith('/t/')) {
      const rawTagId = path.substring(3);
      const tagId = sanitizeTagId(rawTagId);

      if (!tagId) {
        return new Response('Invalid Tag ID', { status: 400 });
      }

      // Check if tag is already configured in KV
      let tagData = null;
      if (env.REVIEW_TAGS) {
        try {
          tagData = await env.REVIEW_TAGS.get(tagId, { type: 'json' });
        } catch (e) {
          console.error('KV Read Error:', e);
        }
      }

      // Check if this is the confirmation screen right after activation
      const isJustActivated = url.searchParams.get('activated') === 'true';
      if (isJustActivated && tagData && tagData.isLocked) {
        const html = SUCCESS_HTML
          .replace(/{{TAG_ID}}/g, tagId)
          .replace(/{{BUSINESS_NAME}}/g, tagData.businessName || 'Bisnis Anda')
          .replace(/{{TARGET_URL}}/g, tagData.targetUrl);
        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
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
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
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

          await env.REVIEW_TAGS.put(tagId, JSON.stringify(tagRecord));
        }

        return Response.json({
          success: true,
          tagId,
          targetUrl: parsedUrl.url
        });
      } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
