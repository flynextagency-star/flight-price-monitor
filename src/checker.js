const config = require('./config');
const { fetchCheapestByAirline } = require('./services/travelpayouts');
const { getTripRecord, saveTripRecord } = require('./services/storage');
const { sendPriceAlert } = require('./services/telegram');

function buildTripKey({ departDate, durationDays, airlineCode }) {
  return `${config.route.origin}-${config.route.destination}-${durationDays}D-${departDate}-${airlineCode}`;
}

async function checkTrip({ departDate, durationDays, targetPriceDzd }) {
  const { results, returnDate } = await fetchCheapestByAirline({ departDate, durationDays });

  if (results.length === 0) {
    console.log(`ℹ️ لا توجد أسعار متاحة حاليًا لشركات الطيران المطلوبة (${departDate}, ${durationDays} أيام).`);
    return [];
  }

  const summary = [];

  for (const ticket of results) {
    const tripKey = buildTripKey({ departDate, durationDays, airlineCode: ticket.airlineCode });
    const previous = getTripRecord(tripKey);
    const now = new Date().toISOString();

    const record = {
      airlineCode: ticket.airlineCode,
      airlineName: ticket.airlineName,
      origin: config.route.origin,
      destination: config.route.destination,
      departDate,
      returnDate,
      durationDays,
      priceDzd: ticket.priceDzd,
      priceUsd: ticket.priceUsd,
      lastUpdated: now,
      previousPriceDzd: previous ? previous.priceDzd : null,
    };

    let alertReason = null;

    if (previous && ticket.priceDzd < previous.priceDzd) {
      alertReason = 'price_drop';
    } else if (targetPriceDzd && ticket.priceDzd < Number(targetPriceDzd)) {
      alertReason = 'target_reached';
    }

    if (alertReason) {
      await sendPriceAlert({
        airlineName: ticket.airlineName,
        origin: config.route.origin,
        destination: config.route.destination,
        departDate,
        returnDate,
        durationDays,
        oldPriceDzd: previous ? previous.priceDzd : ticket.priceDzd,
        newPriceDzd: ticket.priceDzd,
      });
      console.log(`🔔 تم إرسال إشعار (${alertReason}) لشركة ${ticket.airlineName}: ${ticket.priceDzd} DZD`);
    }

    saveTripRecord(tripKey, record);
    summary.push({ ...record, alertSent: !!alertReason });
  }

  return summary;
}

module.exports = { checkTrip, buildTripKey };
