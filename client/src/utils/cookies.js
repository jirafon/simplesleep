/**
 * Cookie utilities to replace localStorage
 * Cookies work better in Render and other server environments
 */

/**
 * Set a cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration (default: 7)
 */
export function setCookie(name, value, days = 7) {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    const cookieValue = encodeURIComponent(value);
    document.cookie = `${name}=${cookieValue};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    return true;
  } catch (error) {
    console.error(`Error setting cookie "${name}":`, error);
    return false;
  }
}

/**
 * Get a cookie value
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export function getCookie(name) {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  } catch (error) {
    console.error(`Error getting cookie "${name}":`, error);
    return null;
  }
}

/**
 * Remove a cookie
 * @param {string} name - Cookie name
 */
export function removeCookie(name) {
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    return true;
  } catch (error) {
    console.error(`Error removing cookie "${name}":`, error);
    return false;
  }
}

/**
 * Safely parse JSON from cookie
 * @param {string} key - Cookie key
 * @param {any} defaultValue - Default value if cookie doesn't exist or is invalid
 * @returns {any} Parsed value or default
 */
export function safeParseJSONCookie(key, defaultValue = null) {
  try {
    const value = getCookie(key);
    if (!value || value === 'null' || value === 'undefined') {
      if (value === 'null' || value === 'undefined') {
        removeCookie(key);
      }
      return defaultValue;
    }
    const parsed = JSON.parse(value);
    return parsed;
  } catch (error) {
    console.error(`Error parsing JSON from cookie "${key}":`, error);
    removeCookie(key);
    return defaultValue;
  }
}

/**
 * Safely set JSON in cookie
 * @param {string} key - Cookie key
 * @param {any} value - Value to store
 * @param {number} days - Days until expiration (default: 7)
 */
export function safeSetJSONCookie(key, value, days = 7) {
  try {
    if (value === null || value === undefined) {
      removeCookie(key);
      return;
    }
    const jsonValue = JSON.stringify(value);
    setCookie(key, jsonValue, days);
  } catch (error) {
    console.error(`Error setting JSON in cookie "${key}":`, error);
  }
}
