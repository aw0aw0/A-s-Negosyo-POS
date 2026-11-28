export const CURRENCY_CODES = ["PHP", "AED", "USD", "SGD", "EUR", "GBP", "SAR", "CAD", "AUD"];

const COUNTRY_CURRENCY = {
  PH: "PHP", AE: "AED", US: "USD", SG: "SGD", DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", IE: "EUR", NL: "EUR", BE: "EUR", AT: "EUR", PT: "EUR", FI: "EUR", GR: "EUR", GB: "GBP", SA: "SAR", CA: "CAD", AU: "AUD",
};
const TIMEZONE_COUNTRY = {
  "Asia/Manila": "PH", "Asia/Dubai": "AE", "Asia/Abu_Dhabi": "AE", "Asia/Singapore": "SG", "Asia/Riyadh": "SA",
  "Europe/London": "GB", "Europe/Berlin": "DE", "Europe/Paris": "FR", "Europe/Rome": "IT", "Europe/Madrid": "ES", "Europe/Dublin": "IE", "Europe/Amsterdam": "NL", "Europe/Brussels": "BE", "Europe/Vienna": "AT", "Europe/Lisbon": "PT", "Europe/Helsinki": "FI", "Europe/Athens": "GR",
  "America/Toronto": "CA", "America/Vancouver": "CA", "America/Edmonton": "CA", "America/Winnipeg": "CA", "America/Halifax": "CA", "America/St_Johns": "CA", "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Brisbane": "AU", "Australia/Perth": "AU", "Australia/Adelaide": "AU", "Australia/Darwin": "AU",
};
const CURRENCY_LOCALE = { PHP: "en-PH", AED: "en-AE", USD: "en-US", SGD: "en-SG", EUR: "de-DE", GBP: "en-GB", SAR: "en-SA", CAD: "en-CA", AUD: "en-AU" };

export function normalizeCurrency(code, fallback = "PHP") {
  const normalized = String(code || "").trim().toUpperCase();
  return CURRENCY_CODES.includes(normalized) ? normalized : fallback;
}

export function normalizeCountry(code, fallback = "PH") {
  const normalized = String(code || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : fallback;
}

export function currencyForCountry(countryCode) {
  return COUNTRY_CURRENCY[normalizeCountry(countryCode)] || "USD";
}

export function detectRegion() {
  let timeZone = "", localeCountry = "";
  try { timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { /* use browser locale */ }
  try {
    const locale = navigator.languages?.[0] || navigator.language || "";
    localeCountry = new Intl.Locale(locale).region || (locale.match(/[-_]([A-Za-z]{2})(?:$|[-_])/u)?.[1] || "").toUpperCase();
  } catch { /* older browsers may not expose Intl.Locale */ }
  const country_code = normalizeCountry(TIMEZONE_COUNTRY[timeZone] || localeCountry, "PH");
  return { country_code, currency_code: currencyForCountry(country_code) };
}

export function isInternationalRegion(countryCode, currencyCode) {
  return normalizeCountry(countryCode, "PH") !== "PH" || normalizeCurrency(currencyCode, "PHP") !== "PHP";
}

export function localeForCurrency(currencyCode) {
  return CURRENCY_LOCALE[normalizeCurrency(currencyCode)] || "en-US";
}

export function formatMoney(amount, currencyCode = "PHP") {
  const currency = normalizeCurrency(currencyCode);
  const numericAmount = Number(amount || 0);
  return new Intl.NumberFormat(localeForCurrency(currency), {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numericAmount) ? numericAmount : 0);
}
