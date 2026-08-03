const { resolveLocale } = require('../i18n/sleepMessages');

/**
 * Attaches req.locale ('en' | 'es') from ?lang=, X-Language, or Accept-Language.
 * Default: en
 */
function localeMiddleware(req, _res, next) {
  req.locale = resolveLocale(req);
  next();
}

module.exports = { localeMiddleware };
