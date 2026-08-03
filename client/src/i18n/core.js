import { appMessages } from './messages';
import { translations as legacyTranslations } from '../translations';

/** Product default: English. Spanish available via language selector. */
export const defaultLanguage = 'en';
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'es', label: 'Español', short: 'ES' }
];

const COOKIE_NAME = 'siempresleep-language';
const LEGACY_COOKIE = 'unbiax-language';

export const getLanguageCookieName = () => COOKIE_NAME;
export const getLegacyLanguageCookieName = () => LEGACY_COOKIE;

const resolve = (dict, key) => {
  const parts = key.split('.');
  let value = dict;
  for (const part of parts) {
    if (value == null || typeof value !== 'object' || !(part in value)) {
      return undefined;
    }
    value = value[part];
  }
  return typeof value === 'string' ? value : undefined;
};

/**
 * Translate a dotted key. Looks up app messages first, then legacy Unbiax dictionary.
 * Supports {{var}} interpolation via optional vars object.
 */
export const t = (key, language = defaultLanguage, vars) => {
  const lang = language === 'es' ? 'es' : 'en';
  let value =
    resolve(appMessages[lang], key) ??
    resolve(appMessages.en, key) ??
    resolve(legacyTranslations[lang], key) ??
    resolve(legacyTranslations.en, key) ??
    key;

  if (vars && typeof value === 'string') {
    Object.entries(vars).forEach(([k, v]) => {
      value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    });
  }
  return value;
};
