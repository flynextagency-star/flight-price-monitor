const axios = require('axios');
const config = require('../config');

function buildGoogleFlightsLink({ origin, destination, departDate, returnDate }) {
  return `https://www.google.com/travel/flights?q=Flights%20from%20${origin}%20to%20${destination}%20on%20${departDate}%20through%20${returnDate}`;
}

function formatMessage({ airlineName, origin, destination, departDate, returnDate, durationDays, oldPriceDzd, newPriceDzd, bookingLink }) {
  const saved = oldPriceDzd - newPriceDzd;
  const link = bookingLink || buildGoogleFlightsLink({ origin, destination, departDate, returnDate });

  return [
    `✈️ *تنبيه انخفاض سعر*`,
    ``,
    `*شركة الطيران:* ✈️ ${airlineName}`,
    `*المسار:* ${origin} → ${destination}`,
    `*الذهاب:* ${departDate}`,
    `*العودة:* ${returnDate}`,
    `*المدة:* ${durationDays} أيام`,
    ``,
    `*السعر السابق:* ${oldPriceDzd.toLocaleString()} DZD`,
    `*السعر الجديد:* ${newPriceDzd.toLocaleString()} DZD`,
    `*التوفير:* ${saved.toLocaleString()} DZD`,
    ``,
    `[فتح الرحلة](${link})`,
    ``,
    `_تم الإنشاء تلقائيًا_`,
    ``,
    `👥 *فريق Flynext.agency*`,
    `Walid Choukry | Yacob | Gaya`,
  ].join('\n');
}

async function sendPriceAlert(payload) {
  if (!config.telegramBotToken || !config.telegramChatId) {
    console.warn('⚠️ لم يتم ضبط TELEGRAM_BOT_TOKEN أو TELEGRAM_CHAT_ID، تم تخطي الإرسال.');
    return;
  }

  const text = formatMessage(payload);
  const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;

  await axios.post(url, {
    chat_id: config.telegramChatId,
    text,
    parse_mode: 'Markdown',
    disable_web_page_preview: false,
  });
}

module.exports = { sendPriceAlert, buildGoogleFlightsLink };
