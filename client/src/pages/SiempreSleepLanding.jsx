import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SleepNavbar from '../components/sleep/SleepNavbar';
import { useAuth } from '../context/AuthContext';
import { useT } from '../i18n/useT';
import { FaMoon, FaLeaf, FaUsers, FaClock } from 'react-icons/fa';

function SiempreSleepLanding() {
  const { token, loading } = useAuth();
  const navigate = useNavigate();
  const t = useT();

  useEffect(() => {
    if (!loading && token) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white">
      <SleepNavbar />
      <main className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(129,140,248,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.2), transparent 40%)'
          }}
        />
        <section className="relative max-w-5xl mx-auto px-4 pt-20 pb-24 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-indigo-200 mb-4">{t('app.landing.eyebrow')}</p>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight mb-5">
            {t('app.landing.titleLine1')}
            <br />
            {t('app.landing.titleLine2')}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">{t('app.landing.subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center rounded-xl bg-white text-slate-900 px-6 py-3 font-semibold hover:bg-indigo-50"
            >
              {t('app.landing.createAccount')}
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-xl border border-white/30 px-6 py-3 font-semibold hover:bg-white/10"
            >
              {t('app.landing.signIn')}
            </Link>
          </div>
        </section>

        <section className="relative max-w-5xl mx-auto px-4 pb-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Pillar icon={FaMoon} title={t('app.landing.pillarSleep')} text={t('app.landing.pillarSleepText')} />
          <Pillar icon={FaLeaf} title={t('app.landing.pillarHabits')} text={t('app.landing.pillarHabitsText')} />
          <Pillar icon={FaClock} title={t('app.landing.pillarDevice')} text={t('app.landing.pillarDeviceText')} />
          <Pillar icon={FaUsers} title={t('app.landing.pillarConnect')} text={t('app.landing.pillarConnectText')} />
        </section>
      </main>
    </div>
  );
}

function Pillar({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur">
      <Icon className="text-indigo-300 mb-3" />
      <h2 className="font-semibold mb-1">{title}</h2>
      <p className="text-sm text-slate-300">{text}</p>
    </div>
  );
}

export default SiempreSleepLanding;
