import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SleepLayout from '../../components/sleep/SleepLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/axios';
import { FaMoon, FaHeartbeat, FaWalking, FaBatteryFull, FaArrowRight } from 'react-icons/fa';

function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await apiClient.get('/wellness/biometrics/summary');
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) {
          setError('Aún no hay resumen biométrico. Vincula tu pulsera desde Device.');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <SleepLayout title="Dashboard" subtitle="Inicia sesión para ver tu día de sueño y recuperación.">
        <Link to="/login" className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl">
          Iniciar sesión <FaArrowRight />
        </Link>
      </SleepLayout>
    );
  }

  const sleep = summary?.sleep || summary?.biometrics?.sleep || {};
  const heartRate = summary?.heartRate ?? summary?.biometrics?.heartRate;
  const steps = summary?.steps ?? summary?.biometrics?.steps;
  const battery = summary?.battery ?? summary?.biometrics?.battery;

  return (
    <SleepLayout
      title="Today"
      subtitle="Resumen de sueño, recuperación y actividad básica. Sin alertas médicas ni seguimiento clínico."
    >
      {error && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <MetricCard icon={FaMoon} label="Sueño" value={formatSleep(sleep)} tone="bg-indigo-50 text-indigo-800" />
        <MetricCard icon={FaHeartbeat} label="Frecuencia cardíaca" value={heartRate != null ? `${heartRate} bpm` : '—'} tone="bg-rose-50 text-rose-800" />
        <MetricCard icon={FaWalking} label="Movimiento" value={steps != null ? `${steps} pasos` : '—'} tone="bg-emerald-50 text-emerald-800" />
        <MetricCard icon={FaBatteryFull} label="Batería / conexión" value={battery != null ? `${battery}%` : 'Ver Device'} tone="bg-slate-100 text-slate-800" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <QuickLink to="/sleep" title="Sleep History" description="Historial de noches y tendencias." />
        <QuickLink to="/habits" title="Habits" description="Hábitos de sueño y recuperación." />
        <QuickLink to="/connect" title="Connect" description="Contactos y solicitud de ayuda familiar." />
      </div>
    </SleepLayout>
  );
}

function formatSleep(sleep) {
  const minutes = sleep?.totalMinutes ?? sleep?.total ?? sleep?.durationMinutes;
  if (typeof minutes !== 'number' || !Number.isFinite(minutes)) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function MetricCard({ icon: Icon, label, value, tone }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 p-5 ${tone}`}>
      <div className="flex items-center gap-2 text-sm opacity-80 mb-2">
        <Icon />
        {label}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function QuickLink({ to, title, description }) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-400 transition"
    >
      <h2 className="font-semibold text-slate-900 mb-1">{title}</h2>
      <p className="text-sm text-slate-600">{description}</p>
    </Link>
  );
}

export default DashboardPage;
