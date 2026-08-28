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
    <p class="notice">Mulai sekarang, setiap scan atau tap NFC oleh pelanggan akan langsung membuka halaman Google Review toko Anda.</p>
  </div>
</body>
</html>`;

const DEFAULT_ADMIN_PASSWORD = 'codenginewlee';

function getAdminToken(adminPassword) {
  return btoa(`auth_session_${adminPassword}`);
}

function isUserAuthenticated(request, env) {
  const adminPassword = env?.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const expectedToken = getAdminToken(adminPassword);
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/admin_auth=([^;]+)/);
  return match && match[1] === expectedToken;
}

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Admin - QR & NFC Generator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1a73e8;
      --dark: #0f172a;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body {
      background: radial-gradient(120% 120% at 50% 0%, #ffffff 0%, #f1f5f9 100%);
      color: #334155;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 16px;
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      background: #ffffff;
      border-radius: 20px;
      padding: 36px 28px;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
      text-align: center;
      transition: transform 0.2s;
    }
    .lock-icon {
      width: 64px;
      height: 64px;
      background: #eff6ff;
      color: var(--primary);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 20px;
      border: 1px solid #bfdbfe;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: var(--dark);
      margin-bottom: 6px;
    }
    p.desc {
      font-size: 13.5px;
      color: #64748b;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .form-group {
      margin-bottom: 20px;
      text-align: left;
      position: relative;
    }
    label {
      display: block;
      font-size: 12.5px;
      font-weight: 700;
      margin-bottom: 6px;
      color: #334155;
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    input[type="password"], input[type="text"] {
      width: 100%;
      padding: 13px 44px 13px 14px;
      border: 1.5px solid var(--border);
      border-radius: 12px;
      font-size: 14px;
      color: var(--dark);
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus {
      border-color: var(--primary);
    }
    .btn-toggle-pw {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      color: #94a3b8;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-submit {
      width: 100%;
      padding: 14px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 14.5px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(26, 115, 232, 0.3);
      transition: all 0.2s;
    }
    .btn-submit:hover {
      background: #1557b0;
      transform: translateY(-1px);
    }
    .btn-submit:active {
      transform: translateY(0);
    }
    .error-msg {
      margin-top: 14px;
      padding: 10px 14px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      color: #dc2626;
      font-size: 12.5px;
      font-weight: 600;
      display: none;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }
    .shake {
      animation: shake 0.4s ease-in-out;
    }
  </style>
</head>
<body>
  <div class="login-card" id="loginCard">
    <div class="lock-icon">🔒</div>
    <h1>Akses Generator Admin</h1>
    <p class="desc">Masukkan kata sandi admin untuk membuka tool cetak QR Code & NFC.</p>

    <form id="loginForm">
      <div class="form-group">
        <label for="password">Kata Sandi Admin</label>
        <div class="input-wrapper">
          <input type="password" id="password" placeholder="Masukkan password..." required autofocus autocomplete="current-password" />
          <button type="button" class="btn-toggle-pw" id="togglePwBtn" onclick="togglePasswordVisibility()">👁️</button>
        </div>
      </div>
      <button type="submit" class="btn-submit" id="submitBtn">🔓 Buka Dashboard</button>
      <div class="error-msg" id="errorMsg"></div>
    </form>
  </div>

  <script>
    function togglePasswordVisibility() {
      const input = document.getElementById('password');
      const btn = document.getElementById('togglePwBtn');
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerText = '🙈';
      } else {
        input.type = 'password';
        btn.innerText = '👁️';
      }
    }

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw = document.getElementById('password').value;
      const btn = document.getElementById('submitBtn');
      const err = document.getElementById('errorMsg');
      const card = document.getElementById('loginCard');

      btn.disabled = true;
      btn.innerText = 'Memverifikasi...';
      err.style.display = 'none';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pw })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          btn.innerText = '✓ Berhasil Masuk!';
          window.location.reload();
        } else {
          err.innerText = data.error || 'Password salah. Silakan coba lagi.';
          err.style.display = 'block';
          card.classList.add('shake');
          setTimeout(() => card.classList.remove('shake'), 400);
          btn.disabled = false;
          btn.innerText = '🔓 Buka Dashboard';
          document.getElementById('password').select();
        }
      } catch (e) {
        err.innerText = 'Gagal terhubung ke server.';
        err.style.display = 'block';
        btn.disabled = false;
        btn.innerText = '🔓 Buka Dashboard';
      }
    });
  </script>
</body>
</html>`;

const GENERATOR_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Batch QR Code & Canva CSV Generator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <style>
    :root {
      --primary: #1a73e8;
      --dark: #0f172a;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --google-yellow: #fbbc04;
      --google-red: #ea4335;
      --google-green: #34a853;
      --google-blue: #4285f4;
      --success: #16a34a;
      --figma: #0d99ff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background: #f8fafc; color: #334155; padding: 30px 20px; }
    .container { max-width: 1100px; margin: 0 auto; }
    .header-card { background: #fff; padding: 28px; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 24px; }
    h1 { font-size: 24px; font-weight: 800; color: var(--dark); margin-bottom: 6px; }
    p.subtitle { color: #64748b; font-size: 14px; margin-bottom: 20px; }
    .controls-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .form-group label { display: block; font-size: 12.5px; font-weight: 700; color: var(--dark); margin-bottom: 6px; }
    .form-group input, .form-group select { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border); font-size: 13.5px; outline: none; }
    .form-group input:focus, .form-group select:focus { border-color: var(--primary); }
    .btn-bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .btn { padding: 12px 18px; border-radius: 10px; font-weight: 700; font-size: 13.5px; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: #1557b0; }
    .btn-success { background: #16a34a; color: #fff; }
    .btn-success:hover { background: #15803d; }
    .btn-figma { background: #0284c7; color: #fff; }
    .btn-figma:hover { background: #0369a1; }
    .btn-secondary { background: #e2e8f0; color: var(--dark); }
    .btn-secondary:hover { background: #cbd5e1; }
    .btn-reset { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; font-size: 12px; padding: 6px 12px; border-radius: 8px; cursor: pointer; }
    .btn-reset:hover { background: #fee2e2; }
    .btn-logout { background: #f8fafc; color: #64748b; border: 1px solid #cbd5e1; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s; }
    .btn-logout:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }
    
    /* Progress Bar Box */
    .progress-box { margin-top: 18px; padding: 14px 18px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .progress-info { font-size: 13px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; }
    .progress-bar-container { flex: 1; min-width: 180px; max-width: 320px; height: 10px; background: #e2e8f0; border-radius: 999px; overflow: hidden; margin: 0 16px; }
    .progress-bar-fill { height: 100%; background: #16a34a; width: 0%; transition: width 0.3s ease; }

    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
    .stand-card { background: #fff; border: 2px solid #e2e8f0; border-radius: 18px; padding: 20px 16px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03); position: relative; page-break-inside: avoid; transition: transform 0.15s, border-color 0.2s; display: flex; flex-direction: column; justify-content: space-between; }
    .stand-card.card-done { border-color: #86efac; background: #f0fdf4; }
    
    .stand-header { font-size: 15px; font-weight: 800; letter-spacing: 0.5px; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; }
    
    /* Google 4-Corner Accent Frame */
    .qr-wrapper { position: relative; display: inline-block; padding: 14px; margin: 0 auto 10px auto; }
    .corner { position: absolute; width: 22px; height: 22px; }
    .corner-tl { top: 0; left: 0; border-top: 4px solid var(--google-red); border-left: 4px solid var(--google-red); border-top-left-radius: 6px; }
    .corner-tr { top: 0; right: 0; border-top: 4px solid var(--google-yellow); border-right: 4px solid var(--google-yellow); border-top-right-radius: 6px; }
    .corner-bl { bottom: 0; left: 0; border-bottom: 4px solid var(--google-green); border-left: 4px solid var(--google-green); border-bottom-left-radius: 6px; }
    .corner-br { bottom: 0; right: 0; border-bottom: 4px solid var(--google-blue); border-right: 4px solid var(--google-blue); border-bottom-right-radius: 6px; }
    .qr-box { display: flex; align-items: center; justify-content: center; background: #fff; }

    .stand-stars { color: var(--google-yellow); font-size: 20px; margin-bottom: 6px; letter-spacing: 2px; }
    .nfc-text { font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 8px; letter-spacing: 1px; }
    .tag-badge { display: inline-block; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 700; color: #64748b; font-family: monospace; }
    .brand-footer { font-size: 10px; color: #94a3b8; margin-top: 6px; margin-bottom: 12px; }

    /* Card Action & Status Area */
    .card-actions { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e2e8f0; }
    .btn-copy-nfc { width: 100%; padding: 9px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; background: #eff6ff; color: #2563eb; border: 1.5px solid #bfdbfe; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
    .btn-copy-nfc:hover { background: #2563eb; color: #fff; }
    .btn-copy-nfc.copied { background: #16a34a; color: #fff; border-color: #16a34a; }
    
    .status-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; margin-top: 6px; cursor: pointer; user-select: none; }
    .status-badge.pending { color: #94a3b8; }
    .status-badge.done { color: #16a34a; }

    /* Hidden container for generating high-res export QR codes */
    #exportOffscreen { position: fixed; left: -9999px; top: -9999px; visibility: hidden; pointer-events: none; }

    /* Toast notification */
    #toast { position: fixed; bottom: 24px; right: 24px; background: #0f172a; color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; box-shadow: 0 10px 25px rgba(0,0,0,0.2); opacity: 0; transform: translateY(20px); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; pointer-events: none; }
    #toast.show { opacity: 1; transform: translateY(0); }

    @media print {
      body { background: #fff; padding: 0; }
      .header-card, .btn-bar, .card-actions, #toast, .progress-box, #exportOffscreen { display: none !important; }
      .cards-grid { grid-template-columns: repeat(3, 1fr); gap: 15px; }
      .stand-card { border: 1px dashed #94a3b8; box-shadow: none; background: #fff !important; }
      .brand-footer { margin-bottom: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
        <div>
          <h1>🖨️ Generator QR Code & Export Canva / Figma</h1>
          <p class="subtitle" style="margin-bottom: 0;">Generate stand akrilik Google Review, copy link untuk NFC, atau export ZIP untuk Figma & Canva.</p>
        </div>
        <button type="button" class="btn-logout" onclick="logoutAdmin()" title="Keluar dari sesi admin">🚪 Logout</button>
      </div>
      <div style="margin-bottom: 20px;"></div>
      
      <div class="controls-grid">
        <div class="form-group">
          <label>Mode Cetak</label>
          <select id="modeSelect" onchange="onInputChange()">
            <option value="single">🎯 1 QR Sama (Cetak Banyak untuk 1 Toko / Banyak Meja)</option>
            <option value="batch">🔢 ID Berurutan (Tiap Stiker Beda ID untuk Klien Berbeda)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Domain Server Worker Anda</label>
          <input type="text" id="domainInput" value="" placeholder="https://qr-review-business.vercel.app" oninput="onInputChange()" />
        </div>
        <div class="form-group" id="tagIdGroup">
          <label>ID Kartu / QR</label>
          <input type="text" id="singleTagId" value="REV-TOKO-01" placeholder="REV-TOKO-01" oninput="onInputChange()" />
        </div>
        <div class="form-group" id="prefixGroup" style="display: none;">
          <label>Prefix ID Kartu</label>
          <input type="text" id="prefixInput" value="REV" placeholder="REV / CARD / STAND" oninput="onInputChange()" />
        </div>
        <div class="form-group" id="startNumGroup" style="display: none;">
          <label>Nomor Mulai</label>
          <input type="number" id="startNum" value="101" min="1" oninput="onInputChange()" />
        </div>
        <div class="form-group">
          <label>Jumlah Stiker Dicetak / Diexport</label>
          <input type="number" id="qtyInput" value="10" min="1" max="500" oninput="onInputChange()" />
        </div>
      </div>
      
      <div class="btn-bar">
        <button class="btn btn-figma" id="btnExportFigma" onclick="exportZipForFigma()">📦 Export ZIP Semua QR (untuk Figma)</button>
        <button class="btn btn-success" onclick="downloadCsvForCanva()">📥 Download CSV Canva</button>
        <button class="btn btn-primary" onclick="generateBatch(true)">⚡ Refresh Preview</button>
        <button class="btn btn-secondary" onclick="window.print()">🖨️ Cetak Lembar A4</button>
      </div>

      <div class="progress-box" id="progressBox">
        <div class="progress-info">
          <span>🔥 Progress Burning NFC:</span>
          <span id="progressText" style="color: #16a34a;">0 / 10 Selesai</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" id="progressBarFill"></div>
        </div>
        <button class="btn-reset" onclick="resetDoneProgress()">🔄 Reset Checklist</button>
      </div>
    </div>
    
    <div class="cards-grid" id="cardsContainer"></div>
  </div>

  <div id="exportOffscreen"></div>
  <div id="toast">Link berhasil disalin!</div>

  <script>
    const STORAGE_KEY_FORM = 'qr_review_form_state';
    const STORAGE_KEY_DONE = 'qr_review_done_tags';

    function saveFormState() {
      const state = {
        mode: document.getElementById('modeSelect').value,
        domain: document.getElementById('domainInput').value,
        singleTagId: document.getElementById('singleTagId').value,
        prefix: document.getElementById('prefixInput').value,
        startNum: document.getElementById('startNum').value,
        qty: document.getElementById('qtyInput').value
      };
      localStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(state));
    }

    function loadFormState() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_FORM);
        if (saved) {
          const state = JSON.parse(saved);
          if (state.mode) document.getElementById('modeSelect').value = state.mode;
          if (state.domain) document.getElementById('domainInput').value = state.domain;
          if (state.singleTagId) document.getElementById('singleTagId').value = state.singleTagId;
          if (state.prefix) document.getElementById('prefixInput').value = state.prefix;
          if (state.startNum) document.getElementById('startNum').value = state.startNum;
          if (state.qty) document.getElementById('qtyInput').value = state.qty;
        }
      } catch (e) {}
    }

    function getDoneMap() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_DONE);
        return saved ? JSON.parse(saved) : {};
      } catch (e) {
        return {};
      }
    }

    function saveDoneMap(map) {
      localStorage.setItem(STORAGE_KEY_DONE, JSON.stringify(map));
    }

    function onInputChange() {
      toggleMode();
      saveFormState();
      generateBatch(false);
    }

    function toggleMode() {
      const mode = document.getElementById('modeSelect').value;
      const isSingle = mode === 'single';
      document.getElementById('tagIdGroup').style.display = isSingle ? 'block' : 'none';
      document.getElementById('prefixGroup').style.display = isSingle ? 'none' : 'block';
      document.getElementById('startNumGroup').style.display = isSingle ? 'none' : 'block';
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.classList.add('show');
      setTimeout(() => {
        t.classList.remove('show');
      }, 2500);
    }

    function copyNfcLink(tagId, targetUrl, cardIndex) {
      navigator.clipboard.writeText(targetUrl).then(() => {
        showToast('📋 Link ' + tagId + ' disalin! Siap di-write ke NFC.');
        toggleDoneStatus(tagId, true, cardIndex);
      }).catch(() => {
        const temp = document.createElement('input');
        temp.value = targetUrl;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        showToast('📋 Link ' + tagId + ' disalin!');
        toggleDoneStatus(tagId, true, cardIndex);
      });
    }

    function toggleDoneStatus(tagId, forceValue, cardIndex) {
      const doneMap = getDoneMap();
      const current = !!doneMap[tagId];
      const newVal = forceValue !== undefined ? forceValue : !current;
      doneMap[tagId] = newVal;
      saveDoneMap(doneMap);

      const card = document.getElementById('card-' + cardIndex);
      const btn = document.getElementById('btn-copy-' + cardIndex);
      const badge = document.getElementById('badge-' + cardIndex);

      if (card && btn && badge) {
        if (newVal) {
          card.classList.add('card-done');
          btn.classList.add('copied');
          btn.innerHTML = '✓ Link Tersalin';
          badge.className = 'status-badge done';
          badge.innerHTML = '● Siap / Selesai';
        } else {
          card.classList.remove('card-done');
          btn.classList.remove('copied');
          btn.innerHTML = '📋 Copy Link for NFC';
          badge.className = 'status-badge pending';
          badge.innerHTML = '○ Belum di-write';
        }
      }
      updateProgressBar();
    }

    function resetDoneProgress() {
      if (confirm('Reset status checklist untuk semua kartu?')) {
        saveDoneMap({});
        generateBatch(false);
        showToast('Checklist direset.');
      }
    }

    function updateProgressBar() {
      const doneMap = getDoneMap();
      const qty = parseInt(document.getElementById('qtyInput').value, 10) || 1;
      const mode = document.getElementById('modeSelect').value;
      let doneCount = 0;

      for (let i = 0; i < qty; i++) {
        let tagId = '';
        if (mode === 'single') {
          tagId = (document.getElementById('singleTagId').value.trim() || 'REV-TOKO-01') + '-' + (i + 1);
        } else {
          const prefix = document.getElementById('prefixInput').value.trim() || 'REV';
          const start = parseInt(document.getElementById('startNum').value, 10) || 1;
          tagId = prefix + '-' + (start + i);
        }
        if (doneMap[tagId]) doneCount++;
      }

      const percent = Math.min(100, Math.round((doneCount / qty) * 100));
      document.getElementById('progressText').innerText = doneCount + ' / ' + qty + ' Selesai (' + percent + '%)';
      document.getElementById('progressBarFill').style.width = percent + '%';
    }

    function generateBatch(showNotice) {
      saveFormState();
      const container = document.getElementById('cardsContainer');
      container.innerHTML = '';
      let domain = document.getElementById('domainInput').value.trim() || window.location.origin;
      if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        domain = 'https://' + domain;
      }
      domain = domain.replace(/\\/+$/, '');

      const mode = document.getElementById('modeSelect').value;
      const qty = parseInt(document.getElementById('qtyInput').value, 10) || 1;
      const doneMap = getDoneMap();

      for (let i = 0; i < qty; i++) {
        let tagId = '';
        let trackingKey = '';
        if (mode === 'single') {
          tagId = document.getElementById('singleTagId').value.trim() || 'REV-TOKO-01';
          trackingKey = tagId + '-' + (i + 1);
        } else {
          const prefix = document.getElementById('prefixInput').value.trim() || 'REV';
          const start = parseInt(document.getElementById('startNum').value, 10) || 1;
          tagId = prefix + '-' + (start + i);
          trackingKey = tagId;
        }

        const isDone = !!doneMap[trackingKey];
        const targetUrl = domain + '/t/' + tagId;
        const card = document.createElement('div');
        card.className = 'stand-card ' + (isDone ? 'card-done' : '');
        card.id = 'card-' + i;
        
        card.innerHTML = 
          '<div>' +
            '<div class="stand-header">REVIEW HERE</div>' +
            '<div class="qr-wrapper">' +
              '<div class="corner corner-tl"></div>' +
              '<div class="corner corner-tr"></div>' +
              '<div class="corner corner-bl"></div>' +
              '<div class="corner corner-br"></div>' +
              '<div class="qr-box" id="qr-' + tagId + '-' + i + '"></div>' +
            '</div>' +
            '<div class="stand-stars">★★★★★</div>' +
            '<div class="nfc-text">((((NFC))))</div>' +
            '<div class="tag-badge">ID: ' + tagId + ' ' + (mode === 'single' ? '(#' + (i + 1) + ')' : '') + '</div>' +
            '<div class="brand-footer">Powered by Codengine</div>' +
          '</div>' +
          '<div class="card-actions">' +
            '<button type="button" class="btn-copy-nfc ' + (isDone ? 'copied' : '') + '" id="btn-copy-' + i + '" onclick="copyNfcLink(\\'' + trackingKey + '\\', \\'' + targetUrl + '\\', ' + i + ')">' +
              (isDone ? '✓ Link Tersalin' : '📋 Copy Link for NFC') +
            '</button>' +
            '<div class="status-badge ' + (isDone ? 'done' : 'pending') + '" id="badge-' + i + '" onclick="toggleDoneStatus(\\'' + trackingKey + '\\', undefined, ' + i + ')" title="Klik untuk ubah status">' +
              (isDone ? '● Siap / Selesai' : '○ Belum di-write') +
            '</div>' +
          '</div>';

        container.appendChild(card);

        new QRCode(document.getElementById('qr-' + tagId + '-' + i), {
          text: targetUrl,
          width: 125,
          height: 125,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      }

      updateProgressBar();
      if (showNotice) showToast('QR Code berhasil di-generate!');
    }

    // Export ZIP of 500x500 pure clean QR PNGs for Figma
    async function exportZipForFigma() {
      const btn = document.getElementById('btnExportFigma');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '⏳ Menyiapkan ZIP...';
      showToast('📦 Sedang memproses gambar QR HD...');

      try {
        let domain = document.getElementById('domainInput').value.trim() || window.location.origin;
        if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
          domain = 'https://' + domain;
        }
        domain = domain.replace(/\\/+$/, '');

        const mode = document.getElementById('modeSelect').value;
        const qty = parseInt(document.getElementById('qtyInput').value, 10) || 1;
        const zip = new JSZip();
        const offscreen = document.getElementById('exportOffscreen');

        for (let i = 0; i < qty; i++) {
          let tagId = '';
          let fileName = '';
          if (mode === 'single') {
            tagId = document.getElementById('singleTagId').value.trim() || 'REV-TOKO-01';
            fileName = tagId + '_copy_' + (i + 1) + '.png';
          } else {
            const prefix = document.getElementById('prefixInput').value.trim() || 'REV';
            const start = parseInt(document.getElementById('startNum').value, 10) || 1;
            tagId = prefix + '-' + (start + i);
            fileName = tagId + '.png';
          }

          const targetUrl = domain + '/t/' + tagId;
          offscreen.innerHTML = '';
          const tempDiv = document.createElement('div');
          offscreen.appendChild(tempDiv);

          // Generate 500x500 HD QR
          new QRCode(tempDiv, {
            text: targetUrl,
            width: 500,
            height: 500,
            colorDark: '#0f172a',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
          });

          // Wait a tick for canvas rendering
          await new Promise(resolve => setTimeout(resolve, 30));

          const canvas = tempDiv.querySelector('canvas');
          let base64Data = '';
          if (canvas) {
            base64Data = canvas.toDataURL('image/png').split(',')[1];
          } else {
            const img = tempDiv.querySelector('img');
            if (img && img.src) {
              base64Data = img.src.split(',')[1];
            }
          }

          if (base64Data) {
            zip.file(fileName, base64Data, { base64: true });
          }
        }

        offscreen.innerHTML = '';
        btn.innerHTML = '📦 Mengemas ZIP...';

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', \`qr_figma_batch_\${mode}_\${qty}.zip\`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast('🎉 File ZIP berhasil diunduh! Siap drag ke Figma.');
      } catch (err) {
        alert('Gagal export ZIP: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }

    function downloadCsvForCanva() {
      let domain = document.getElementById('domainInput').value.trim() || window.location.origin;
      if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        domain = 'https://' + domain;
      }
      domain = domain.replace(/\\/+$/, '');

      const mode = document.getElementById('modeSelect').value;
      const qty = parseInt(document.getElementById('qtyInput').value, 10) || 1;

      let csvContent = 'Tag_ID,QR_Link,Label\\n';

      for (let i = 0; i < qty; i++) {
        let tagId = '';
        let label = '';
        if (mode === 'single') {
          tagId = document.getElementById('singleTagId').value.trim() || 'REV-TOKO-01';
          label = 'Copy #' + (i + 1);
        } else {
          const prefix = document.getElementById('prefixInput').value.trim() || 'REV';
          const start = parseInt(document.getElementById('startNum').value, 10) || 1;
          tagId = prefix + '-' + (start + i);
          label = 'Unit #' + (start + i);
        }
        const targetUrl = domain + '/t/' + tagId;
        csvContent += '"' + tagId + '","' + targetUrl + '","' + label + '"\\n';
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'canva_qr_batch_' + mode + '_' + qty + '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('File CSV berhasil diunduh!');
    }

    async function logoutAdmin() {
      if (confirm('Keluar dari sesi admin?')) {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.reload();
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      loadFormState();
      if (!document.getElementById('domainInput').value) {
        document.getElementById('domainInput').value = window.location.origin;
      }
      toggleMode();
      generateBatch(false);
    });
  </script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Auth API Routes
    if (path === '/api/auth/login' && request.method === 'POST') {
      try {
        const body = await request.json();
        const adminPassword = env?.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
        if (body.password === adminPassword) {
          const token = getAdminToken(adminPassword);
          const res = Response.json({ success: true });
          res.headers.set('Set-Cookie', `admin_auth=${token}; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly`);
          return res;
        }
        return Response.json({ success: false, error: 'Password admin salah!' }, { status: 401 });
      } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
      }
    }

    if (path === '/api/auth/logout') {
      const res = Response.json({ success: true });
      res.headers.set('Set-Cookie', 'admin_auth=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly');
      return res;
    }

    // 2. Root & Admin Tools Routing (Protected)
    if (path === '/' || path === '' || path === '/tools/generator' || path === '/tools/qr' || path === '/admin') {
      if (!isUserAuthenticated(request, env)) {
        return new Response(LOGIN_HTML, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
          }
        });
      }
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
