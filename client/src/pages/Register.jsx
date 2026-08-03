import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SleepNavbar from '../components/sleep/SleepNavbar';
import { useAuth } from '../context/AuthContext';
import { useT } from '../i18n/useT';
import { formatRut, normalizeRut, isValidChileanRut } from '../utils/rut';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const t = useT();
  const [formData, setFormData] = useState({
    name: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rut: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rut' ? formatRut(value) : value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedName = formData.name.trim();
    const normalizedApellidoPaterno = formData.apellidoPaterno.trim();
    const normalizedApellidoMaterno = formData.apellidoMaterno.trim();
    const normalizedRut = normalizeRut(formData.rut);
    const normalizedEmail = formData.email.trim();

    if (
      !normalizedName ||
      !normalizedApellidoPaterno ||
      !normalizedApellidoMaterno ||
      !normalizedRut ||
      !normalizedEmail ||
      !formData.password
    ) {
      setError(t('app.auth.fillAllFields'));
      return;
    }

    if (!isValidChileanRut(normalizedRut)) {
      setError(t('app.auth.invalidRut'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('app.auth.passwordsMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('app.auth.passwordMin'));
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: normalizedName,
        apellidoPaterno: normalizedApellidoPaterno,
        apellidoMaterno: normalizedApellidoMaterno,
        rut: normalizedRut,
        email: normalizedEmail,
        password: formData.password
      });

      if (result.success) {
        setSuccess(result.message || t('app.auth.registerSuccess'));
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        setError(result.error || t('app.auth.registerError'));
      }
    } catch {
      setError(t('app.auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-slate-50">
      <SleepNavbar />
      <div className="py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">{t('app.auth.registerTitle')}</h1>
            <p className="text-slate-600">{t('app.auth.registerSubtitle')}</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg mb-6 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: 'name', label: t('app.auth.name') },
              { id: 'apellidoPaterno', label: t('app.auth.lastName') },
              { id: 'apellidoMaterno', label: t('app.auth.motherLastName') },
              { id: 'rut', label: t('app.auth.rut'), maxLength: 12 },
              { id: 'email', label: t('app.auth.email'), type: 'email' },
              {
                id: 'password',
                label: t('app.auth.password'),
                type: 'password',
                placeholder: t('app.auth.minChars')
              },
              {
                id: 'confirmPassword',
                label: t('app.auth.confirmPassword'),
                type: 'password'
              }
            ].map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium text-slate-700 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  id={field.id}
                  name={field.id}
                  value={formData[field.id]}
                  onChange={handleChange}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400"
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? t('app.auth.creating') : t('app.auth.createButton')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {t('app.auth.haveAccount')}{' '}
            <Link to="/login" className="text-slate-900 font-semibold hover:underline">
              {t('app.auth.signInButton')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
