import React, { useEffect, useMemo, useRef, useState } from 'react';
import SleepLayout from '../../components/sleep/SleepLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/axios';
import { isFeatureEnabled } from '../../config/featureFlags';
import {
  HELP_BUTTON_DEFAULTS,
  HELP_BUTTON_LABELS,
  buildHelpActivationPayload
} from '../../utils/helpButton';
import { Link } from 'react-router-dom';
import { useT } from '../../i18n/useT';
import { useLanguage } from '../../context/LanguageContext';

const DEFAULT_CONTACTS = { emails: ['', '', ''], whatsapp: '' };

function ConnectPage() {
  const { isAuthenticated, user } = useAuth();
  const t = useT();
  const { language } = useLanguage();
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const [lastActivation, setLastActivation] = useState(null);
  const [locationShare, setLocationShare] = useState({
    mode: 'off',
    lastUpdatedAt: null,
    freshness: null,
    source: null,
    disconnected: false
  });
  const pressTimer = useRef(null);
  const countdownTimer = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !isFeatureEnabled('HELP_BUTTON')) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await apiClient.get('/wellness/reminders');
        if (cancelled) return;
        const raw = data?.panicAlertContacts || data?.helpContacts || {};
        setContacts({
          emails: [
            raw.emails?.[0] || user?.email || '',
            raw.emails?.[1] || '',
            raw.emails?.[2] || ''
          ],
          whatsapp: raw.whatsapp || ''
        });
      } catch {
        if (!cancelled) setError(t('app.connect.loadContactsError'));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.email, t]);

  useEffect(
    () => () => {
      clearTimeout(pressTimer.current);
      clearInterval(countdownTimer.current);
    },
    []
  );

  const helpEnabled = isFeatureEnabled('HELP_BUTTON');
  const locationEnabled = isFeatureEnabled('OPTIONAL_LOCATION');
  const healthConnectEnabled = isFeatureEnabled('HEALTH_CONNECT');

  const saveContacts = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payloadContacts = {
        emails: contacts.emails.map((e) => String(e || '').trim()).filter(Boolean).slice(0, 3),
        whatsapp: String(contacts.whatsapp || '').trim()
      };
      await apiClient.put('/wellness/reminders', {
        panicAlertContacts: payloadContacts,
        helpContacts: payloadContacts
      });
      setMessage(t('app.connect.contactsSaved'));
    } catch (err) {
      setError(err.response?.data?.message || t('app.connect.saveContactsError'));
    } finally {
      setSaving(false);
    }
  };

  const cancelCountdown = () => {
    clearInterval(countdownTimer.current);
    setCountdown(null);
    setMessage(t('app.connect.helpCancelled'));
  };

  const completeHelpRequest = async () => {
    clearInterval(countdownTimer.current);
    setCountdown(null);

    if (HELP_BUTTON_DEFAULTS.vibrateOnConfirm && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(HELP_BUTTON_DEFAULTS.vibratePatternMs);
    }

    const payload = buildHelpActivationPayload({
      source: 'web_connect',
      mode: testMode ? 'test' : 'live',
      confirmed: true,
      metadata: { ui: 'connect_long_press' }
    });

    setLastActivation(payload);

    if (testMode) {
      setMessage(t('app.connect.testModeMsg'));
      return;
    }

    try {
      await apiClient.post('/mobile/help', {
        email: user?.email,
        action: 'help_button',
        source: 'web_connect',
        triggerHelp: true,
        testMode: false
      });
      setMessage(t('app.connect.helpSent'));
    } catch (err) {
      try {
        await apiClient.post('/mobile/panic', {
          email: user?.email,
          source: 'web_connect_help',
          rawData: 'help_button'
        });
        setMessage(t('app.connect.helpCompat'));
      } catch (legacyErr) {
        setError(
          legacyErr.response?.data?.message ||
            err.response?.data?.message ||
            t('app.connect.helpError')
        );
      }
    }
  };

  const startCountdown = () => {
    let remaining = HELP_BUTTON_DEFAULTS.countdownSeconds;
    setCountdown(remaining);
    setMessage('');
    clearInterval(countdownTimer.current);
    countdownTimer.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        completeHelpRequest();
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  };

  const onHelpPressStart = () => {
    if (!helpEnabled || countdown != null) return;
    pressTimer.current = setTimeout(() => {
      startCountdown();
    }, HELP_BUTTON_DEFAULTS.longPressMs);
  };

  const onHelpPressEnd = () => {
    clearTimeout(pressTimer.current);
  };

  const locationStatusLabel = useMemo(() => {
    if (locationShare.mode === 'off') return t('app.connect.locationOff');
    if (locationShare.disconnected) return t('app.connect.locationDisconnected');
    if (locationShare.freshness === 'current') return t('app.connect.locationCurrent');
    return t('app.connect.locationLast');
  }, [locationShare, t]);

  if (!isAuthenticated) {
    return (
      <SleepLayout title={HELP_BUTTON_LABELS.section}>
        <Link to="/login" className="underline">
          {t('app.connect.signIn')}
        </Link>
      </SleepLayout>
    );
  }

  const locale = language === 'es' ? 'es-CL' : 'en-US';

  return (
    <SleepLayout title={t('app.connect.title')} subtitle={t('app.connect.subtitle')}>
      {healthConnectEnabled && (
        <section className="mb-10 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-white p-6">
          <h2 className="text-xl font-semibold mb-1">{t('app.connect.healthConnectTitle')}</h2>
          <p className="text-sm text-slate-600 mb-3">{t('app.connect.healthConnectBody')}</p>
          <ul className="text-sm text-slate-700 space-y-1 mb-3">
            <li>✓ {t('app.connect.hcSleep')}</li>
            <li>✓ {t('app.connect.hcSteps')}</li>
            <li>✓ {t('app.connect.hcHr')}</li>
          </ul>
          <p className="text-xs text-slate-500 mb-3">{t('app.connect.hcPrivacy')}</p>
          <p className="text-sm text-teal-900 font-medium">{t('app.connect.hcAndroid')}</p>
        </section>
      )}

      {helpEnabled && (
        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold mb-1">{HELP_BUTTON_LABELS.family}</h2>
          <p className="text-sm text-slate-600 mb-4">
            {HELP_BUTTON_LABELS.request}: {t('app.connect.helpDesc')}
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {contacts.emails.map((email, index) => (
              <label key={`email-${index}`} className="text-sm text-slate-700">
                {t('app.connect.authorizedEmail', { n: index + 1 })}
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={email}
                  onChange={(e) => {
                    const next = [...contacts.emails];
                    next[index] = e.target.value;
                    setContacts({ ...contacts, emails: next });
                  }}
                />
              </label>
            ))}
          </div>
          <label className="block text-sm text-slate-700 mb-4 max-w-sm">
            {t('app.connect.authorizedWhatsApp')}
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={contacts.whatsapp}
              onChange={(e) => setContacts({ ...contacts, whatsapp: e.target.value })}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              type="button"
              onClick={saveContacts}
              disabled={saving}
              className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {saving ? t('app.common.saving') : t('app.connect.saveContacts')}
            </button>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)} />
              {t('app.connect.testMode')}
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onMouseDown={onHelpPressStart}
              onMouseUp={onHelpPressEnd}
              onMouseLeave={onHelpPressEnd}
              onTouchStart={onHelpPressStart}
              onTouchEnd={onHelpPressEnd}
              className="select-none rounded-full bg-amber-600 hover:bg-amber-700 text-white px-6 py-4 font-semibold shadow-sm"
            >
              {t('app.connect.holdHelp', { label: HELP_BUTTON_LABELS.button })}
            </button>
            {countdown != null && (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold text-amber-700">{countdown}</span>
                <button type="button" onClick={cancelCountdown} className="text-sm underline text-slate-700">
                  {t('app.connect.cancel')}
                </button>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-500">{t('app.connect.warning911')}</p>
        </section>
      )}

      {locationEnabled && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold mb-1">{t('app.connect.locationTitle')}</h2>
          <p className="text-sm text-slate-600 mb-4">{t('app.connect.locationNote')}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { id: 'off', label: t('app.connect.modeOff') },
              { id: 'once', label: t('app.connect.modeOnce') },
              { id: 'temporary', label: t('app.connect.modeTemporary') },
              { id: 'permanent', label: t('app.connect.modePermanent') }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setLocationShare((s) => ({
                    ...s,
                    mode: opt.id,
                    lastUpdatedAt: opt.id === 'off' ? s.lastUpdatedAt : new Date().toISOString(),
                    freshness: opt.id === 'off' ? s.freshness : 'current',
                    source: opt.id === 'off' ? s.source : 'phone',
                    disconnected: false
                  }))
                }
                className={`px-3 py-2 rounded-lg text-sm border ${
                  locationShare.mode === opt.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">{t('app.connect.locationModes')}</dt>
              <dd className="font-medium">{locationStatusLabel}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Updated</dt>
              <dd className="font-medium">
                {locationShare.lastUpdatedAt
                  ? new Date(locationShare.lastUpdatedAt).toLocaleString(locale)
                  : '—'}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {lastActivation && (
        <pre className="mt-6 text-xs bg-slate-900 text-slate-100 rounded-xl p-4 overflow-auto">
          {JSON.stringify(lastActivation, null, 2)}
        </pre>
      )}

      {message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
    </SleepLayout>
  );
}

export default ConnectPage;
