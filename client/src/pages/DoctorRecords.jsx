import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaSpinner, 
  FaEye, 
  FaSearch,
  FaUser,
  FaCalendarAlt,
  FaFileMedical,
  FaEnvelope,
  FaPhone,
  FaRobot,
  FaBrain,
  FaChartLine,
  FaUserMd,
  FaLightbulb
} from 'react-icons/fa';
import { format } from 'date-fns';
import { getApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

function DoctorRecords() {
  const navigate = useNavigate();
  const { token, isDoctor } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [showCopilotModal, setShowCopilotModal] = useState(false);
  const [copilotSummary, setCopilotSummary] = useState(null);
  const [loadingCopilot, setLoadingCopilot] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [clinicalTimeline, setClinicalTimeline] = useState(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await axios.get(getApiUrl('/api/doctor/records'), {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });

      setOrders(response.data.orders || []);
      setTotalPages(response.data.totalPages || 1);
      setError('');
    } catch (err) {
      console.error('Error fetching records:', err);
      if (err.response?.status === 403) {
        setError('No tienes permisos de doctor');
        navigate('/bitacora');
      } else {
        setError('Error al cargar los registros. Por favor recarga la página.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, navigate, searchTerm, statusFilter, token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if user is doctor
    if (!isDoctor) {
      navigate('/bitacora');
      return;
    }

    fetchRecords();
  }, [fetchRecords, isDoctor, navigate, token]);

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o._id));
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await axios.get(
        getApiUrl(`/api/doctor/records/${orderId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSelectedOrder(response.data);
      setShowOrderModal(true);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Error al cargar los detalles del registro');
    }
  };

  const handleAIAnalysis = async () => {
    if (selectedOrders.length === 0) {
      setError('Por favor selecciona al menos un registro para analizar');
      return;
    }

    if (selectedOrders.length > 10) {
      setError('Puedes analizar máximo 10 registros a la vez');
      return;
    }

    setAnalyzing(true);
    setError('');
    setShowAIModal(true);
    setAiAnalysis('');

    try {
      const response = await axios.post(
        getApiUrl('/api/doctor/records/ai-analysis'),
        { orderIds: selectedOrders },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAiAnalysis(response.data.analysis);
    } catch (err) {
      console.error('Error in AI analysis:', err);
      setError(err.response?.data?.message || 'Error al realizar el análisis con IA');
      setShowAIModal(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleViewTimeline = async (orderId) => {
    try {
      setLoadingTimeline(true);
      setError('');
      setShowTimelineModal(true);
      setClinicalTimeline(null);

      const response = await axios.get(
        getApiUrl(`/api/doctor/records/${orderId}/clinical-timeline`),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setClinicalTimeline(response.data);
    } catch (err) {
      console.error('Error fetching clinical timeline:', err);
      setError('Error al cargar la línea de tiempo clínica');
      setShowTimelineModal(false);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleDoctorCopilot = async (userId, orderIds = null) => {
    try {
      setLoadingCopilot(true);
      setError('');
      setShowCopilotModal(true);
      setCopilotSummary(null);

      const response = await axios.post(
        getApiUrl('/api/doctor/records/copilot-summary'),
        { userId, orderIds },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCopilotSummary(response.data);
    } catch (err) {
      console.error('Error generating copilot summary:', err);
      setError('Error al generar el resumen del copiloto');
      setShowCopilotModal(false);
    } finally {
      setLoadingCopilot(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      processing: 'En Proceso',
      completed: 'Aprobada',
      cancelled: 'Rechazada'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-600" />;
      case 'processing':
        return <FaSpinner className="text-blue-600 animate-spin" />;
      case 'completed':
        return <FaCheck className="text-green-600" />;
      case 'cancelled':
        return <FaTimes className="text-red-600" />;
      default:
        return <FaClock />;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando registros...</p>
          </div>
        </div>
        <SaludSimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Registros de Pacientes
          </h1>
          <p className="text-xl text-gray-600">
            Visualiza y gestiona todos los registros médicos de los pacientes
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* AI Analysis Button */}
        {selectedOrders.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-4 mb-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaBrain className="text-2xl text-purple-600 mr-3" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedOrders.length} registro(s) seleccionado(s)
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedOrders.length > 10 
                      ? 'Selecciona máximo 10 registros para análisis'
                      : 'Listo para análisis con IA'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleAIAnalysis}
                disabled={analyzing || selectedOrders.length > 10}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {analyzing ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <FaRobot className="mr-2" />
                    Análisis con IA
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellidos, email, examen o estado..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Busca en nombre, apellidos, email del usuario, nombre del examen o estado
              </p>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="processing">En Proceso</option>
                <option value="completed">Aprobadas</option>
                <option value="cancelled">Rechazadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Examen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No se encontraron registros con los filtros aplicados'
                        : 'No se encontraron registros'}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => handleSelectOrder(order._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUser className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.userId?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FaEnvelope className="mr-1 text-xs" />
                              {order.userId?.email || 'N/A'}
                            </div>
                            {order.userId?.phone && (
                              <div className="text-xs text-gray-400 flex items-center">
                                <FaPhone className="mr-1" />
                                {order.userId.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FaFileMedical className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {order.examName || 'N/A'}
                            </div>
                            {order.exams && order.exams.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {order.exams.length} examen(es)
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-2">{getStatusLabel(order.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-gray-400" />
                          {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewOrder(order._id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center text-xs"
                          >
                            <FaEye className="mr-1" />
                            Detalles
                          </button>
                          <button
                            onClick={() => handleViewTimeline(order._id)}
                            className="text-green-600 hover:text-green-900 flex items-center text-xs"
                          >
                            <FaChartLine className="mr-1" />
                            Timeline
                          </button>
                          <button
                            onClick={() => handleDoctorCopilot(order.userId._id, [order._id])}
                            className="text-purple-600 hover:text-purple-900 flex items-center text-xs"
                          >
                            <FaUserMd className="mr-1" />
                            Copiloto
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <SaludSimpleFooter />

      {/* Order Details Modal */}
      {selectedOrder && showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles del Registro
                </h2>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Patient Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FaUser className="mr-2 text-blue-600" />
                    Información del Paciente
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nombre:</strong> {selectedOrder.userId?.name || 'N/A'}</div>
                    <div><strong>Email:</strong> {selectedOrder.userId?.email || 'N/A'}</div>
                    {selectedOrder.userId?.phone && (
                      <div><strong>Teléfono:</strong> {selectedOrder.userId?.phone}</div>
                    )}
                    {selectedOrder.userId?.dateOfBirth && (
                      <div><strong>Fecha de Nacimiento:</strong> {format(new Date(selectedOrder.userId.dateOfBirth), 'dd/MM/yyyy')}</div>
                    )}
                    {selectedOrder.userId?.gender && (
                      <div><strong>Género:</strong> {
                        selectedOrder.userId.gender === 'male' ? 'Masculino' :
                        selectedOrder.userId.gender === 'female' ? 'Femenino' :
                        selectedOrder.userId.gender === 'other' ? 'Otro' :
                        'Prefiero no decir'
                      }</div>
                    )}
                    {selectedOrder.userId?.address && (
                      <div>
                        <strong>Dirección:</strong> {
                          [
                            selectedOrder.userId.address.street,
                            selectedOrder.userId.address.city,
                            selectedOrder.userId.address.state,
                            selectedOrder.userId.address.country
                          ].filter(Boolean).join(', ') || 'N/A'
                        }
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FaFileMedical className="mr-2 text-green-600" />
                    Información de la Orden
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Estado:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>
                    <div><strong>Fecha Creación:</strong> {format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm')}</div>
                    {selectedOrder.approvedAt && (
                      <div><strong>Fecha Aprobación:</strong> {format(new Date(selectedOrder.approvedAt), 'dd/MM/yyyy HH:mm')}</div>
                    )}
                    {selectedOrder.approvedBy && (
                      <div><strong>Aprobado Por:</strong> {selectedOrder.approvedBy?.name || 'N/A'}</div>
                    )}
                    {selectedOrder.doctorName && (
                      <div><strong>Médico:</strong> {selectedOrder.doctorName}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Exams */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Exámenes Solicitados</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedOrder.exams && selectedOrder.exams.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {selectedOrder.exams.map((exam, idx) => (
                        <li key={idx} className="text-sm">{exam}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">{selectedOrder.examName || 'N/A'}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Activity Log */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Historial de Actividades</h3>
                <div className="space-y-3">
                  {selectedOrder.logs && selectedOrder.logs.length > 0 ? (
                    selectedOrder.logs.map((log, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-gray-900">
                              {log.action === 'created' && 'Orden Creada'}
                              {log.action === 'approved' && 'Orden Aprobada'}
                              {log.action === 'rejected' && 'Orden Rechazada'}
                              {log.action === 'status_changed' && 'Estado Cambiado'}
                              {log.action === 'pdf_generated' && 'PDF Generado'}
                              {log.action === 'updated' && 'Orden Actualizada'}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {log.performedByName && `Por: ${log.performedByName}`}
                            </div>
                            {log.notes && (
                              <div className="text-sm text-gray-700 mt-2">
                                {log.notes}
                              </div>
                            )}
                            {log.previousStatus && log.newStatus && (
                              <div className="text-xs text-gray-500 mt-1">
                                {log.previousStatus} → {log.newStatus}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No hay actividades registradas</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FaRobot className="text-3xl text-purple-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Análisis con IA
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowAIModal(false);
                    setAiAnalysis('');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {analyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-purple-600 mb-4" />
                  <p className="text-gray-600">Analizando registros con IA...</p>
                  <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos momentos</p>
                </div>
              ) : aiAnalysis ? (
                <div className="prose max-w-none">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4 border-l-4 border-purple-500">
                    <p className="text-sm text-gray-600 mb-0">
                      <strong>Registros analizados:</strong> {selectedOrders.length}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                      {aiAnalysis}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setShowAIModal(false);
                        setAiAnalysis('');
                        setSelectedOrders([]);
                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Doctor Copilot Modal */}
      {showCopilotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FaUserMd className="text-3xl text-purple-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Copiloto Médico - Resumen Pre-Consulta
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowCopilotModal(false);
                    setCopilotSummary(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {loadingCopilot ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-purple-600 mb-4" />
                  <p className="text-gray-600">Generando resumen pre-consulta...</p>
                </div>
              ) : copilotSummary ? (
                <div className="space-y-6">
                  {/* Summary */}
                  {copilotSummary.summary && (
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <h3 className="font-semibold text-gray-900 mb-2">Resumen Ejecutivo</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{copilotSummary.summary}</p>
                    </div>
                  )}

                  {/* Suggested Questions */}
                  {copilotSummary.suggestedQuestions && copilotSummary.suggestedQuestions.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FaLightbulb className="mr-2 text-purple-600" />
                        Preguntas Clínicas Sugeridas
                      </h3>
                      <ul className="space-y-2">
                        {copilotSummary.suggestedQuestions.map((question, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-purple-600 mr-2">•</span>
                            <span className="text-gray-700">{question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Points */}
                  {copilotSummary.keyPoints && copilotSummary.keyPoints.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                      <h3 className="font-semibold text-gray-900 mb-3">Puntos Clave a Revisar</h3>
                      <ul className="space-y-2">
                        {copilotSummary.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-yellow-600 mr-2">•</span>
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Clinical Timeline Modal */}
      {showTimelineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FaChartLine className="text-3xl text-green-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Línea de Tiempo Clínica
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowTimelineModal(false);
                    setClinicalTimeline(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {loadingTimeline ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-green-600 mb-4" />
                  <p className="text-gray-600">Analizando línea de tiempo...</p>
                </div>
              ) : clinicalTimeline ? (
                <div className="space-y-6">
                  {/* Alerts */}
                  {clinicalTimeline.alerts && clinicalTimeline.alerts.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Alertas Proactivas</h3>
                      <div className="space-y-2">
                        {clinicalTimeline.alerts.map((alert, index) => (
                          <div key={index} className={`p-3 rounded-lg border-l-4 ${
                            alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                            alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                            'bg-blue-50 border-blue-500'
                          }`}>
                            <p className="font-semibold">{alert.title}</p>
                            <p className="text-sm">{alert.message}</p>
                            {alert.recommendation && (
                              <p className="text-sm mt-2 text-gray-600">{alert.recommendation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  {clinicalTimeline.timeline && clinicalTimeline.timeline.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Línea de Tiempo</h3>
                      <div className="space-y-3">
                        {clinicalTimeline.timeline.map((event, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{event.title}</span>
                              <span className="text-sm text-gray-500">
                                {format(new Date(event.date), 'dd/MM/yyyy')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorRecords;
