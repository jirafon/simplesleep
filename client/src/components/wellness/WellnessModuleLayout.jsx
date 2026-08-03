import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../sleep/SleepNavbar';
import { FaLeaf, FaBell, FaSpa, FaFemale, FaRobot, FaHeartbeat } from 'react-icons/fa';
import { isFeatureEnabled } from '../../config/featureFlags';

const MODULES = [
  {
    path: '/habits',
    label: 'Habits',
    description: 'Sueño, recuperación e hidratación',
    icon: FaLeaf,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200'
  },
  {
    path: '/wellness/recordatorios',
    label: 'Recordatorios',
    description: 'Vibraciones, horarios y frecuencia',
    icon: FaBell,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200'
  },
  ...(isFeatureEnabled('CYCLE_MENOPAUSE')
    ? [
        {
          path: '/wellness/ciclo-fertilidad',
          label: 'Ciclo y fertilidad',
          description: 'Periodo, ventana fértil y síntomas',
          icon: FaFemale,
          color: 'text-pink-600',
          bg: 'bg-pink-50 border-pink-200'
        },
        {
          path: '/wellness/menopausia',
          label: 'Perimenopausia / Menopausia',
          description: 'Bochornos, sueño, ánimo, fatiga y brain fog',
          icon: FaSpa,
          color: 'text-violet-600',
          bg: 'bg-violet-50 border-violet-200'
        }
      ]
    : [])
];

export const ScoreRing = ({ score, color = '#059669', size = 72 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = typeof score === 'number' ? Math.max(0, Math.min(100, Math.round(score))) : null;
  const offset = normalized === null ? circumference : circumference - (normalized / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth="7" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16" fontWeight="700" fill="#111827">
        {normalized === null ? '--' : normalized}
      </text>
    </svg>
  );
};

export const RecommendationList = ({ title, items = [], tone = 'bg-blue-50 border-blue-100' }) => (
  <div className={`rounded-xl border p-4 ${tone}`}>
    {title && <h4 className="text-sm font-semibold text-gray-800 mb-3">{title}</h4>}
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={`${title}-${index}`} className="text-sm text-gray-700 flex gap-2">
          <span className="text-blue-500 shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const BiometricMiniSummary = ({ biometrics }) => {
  if (!biometrics?.hasData) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        Sin datos biométricos recientes vinculados a tu email. Conecta la pulsera SiempreSalud para personalizar las recomendaciones.
      </div>
    );
  }

  const avg = biometrics.averages || {};
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: 'FC prom.', value: avg.heartRate ? `${avg.heartRate} bpm` : 'N/A' },
        { label: 'HRV prom.', value: avg.hrv ? `${avg.hrv} ms` : 'N/A' },
        { label: 'Estrés prom.', value: avg.stress ?? 'N/A' },
        { label: 'Pasos prom.', value: avg.steps ? Math.round(avg.steps) : 'N/A' },
        { label: 'Sueño prom.', value: avg.sleepMinutes ? `${Math.floor(avg.sleepMinutes / 60)}h ${avg.sleepMinutes % 60}m` : 'N/A' }
      ].map((item) => (
        <div key={item.label} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
          <p className="text-xs text-gray-500">{item.label}</p>
          <p className="text-lg font-semibold text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export const AiBadge = ({ aiUsed, aiAvailable }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border ${
    aiUsed ? 'bg-violet-100 text-violet-800 border-violet-200' : 'bg-gray-100 text-gray-700 border-gray-200'
  }`}>
    <FaRobot />
    {aiUsed ? 'Recomendaciones con IA' : aiAvailable ? 'Modo reglas (IA no respondió)' : 'Modo reglas (sin API IA)'}
  </span>
);

export const WellnessLoginPrompt = () => (
  <div className="min-h-screen bg-white text-gray-900">
    <Navbar />
    <main className="container mx-auto px-4 py-16 bg-white">
      <div className="max-w-md mx-auto bg-white border border-gray-100 shadow-lg rounded-2xl p-8 text-center">
        <FaHeartbeat className="text-red-500 text-4xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Salud personal</h1>
        <p className="text-gray-600 mb-6">Inicia sesión para ver tus hábitos, biométricos y recomendaciones.</p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium"
        >
          Iniciar sesión
        </Link>
      </div>
    </main>
  </div>
);

function WellnessModuleLayout({ title, subtitle, children, loading = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <FaHeartbeat className="text-red-500" />
              {title}
            </h1>
            {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {MODULES.map((module) => {
              const Icon = module.icon;
              const active = location.pathname === module.path;
              return (
                <Link
                  key={module.path}
                  to={module.path}
                  className={`rounded-xl border p-4 transition ${active ? `${module.bg} ring-2 ring-offset-1 ring-blue-300` : 'bg-white border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`text-xl ${module.color}`} />
                    <h2 className="font-semibold text-gray-900">{module.label}</h2>
                  </div>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </Link>
              );
            })}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
              <p className="text-gray-600">Cargando módulo...</p>
            </div>
          ) : (
            children
          )}

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => navigate('/wellness')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Volver al hub de salud personal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default WellnessModuleLayout;
