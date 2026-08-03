import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaUserPlus } from 'react-icons/fa';

function FinalCta() {
  return (
    <section className="px-4 py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-8 md:p-10 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-200 mb-3">Siguiente paso</p>
            <h3 className="text-3xl md:text-4xl font-bold mb-3">Elige tu programa y avanza hoy</h3>
            <p className="text-slate-200">
              Salud Hombre o Salud Mujer: una ruta clara para cada necesidad.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/personaliza-tu-orden"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition"
            >
              Ver rutas de salud
              <FaArrowRight className="text-sm" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition"
            >
              Crear cuenta
              <FaUserPlus className="text-sm" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCta;
