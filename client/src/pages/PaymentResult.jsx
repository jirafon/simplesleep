import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner, 
  FaClock,
  FaDownload,
  FaEye,
  FaHome,
  FaReceipt
} from 'react-icons/fa';
import { getApiUrl } from '../config/api';
import { getCookie } from '../utils/cookies';

function PaymentResult() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPaymentStatus = useCallback(async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        getApiUrl(`/api/payments/${paymentId}/status`),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPayment(response.data);
      
      // Stop loading if payment is completed or failed
      if (response.data.status === 'completed' || response.data.status === 'failed') {
        setLoading(false);
      }

    } catch (err) {
      console.error('Error fetching payment status:', err);
      setError(err.response?.data?.message || 'Error al consultar el estado del pago');
      setLoading(false);
    }
  }, [navigate, paymentId]);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentStatus();
      
      // Poll payment status every 5 seconds for up to 2 minutes if payment is still processing
      const interval = setInterval(() => {
        fetchPaymentStatus();
      }, 5000);

      // Clear interval after 2 minutes
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 120000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [fetchPaymentStatus, paymentId]);

  const getStatusIcon = () => {
    if (!payment) return <FaSpinner className="animate-spin text-blue-600 text-6xl" />;
    
    switch (payment.status) {
      case 'completed':
        return <FaCheckCircle className="text-green-600 text-6xl" />;
      case 'failed':
        return <FaTimesCircle className="text-red-600 text-6xl" />;
      case 'processing':
      default:
        return <FaClock className="text-yellow-600 text-6xl" />;
    }
  };

  const getStatusMessage = () => {
    if (!payment) return { title: 'Cargando...', description: 'Verificando el estado de tu pago' };
    
    switch (payment.status) {
      case 'completed':
        return {
          title: '¡Pago Exitoso!',
          description: 'Tu pago ha sido procesado exitosamente. Tu orden médica está lista.',
          color: 'green'
        };
      case 'failed':
        return {
          title: 'Pago Rechazado',
          description: 'Tu pago no pudo ser procesado. Por favor intenta nuevamente.',
          color: 'red'
        };
      case 'processing':
        return {
          title: 'Procesando Pago',
          description: 'Tu pago está siendo verificado. Por favor espera un momento.',
          color: 'yellow'
        };
      default:
        return {
          title: 'Verificando Pago',
          description: 'Estamos confirmando tu pago con el banco.',
          color: 'blue'
        };
    }
  };

  const statusInfo = getStatusMessage();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FaTimesCircle className="text-red-600 text-6xl mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-red-800 mb-4">Error</h1>
            <p className="text-lg text-red-700 mb-6">{error}</p>
            <button
              onClick={() => navigate('/bitacora')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl"
            >
              Ir a Mi Bitácora
            </button>
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
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Status Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              {getStatusIcon()}
            </div>
            <h1 className={`text-3xl font-bold mb-4 ${
              statusInfo.color === 'green' ? 'text-green-800' :
              statusInfo.color === 'red' ? 'text-red-800' :
              statusInfo.color === 'yellow' ? 'text-yellow-800' :
              'text-blue-800'
            }`}>
              {statusInfo.title}
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              {statusInfo.description}
            </p>
          </div>

          {/* Payment Details */}
          {payment && (
            <div className="border-t border-gray-200 pt-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaReceipt className="mr-2" />
                Detalles del Pago
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Monto Total</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${payment.totalAmount?.toLocaleString('es-CL')} {payment.currency}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status === 'completed' ? 'Completado' :
                       payment.status === 'failed' ? 'Fallido' :
                       'Procesando'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Pago</p>
                    <p className="text-gray-900">
                      {payment.paidAt ? 
                        new Date(payment.paidAt).toLocaleString('es-CL') :
                        'Pendiente'
                      }
                    </p>
                  </div>
                </div>
                
                {payment.order && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Número de Orden</p>
                      <p className="text-gray-900 font-mono">
                        #{payment.order.id?.slice(-8)?.toUpperCase()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Exámenes</p>
                      <p className="text-gray-900">
                        {payment.order.exams?.length || 1} examen(es) médico(s)
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Estado de la Orden</p>
                      <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        payment.order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.order.status === 'payment_confirmed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.order.status === 'completed' ? 'Completada' :
                         payment.order.status === 'payment_confirmed' ? 'Pago Confirmado' :
                         'Pendiente'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {payment?.status === 'completed' && (
                <>
                  <button
                    onClick={() => navigate('/bitacora')}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center"
                  >
                    <FaEye className="mr-2" />
                    Ver en Mi Bitácora
                  </button>
                  
                  {payment.order?.status === 'completed' && (
                    <button
                      onClick={() => {
                        // Navigate to download page or trigger download
                        navigate(`/bitacora?highlight=${payment.order.id}`);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center"
                    >
                      <FaDownload className="mr-2" />
                      Descargar Orden
                    </button>
                  )}
                </>
              )}
              
              {payment?.status === 'failed' && (
                <button
                  onClick={() => navigate(`/checkout/${payment.order?.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl"
                >
                  Intentar Nuevamente
                </button>
              )}
              
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center"
              >
                <FaHome className="mr-2" />
                Volver al Inicio
              </button>
            </div>
          </div>

          {/* Processing Message */}
          {loading && payment?.status === 'processing' && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <FaSpinner className="animate-spin text-blue-600 text-lg mr-3" />
                <div>
                  <p className="text-blue-800 font-medium">Verificando pago...</p>
                  <p className="text-blue-700 text-sm">
                    Estamos confirmando tu pago. Esto puede tomar unos minutos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Help Message */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">¿Necesitas ayuda?</h3>
            <p className="text-sm text-gray-700 mb-2">
              Si tienes algún problema con tu pago o tu orden, no dudes en contactarnos.
            </p>
            <p className="text-sm text-gray-600">
              Email: soporte@siempresalud.cl | Teléfono: +56 2 1234 5678
            </p>
          </div>
        </div>
      </div>

      <SaludSimpleFooter />
    </div>
  );
}

export default PaymentResult;