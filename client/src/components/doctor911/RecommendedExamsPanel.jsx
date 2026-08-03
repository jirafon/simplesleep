import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCalendarAlt, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import { getRecommendedExamsByProfile } from '../../utils/recommendedExams';

function RecommendedExamsPanel({ user }) {
  if (!user) {
    return null;
  }

  const recommendation = getRecommendedExamsByProfile({
    gender: user.gender,
    dateOfBirth: user.dateOfBirth
  });

  return (
    <section className="bg-white py-14 px-4 border-y border-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-50 via-cyan-50 to-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] bg-white border border-blue-200 text-blue-700 rounded-full px-3 py-1 mb-4">
                <FaClipboardList className="text-blue-600" />
                Exámenes recomendados
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {recommendation.title}
              </h2>
              <p className="text-slate-600 mb-5">{recommendation.description}</p>

              {recommendation.age !== null && (
                <p className="inline-flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-full px-4 py-2 mb-5">
                  <FaCalendarAlt className="text-blue-600" />
                  Edad estimada: {recommendation.age} años
                </p>
              )}

              {recommendation.recommendations.length > 0 && (
                <ul className="grid md:grid-cols-2 gap-2">
                  {recommendation.recommendations.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-700 bg-white rounded-xl border border-slate-200 px-3 py-2">
                      <FaCheckCircle className="text-emerald-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="lg:min-w-[260px]">
              <Link
                to={recommendation.cta.href}
                className="inline-flex items-center justify-center w-full py-3 px-6 rounded-xl font-semibold text-white bg-slate-900 hover:bg-black transition gap-2"
              >
                {recommendation.cta.label}
                <FaArrowRight className="text-sm" />
              </Link>

              {!recommendation.profileComplete && (
                <p className="text-xs text-slate-600 mt-3">
                  Este bloque se personaliza automáticamente una vez que completes ambos campos en tu perfil.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RecommendedExamsPanel;
