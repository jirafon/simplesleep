import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SleepNavbar from '../components/sleep/SleepNavbar';
import { useT } from '../i18n/useT';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaSave, FaSpinner, FaUserShield, FaUserCircle } from 'react-icons/fa';
import { getApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { formatRut, normalizeRut, isValidChileanRut } from '../utils/rut';

function Profile() {
  const navigate = useNavigate();
  const { token, updateUser, logout } = useAuth();
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rut: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    userprofile: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get(getApiUrl('/api/user/profile'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const user = response.data;
      console.log('📧 User email from API:', user.email);
      setFormData({
        name: user.name || '',
        apellidoPaterno: user.apellidoPaterno || '',
        apellidoMaterno: user.apellidoMaterno || '',
        rut: formatRut(user.rut || ''),
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        userprofile: user.userprofile || 'user',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        }
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.response?.status === 401) {
        logout();
      } else {
        setError(t('app.profile.loadError'));
      }
    } finally {
      setLoading(false);
    }
  }, [logout, token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [fetchProfile, navigate, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'rut' ? formatRut(value) : value
      });
    }
    setError('');
    setSuccess(t('app.profile.saveSuccess'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedName = String(formData.name || '').trim();
    const normalizedApellidoPaterno = String(formData.apellidoPaterno || '').trim();
    const normalizedApellidoMaterno = String(formData.apellidoMaterno || '').trim();
    const normalizedRut = normalizeRut(formData.rut);

    if (!normalizedName || !normalizedApellidoPaterno || !normalizedApellidoMaterno || !normalizedRut) {
      setError(t('app.profile.requiredNames'));
      return;
    }

    if (!isValidChileanRut(normalizedRut)) {
      setError(t('app.profile.invalidRut'));
      return;
    }

    if (!formData.dateOfBirth) {
      setError(t('app.profile.birthRequired'));
      return;
    }

    if (!formData.gender) {
      setError(t('app.profile.genderRequired'));
      return;
    }

    const selectedBirthDate = new Date(formData.dateOfBirth);
    if (Number.isNaN(selectedBirthDate.getTime()) || selectedBirthDate > new Date()) {
      setError(t('app.profile.birthInvalid'));
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        name: normalizedName,
        apellidoPaterno: normalizedApellidoPaterno,
        apellidoMaterno: normalizedApellidoMaterno,
        rut: normalizedRut,
        email: String(formData.email || '').trim().toLowerCase()
      };

      const response = await axios.put(getApiUrl('/api/user/profile'), payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update user in AuthContext
      if (response.data.user) {
        updateUser(response.data.user);
      }

      setSuccess('Perfil actualizado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(t('app.profile.saveError'));
      }
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SleepNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('app.common.loading')}</p>
          </div>
        </div>
        
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SleepNavbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('app.profile.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('app.profile.subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Tipo de Perfil */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {(formData.userprofile === 'admin' || formData.userprofile === 'superadmin') ? (
                  <FaUserShield className="text-2xl text-purple-600 mr-3" />
                ) : (
                  <FaUserCircle className="text-2xl text-blue-600 mr-3" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('app.profile.profileType')}</h3>
                  <p className="text-sm text-gray-600">{t('app.profile.profileTypeHint')}</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg font-semibold ${
                (formData.userprofile === 'admin' || formData.userprofile === 'superadmin')
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {(formData.userprofile === 'admin' || formData.userprofile === 'superadmin') ? t('app.profile.admin') : t('app.profile.user')}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                {t('app.profile.title')}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('app.profile.firstName')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('app.profile.lastName')} *
                  </label>
                  <input
                    type="text"
                    name="apellidoPaterno"
                    value={formData.apellidoPaterno}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('app.profile.motherLastName')} *
                  </label>
                  <input
                    type="text"
                    name="apellidoMaterno"
                    value={formData.apellidoMaterno}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('app.profile.rut')} *
                  </label>
                  <input
                    type="text"
                    name="rut"
                    value={formData.rut}
                    onChange={handleChange}
                    maxLength={12}
                    placeholder="12.345.678-9"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaEnvelope className="mr-1 text-gray-400" />
                    {t('app.profile.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaPhone className="mr-1 text-gray-400" />
                    {t('app.profile.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+56 9 1234 5678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaCalendarAlt className="mr-1 text-gray-400" />
                    {t('app.profile.birthDate')} *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('app.profile.gender')} *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">{t('app.profile.selectGender')}</option>
                    <option value="male">{t('app.profile.male')}</option>
                    <option value="female">{t('app.profile.female')}</option>
                    <option value="other">{t('app.profile.other')}</option>
                    <option value="prefer_not_to_say">{t('app.profile.preferNot')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-blue-600" />
                {t('app.profile.address')}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('app.profile.street')}
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="Av. Principal 123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('app.profile.city')}
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="Santiago"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('app.profile.state')}
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder={t('app.profile.state')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('app.profile.zip')}
                  </label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    placeholder="1234567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('app.profile.country')}
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    placeholder="Chile"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    {t('app.profile.saving')}
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    {t('app.profile.save')}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/bitacora')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                {t('app.common.cancel')}
              </button>
            </div>
          </form>

        </div>
      </div>
      
    </div>
  );
}

export default Profile;
