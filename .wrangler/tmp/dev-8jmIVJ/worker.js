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
function parseAndNormalizeGoogleReviewUrl(input) {
  if (!input || typeof input !== "string") {
    return { valid: false, error: "URL atau Place ID tidak boleh kosong" };
  }
  const trimmed = input.trim();
  if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return {
      valid: true,
      url: `https://search.google.com/local/writereview?placeid=${trimmed}`,
      type: "place_id"
    };
  }
  if (trimmed.includes("search.google.com/local/writereview")) {
    try {
      const parsed = new URL(trimmed);
      return {
        valid: true,
        url: parsed.toString(),
        type: "direct_review"
      };
    } catch {
      return { valid: false, error: "Format URL Google Review tidak valid" };
    }
  }
  if (trimmed.includes("google.com/maps") || trimmed.includes("maps.google.com") || trimmed.includes("maps.app.goo.gl") || trimmed.includes("g.page")) {
    try {
      const parsed = new URL(trimmed);
      const placeId = parsed.searchParams.get("place_id") || parsed.searchParams.get("placeid");
      if (placeId) {
        return {
          valid: true,
          url: `https://search.google.com/local/writereview?placeid=${placeId}`,
          type: "place_id_extracted"
        };
      }
      return {
        valid: true,
        url: parsed.toString(),
        type: "maps_url"
      };
    } catch {
      return { valid: false, error: "Format URL Google Maps tidak valid" };
    }
  }
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    try {
      const parsed = new URL(trimmed);
      return {
        valid: true,
        url: parsed.toString(),
        type: "custom_url"
      };
    } catch {
      return { valid: false, error: "Format URL tidak valid" };
    }
  }
  return {
    valid: false,
    error: "Masukkan URL Google Maps / Review yang valid atau Place ID"
  };
}
__name(parseAndNormalizeGoogleReviewUrl, "parseAndNormalizeGoogleReviewUrl");

// src/worker.js
var SETUP_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Aktivasi Kartu Google Review</title>
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
      --dark: #1e293b;
      --text: #334155;
      --text-muted: #64748b;
      --bg: #f8fafc;
      --card: #ffffff;
      --border: #e2e8f0;
      --radius: 18px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      background: radial-gradient(120% 120% at 50% 0%, #ffffff 0%, #f1f5f9 100%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px 16px;
    }

    .container {
      width: 100%;
      max-width: 440px;
      background: var(--card);
      border-radius: var(--radius);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(0, 0, 0, 0.04);
      padding: 28px 24px;
      position: relative;
      overflow: hidden;
    }

    .container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #4285f4 0%, #ea4335 25%, #fbbc05 50%, #34a853 75%, #4285f4 100%);
    }

    .badge-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f1f5f9;
      padding: 6px 12px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }

    .badge-tag span.dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--google-green);
      display: inline-block;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }

    .header {
      text-align: center;
      margin-bottom: 24px;
    }

    .google-stars {
      display: flex;
      justify-content: center;
      gap: 4px;
      font-size: 22px;
      color: var(--google-yellow);
      margin-bottom: 12px;
    }

    h1 {
      font-size: 22px;
      font-weight: 800;
      color: var(--dark);
      line-height: 1.3;
      margin-bottom: 8px;
    }

    p.subtitle {
      font-size: 13.5px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .form-group {
      margin-bottom: 18px;
      text-align: left;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 8px;
    }

    input[type="text"] {
      width: 100%;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1.5px solid var(--border);
      font-size: 14px;
      color: var(--dark);
      background: #fcfdfe;
      transition: all 0.2s ease;
      outline: none;
    }

    input[type="text"]:focus {
      border-color: var(--primary);
      background: #fff;
      box-shadow: 0 0 0 4px var(--primary-light);
    }

    .helper-card {
      background: #f8fafc;
      border: 1px dashed var(--border);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 20px;
      font-size: 12.5px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .helper-card b {
      color: var(--dark);
    }

    .helper-steps {
      margin-top: 8px;
      padding-left: 18px;
    }

    .helper-steps li {
      margin-bottom: 4px;
    }

    .preview-box {
      display: none;
      background: #f0fdf4;
      border: 1.5px solid #bbf7d0;
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 20px;
      text-align: left;
    }

    .preview-box.active {
      display: block;
    }

    .preview-title {
      font-size: 12px;
      font-weight: 700;
      color: #166534;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .preview-url {
      font-size: 12px;
      color: #15803d;
      word-break: break-all;
      line-height: 1.4;
    }

    .btn-test {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      font-size: 12px;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
      padding: 4px 8px;
      border-radius: 6px;
      background: rgba(26, 115, 232, 0.08);
      cursor: pointer;
    }

    .btn-submit {
      width: 100%;
      padding: 16px;
      border-radius: 14px;
      border: none;
      background: var(--primary);
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(26, 115, 232, 0.35);
    }

    .btn-submit:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    .warning-lock {
      margin-top: 14px;
      font-size: 11.5px;
      color: #94a3b8;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
    }

    .modal-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .modal-box {
      background: #fff;
      width: 100%;
      max-width: 380px;
      border-radius: 20px;
      padding: 24px;
      text-align: center;
      transform: scale(0.95);
      transition: transform 0.2s ease;
    }

    .modal-overlay.open .modal-box {
      transform: scale(1);
    }

    .modal-icon {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #fef2f2;
      color: var(--google-red);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 14px;
    }

    .modal-box h3 {
      font-size: 18px;
      font-weight: 800;
      color: var(--dark);
      margin-bottom: 8px;
    }

    .modal-box p {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
    }

    .btn-cancel {
      flex: 1;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: #fff;
      color: var(--text);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }

    .btn-confirm {
      flex: 1;
      padding: 12px;
      border-radius: 10px;
      border: none;
      background: var(--google-red);
      color: #fff;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge-tag">
        <span class="dot"></span>
        ID KARTU: <span id="tagDisplay">{{TAG_ID}}</span>
      </div>
      <div class="google-stars">\u2605\u2605\u2605\u2605\u2605</div>
      <h1>Aktivasi Kartu Google Review</h1>
      <p class="subtitle">Hubungkan kartu NFC / Stand QR ini dengan halaman Google Review bisnis Anda.</p>
    </div>

    <form id="setupForm">
      <div class="form-group">
        <label for="businessName">Nama Bisnis / Toko</label>
        <input type="text" id="businessName" placeholder="Contoh: Kopi Kenangan Senopati" required autocomplete="off" />
      </div>

      <div class="form-group">
        <label for="reviewUrl">Link Google Maps / Review / Place ID</label>
        <input type="text" id="reviewUrl" placeholder="https://maps.app.goo.gl/... atau Place ID" required autocomplete="off" />
      </div>

      <div class="helper-card">
        <b>\u{1F4A1} Cara Ambil Link Google Review:</b>
        <ol class="helper-steps">
          <li>Buka <b>Google Maps</b> dan cari lokasi bisnis Anda.</li>
          <li>Klik tombol <b>Bagikan (Share)</b> lalu pilih <b>Salin Link</b>.</li>
          <li>Atau buka <b>Google Profil Bisnis</b> Anda &rarr; klik <b>Minta Ulasan</b> &rarr; salin link.</li>
        </ol>
      </div>

      <div class="preview-box" id="previewBox">
        <div class="preview-title">
          <span>\u2713</span> Link Review Terverifikasi
        </div>
        <div class="preview-url" id="previewUrlText"></div>
        <a href="#" target="_blank" class="btn-test" id="btnTest">
          \u{1F517} Uji Coba Buka Link di Tab Baru
        </a>
      </div>

      <button type="button" class="btn-submit" id="btnOpenModal">
        \u{1F512} Simpan & Kunci Kartu Ini
      </button>

      <div class="warning-lock">
        <span>\u26A0\uFE0F</span> Pengaturan ini permanen & terkunci otomatis setelah disimpan.
      </div>
    </form>
  </div>

  <div class="modal-overlay" id="confirmModal">
    <div class="modal-box">
      <div class="modal-icon">\u{1F512}</div>
      <h3>Kunci Kartu Permanen?</h3>
      <p>
        Setelah disimpan, kartu NFC ini akan <b>langsung terkunci secara permanen</b>.
        Setiap kali customer men-scan/tap kartu ini, mereka akan langsung diarahkan ke halaman review toko Anda.
      </p>
      <div class="modal-actions">
        <button class="btn-cancel" id="btnCancelModal">Batal</button>
        <button class="btn-confirm" id="btnConfirmLock">Ya, Kunci Sekarang</button>
      </div>
    </div>
  </div>

  <script>
    const TAG_ID = "{{TAG_ID}}";
    const nameInput = document.getElementById('businessName');
    const urlInput = document.getElementById('reviewUrl');
    const previewBox = document.getElementById('previewBox');
    const previewUrlText = document.getElementById('previewUrlText');
    const btnTest = document.getElementById('btnTest');
    const btnOpenModal = document.getElementById('btnOpenModal');
    const confirmModal = document.getElementById('confirmModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const btnConfirmLock = document.getElementById('btnConfirmLock');

    let normalizedUrl = '';

    function checkInputs() {
      const rawUrl = urlInput.value.trim();
      if (!rawUrl) {
        previewBox.classList.remove('active');
        normalizedUrl = '';
        return;
      }

      if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(rawUrl)) {
        normalizedUrl = 'https://search.google.com/local/writereview?placeid=' + rawUrl;
      } else if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        normalizedUrl = rawUrl;
      } else {
        normalizedUrl = 'https://www.google.com/search?q=' + encodeURIComponent(rawUrl) + '+reviews';
      }

      previewUrlText.textContent = normalizedUrl;
      btnTest.href = normalizedUrl;
      previewBox.classList.add('active');
    }

    urlInput.addEventListener('input', checkInputs);

    btnOpenModal.addEventListener('click', () => {
      if (!nameInput.value.trim()) {
        alert('Mohon isi nama bisnis / toko Anda terlebih dahulu.');
        nameInput.focus();
        return;
      }
      if (!urlInput.value.trim()) {
        alert('Mohon masukkan Link Google Maps / Review atau Place ID toko Anda.');
        urlInput.focus();
        return;
      }
      confirmModal.classList.add('open');
    });

    btnCancelModal.addEventListener('click', () => {
      confirmModal.classList.remove('open');
    });

    btnConfirmLock.addEventListener('click', async () => {
      btnConfirmLock.disabled = true;
      btnConfirmLock.textContent = 'Menyimpan...';

      try {
        const payload = {
          tagId: TAG_ID,
          businessName: nameInput.value.trim(),
          reviewUrl: urlInput.value.trim()
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
          alert(data.error || 'Terjadi kesalahan saat mengunci kartu.');
          btnConfirmLock.disabled = false;
          btnConfirmLock.textContent = 'Ya, Kunci Sekarang';
          confirmModal.classList.remove('open');
        }
      } catch (err) {
        alert('Gagal terhubung ke server: ' + err.message);
        btnConfirmLock.disabled = false;
        btnConfirmLock.textContent = 'Ya, Kunci Sekarang';
      }
    });
  <\/script>
</body>
</html>`;
var SUCCESS_HTML = `<!DOCTYPE html>
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

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    body {
      background: radial-gradient(120% 120% at 50% 0%, #ffffff 0%, #f0fdf4 100%);
      color: #334155;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px 16px;
      text-align: center;
    }

    .container {
      width: 100%;
      max-width: 440px;
      background: #fff;
      border-radius: var(--radius);
      box-shadow: 0 20px 40px -15px rgba(22, 101, 52, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04);
      padding: 36px 24px;
    }

    .success-icon {
      width: 72px;
      height: 72px;
      background: #dcfce7;
      color: var(--google-green);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      margin-bottom: 20px;
      animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes popIn {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    h1 {
      font-size: 22px;
      font-weight: 800;
      color: var(--dark);
      margin-bottom: 8px;
    }

    p.desc {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .info-card {
      background: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      text-align: left;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .info-label {
      color: var(--text-muted);
    }

    .info-value {
      font-weight: 700;
      color: var(--dark);
      max-width: 60%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .btn-test-now {
      display: block;
      width: 100%;
      padding: 15px;
      background: var(--primary);
      color: #fff;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);
    }

    .notice {
      margin-top: 18px;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">\u2713</div>
    <h1>Kartu Berhasil Diaktifkan!</h1>
    <p class="desc">
      Kartu NFC & QR Review ini sekarang <b>terkunci permanen</b> untuk bisnis Anda.
    </p>

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
        <span class="info-value" style="color: #16a34a;">\u25CF Aktif & Terkunci</span>
      </div>
    </div>

    <a href="{{TARGET_URL}}" class="btn-test-now">
      \u{1F680} Buka Halaman Review Sekarang
    </a>

    <p class="notice">
      Mulai sekarang, setiap scan atau tap NFC oleh pelanggan akan langsung membuka halaman Google Review toko Anda.
    </p>
  </div>
</body>
</html>`;
var GENERATOR_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Batch QR & NFC Stand Generator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
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
      <h1>\u{1F5A8}\uFE0F Batch QR Code & NFC Generator</h1>
      <p class="subtitle">Generate Tag ID unik dan QR Code siap cetak untuk kartu/stand akrilik Google Review Anda.</p>
      <div class="controls-grid">
        <div class="form-group">
          <label>Mode Cetak</label>
          <select id="modeSelect" onchange="toggleMode()">
            <option value="single">\u{1F3AF} 1 QR Sama (Cetak Banyak untuk Meja/Cabang yang Sama)</option>
            <option value="batch">\u{1F522} ID Berurutan (Tiap Stiker Beda ID untuk Klien Berbeda)</option>
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
        <button class="btn btn-primary" onclick="generateBatch()">\u26A1 Generate QR Codes</button>
        <button class="btn btn-secondary" onclick="window.print()">\u{1F5A8}\uFE0F Cetak / Print Lembar (A4)</button>
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
          '<div class="stand-stars">\u2605\u2605\u2605\u2605\u2605</div>' +
          '<div class="qr-frame" id="qr-' + tagId + '-' + i + '"></div>' +
          '<div><div class="tag-badge">ID: ' + tagId + ' ' + (mode === 'single' ? '(Stiker #' + (i + 1) + ')' : '') + '</div>' +
          '<div class="nfc-hint">\u{1F4F2} Tap NFC atau Scan QR</div></div>';
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
      const isJustActivated = url.searchParams.get("activated") === "true";
      if (isJustActivated && tagData && tagData.isLocked) {
        const html = SUCCESS_HTML.replace(/{{TAG_ID}}/g, tagId).replace(/{{BUSINESS_NAME}}/g, tagData.businessName || "Bisnis Anda").replace(/{{TARGET_URL}}/g, tagData.targetUrl);
        return new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
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
        headers: { "Content-Type": "text/html; charset=utf-8" }
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
        const parsedUrl = parseAndNormalizeGoogleReviewUrl(reviewUrl);
        if (!parsedUrl.valid) {
          return Response.json({ success: false, error: parsedUrl.error }, { status: 400 });
        }
        if (env.REVIEW_TAGS) {
          const existing = await env.REVIEW_TAGS.get(tagId, { type: "json" });
          if (existing && existing.isLocked) {
            return Response.json({
              success: false,
              error: "Kartu ini sudah pernah diaktifkan dan dikunci permanen."
            }, { status: 409 });
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
