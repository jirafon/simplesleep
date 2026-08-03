import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { useCart } from '../context/CartContext';
import { getCookie } from '../utils/cookies';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

function ReviewOrder() {
  const navigate = useNavigate();
  const { items, getCartTotal } = useCart();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    birthDate: '',
    rut: '',
    phone: '',
    region: '',
    address: '',
    termsAccepted: false,
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const isAuthenticated = !!getCookie('token');
  const subtotal = getCartTotal();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.termsAccepted) {
      setMessage({ type: 'error', text: 'Debes aceptar los Términos y Condiciones para continuar.' });
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Aquí se puede agregar la lógica para enviar el pedido al backend
    setMessage({ type: 'success', text: 'Pedido realizado con éxito. Redirigiendo...' });
    setTimeout(() => navigate('/payment'), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Revisa tu pedido con SiempreSalud</h1>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <FaCheckCircle className="text-green-600 mr-2" />
              ) : (
                <FaExclamationTriangle className="text-red-600 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información personal</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombres</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Apellidos</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Repetir Email</label>
              <input
                type="email"
                name="confirmEmail"
                value={formData.confirmEmail}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">RUT</label>
              <input
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Región</label>
              <select
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">Seleccione su región</option>
                <option value="Region 1">Región 1</option>
                <option value="Region 2">Región 2</option>
                {/* Agregar más regiones aquí */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                className="mt-1"
              />
              <label className="text-sm text-gray-700">
                He leído y acepto los{' '}
                <a href="/terms-and-conditions" target="_blank" className="text-blue-600 hover:underline">
                  Términos y Condiciones
                </a>.
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tu pedido</h2>

          <ul className="space-y-2 mb-4">
            {items.map((item) => (
              <li key={item.id} className="text-gray-700">
                • {item.name}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">Subtotal</span>
            <span className="text-lg font-bold text-gray-900">${subtotal.toLocaleString('es-CL')}</span>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">${subtotal.toLocaleString('es-CL')}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Realizar pedido
          </button>
        </div>
      </div>

      <SaludSimpleFooter />
    </div>
  );
}

export default ReviewOrder;