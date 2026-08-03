/**
 * Safely parse JSON from localStorage
 * Handles cases where the value might be null, undefined, or the string "undefined"
 * Automatically removes invalid values from localStorage
 */
export function safeParseJSON(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(key);
    // Check for invalid values
    if (!value || value === 'null' || value === 'undefined' || value === null) {
      // Remove invalid value if it exists
      if (value === 'null' || value === 'undefined') {
        localStorage.removeItem(key);
      }
      return defaultValue;
    }
    // Try to parse the value
    const parsed = JSON.parse(value);
    return parsed;
  } catch (error) {
    // If parsing fails, remove the invalid data
    console.error(`Error parsing JSON from localStorage key "${key}":`, error);
    localStorage.removeItem(key);
    return defaultValue;
  }
}

/**
 * Safely set JSON in localStorage
 * Only stores if the value is not null or undefined
 */
export function safeSetJSON(key, value) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting JSON in localStorage key "${key}":`, error);
  }
}
