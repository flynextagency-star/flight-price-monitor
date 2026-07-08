const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'trips.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf8');
  }
}

function loadAll() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('⚠️ خطأ في قراءة ملف البيانات، سيتم البدء بقاعدة بيانات فارغة:', err.message);
    return {};
  }
}

function saveAll(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getTripRecord(tripKey) {
  const all = loadAll();
  return all[tripKey] || null;
}

function saveTripRecord(tripKey, record) {
  const all = loadAll();
  all[tripKey] = record;
  saveAll(all);
}

module.exports = { getTripRecord, saveTripRecord };
