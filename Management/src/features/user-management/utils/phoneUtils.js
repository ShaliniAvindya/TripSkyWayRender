/**
 * Phone Number Utility Functions
 * Handles international phone number validation and formatting
 * Uses E.164 format for API communication (e.g., +94768952480)
 */

import { parsePhoneNumber } from 'libphonenumber-js';

/**
 * List of supported countries with their codes
 */
export const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', callingCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', callingCode: '+44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', callingCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', callingCode: '+61' },
  { code: 'IN', name: 'India', flag: '🇮🇳', callingCode: '+91' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', callingCode: '+94' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', callingCode: '+92' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', callingCode: '+880' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', callingCode: '+977' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', callingCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', callingCode: '+33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', callingCode: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', callingCode: '+34' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', callingCode: '+31' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', callingCode: '+32' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', callingCode: '+41' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', callingCode: '+46' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', callingCode: '+47' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', callingCode: '+45' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', callingCode: '+358' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', callingCode: '+48' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', callingCode: '+420' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', callingCode: '+7' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', callingCode: '+81' },
  { code: 'CN', name: 'China', flag: '🇨🇳', callingCode: '+86' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', callingCode: '+65' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', callingCode: '+60' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', callingCode: '+66' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', callingCode: '+62' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', callingCode: '+63' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', callingCode: '+84' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', callingCode: '+82' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', callingCode: '+55' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', callingCode: '+52' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', callingCode: '+27' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', callingCode: '+971' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', callingCode: '+966' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', callingCode: '+64' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', callingCode: '+353' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', callingCode: '+43' },
];

/**
 * Validate phone number for given country
 * @param {string} phone - Phone number (can include country code or not)
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'LK')
 * @returns {boolean} True if valid
 */
export const validatePhone = (phone, countryCode) => {
  if (!phone || !countryCode) return false;

  try {
    const parsed = parsePhoneNumber(phone, countryCode);
    return parsed && parsed.isValid();
  } catch (err) {
    return false;
  }
};

/**
 * Format phone number to E.164 format for API
 * @param {string} phone - Phone number
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {Object|null} { e164: '+1234567890', countryCode: 'US' } or null if invalid
 */
export const formatPhoneToE164 = (phone, countryCode) => {
  if (!phone || !countryCode) return null;

  try {
    const parsed = parsePhoneNumber(phone, countryCode);
    if (!parsed || !parsed.isValid()) {
      return null;
    }

    return {
      e164: parsed.format('E.164'),
      countryCode: parsed.country,
      formatted: parsed.formatInternational(),
      national: parsed.formatNational(),
    };
  } catch (err) {
    return null;
  }
};

/**
 * Get country name by code
 * @param {string} countryCode - ISO country code
 * @returns {string} Country name
 */
export const getCountryName = (countryCode) => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country ? country.name : countryCode;
};

/**
 * Get country flag by code
 * @param {string} countryCode - ISO country code
 * @returns {string} Country flag emoji
 */
export const getCountryFlag = (countryCode) => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country ? country.flag : '🌍';
};

/**
 * Parse E.164 formatted phone to get country code
 * @param {string} e164 - E.164 formatted phone (e.g., '+94768952480')
 * @returns {Object|null} { countryCode: 'LK', phone: '768952480' } or null if invalid
 */
export const parseE164 = (e164) => {
  if (!e164) return null;

  try {
    const parsed = parsePhoneNumber(e164);
    if (!parsed || !parsed.isValid()) {
      return null;
    }

    return {
      countryCode: parsed.country,
      e164: parsed.format('E.164'),
      formatted: parsed.formatInternational(),
    };
  } catch (err) {
    return null;
  }
};

/**
 * Get phone input placeholder for country
 * @param {string} countryCode - ISO country code
 * @returns {string} Placeholder text
 */
export const getPhonePlaceholder = (countryCode) => {
  const examples = {
    US: '+1 (234) 567-8900',
    GB: '+44 20 7946 0958',
    CA: '+1 (416) 555-0123',
    AU: '+61 2 1234 5678',
    IN: '+91 98765 43210',
    LK: '+94 76 895 2480',
    PK: '+92 42 1234 5678',
    BD: '+880 1234 567890',
    NP: '+977 1 4123 456',
    DE: '+49 30 12345678',
    FR: '+33 1 42 68 53 00',
    IT: '+39 06 6982 0000',
    ES: '+34 91 123 4567',
    NL: '+31 20 123 4567',
    BE: '+32 2 123 4567',
    CH: '+41 44 123 4567',
    SE: '+46 8 123 4567',
    NO: '+47 23 12 3456',
    DK: '+45 33 12 3456',
    FI: '+358 9 123 4567',
    PL: '+48 12 123 4567',
    CZ: '+420 2 123 4567',
    RU: '+7 495 123 4567',
    JP: '+81 3 1234 5678',
    CN: '+86 10 1234 5678',
    SG: '+65 6123 4567',
    MY: '+60 3 1234 5678',
    TH: '+66 2 123 4567',
    ID: '+62 21 123 4567',
    PH: '+63 2 123 4567',
    VN: '+84 4 123 4567',
    KR: '+82 2 123 4567',
    BR: '+55 11 98765 4321',
    MX: '+52 55 1234 5678',
    ZA: '+27 11 123 4567',
    AE: '+971 4 123 4567',
    SA: '+966 11 123 4567',
    NZ: '+64 9 123 4567',
    IE: '+353 1 123 4567',
    AT: '+43 1 123 4567',
  };

  return examples[countryCode] || `+${countryCode} phone number`;
};

export default {
  validatePhone,
  formatPhoneToE164,
  getCountryName,
  getCountryFlag,
  parseE164,
  getPhonePlaceholder,
  COUNTRIES,
};
