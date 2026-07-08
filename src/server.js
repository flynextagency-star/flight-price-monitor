const path = require('path');
const express = require('express');
const config = require('./config');
const { checkTrip } = require('./checker');
const { startScheduler } = require('./scheduler');
const watchlist = require('./watchlist');

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    checkIntervalMinutes: config.checkIntervalMinutes,
    route: config.route,
  });
});

app.get('/api/trips', (req, res) => {
  res.json(watchlist.getAllWatchedTrips());
});

app.post('/api/trips', (req, res) => {
  const { departDate, durationDays, targetPriceDzd } = req.body;
  if (!departDate || !durationDays) {
    return res.status(400).json({ error: 'departDate و durationDays مطلوبان' });
  }
  const trip = watchlist.addTrip({ departDate, durationDays, targetPriceDzd });
  res.status(201).json(trip);
});

app.put('/api/trips/:id', (req, res) => {
  try {
    const updated = watchlist.updateTrip(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.delete('/api/trips/:id', (req, res) => {
  const deleted = watchlist.deleteTrip(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'الرحلة غير موجودة' });
  res.json({ success: true });
});

app.post('/api/trips/:id/pause', (req, res) => {
  try {
    res.json(watchlist.setStatus(req.params.id, 'paused'));
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.post('/api/trips/:id/resume', (req, res) => {
  try {
    res.json(watchlist.setStatus(req.params.id, 'running'));
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.post('/api/trips/:id/duplicate', (req, res) => {
  try {
    res.status(201).json(watchlist.duplicateTrip(req.params.id));
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.post('/api/trips/:id/check-now', async (req, res) => {
  const trip = watchlist.getAllWatchedTrips().find((t) => t.id === req.params.id);
  if (!trip) return res.status(404).json({ error: 'الرحلة غير موجودة' });
  try {
    const result = await checkTrip(trip);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`);
  console.log(`📍 المسار المراقَب: ${config.route.origin} → ${config.route.destination}`);
  startScheduler();
});
