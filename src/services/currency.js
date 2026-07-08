const axios = require('axios');
const config = require('../config');

let cachedRate = null;
let cachedAt = 0;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

async function getUsdToDzdRate() {
  const now = Date.now();
  if (cachedRate && now - cachedAt < CACHE_TTL_MS) {
    return cachedRate;
  }

  try {
    const res = await axios.get('https://api.exchangerate.host/convert', {
      params: { from: 'USD', to: 'DZD' },
      timeout: 8000,
    });
    const rate = res?.data?.result || res?.data?.info?.rate;
    if (rate && rate > 0) {
      cachedRate = rate;
      cachedAt = now;
      return rate;
    }
    throw new Error('لم يتم إرجاع سعر صرف صالح');
  } catch (err) {
    console.warn('⚠️ فشل جلب سعر الصرف الحي، سيتم استخدام السعر الاحتياطي:', err.message);
    return config.fallbackUsdToDzd;
  }
}

async function convertUsdToDzd(amountUsd) {
  const rate = await getUsdToDzdRate();
  return Math.round(amountUsd * rate);
}

module.exports = { getUsdToDzdRate, convertUsdToDzd };
