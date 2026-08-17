import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaMoon,
  FaHome,
  FaComments,
  FaLightbulb,
  FaUsers,
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../i18n/useT';
import LanguageToggle from '../LanguageToggle';
import FEATURE_FLAGS from '../../config/featureFlags';

function SleepNavbar() {
  const { token, user, logout } = useAuth();
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isLoggedIn = !!token;
  const onLanding = location.pathname === '/';

  const primaryNav = [
    { to: '/dashboard', label: t('app.nav.today'), icon: FaHome },
    { to: '/sleep', label: t('app.nav.sleep'), icon: FaMoon },
    FEATURE_FLAGS.AI_SLEEP_COACH
      ? { to: '/coach', label: t('app.nav.coach'), icon: FaComments }
      : { to: '/improve', label: t('app.nav.improve'), icon: FaComments },
    { to: '/insights', label: t('app.nav.insights'), icon: FaLightbulb },
    { to: '/connect', label: t('app.nav.connect'), icon: FaUsers }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
      isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
    }`;

  const landingLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
      isActive ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10'
    }`;

  return (
    <nav
      className={`backdrop-blur sticky top-0 z-50 ${
        onLanding
          ? 'bg-slate-950/80 border-b border-white/10'
          : 'bg-white/95 border-b border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <Link to={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                onLanding ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
              }`}
            >
              <FaMoon className="text-sm" />
            </span>
            <span
              className={`font-semibold tracking-tight text-lg ${
                onLanding ? 'text-white' : 'text-slate-900'
              }`}
            >
              {t('app.brand')}
            </span>
          </Link>

          {isLoggedIn && (
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center min-w-0 overflow-x-auto">
              {primaryNav.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass}>
                  <Icon className="shrink-0 opacity-80" />
                  {label}
                </NavLink>
              ))}
              <NavLink to="/account" className={linkClass}>
                <FaUser className="shrink-0 opacity-80" />
                {t('app.nav.profile')}
              </NavLink>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <LanguageToggle variant={onLanding ? 'dark' : 'sleep'} />
            {isLoggedIn ? (
              <>
                <span className={`text-sm max-w-[140px] truncate ${onLanding ? 'text-white/80' : 'text-slate-600'}`}>
                  {user?.name || user?.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                    onLanding ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FaSignOutAlt />
                  {t('app.nav.signOut')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  onLanding
                    ? 'bg-white text-slate-900 hover:bg-indigo-50'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {t('app.nav.signIn')}
              </Link>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <LanguageToggle variant={onLanding ? 'dark' : 'sleep'} />
            <button
              type="button"
              className={`p-2 ${onLanding ? 'text-white' : 'text-slate-700'}`}
              onClick={() => setOpen((v) => !v)}
              aria-label={t('app.nav.menu')}
            >
              {open ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <div className={`lg:hidden border-t py-3 space-y-1 ${onLanding ? 'border-white/10' : 'border-slate-100'}`}>
            {isLoggedIn ? (
              <>
                {[
                  ...primaryNav,
                  { to: '/account', label: t('app.nav.profile'), icon: FaUser },
                  { to: '/device', label: t('app.nav.device'), icon: FaMoon },
                  { to: '/reports', label: t('app.nav.reports'), icon: FaMoon }
                ].map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={onLanding ? landingLinkClass : linkClass}
                    onClick={() => setOpen(false)}
                  >
                    <Icon />
                    {label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
                >
                  <FaSignOutAlt />
                  {t('app.nav.signOut')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`block text-center px-4 py-2 rounded-lg ${
                  onLanding ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                }`}
                onClick={() => setOpen(false)}
              >
                {t('app.nav.signIn')}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default SleepNavbar;
export const PRIMARY_NAV = [
  { to: '/dashboard', labelKey: 'app.nav.today', icon: FaHome },
  { to: '/sleep', labelKey: 'app.nav.sleep', icon: FaMoon },
  { to: '/coach', labelKey: 'app.nav.coach', icon: FaComments },
  { to: '/insights', labelKey: 'app.nav.insights', icon: FaLightbulb },
  { to: '/connect', labelKey: 'app.nav.connect', icon: FaUsers }
];
