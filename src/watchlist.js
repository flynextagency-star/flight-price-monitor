const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WATCHLIST_PATH = path.join(__dirname, '../data/watchlist.json');

function ensureFile() {
  const dir = path.dirname(WATCHLIST_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(WATCHLIST_PATH)) {
    fs.writeFileSync(WATCHLIST_PATH, JSON.stringify([], null, 2));
  }
}

function readWatchlist() {
  ensureFile();
  return JSON.parse(fs.readFileSync(WATCHLIST_PATH, 'utf-8'));
}

function writeWatchlist(list) {
  ensureFile();
  fs.writeFileSync(WATCHLIST_PATH, JSON.stringify(list, null, 2));
}

function getAllWatchedTrips() {
  return readWatchlist();
}

function addTrip({ departDate, durationDays, targetPriceDzd }) {
  const list = readWatchlist();
  const trip = {
    id: crypto.randomUUID(),
    departDate,
    durationDays: Number(durationDays),
    targetPriceDzd: targetPriceDzd ? Number(targetPriceDzd) : null,
    status: 'running',
    createdAt: new Date().toISOString(),
  };
  list.push(trip);
  writeWatchlist(list);
  return trip;
}

function updateTrip(id, updates) {
  const list = readWatchlist();
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('الرحلة غير موجودة');
  list[idx] = { ...list[idx], ...updates };
  writeWatchlist(list);
  return list[idx];
}

function deleteTrip(id) {
  const list = readWatchlist();
  const filtered = list.filter((t) => t.id !== id);
  writeWatchlist(filtered);
  return filtered.length !== list.length;
}

function setStatus(id, status) {
  return updateTrip(id, { status });
}

function duplicateTrip(id) {
  const list = readWatchlist();
  const original = list.find((t) => t.id === id);
  if (!original) throw new Error('الرحلة غير موجودة');
  const copy = { ...original, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  list.push(copy);
  writeWatchlist(list);
  return copy;
}

module.exports = {
  getAllWatchedTrips,
  addTrip,
  updateTrip,
  deleteTrip,
  setStatus,
  duplicateTrip,
};
