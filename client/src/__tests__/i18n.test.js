/**
 * @jest-environment jsdom
 */
import { t, defaultLanguage } from '../i18n/core';

describe('SiempreSleep i18n', () => {
  test('defaults to English', () => {
    expect(defaultLanguage).toBe('en');
  });

  test('resolves English product strings', () => {
    expect(t('app.nav.today', 'en')).toBe('Today');
    expect(t('app.landing.createAccount', 'en')).toBe('Create account');
    expect(t('app.auth.loginTitle', 'en')).toBe('Sign in');
  });

  test('resolves Spanish product strings', () => {
    expect(t('app.nav.today', 'es')).toBe('Hoy');
    expect(t('app.landing.createAccount', 'es')).toBe('Crear cuenta');
    expect(t('app.auth.loginTitle', 'es')).toBe('Iniciar sesión');
  });

  test('supports interpolation', () => {
    expect(t('app.connect.authorizedEmail', 'en', { n: 2 })).toBe('Authorized email #2');
  });
});
