/**
 * Locale helper for sleep API i18n
 * Run: node server/scripts/testSleepI18n.js
 */
const assert = require('assert');
const { t, resolveLocale, localizeCatalogItem, normalizeLocale } = require('../i18n/sleepMessages');
const { EXPERIMENT_CATALOG } = require('../services/sleepExperimentCatalog');

assert.strictEqual(normalizeLocale('es-CL'), 'es');
assert.strictEqual(normalizeLocale('en-US'), 'en');
assert.strictEqual(resolveLocale({ headers: { 'accept-language': 'es-CL,es;q=0.9' } }), 'es');
assert.strictEqual(resolveLocale({ query: { lang: 'es' }, headers: {} }), 'es');
assert.strictEqual(resolveLocale({ headers: {} }), 'en');

assert.ok(t('en', 'exp.no_caffeine_after_2pm.title').includes('caffeine'));
assert.ok(t('es', 'exp.no_caffeine_after_2pm.title').toLowerCase().includes('cafeína') || t('es', 'exp.no_caffeine_after_2pm.title').includes('cafeina') || t('es', 'exp.no_caffeine_after_2pm.title').includes('14'));

const enItem = localizeCatalogItem(EXPERIMENT_CATALOG[0], 'en');
const esItem = localizeCatalogItem(EXPERIMENT_CATALOG[0], 'es');
assert.notStrictEqual(enItem.title, esItem.title);

assert.ok(t('es', 'insight.caffeine_after_3_later_sleep.body', { minutes: 40 }).includes('40'));
assert.ok(t('en', 'rec.windDown', { time: '21:45' }).includes('21:45'));

console.log('✅ testSleepI18n.js passed');
