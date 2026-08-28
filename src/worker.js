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
