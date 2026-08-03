import React from 'react';
import SleepNavbar from './SleepNavbar';

function SleepLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(204,251,241,0.55),_transparent_55%),linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f0f9ff_100%)] text-slate-900">
      <SleepNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {(title || subtitle) && (
          <header className="mb-8">
            {title && (
              <h1
                className="text-3xl tracking-tight text-slate-900"
                style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
              >
                {title}
              </h1>
            )}
            {subtitle && <p className="mt-2 text-slate-600 max-w-2xl">{subtitle}</p>}
          </header>
        )}
        {children}
      </main>
    </div>
  );
}

export default SleepLayout;
