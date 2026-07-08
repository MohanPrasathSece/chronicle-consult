export interface CountryConfig {
  code: string;
  name: string;
  prefix: string;
  placeholder: string;
  regex: RegExp;
  errorMessage: string;
}

export const countryConfigs: Record<string, CountryConfig> = {
  CY: {
    code: "CY",
    name: "Cyprus",
    prefix: "357",
    placeholder: "99 123456",
    regex: /^[97]\d{7}$/,
    errorMessage: "Cyprus number must be 8 digits (excluding leading zero).",
  },
  CH: {
    code: "CH",
    name: "Switzerland",
    prefix: "41",
    placeholder: "79 123 45 67",
    regex: /^[1-9]\d{8}$/,
    errorMessage: "Swiss number must be 9 digits (excluding leading zero).",
  },
  US: {
    code: "US",
    name: "United States",
    prefix: "1",
    placeholder: "201 555 0123",
    regex: /^[2-9]\d{9}$/,
    errorMessage: "US number must be 10 digits.",
  },
  GB: {
    code: "GB",
    name: "United Kingdom",
    prefix: "44",
    placeholder: "7700 900077",
    regex: /^7\d{9}$/,
    errorMessage: "UK mobile number must be 10 digits starting with 7.",
  },
  DE: {
    code: "DE",
    name: "Germany",
    prefix: "49",
    placeholder: "170 1234567",
    regex: /^[1-9]\d{9,11}$/,
    errorMessage: "German mobile number must be 10 to 12 digits.",
  },
  IN: {
    code: "IN",
    name: "India",
    prefix: "91",
    placeholder: "98765 43210",
    regex: /^[6-9]\d{9}$/,
    errorMessage: "Indian number must be 10 digits starting with 6-9.",
  },
  FR: {
    code: "FR",
    name: "France",
    prefix: "33",
    placeholder: "6 12 34 56 78",
    regex: /^[67]\d{8}$/,
    errorMessage: "French mobile number must be 9 digits starting with 6 or 7.",
  },
  BE: {
    code: "BE",
    name: "Belgium",
    prefix: "32",
    placeholder: "470 12 34 56",
    regex: /^[4-9]\d{8}$/,
    errorMessage: "Belgium mobile number must be 9 digits (excluding leading zero).",
  },
  IT: {
    code: "IT",
    name: "Italy",
    prefix: "39",
    placeholder: "312 345 6789",
    regex: /^3[1-9]\d{8}$/,
    errorMessage: "Italian mobile number must be 10 digits starting with 3.",
  },
  ES: {
    code: "ES",
    name: "Spain",
    prefix: "34",
    placeholder: "612 34 56 78",
    regex: /^[67]\d{8}$/,
    errorMessage: "Spanish mobile number must be 9 digits starting with 6 or 7.",
  },
  NL: {
    code: "NL",
    name: "Netherlands",
    prefix: "31",
    placeholder: "6 12345678",
    regex: /^6[1-9]\d{7}$/,
    errorMessage: "Dutch mobile number must be 9 digits starting with 6.",
  },
  AT: {
    code: "AT",
    name: "Austria",
    prefix: "43",
    placeholder: "664 1234567",
    regex: /^6[1-9]\d{8,9}$/,
    errorMessage: "Austrian mobile number must be 9 or 10 digits starting with 6.",
  },
  SE: {
    code: "SE",
    name: "Sweden",
    prefix: "46",
    placeholder: "70 123 45 67",
    regex: /^7[02369]\d{7}$/,
    errorMessage: "Swedish mobile number must be 9 digits starting with 7.",
  },
  GEN: {
    code: "GEN",
    name: "Other",
    prefix: "",
    placeholder: "+357 99 123456",
    regex: /^\+?[1-9]\d{6,14}$/,
    errorMessage: "Please enter a valid phone number with dial code (7 to 15 digits).",
  },
};

/**
 * Validates a phone number based on selected country.
 * If prefix is present in the number, it strips it for country-specific regex validation.
 */
export function validatePhoneNumber(phone: string, countryCode: string): string | null {
  const code = countryCode.toUpperCase();
  const config = countryConfigs[code] || countryConfigs.GEN;
  
  // Clean all formatting
  let cleaned = phone.replace(/[\s()-]/g, "");
  
  if (!cleaned) {
    return "Phone number is required.";
  }
  
  if (code === "GEN") {
    return config.regex.test(cleaned) ? null : config.errorMessage;
  }
  
  // Strip leading '+' if present
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }
  
  // Strip dial prefix if the user typed it
  if (config.prefix && cleaned.startsWith(config.prefix)) {
    cleaned = cleaned.substring(config.prefix.length);
  }
  
  // Remove leading zero if present and country excludes leading zero
  if (
    ["CY", "CH", "BE", "DE", "FR", "NL", "AT", "SE"].includes(code) &&
    cleaned.startsWith("0")
  ) {
    cleaned = cleaned.substring(1);
  }
  
  return config.regex.test(cleaned) ? null : config.errorMessage;
}

/**
 * Normalizes phone numbers to standard E.164-like format: +[prefix][number]
 */
export function formatFullPhoneNumber(phone: string, countryCode: string): string {
  const code = countryCode.toUpperCase();
  const config = countryConfigs[code] || countryConfigs.GEN;
  
  let cleaned = phone.replace(/[\s()-]/g, "");
  
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  
  if (code === "GEN") {
    // If no country code, prepend + if missing and has digits
    return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
  }
  
  // Strip dial prefix if they wrote it without a '+'
  if (config.prefix && cleaned.startsWith(config.prefix)) {
    return `+${cleaned}`;
  }
  
  // Remove leading zero
  if (
    ["CY", "CH", "BE", "DE", "FR", "NL", "AT", "SE"].includes(code) &&
    cleaned.startsWith("0")
  ) {
    cleaned = cleaned.substring(1);
  }
  
  return `+${config.prefix}${cleaned}`;
}

/**
 * Utility to map a country name to its 2-letter country code.
 */
export function mapCountryNameToCode(countryName: string): string {
  const name = countryName.trim().toLowerCase();
  for (const [code, config] of Object.entries(countryConfigs)) {
    if (config.name.toLowerCase() === name) {
      return code;
    }
  }
  return "GEN";
}
