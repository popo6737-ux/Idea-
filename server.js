const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// ── 미들웨어 ──────────────────────────────────────
app.use(express.json());
app.use(express.static(__dirname));

// 데이터 저장 디렉토리 초기화
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return []; }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// ── 얼리어답터 사전등록 ──────────────────────────
// POST /api/register
// body: { name, email, phone, rounds_per_month }
app.post('/api/register', (req, res) => {
  const { name, email, phone, rounds_per_month } = req.body;

  if (!name || !email) {
    return res.status(400).json({ ok: false, message: '이름과 이메일은 필수입니다.' });
  }

  const file = path.join(DATA_DIR, 'registrations.json');
  const list = readJSON(file);

  if (list.some(r => r.email === email)) {
    return res.status(409).json({ ok: false, message: '이미 등록된 이메일입니다.' });
  }

  const entry = {
    id: Date.now(),
    name,
    email,
    phone: phone || '',
    rounds_per_month: rounds_per_month || '',
    registered_at: new Date().toISOString(),
  };

  list.push(entry);
  writeJSON(file, list);

  res.json({ ok: true, message: `${name}님, 얼리어답터 등록이 완료되었습니다!`, count: list.length });
});

// GET /api/register/count — 현재 등록자 수 (공개)
app.get('/api/register/count', (req, res) => {
  const file = path.join(DATA_DIR, 'registrations.json');
  const list = readJSON(file);
  res.json({ count: list.length });
});

// ── 프로샵 제휴 문의 ─────────────────────────────
// POST /api/inquiry
// body: { company, name, email, phone, message }
app.post('/api/inquiry', (req, res) => {
  const { company, name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, message: '이름, 이메일, 문의 내용은 필수입니다.' });
  }

  const file = path.join(DATA_DIR, 'inquiries.json');
  const list = readJSON(file);

  const entry = {
    id: Date.now(),
    company: company || '',
    name,
    email,
    phone: phone || '',
    message,
    submitted_at: new Date().toISOString(),
  };

  list.push(entry);
  writeJSON(file, list);

  res.json({ ok: true, message: `${name}님의 문의가 접수되었습니다. 빠르게 연락드리겠습니다!` });
});

// ── SPA fallback ──────────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Po⁴ server running at http://localhost:${PORT}`);
});
