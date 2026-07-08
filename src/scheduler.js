const cron = require('node-cron');
const config = require('./config');
const { checkTrip } = require('./checker');
const { getAllWatchedTrips } = require('./watchlist');

function buildCronExpression(minutes) {
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60;
    return `0 */${hours} * * *`;
  }
  return `*/${minutes} * * * *`;
}

function startScheduler() {
  const cronExpr = buildCronExpression(config.checkIntervalMinutes);
  console.log(`⏰ الجدولة مفعّلة: سيتم التحقق من الأسعار كل ${config.checkIntervalMinutes} دقيقة (cron: ${cronExpr})`);

  cron.schedule(cronExpr, async () => {
    console.log(`\n🔄 بدء دورة تحقق تلقائية: ${new Date().toISOString()}`);
    const trips = getAllWatchedTrips();

    for (const trip of trips) {
      if (trip.status !== 'running') continue;
      try {
        await checkTrip(trip);
      } catch (err) {
        console.error(`❌ خطأ أثناء فحص الرحلة (${trip.departDate}, ${trip.durationDays} أيام):`, err.message);
      }
    }
  });
}

module.exports = { startScheduler, buildCronExpression };
