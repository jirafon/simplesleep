import React, { useEffect, useState } from 'react';
import { FaBell, FaDownload, FaRobot, FaSave, FaSyncAlt } from 'react-icons/fa';
import WellnessModuleLayout, { AiBadge, WellnessLoginPrompt } from '../../components/wellness/WellnessModuleLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/axios';

const FREQUENCIES = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'custom', label: 'Custom' }
];

const DEFAULT_REMINDER_RULES = [
  {
    id: 'drink_water',
    label: 'Drink water',
    vibrationCount: 3,
    time: '09:30',
    startTime: '09:30',
    endTime: '19:00',
    frequency: 'daily',
    frequencyMinutes: 120,
    enabled: true,
    aiRecommended: true,
    aiReason: 'Best in the morning to start hydration early.'
  },
  {
    id: 'meditate',
    label: 'Meditate',
    vibrationCount: 8,
    time: '21:30',
    startTime: '21:30',
    endTime: '22:30',
    frequency: 'daily',
    frequencyMinutes: 1440,
    enabled: true,
    aiRecommended: true,
    aiReason: 'Evening helps lower stress and prepare for sleep.'
  },
  {
    id: 'here_now_pause',
    label: 'Here-and-now pause',
    vibrationCount: 4,
    time: '15:30',
    startTime: '15:30',
    endTime: '18:30',
    frequency: 'weekdays',
    frequencyMinutes: 180,
    enabled: true,
    aiRecommended: true,
    aiReason: 'An afternoon break helps cut stress and regain focus.'
  }
];

const DEFAULT_EVENT_ALERTS = [
  {
    id: 'whatsapp_message',
    label: 'WhatsApp message',
    type: 'whatsapp',
    vibrationCount: 2,
    startTime: '09:00',
    endTime: '21:00',
    enabled: true,
    aiRecommended: true,
    aiReason: 'Event alert: notify when a message arrives within this window.'
  },
  {
    id: 'phone_call',
    label: 'Phone call',
    type: 'phone_call',
    vibrationCount: 3,
    startTime: '08:00',
    endTime: '22:00',
    enabled: true,
    aiRecommended: true,
    aiReason: 'Event alert: notify when a call arrives within this window.'
  },
  {
    id: 'panic_button',
    label: 'Help Button / Family Assistance',
    type: 'help_button',
    vibrationCount: 5,
    startTime: '00:00',
    endTime: '23:59',
    enabled: true,
    aiRecommended: true,
    aiReason: 'Request Help notifies authorized contacts. Does not contact 911.'
  }
];

const frequencyLabel = (value) => FREQUENCIES.find((item) => item.value === value)?.label || 'Every day';
const reminderFrequencySummary = (reminder) => (
  `${frequencyLabel(reminder.frequency)} · every ${reminder.frequencyMinutes || 60} minutes`
);
const cloneDefaultRules = () => DEFAULT_REMINDER_RULES.map((item) => ({ ...item }));
const cloneDefaultEventAlerts = () => DEFAULT_EVENT_ALERTS.map((item) => ({ ...item }));
const reminderStartTime = (reminder) => reminder.startTime || reminder.time || '09:00';
const reminderEndTime = (reminder) => reminder.endTime || reminderStartTime(reminder);
const DEFAULT_PANIC_ALERT_CONTACTS = { emails: ['', '', ''], whatsapp: '' };

const normalizePanicContacts = (contacts = {}) => {
  const nextEmails = Array.from({ length: 3 }, (_, index) => String(contacts?.emails?.[index] || '').trim());
  return {
    emails: nextEmails,
    whatsapp: String(contacts?.whatsapp || '').trim()
  };
};

const applyLoggedInUserContactDefaults = (contacts = {}, account = {}) => {
  const normalized = normalizePanicContacts(contacts);
  const emails = [...normalized.emails];
  const accountEmail = String(account.email || '').trim().toLowerCase();
  const accountPhone = String(account.phone || '').trim();

  if (!emails.some(Boolean) && accountEmail) {
    emails[0] = accountEmail;
  }

  return {
    emails,
    whatsapp: normalized.whatsapp || accountPhone
  };
};

const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value || '').trim());

const normalizeTimeInput = (value, fallback) => {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return fallback;
  const hour = Math.min(23, Math.max(0, Number.parseInt(match[1], 10)));
  const minute = Math.min(59, Math.max(0, Number.parseInt(match[2], 10)));
  if (Number.isNaN(hour) || Number.isNaN(minute)) return fallback;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

function RemindersPulsera() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingRules, setLoadingRules] = useState(false);
  const [reminders, setReminders] = useState(cloneDefaultRules);
  const [serverRules, setServerRules] = useState(cloneDefaultRules);
  const [eventAlerts, setEventAlerts] = useState(cloneDefaultEventAlerts);
  const [serverEventAlerts, setServerEventAlerts] = useState(cloneDefaultEventAlerts);
  const [panicAlertContacts, setPanicAlertContacts] = useState(DEFAULT_PANIC_ALERT_CONTACTS);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [message, setMessage] = useState('');

  const loadRules = async ({ showMessage = false } = {}) => {
    setLoadingRules(true);
    try {
      const { data } = await apiClient.get('/wellness/reminders');
      const rules = data.defaults?.length ? data.defaults : cloneDefaultRules();
      const saved = data.reminders?.length ? data.reminders : rules;
      const eventRules = data.eventDefaults?.length ? data.eventDefaults : cloneDefaultEventAlerts();
      const savedEventAlerts = data.eventAlerts?.length ? data.eventAlerts : eventRules;
      setServerRules(rules);
      setReminders(saved);
      setServerEventAlerts(eventRules);
      setEventAlerts(savedEventAlerts);
      setPanicAlertContacts(
        applyLoggedInUserContactDefaults(data.panicAlertContacts, {
          email: data.accountEmail || user?.email,
          phone: data.accountPhone || user?.phone
        })
      );
      setAiAvailable(Boolean(data.aiAvailable));
      if (showMessage) setMessage('Rules downloaded from the server.');
    } catch (error) {
      console.error('Error loading reminders:', error);
      const fallback = cloneDefaultRules();
      const eventFallback = cloneDefaultEventAlerts();
      setServerRules(fallback);
      setReminders((current) => (current.length ? current : fallback));
      setServerEventAlerts(eventFallback);
      setEventAlerts((current) => (current.length ? current : eventFallback));
      setPanicAlertContacts((current) => normalizePanicContacts(current));
      setMessage('Could not download rules from the server. Showing recommended local rules.');
    } finally {
      setLoadingRules(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    loadRules();
  }, [isAuthenticated]);

  const updateReminder = (id, patch) => {
    setReminders((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const updateEventAlert = (id, patch) => {
    setEventAlerts((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const applyRecommendedRules = () => {
    setReminders(serverRules.map((item) => ({ ...item })));
    setEventAlerts(serverEventAlerts.map((item) => ({ ...item })));
    setMessage('Recommended rules applied. You can adjust reminders and alert windows before saving.');
  };

  const downloadRules = () => {
    const payload = {
      name: 'siempresleep-reminder-rules',
      generatedAt: new Date().toISOString(),
      source: serverRules.length ? 'server-or-local-rules' : 'local-rules',
              rules: serverRules.length ? serverRules : cloneDefaultRules(),
              eventAlerts: serverEventAlerts.length ? serverEventAlerts : cloneDefaultEventAlerts()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'siempresleep-reminder-rules.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage('Rules file downloaded.');
  };

  const updatePanicAlertEmail = (index, value) => {
    setPanicAlertContacts((current) => {
      const nextEmails = [...(current.emails || ['', '', ''])];
      nextEmails[index] = value;
      return { ...current, emails: nextEmails };
    });
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payloadContacts = {
        emails: (panicAlertContacts.emails || []).map((email) => String(email || '').trim()).filter(Boolean),
        whatsapp: String(panicAlertContacts.whatsapp || '').trim()
      };

      const invalidEmail = payloadContacts.emails.find((email) => !isValidEmail(email));
      if (invalidEmail) {
        setMessage(`Invalid email: ${invalidEmail}`);
        return;
      }
      if (!payloadContacts.emails.length && !payloadContacts.whatsapp) {
        setMessage('Enter at least one email or WhatsApp number in alert contacts.');
        return;
      }

      const { data } = await apiClient.put('/wellness/reminders', { reminders, eventAlerts, panicAlertContacts: payloadContacts });
      setReminders(data.reminders || reminders);
      setEventAlerts(data.eventAlerts || eventAlerts);
      setPanicAlertContacts(
        applyLoggedInUserContactDefaults(data.panicAlertContacts || payloadContacts, {
          email: user?.email,
          phone: user?.phone
        })
      );
      setMessage('Reminders and alert contacts saved. They sync with the mobile app.');
    } catch (error) {
      console.error('Error saving reminders:', error);
      setMessage('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <WellnessModuleLayout title="Important reminders" loading />;
  if (!isAuthenticated) return <WellnessLoginPrompt />;

  return (
    <WellnessModuleLayout
      title="Important reminders"
      subtitle="Set schedule, frequency, and vibration pattern for the band."
      loading={loading}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaRobot className="text-violet-600" />
              <h2 className="font-semibold text-gray-900">Initial recommendation from rules/AI</h2>
            </div>
            <p className="text-sm text-gray-700">
              Default values for programmable habits with start/end time, minute frequency, and vibrations. WhatsApp and calls are configured as phone notifications.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <AiBadge aiUsed={false} aiAvailable={aiAvailable} />
            <button
              type="button"
              onClick={() => loadRules({ showMessage: true })}
              disabled={loadingRules}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-60"
            >
              <FaSyncAlt className={loadingRules ? 'animate-spin' : ''} />
              Download rules
            </button>
            <button
              type="button"
              onClick={applyRecommendedRules}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              <FaRobot />
              Apply recommended
            </button>
            <button
              type="button"
              onClick={downloadRules}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <FaDownload />
              Export JSON
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`rounded-2xl shadow-sm p-5 ${
                reminder.enabled
                  ? 'border border-emerald-300 bg-emerald-50'
                  : 'border border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      reminder.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    <FaBell />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{reminder.label}</h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          reminder.enabled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            reminder.enabled ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                        />
                        {reminder.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{reminder.aiReason}</p>
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(reminder.enabled)}
                    onChange={(event) => updateReminder(reminder.id, { enabled: event.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <label className="text-sm text-gray-700">
                  Start (HH:MM)
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="09:30"
                    value={reminderStartTime(reminder)}
                    onChange={(event) => updateReminder(reminder.id, { startTime: event.target.value, time: event.target.value })}
                    onBlur={(event) => {
                      const normalized = normalizeTimeInput(event.target.value, reminderStartTime(reminder));
                      updateReminder(reminder.id, { startTime: normalized, time: normalized });
                    }}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  End (HH:MM)
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="19:00"
                    value={reminderEndTime(reminder)}
                    onChange={(event) => updateReminder(reminder.id, { endTime: event.target.value })}
                    onBlur={(event) => {
                      const normalized = normalizeTimeInput(event.target.value, reminderEndTime(reminder));
                      updateReminder(reminder.id, { endTime: normalized });
                    }}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Frequency
                  <select
                    value={reminder.frequency}
                    onChange={(event) => updateReminder(reminder.id, { frequency: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  >
                    {FREQUENCIES.map((freq) => (
                      <option key={freq.value} value={freq.value}>{freq.label}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-gray-700">
                  Every N minutes
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    step="5"
                    value={reminder.frequencyMinutes || 60}
                    onChange={(event) => updateReminder(reminder.id, { frequencyMinutes: Number(event.target.value) })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Vibrations
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={reminder.vibrationCount}
                    onChange={(event) => updateReminder(reminder.id, { vibrationCount: Number(event.target.value) })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </label>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Summary: {reminderFrequencySummary(reminder)} between {reminderStartTime(reminder)} and {reminderEndTime(reminder)} · {reminder.vibrationCount} vibrations.
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Phone event alerts</h2>
          <p className="text-sm text-gray-700 mb-4">
            WhatsApp and calls have no frequency: they only notify when the event happens inside the time window.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {eventAlerts.filter((alert) => alert?.type !== 'panic_button' && alert?.type !== 'help_button').map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-blue-100 bg-white shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{alert.label}</h3>
                    <p className="text-xs text-gray-500">{alert.aiReason}</p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={Boolean(alert.enabled)}
                      onChange={(event) => updateEventAlert(alert.id, { enabled: event.target.checked })}
                    />
                    Active
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-sm text-gray-700">
                    Start
                    <input
                      type="time"
                      value={alert.startTime || '09:00'}
                      onChange={(event) => updateEventAlert(alert.id, { startTime: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    End
                    <input
                      type="time"
                      value={alert.endTime || '21:00'}
                      onChange={(event) => updateEventAlert(alert.id, { endTime: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    Vibrations
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={alert.vibrationCount || 1}
                      onChange={(event) => updateEventAlert(alert.id, { vibrationCount: Number(event.target.value) })}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </label>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Summary: event active between {alert.startTime || '09:00'} and {alert.endTime || '21:00'} · {alert.vibrationCount || 1} vibrations.
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Family Assistance contacts</h2>
          <p className="text-sm text-gray-700 mb-4">
            Define up to 3 emails and 1 WhatsApp for Assistance Request from the band linked to{' '}
            <strong>{user?.email || 'your account'}</strong>. You can also manage them in Connect. Not a medical emergency or 911.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm text-gray-700">
              Alert email #1
              <input
                type="email"
                value={panicAlertContacts.emails?.[0] || ''}
                onChange={(event) => updatePanicAlertEmail(0, event.target.value)}
                placeholder="family1@email.com"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 bg-white"
              />
            </label>
            <label className="text-sm text-gray-700">
              Alert email #2
              <input
                type="email"
                value={panicAlertContacts.emails?.[1] || ''}
                onChange={(event) => updatePanicAlertEmail(1, event.target.value)}
                placeholder="family2@email.com"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 bg-white"
              />
            </label>
            <label className="text-sm text-gray-700">
              Alert email #3
              <input
                type="email"
                value={panicAlertContacts.emails?.[2] || ''}
                onChange={(event) => updatePanicAlertEmail(2, event.target.value)}
                placeholder="family3@email.com"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 bg-white"
              />
            </label>
            <label className="text-sm text-gray-700">
              WhatsApp number
              <input
                type="text"
                inputMode="tel"
                value={panicAlertContacts.whatsapp || ''}
                onChange={(event) => setPanicAlertContacts((current) => ({ ...current, whatsapp: event.target.value }))}
                placeholder="+56912345678"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 bg-white"
              />
            </label>
          </div>
        </div>

        {message && (
          <div className="rounded-xl bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold"
          >
            {saving ? <FaSyncAlt className="animate-spin" /> : <FaSave />}
            Save settings
          </button>
        </div>
      </div>
    </WellnessModuleLayout>
  );
}

export default RemindersPulsera;
