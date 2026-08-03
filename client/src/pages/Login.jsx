import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SleepNavbar from '../components/sleep/SleepNavbar';
import { useAuth } from '../context/AuthContext';
import { useT } from '../i18n/useT';
import axios from 'axios';
import { getApiUrl } from '../config/api';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const t = useT();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError(t('app.auth.fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || t('app.auth.invalidCredentials'));
      }
    } catch {
      setError(t('app.auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    if (forgotStep === 1) {
      if (!forgotEmail) {
        setForgotError(t('app.auth.enterEmail'));
        return;
      }
      setForgotLoading(true);
      try {
        const response = await axios.post(getApiUrl('/api/auth/forgot-password'), {
          email: forgotEmail
        });
        setForgotMessage(response.data.message);
        if (response.data.devToken) {
          setForgotMessage(
            `${response.data.message}\n\nDev recovery code: ${response.data.devToken}`
          );
        }
        setForgotStep(2);
      } catch (err) {
        setForgotError(err.response?.data?.message || t('app.auth.requestError'));
      } finally {
        setForgotLoading(false);
      }
    } else {
      if (!resetToken || !newPassword) {
        setForgotError(t('app.auth.fillAllFields'));
        return;
      }
      if (newPassword.length < 6) {
        setForgotError(t('app.auth.passwordMin'));
        return;
      }
      setForgotLoading(true);
      try {
        const response = await axios.post(getApiUrl('/api/auth/reset-password'), {
          email: forgotEmail,
          token: resetToken,
          newPassword
        });
        setForgotMessage(response.data.message);
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotStep(1);
          setForgotEmail('');
          setResetToken('');
          setNewPassword('');
          setForgotMessage('');
          setForgotError('');
        }, 2000);
      } catch (err) {
        setForgotError(err.response?.data?.message || t('app.auth.resetError'));
      } finally {
        setForgotLoading(false);
      }
    }
  };

  const closeForgotModal = () => {
    setShowForgotPassword(false);
    setForgotStep(1);
    setForgotEmail('');
    setResetToken('');
    setNewPassword('');
    setForgotMessage('');
    setForgotError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-slate-50">
      <SleepNavbar />
      <div className="py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">{t('app.auth.loginTitle')}</h1>
            <p className="text-slate-600">{t('app.auth.loginSubtitle')}</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                {t('app.auth.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                {t('app.auth.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                placeholder={t('app.auth.passwordPlaceholder')}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading ? t('app.auth.signingIn') : t('app.auth.signInButton')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-slate-700 hover:underline"
            >
              {t('app.auth.forgotPassword')}
            </button>
          </div>

          <div className="mt-6 text-center text-slate-600 text-sm">
            {t('app.auth.noAccount')}{' '}
            <Link to="/register" className="text-slate-900 font-semibold hover:underline">
              {t('app.auth.createAccount')}
            </Link>
          </div>
        </div>
      </div>

      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
            <button
              type="button"
              onClick={closeForgotModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              aria-label={t('app.common.cancel')}
            >
              ×
            </button>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t('app.auth.recoverTitle')}</h2>
            {forgotMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg mb-4 whitespace-pre-line text-sm">
                {forgotMessage}
              </div>
            )}
            {forgotError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg mb-4 text-sm">
                {forgotError}
              </div>
            )}
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {forgotStep === 1 ? (
                <>
                  <p className="text-slate-600 text-sm">{t('app.auth.recoverIntro')}</p>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                    placeholder="you@example.com"
                    required
                  />
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {forgotLoading ? t('app.auth.sending') : t('app.auth.sendCode')}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-slate-600 text-sm">{t('app.auth.enterCode')}</p>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                    placeholder={t('app.auth.recoveryCode')}
                    required
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                    placeholder={t('app.auth.minChars')}
                    required
                  />
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {forgotLoading ? t('app.auth.updating') : t('app.auth.resetPassword')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="w-full text-sm text-slate-600"
                  >
                    {t('app.auth.backToCode')}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
