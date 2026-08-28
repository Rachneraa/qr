var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-iZzW1b/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-iZzW1b/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// src/utils/googleReview.js
function sanitizeTagId(rawId) {
  if (!rawId)
    return "";
  return rawId.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
}
__name(sanitizeTagId, "sanitizeTagId");
async function parseAndNormalizeGoogleReviewUrl(input, businessName = "") {
  if (!input || typeof input !== "string") {
    return { valid: false, error: "Place ID atau Link Google Review tidak boleh kosong" };
  }
  const trimmed = input.trim();
  const placeIdMatch = trimmed.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
  if (placeIdMatch) {
    const cleanPlaceId = placeIdMatch[0];
    return {
      valid: true,
      url: `https://search.google.com/local/writereview?placeid=${cleanPlaceId}`,
      type: "place_id"
    };
  }
  if (trimmed.includes("search.google.com/local/writereview")) {
    try {
      const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      return {
        valid: true,
        url: parsed.toString(),
        type: "direct_review"
      };
    } catch {
      return { valid: false, error: "Format URL Google Review tidak valid" };
    }
  }
  if (trimmed.includes("g.page/")) {
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const reviewUrl = url.endsWith("/review") ? url : `${url.replace(/\/+$/, "")}/review`;
    return {
      valid: true,
      url: reviewUrl,
      type: "gpage_review"
    };
  }
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return {
      valid: true,
      url: trimmed,
      type: "custom_url"
    };
  }
  return {
    valid: true,
    url: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(trimmed.split("\n")[0].trim())}`,
    type: "inferred_place_id"
  };
}
__name(parseAndNormalizeGoogleReviewUrl, "parseAndNormalizeGoogleReviewUrl");

// src/worker.js
var SETUP_HTML = `<!DOCTYPE html>
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
      <div class="stars">\u2605\u2605\u2605\u2605\u2605</div>
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
          <b>\u{1F4A1} Cara dapatkan Place ID Toko:</b><br>
          Ketik nama toko Anda di web resmi Google, lalu salin kodenya.<br>
          <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank">
            \u{1F50D} Buka Pencari Place ID Google (Gratis) &rarr;
          </a>
        </div>

        <button type="submit" id="submitBtn" class="btn-submit">
          \u{1F512} Simpan & Kunci Kartu Ini
        </button>
      </form>
    </div>

    <div id="successView">
      <div class="icon-success">\u2713</div>
      <h1 style="color: #16a34a; margin-bottom: 6px;">Kartu Berhasil Terkunci!</h1>
      <p class="desc">Stand review untuk <b id="resultName" style="color: #0f172a;"></b> sudah aktif.</p>

      <a href="#" id="resultLink" target="_blank" class="btn-review-link">
        \u{1F680} Buka Google Review Sekarang
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
          submitBtn.innerText = '\u{1F512} Simpan & Kunci Kartu Ini';
        }
      } catch (err) {
        alert('Gagal terhubung ke server: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = '\u{1F512} Simpan & Kunci Kartu Ini';
      }
    });
  <\/script>
</body>
</html>`;
var GENERATOR_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Batch QR Stand Generator - Google Style</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
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
      <h1>\u2B50 Batch QR Stand Generator (Google 4-Color Style)</h1>
      <p class="subtitle">Generate otomatis desain stand akrilik ulasan bintang 5 Google siap cetak / download.</p>

      <div class="grid-inputs">
        <div class="form-group">
          <label>Mode Cetak</label>
          <select id="modeSelect" onchange="handleModeChange()">
            <option value="single">\u{1F3AF} 1 QR Sama (Paket Meja Kafe / 1 Toko)</option>
            <option value="batch">\u{1F522} ID Berurutan (Stiker Beda ID untuk Klien Berbeda)</option>
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
        <button class="btn btn-primary" onclick="generateStands()">\u26A1 Generate Stand Preview</button>
        <button class="btn btn-secondary" onclick="window.print()">\u{1F5A8}\uFE0F Cetak Lembar A4 (Print)</button>
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

      var domain = document.getElementById('domainInput').value.trim().replace(//+$/, '');
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
        stars.textContent = '\u2605\u2605\u2605\u2605\u2605';
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
  <\/script>
</body>
</html>`;
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/" || path === "" || path === "/tools/generator" || path === "/tools/qr") {
      return new Response(GENERATOR_HTML, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }
    if (path === "/api/places/search") {
      const q = url.searchParams.get("q") || "";
      if (!q || q.length < 2) {
        return Response.json({ results: [] });
      }
      try {
        const searchUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6`;
        const res = await fetch(searchUrl, {
          headers: { "User-Agent": "QRReviewPlatform/1.0" }
        });
        const data = await res.json();
        const results = (data.features || []).map((f) => {
          const p = f.properties || {};
          const name = p.name || q;
          const parts = [p.street, p.district, p.city || p.county, p.state, p.country].filter(Boolean);
          const address = parts.join(", ");
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
    if (path.startsWith("/t/")) {
      const rawTagId = path.substring(3);
      const tagId = sanitizeTagId(rawTagId);
      if (!tagId) {
        return new Response("Invalid Tag ID", { status: 400 });
      }
      let tagData = null;
      if (env.REVIEW_TAGS) {
        try {
          tagData = await env.REVIEW_TAGS.get(tagId, { type: "json" });
        } catch (e) {
          console.error("KV Read Error:", e);
        }
      }
      if (!tagData) {
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookieMatch = cookieHeader.match(new RegExp(`tag_${tagId}=([^;]+)`));
        if (cookieMatch) {
          try {
            tagData = JSON.parse(decodeURIComponent(cookieMatch[1]));
          } catch (e) {
          }
        }
      }
      if (tagData && tagData.isLocked && tagData.targetUrl) {
        if (ctx && ctx.waitUntil && env.REVIEW_TAGS) {
          ctx.waitUntil(
            (async () => {
              try {
                tagData.totalTaps = (tagData.totalTaps || 0) + 1;
                tagData.lastTappedAt = (/* @__PURE__ */ new Date()).toISOString();
                await env.REVIEW_TAGS.put(tagId, JSON.stringify(tagData));
              } catch (err) {
                console.error("Tap count update error:", err);
              }
            })()
          );
        }
        return Response.redirect(tagData.targetUrl, 302);
      }
      const setupHtml = SETUP_HTML.replace(/{{TAG_ID}}/g, tagId);
      return new Response(setupHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
        }
      });
    }
    if (path === "/api/claim" && request.method === "POST") {
      try {
        const body = await request.json();
        const tagId = sanitizeTagId(body.tagId);
        const businessName = (body.businessName || "").trim();
        const reviewUrl = (body.reviewUrl || "").trim();
        if (!tagId) {
          return Response.json({ success: false, error: "Tag ID tidak valid" }, { status: 400 });
        }
        if (!businessName) {
          return Response.json({ success: false, error: "Nama bisnis wajib diisi" }, { status: 400 });
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
          claimedAt: (/* @__PURE__ */ new Date()).toISOString(),
          totalTaps: 0
        };
        if (env.REVIEW_TAGS) {
          const existing = await env.REVIEW_TAGS.get(tagId, { type: "json" });
          if (existing && existing.isLocked) {
            return Response.json({
              success: false,
              error: "Kartu ini sudah pernah diaktifkan dan dikunci permanen."
            }, { status: 409 });
          }
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
        res.headers.set("Set-Cookie", `tag_${tagId}=${cookieVal}; Path=/; Max-Age=315360000; SameSite=Lax`);
        return res;
      } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
      }
    }
    return new Response("Not Found", { status: 404 });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-iZzW1b/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-iZzW1b/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
