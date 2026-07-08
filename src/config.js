require('dotenv').config();

module.exports = {
  travelpayoutsToken: process.env.TRAVELPAYOUTS_TOKEN || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',

  route: {
    origin: 'ALG',
    destination: 'CAN',
  },

  allowedAirlines: {
    QR: 'Qatar Airways',
    TK: 'Turkish Airlines',
    MS: 'EgyptAir',
    AH: 'Air Algérie',
  },

  defaultDurations: [7, 10],

  baseCurrency: 'usd',
  targetCurrency: 'DZD',

  fallbackUsdToDzd: 135,

  checkIntervalMinutes: Number(process.env.CHECK_INTERVAL_MINUTES) || 60,

  storagePath: __dirname + '/../data/prices.json',
};
