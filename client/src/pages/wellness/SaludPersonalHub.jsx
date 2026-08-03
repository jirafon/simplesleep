import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/doctor911/Navbar';
import { WellnessLoginPrompt } from '../../components/wellness/WellnessModuleLayout';
import { useAuth } from '../../context/AuthContext';
import { FaHeartbeat, FaLeaf, FaBell, FaArrowRight, FaRobot } from 'react-icons/fa';

const MODULES = [
  {
    path: '/habits',
    title: 'Hábitos de sueño y recuperación',
    description: 'Rutinas de descanso, hidratación y recuperación según tu pulsera.',
    icon: FaLeaf,
    accent: 'from-emerald-500 to-teal-600'
  },
  {
    path: '/wellness/recordatorios',
    title: 'Recordatorios y vibraciones',
    description: 'Configura vibraciones y recordatorios. La asistencia familiar está en Connect.',
    icon: FaBell,
    accent: 'from-amber-500 to-orange-600'
  },
  {
    path: '/connect',
    title: 'Connect / Family Connection',
    description: 'Contactos autorizados, Request Help y ubicación opcional. Sin 911.',
    icon: FaHeartbeat,
    accent: 'from-slate-600 to-slate-800'
  }
];

function SaludPersonalHub() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <WellnessLoginPrompt />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
              <FaHeartbeat className="text-indigo-500" />
              SiempreSleep
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sueño, hábitos y conexión familiar opcional — sin promesas clínicas.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-full">
              <FaRobot />
              Base preparada para SiempreSleep
            </div>
          </div>

          <div className="space-y-6">
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.path}
                  to={module.path}
                  className="block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition group"
                >
                  <div className={`h-2 bg-gradient-to-r ${module.accent}`} />
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.accent} flex items-center justify-center shrink-0`}>
                      <Icon className="text-white text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{module.title}</h2>
                      <p className="text-gray-600">{module.description}</p>
                    </div>
                    <FaArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition text-xl shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SaludPersonalHub;
