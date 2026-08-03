import React from 'react';
import { Navigate } from 'react-router-dom';
import { isFeatureEnabled } from '../config/featureFlags';

/**
 * Blocks access to retired/legacy product surfaces when the flag is off.
 * Redirects to a Sleep-safe route instead of rendering clinical/commerce UX.
 */
function FeatureGate({ flag, children, redirectTo = '/dashboard', fallback = null }) {
  if (!isFeatureEnabled(flag)) {
    if (fallback) return fallback;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default FeatureGate;
