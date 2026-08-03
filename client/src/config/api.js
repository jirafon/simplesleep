/**
 * API Configuration
 * 
 * Two deployment scenarios:
 * 1. SAME DOMAIN: Backend serves frontend from server/public (REACT_APP_BASE_URL not set)
 *    - Frontend: https://siempresalud-server.onrender.com
 *    - Backend: https://siempresalud-server.onrender.com/api
 *    - Uses relative URLs
 * 
 * 2. SEPARATE SERVICES: Frontend and backend on different Render services
 *    - Frontend oficial: https://saludsimple.onrender.com
 *    - Backend: https://siempresalud-server.onrender.com
 *    - Requires REACT_APP_BASE_URL=https://siempresalud-server.onrender.com
 *    - Uses absolute URLs
 */

const getRenderFallbackUrl = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  const { hostname } = window.location;

  // Known production frontend domains for separated deployment
  if (hostname === 'saludsimple.onrender.com' || hostname === 'www.siempresalud.cl' || hostname === 'siempresalud.cl') {
    return 'https://siempresalud-server.onrender.com';
  }

  const renderFrontendMatch = hostname.match(/^(.*)-frontend\.onrender\.com$/);

  if (!renderFrontendMatch) {
    return '';
  }

  return `https://${renderFrontendMatch[1]}-server.onrender.com`;
};

const getApiBaseUrl = () => {
  // Check if REACT_APP_BASE_URL is explicitly set (for separate services)
  const explicitUrl = process.env.REACT_APP_BASE_URL;
  
  if (explicitUrl) {
    // Use the explicit URL (separate frontend/backend services)
    console.log('📍 API Mode: SEPARATE SERVICES');
    console.log('   REACT_APP_BASE_URL:', explicitUrl);
    console.log('   Using absolute URLs');
    
    // Validate URL format
    if (!explicitUrl.startsWith('http://') && !explicitUrl.startsWith('https://')) {
      console.error('⚠️ REACT_APP_BASE_URL must start with http:// or https://');
      console.error('   Current value:', explicitUrl);
    }
    
    if (explicitUrl.startsWith('http://') && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ WARNING: Using HTTP in production. Should use HTTPS.');
    }
    
    return explicitUrl;
  }
  
  const renderFallbackUrl = getRenderFallbackUrl();
  if (renderFallbackUrl) {
    console.warn('⚠️ REACT_APP_BASE_URL is not set on a Render frontend domain.');
    console.warn('   Falling back to inferred backend URL:', renderFallbackUrl);
    console.warn('   Set REACT_APP_BASE_URL explicitly to avoid relying on inference.');
    return renderFallbackUrl;
  }

  // No explicit URL - use relative URLs (same domain deployment)
  if (process.env.NODE_ENV === 'production') {
    console.log('📍 API Mode: SAME DOMAIN (production)');
    console.log('   Backend serves frontend from same domain');
    console.log('   Using relative URLs');
  } else {
    console.log('📍 API Mode: DEVELOPMENT (local)');
    console.log('   Using relative URLs (proxied)');
  }
  
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

// Log configuration on app load
console.log('\n🔧 ========== API CONFIGURATION ==========');
console.log('📍 Current URL:', typeof window !== 'undefined' ? window.location.href : 'server-side');
console.log('📍 NODE_ENV:', process.env.NODE_ENV);
console.log('📍 REACT_APP_BASE_URL:', process.env.REACT_APP_BASE_URL || 'NOT SET');
console.log('📍 Computed API_BASE_URL:', API_BASE_URL || '(relative paths)');
if (API_BASE_URL) {
  console.log('📍 Example API call: ' + API_BASE_URL + '/api/auth/login');
} else {
  console.log('📍 Example API call: /api/auth/login (relative)');
  if (typeof window !== 'undefined') {
    console.log('📍 Will resolve to: ' + window.location.origin + '/api/auth/login');
  }
}
console.log('=========================================\n');

/**
 * Get full API URL for an endpoint
 * @param {string} endpoint - API endpoint (e.g., '/api/auth/login')
 * @returns {string} Full URL
 */
export const getApiUrl = (endpoint) => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  if (API_BASE_URL) {
    // Remove trailing slash from base URL if present
    const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const fullUrl = `${cleanBase}${cleanEndpoint}`;
    console.log(`🔗 API Call: ${fullUrl}`);
    return fullUrl;
  }
  
  // Use relative URL
  console.log(`🔗 API Call (relative): ${cleanEndpoint}`);
  return cleanEndpoint;
};

export default API_BASE_URL;
