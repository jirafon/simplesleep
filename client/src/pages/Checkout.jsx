import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { 
  FaShoppingCart, 
  FaCreditCard, 
  FaLock, 
  FaMoneyBillWave,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { getApiUrl } from '../config/api';
import { getCookie } from '../utils/cookies';

function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [pricing, setPricing] = useState(null);

  const fetchOrder = useCallback(async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        getApiUrl(`/api/orders/${orderId}`),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const orderData = response.data;
      setOrder(orderData);
      
      // Calcular precios según resumen de cobro por bloques cuando esté disponible
      const totalAmount = calculateOrderTotal(orderData);
      setPricing(totalAmount);

    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.message || 'Error al cargar la orden');
    } finally {
      setLoading(false);
    }
  }, [navigate, orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const calculateOrderTotal = (orderData) => {
    const pricingSummary = orderData?.pricingSummary;

    if (pricingSummary) {
      const items = [];

      if ((pricingSummary.packUnits || 0) > 0) {
        items.push({
          name: `Packs seleccionados (${pricingSummary.packUnits})`,
          detail: `${pricingSummary.packBlocks} bloque(s) x $${pricingSummary.blockPrice.toLocaleString('es-CL')}`,
          price: pricingSummary.packsAmount
        });
      }

      if ((pricingSummary.customExamUnits || 0) > 0) {
        items.push({
          name: `Exámenes personalizados (${pricingSummary.customExamUnits})`,
          detail: `${pricingSummary.customExamBlocks} bloque(s) x $${pricingSummary.blockPrice.toLocaleString('es-CL')}`,
          price: pricingSummary.customAmount
        });
      }

      return {
        subtotal: pricingSummary.total,
        taxes: pricingSummary.taxes || 0,
        total: orderData.totalAmount || pricingSummary.total,
        items,
        itemCount: (pricingSummary.packUnits || 0) + (pricingSummary.customExamUnits || 0)
      };
    }

    const examItems = Array.isArray(orderData?.exams)
      ? orderData.exams.map((examName) => ({
          name: String(examName).trim(),
          price: 5990
        }))
      : [];

    const fallbackSubtotal = examItems.reduce((sum, item) => sum + item.price, 0);
    const fallbackTotal = Number.isFinite(orderData?.totalAmount) && orderData.totalAmount > 0
      ? orderData.totalAmount
      : fallbackSubtotal;

    return {
      subtotal: fallbackTotal,
      taxes: 0,
      total: fallbackTotal,
      items: examItems,
      itemCount: examItems.length
    };
  };

  const handlePayWithFlow = async () => {
    try {
      setPaymentLoading(true);
      setError('');

      const token = getCookie('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        getApiUrl('/api/payments/create'),
        { orderId: order._id },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.payment && response.data.payment.paymentUrl) {
        // Redirigir a Flow
        window.location.href = response.data.payment.paymentUrl;
      } else {
        throw new Error('No se recibió URL de pago de Flow');
      }

    } catch (err) {
      console.error('Error creating payment:', err);
      setError(err.response?.data?.message || 'Error al crear el pago');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleAcceptTerms = () => {
    // Handle terms acceptance
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <FaSpinner className="animate-spin text-blue-600 text-4xl" />
        </div>
        <SaludSimpleFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <FaExclamationTriangle className="text-red-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
        <SaludSimpleFooter />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Orden no encontrada</h3>
          </div>
        </div>
        <SaludSimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Finalizar Compra
          </h1>
          <p className="text-lg text-gray-600">
            Revisa tu orden y procede al pago seguro
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <FaShoppingCart className="text-blue-600 text-2xl mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Resumen de tu Orden</h2>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Número de Orden</p>
              <p className="text-lg font-mono text-gray-900">
                #{order._id.slice(-8).toUpperCase()}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Exámenes Seleccionados</h3>
              <div className="space-y-3">
                {pricing && pricing.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <p className="text-sm text-gray-900">{item.name}</p>
                    </div>
                    <div className="text-right">
                          {item.detail && (
                            <p className="text-xs text-gray-500 mb-1">{item.detail}</p>
                          )}
                      <p className="text-sm font-medium text-gray-900">
                        ${item.price.toLocaleString('es-CL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({pricing?.itemCount} exámenes)</span>
                <span className="text-gray-900">${pricing?.subtotal.toLocaleString('es-CL')}</span>
              </div>
             
              <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">${pricing?.total.toLocaleString('es-CL')} CLP</span>
              </div>
              <p className="text-xs text-gray-500 pt-1">
                Cobro por bloques: packs cada 3 y personalizados cada 9 exámenes. IVA incluido.
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <FaCreditCard className="text-green-600 text-2xl mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Método de Pago</h2>
            </div>

            {/* Flow Payment Option */}
            <div className="border-2 border-blue-200 rounded-xl p-4 mb-6 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="bg-blue-600 rounded-lg p-2 mr-3">
                    <FaMoneyBillWave className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Flow</h3>
                    <p className="text-sm text-gray-600">Pago seguro con Flow</p>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={true}
                  readOnly
                  className="w-5 h-5 text-blue-600"
                />
              </div>
              
              <div className="text-sm text-gray-700 mb-3">
                <p>• Tarjetas de crédito y débito</p>
                <p>• Transferencia bancaria</p>
                <p>• Otros medios de pago disponibles</p>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <FaLock className="text-green-600 text-lg mr-2" />
                <div>
                  <h4 className="font-semibold text-green-800">Pago 100% Seguro</h4>
                  <p className="text-sm text-green-700">
                    Tu información está protegida con encriptación SSL
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayWithFlow}
              disabled={paymentLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition duration-200 flex items-center justify-center"
            >
              {paymentLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <FaLock className="mr-2" />
                  Pagar ${pricing?.total.toLocaleString('es-CL')} CLP
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Al hacer clic en "Pagar" aceptas nuestros términos y condiciones de servicio
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <div className="flex items-start">
            <FaCheckCircle className="text-blue-600 text-xl mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Qué sucede después del pago?</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Tu orden será procesada automáticamente</li>
                <li>• Recibirás un PDF con la orden médica en tu email</li>
                <li>• Podrás acceder a tus órdenes desde tu bitácora</li>
                <li>• El PDF estará disponible para descarga inmediata</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="mt-4">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              className="mr-2 border-gray-300 rounded"
              required
            />
            He leído y acepto <a href="/terms-and-conditions" className="text-blue-600 hover:underline">Términos y Condiciones</a>
          </label>
        </div>
      </div>

      <SaludSimpleFooter />
    </div>
  );
}

export default Checkout;