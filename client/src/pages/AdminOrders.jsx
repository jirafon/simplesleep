import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { 
  FaShieldAlt, FaFileMedical, FaCheck, FaTimes, FaClock, FaUser, 
  FaCalendarAlt, FaSearch, FaFilter, FaSpinner, FaToggleOn, FaToggleOff,
  FaCheckSquare, FaSquare, FaDownload, FaEye, FaTrash
} from 'react-icons/fa';
import { format } from 'date-fns';
import { getApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

function AdminOrders() {
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvalMode, setApprovalMode] = useState('auto');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    if (!isAdmin) {
      setError('Acceso denegado. Se requieren permisos de administrador.');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    fetchApprovalMode();
    fetchOrders();
  }, [navigate, currentPage, filterStatus]);

  const fetchApprovalMode = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/admin/settings/approval-mode'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApprovalMode(response.data.mode);
    } catch (err) {
      console.error('Error fetching approval mode:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 50
      };
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await axios.get(getApiUrl('/api/admin/orders'), {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setOrders(response.data.orders || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response?.status === 403) {
        setError('Acceso denegado. Se requieren permisos de administrador.');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setError('Error al cargar las órdenes. Por favor recarga la página.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleApprovalMode = async () => {
    try {
      setProcessing(true);
      const newMode = approvalMode === 'auto' ? 'manual' : 'auto';
      
      await axios.put(
        getApiUrl('/api/admin/settings/approval-mode'),
        { mode: newMode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApprovalMode(newMode);
    } catch (err) {
      console.error('Error updating approval mode:', err);
      setError('Error al actualizar el modo de aprobación');
    } finally {
      setProcessing(false);
    }
  };

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

  const handleApprove = async (orderIds) => {
    const selectedRows = orders.filter((order) => orderIds.includes(order._id));
    const packCount = selectedRows.filter((order) => Array.isArray(order?.cartItems)
      && order.cartItems.some((item) => String(item?.pricingType || '').toLowerCase() === 'pack')).length;
    const customCount = selectedRows.length - packCount;

    let confirmMessage = `¿Aprobar ${orderIds.length} orden(es)?`;
    if (packCount > 0 && customCount === 0) {
      confirmMessage = orderIds.length === 1
        ? '¿Aprobar este pack completo?'
        : `¿Aprobar ${orderIds.length} pack(s) completos?`;
    } else if (customCount > 0 && packCount === 0) {
      confirmMessage = orderIds.length === 1
        ? '¿Aprobar esta orden personalizada?'
        : `¿Aprobar ${orderIds.length} órdenes personalizadas?`;
    } else if (packCount > 0 && customCount > 0) {
      confirmMessage = `¿Aprobar selección mixta (${packCount} pack(s) y ${customCount} orden(es) personalizada(s))?`;
    }

    if (!window.confirm(confirmMessage)) return;

    try {
      setProcessing(true);
      await axios.post(
        getApiUrl('/api/admin/orders/approve'),
        { orderIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedOrders([]);
      await fetchOrders();
    } catch (err) {
      console.error('Error approving orders:', err);
      setError(err.response?.data?.message || 'Error al aprobar las órdenes');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (orderIds) => {
    const reason = window.prompt('Motivo del rechazo (opcional):');
    if (reason === null) return; // User cancelled

    if (!window.confirm(`¿Rechazar ${orderIds.length} orden(es)?`)) return;

    try {
      setProcessing(true);
      await axios.post(
        getApiUrl('/api/admin/orders/reject'),
        { orderIds, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedOrders([]);
      await fetchOrders();
    } catch (err) {
      console.error('Error rejecting orders:', err);
      setError(err.response?.data?.message || 'Error al rechazar las órdenes');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (orderIds) => {
    if (!window.confirm(`¿Eliminar ${orderIds.length} orden(es)? Esta acción no se puede deshacer.`)) return;

    try {
      setProcessing(true);
      await axios.post(
        getApiUrl('/api/admin/orders/delete'),
        { orderIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedOrders((prev) => prev.filter((id) => !orderIds.includes(id)));
      if (showOrderDetail && orderIds.includes(showOrderDetail._id)) {
        setShowOrderDetail(null);
      }
      await fetchOrders();
    } catch (err) {
      console.error('Error deleting orders:', err);
      setError(err.response?.data?.message || 'Error al eliminar las órdenes');
    } finally {
      setProcessing(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const response = await axios.get(getApiUrl(`/api/admin/orders/${orderId}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowOrderDetail(response.data);
    } catch (err) {
      console.error('Error fetching order detail:', err);
      setError('Error al cargar los detalles de la orden');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      processing: 'En Proceso',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  };

  const getExamLabel = (value) => {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => getExamLabel(item))
        .filter(Boolean)
        .join(', ');
    }

    if (value && typeof value === 'object') {
      const label = value.examName || value.nombre || value.name || value.title || value.label;
      if (typeof label === 'string') {
        return label;
      }

      if (Array.isArray(value.exams)) {
        return getExamLabel(value.exams);
      }

      const firstPrimitive = Object.values(value).find(
        (item) => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
      );
      if (firstPrimitive !== undefined) {
        return String(firstPrimitive);
      }
    }

    return '';
  };

  const getDisplayExamLabel = (value) => getExamLabel(value) || 'N/A';

  const isPackOrder = (order) => {
    return Array.isArray(order?.cartItems)
      && order.cartItems.some((item) => String(item?.pricingType || '').toLowerCase() === 'pack');
  };

  const getOrderExamDisplay = (order) => {
    const packItems = Array.isArray(order?.cartItems)
      ? order.cartItems.filter((item) => String(item?.pricingType || '').toLowerCase() === 'pack')
      : [];

    if (packItems.length > 0) {
      const packNames = packItems.map((item) => getDisplayExamLabel(item?.name)).filter((name) => name && name !== 'N/A');
      if (packNames.length === 1) {
        return `Pack: ${packNames[0]}`;
      }
      if (packNames.length > 1) {
        return `Packs: ${packNames[0]} +${packNames.length - 1} más`;
      }
      return `Pack (${packItems.length})`;
    }

    if (Array.isArray(order?.exams) && order.exams.length > 0) {
      const firstExam = getDisplayExamLabel(order.exams[0]);
      if (order.exams.length === 1) {
        return firstExam;
      }

      return `${firstExam} +${order.exams.length - 1} más`;
    }

    return getDisplayExamLabel(order?.examName);
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const userName = order.userId?.name?.toLowerCase() || '';
      const userEmail = order.userId?.email?.toLowerCase() || '';
      const examName = getDisplayExamLabel(order.examName).toLowerCase();
      return userName.includes(searchLower) || 
             userEmail.includes(searchLower) || 
             examName.includes(searchLower) ||
             order._id.toString().includes(searchLower);
    }
    return true;
  });

  const selectedOrderRows = orders.filter((order) => selectedOrders.includes(order._id));
  const selectedPackCount = selectedOrderRows.filter((order) => isPackOrder(order)).length;
  const selectedCustomCount = selectedOrderRows.length - selectedPackCount;

  let approveSelectionLabel = 'Aprobar selección';
  if (selectedOrders.length > 0) {
    if (selectedPackCount > 0 && selectedCustomCount === 0) {
      approveSelectionLabel = selectedOrders.length === 1 ? 'Aprobar pack' : 'Aprobar packs';
    } else if (selectedCustomCount > 0 && selectedPackCount === 0) {
      approveSelectionLabel = selectedOrders.length === 1 ? 'Aprobar orden' : 'Aprobar órdenes';
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando órdenes...</p>
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <FaShieldAlt className="mr-3 text-red-600" />
                Panel de Administración
              </h1>
              <p className="text-xl text-gray-600">
                Gestión de órdenes médicas
              </p>
            </div>
          </div>

          {/* Approval Mode Toggle */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Modo de Aprobación
                </h3>
                <p className="text-sm text-gray-600">
                  {approvalMode === 'auto' 
                    ? 'Las órdenes se aprueban automáticamente al crearse'
                    : 'Las órdenes requieren aprobación manual del administrador'}
                </p>
              </div>
              <button
                onClick={toggleApprovalMode}
                disabled={processing}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${
                  approvalMode === 'auto'
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                } disabled:opacity-50`}
              >
                {approvalMode === 'auto' ? (
                  <>
                    <FaToggleOn className="text-2xl" />
                    <span>Automática</span>
                  </>
                ) : (
                  <>
                    <FaToggleOff className="text-2xl" />
                    <span>Manual</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterStatus === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterStatus === 'pending'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pendientes
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterStatus === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Completadas
                </button>
              </div>
            </div>
          </div>

          {/* Batch Actions */}
          {selectedOrders.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <span className="text-blue-800 font-semibold">
                {selectedOrders.length} orden(es) seleccionada(s)
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApprove(selectedOrders)}
                  disabled={processing}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center space-x-2"
                >
                  <FaCheck />
                  <span>{approveSelectionLabel}</span>
                </button>
                <button
                  onClick={() => handleReject(selectedOrders)}
                  disabled={processing}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center space-x-2"
                >
                  <FaTimes />
                  <span>Rechazar</span>
                </button>
                <button
                  onClick={() => handleDelete(selectedOrders)}
                  disabled={processing}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition disabled:opacity-50 flex items-center space-x-2"
                >
                  <FaTrash />
                  <span>Borrar</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={handleSelectAll}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {selectedOrders.length === filteredOrders.length && filteredOrders.length > 0 ? (
                        <FaCheckSquare className="text-blue-600" />
                      ) : (
                        <FaSquare />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID / Referencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exámenes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleSelectOrder(order._id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {selectedOrders.includes(order._id) ? (
                          <FaCheckSquare className="text-blue-600" />
                        ) : (
                          <FaSquare />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {order._id.toString().slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.userId?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.userId?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {Array.isArray(order.exams) && order.exams.length > 0
                          ? getOrderExamDisplay(order)
                          : getDisplayExamLabel(order.examName)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {isPackOrder(order) ? 'Tipo: Pack' : 'Tipo: Orden personalizada'}
                      </div>
                      {Array.isArray(order?.cartItems) && order.cartItems.some((item) => String(item?.pricingType || '').toLowerCase() === 'pack') ? (
                        <div className="text-xs text-gray-500 mt-1">Aprobación por orden completa del pack</div>
                      ) : Array.isArray(order.exams) && order.exams.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {order.exams.slice(0, 2).map((exam) => getDisplayExamLabel(exam)).join(', ')}
                          {order.exams.length > 2 && ` +${order.exams.length - 2} más`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(order.createdAt), 'dd/MM/yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(order.createdAt), 'HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => fetchOrderDetail(order._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <FaEye />
                        </button>
                        {order.pdfLink && (
                          <a
                            href={getApiUrl(order.pdfLink)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900"
                            title="Descargar PDF"
                          >
                            <FaDownload />
                          </a>
                        )}
                        {order.status === 'pending' && approvalMode === 'manual' && (
                          <>
                            <button
                              onClick={() => handleApprove([order._id])}
                              disabled={processing}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title={isPackOrder(order) ? 'Aprobar pack completo' : 'Aprobar orden personalizada'}
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleReject([order._id])}
                              disabled={processing}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Rechazar"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete([order._id])}
                          disabled={processing}
                          className="text-gray-700 hover:text-black disabled:opacity-50"
                          title="Borrar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <FaFileMedical className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No hay órdenes que coincidan con los filtros</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-4 py-2">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Detalles de la Orden</h2>
                <button
                  onClick={() => setShowOrderDetail(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Información del Paciente</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p><strong>Nombre:</strong> {showOrderDetail.userId?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {showOrderDetail.userId?.email || 'N/A'}</p>
                    <p><strong>Teléfono:</strong> {showOrderDetail.userId?.phone || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Exámenes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {Array.isArray(showOrderDetail?.cartItems) && showOrderDetail.cartItems.some((item) => String(item?.pricingType || '').toLowerCase() === 'pack') ? (
                      <div>
                        <p className="text-sm font-semibold text-gray-800 mb-2">Packs incluidos</p>
                        <ul className="list-disc list-inside">
                          {showOrderDetail.cartItems
                            .filter((item) => String(item?.pricingType || '').toLowerCase() === 'pack')
                            .map((item, idx) => (
                              <li key={idx}>{getDisplayExamLabel(item?.name)}</li>
                            ))}
                        </ul>
                        <p className="text-xs text-gray-500 mt-2">La aprobación aplica a toda la orden del pack.</p>
                      </div>
                    ) : Array.isArray(showOrderDetail.exams) && showOrderDetail.exams.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {showOrderDetail.exams.map((exam, idx) => (
                          <li key={idx}>{getDisplayExamLabel(exam)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{getDisplayExamLabel(showOrderDetail.examName)}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Log de Registro</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {showOrderDetail.logs && showOrderDetail.logs.length > 0 ? (
                      showOrderDetail.logs.map((log, idx) => (
                        <div key={idx} className="border-b border-gray-200 pb-2 last:border-0">
                          <div className="flex justify-between">
                            <span className="font-semibold">{log.action}</span>
                            <span className="text-sm text-gray-500">
                              {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Por: {log.performedByName || 'Sistema'}
                          </p>
                          {log.previousStatus && (
                            <p className="text-xs text-gray-500">
                              {log.previousStatus} → {log.newStatus}
                            </p>
                          )}
                          {log.notes && (
                            <p className="text-xs text-gray-500 mt-1">{log.notes}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No hay registros de log</p>
                    )}
                  </div>
                </div>

                {showOrderDetail.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Notas</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p>{showOrderDetail.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <SaludSimpleFooter />
    </div>
  );
}

export default AdminOrders;
