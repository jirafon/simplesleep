import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { FaFileMedical, FaCheckCircle } from 'react-icons/fa';
import { getApiUrl } from '../config/api';
import { getCookie } from '../utils/cookies';

function Servicios() {
  const navigate = useNavigate();
  const [orderForm, setOrderForm] = useState({
    type: 'PAP',
    examName: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const examTypes = [
    { value: 'PAP', label: 'PAP (Papanicolaou)' },
    { value: 'thyroid', label: 'Examen de Tiroides' },
    { value: 'hypertension', label: 'Control de Hipertensión' },
    { value: 'mammography', label: 'Mamografía' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    const token = getCookie('token');

    if (!token) {
      navigate('/login');
      return;
    }

    if (!orderForm.examName) {
      setMessage({ type: 'error', text: 'Por favor ingrese el nombre del examen' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post(
        getApiUrl('/api/orders/create'),
        {
          type: orderForm.type,
          examName: orderForm.examName,
          notes: orderForm.notes
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage({ type: 'success', text: 'Orden médica creada exitosamente' });
      setOrderForm({ type: 'PAP', examName: '', notes: '' });
      setTimeout(() => {
        navigate('/bitacora');
      }, 2000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al crear la orden'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nuestros Servicios
          </h1>
          <p className="text-xl text-gray-600">
            Órdenes médicas rápidas y accesibles
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md px-6 py-3 inline-flex items-center text-blue-700 font-semibold">
            <FaFileMedical className="inline mr-2" />
            Órdenes Médicas
          </div>
        </div>

        {/* Messages */}
        {message.text && (
          <div
            className={`max-w-2xl mx-auto mb-6 px-4 py-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Solicitar Orden Médica
              </h2>
              <p className="text-gray-600">
                Exámenes preventivos rápidos y accesibles
              </p>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Examen
                </label>
                <select
                  value={orderForm.type}
                  onChange={(e) => setOrderForm({ ...orderForm, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {examTypes.map((exam) => (
                    <option key={exam.value} value={exam.value}>
                      {exam.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Examen *
                </label>
                <input
                  type="text"
                  value={orderForm.examName}
                  onChange={(e) => setOrderForm({ ...orderForm, examName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: PAP, Mamografía, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales (opcional)
                </label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Información adicional sobre el examen..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Creando orden...' : 'Crear Orden Médica'}
              </button>
            </form>

            {/* Exam Types Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Exámenes Disponibles:</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {examTypes.map((exam) => (
                  <div key={exam.value} className="flex items-center space-x-2 text-gray-600">
                    <FaCheckCircle className="text-green-500" />
                    <span>{exam.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>

      <SaludSimpleFooter />
    </div>
  );
}

export default Servicios;
