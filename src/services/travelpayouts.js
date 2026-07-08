const axios = require('axios');
const config = require('../config');
const { convertUsdToDzd } = require('./currency');

const BASE_URL = 'https://api.travelpayouts.com/v1/prices/cheap';

function calculateReturnDate(departDate, durationDays) {
  const d = new Date(departDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + Number(durationDays));
  return d.toISOString().slice(0, 10);
}

function formatDDMM(dateStr) {
  const [, month, day] = dateStr.split('-');
  return `${day}${month}`;
}

function buildBookingLink({ origin, destination, departDate, returnDate }) {
  const departPart = formatDDMM(departDate);
  const returnPart = formatDDMM(returnDate);
  return `https://www.aviasales.com/search/${origin}${departPart}${destination}${returnPart}1`;
}

async function fetchCheapestByAirline({ departDate, durationDays }) {
  const returnDate = calculateReturnDate(departDate, durationDays);

  const res = await axios.get(BASE_URL, {
    params: {
      origin: config.route.origin,
      destination: config.route.destination,
      depart_date: departDate,
      return_date: returnDate,
      currency: config.baseCurrency,
      token: config.travelpayoutsToken,
    },
    timeout: 15000,
  });

  const payload = res.data;
  if (!payload || !payload.success) {
    throw new Error('استجابة غير صالحة من TravelPayouts');
  }

  const destinationData = payload.data?.[config.route.destination] || {};
  const candidates = Object.values(destinationData);

  const cheapestByAirline = {};
  for (const ticket of candidates) {
    const code = ticket.airline;
    if (!cheapestByAirline[code] || ticket.price < cheapestByAirline[code].price) {
      cheapestByAirline[code] = ticket;
    }
  }

  const bookingLink = buildBookingLink({
    origin: config.route.origin,
    destination: config.route.destination,
    departDate,
    returnDate,
  });

  const results = [];
  for (const [code, ticket] of Object.entries(cheapestByAirline)) {
    const priceDzd = await convertUsdToDzd(ticket.price);
    results.push({
      airlineCode: code,
      airlineName: config.allowedAirlines[code] || code,
      priceUsd: ticket.price,
      priceDzd,
      departureAt: ticket.departure_at,
      returnAt: ticket.return_at,
      flightNumber: ticket.flight_number,
      bookingLink,
    });
  }

  return {
    origin: config.route.origin,
    destination: config.route.destination,
    departDate,
    returnDate,
    durationDays,
    results,
  };
}

module.exports = { fetchCheapestByAirline, calculateReturnDate, buildBookingLink };
