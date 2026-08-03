import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import ModalShell from '../components/ui/ModalShell';
import { 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaSpinner, 
  FaEye, 
  FaSearch,
  FaUser,
  FaCalendarAlt,
  FaVideo,
  FaToggleOn,
  FaToggleOff,
  FaCog,
  FaChartLine,
  FaFlask,
  FaUserPlus,
  FaPercent,
  FaClipboardList,
  FaTrash,
  FaDownload,
  FaEnvelope,
  FaTag,
  FaEdit,
  FaPlus
} from 'react-icons/fa';
import { format } from 'date-fns';
import { getApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [approvalMode, setApprovalMode] = useState('auto');
  const [loadingMode, setLoadingMode] = useState(true);
  const [changingMode, setChangingMode] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [pendingDeleteOrderIds, setPendingDeleteOrderIds] = useState([]);
  const [showOtherEmailModal, setShowOtherEmailModal] = useState(false);
  const [otherEmailOrderId, setOtherEmailOrderId] = useState(null);
  const [otherEmailInput, setOtherEmailInput] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const [activeSection, setActiveSection] = useState('orders');
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountForm, setDiscountForm] = useState({
    code: '', description: '', discountType: 'percentage', discountValue: '',
    minOrderAmount: '', maxUsages: '', expiresAt: '', active: true
  });
  const [savingDiscount, setSavingDiscount] = useState(false);

  const fetchDiscountCodes = useCallback(async () => {
    try {
      setLoadingDiscounts(true);
      setDiscountError('');
      const response = await axios.get(getApiUrl('/api/admin/discount-codes'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiscountCodes(response.data.codes || []);
    } catch (err) {
      console.error('Error fetching discount codes:', err);
      setDiscountError('Error al cargar los códigos de descuento');
    } finally {
      setLoadingDiscounts(false);
    }
  }, [token]);

  const handleSaveDiscount = async () => {
    try {
      setSavingDiscount(true);
      setDiscountError('');
      const payload = {
        ...discountForm,
        discountValue: Number(discountForm.discountValue),
        minOrderAmount: Number(discountForm.minOrderAmount) || 0,
        maxUsages: discountForm.maxUsages ? Number(discountForm.maxUsages) : null,
        expiresAt: discountForm.expiresAt || null
      };
      if (editingDiscount) {
        await axios.put(getApiUrl(`/api/admin/discount-codes/${editingDiscount._id}`), payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Código actualizado correctamente');
      } else {
        await axios.post(getApiUrl('/api/admin/discount-codes'), payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Código creado correctamente');
      }
      setShowDiscountForm(false);
      setEditingDiscount(null);
      setDiscountForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUsages: '', expiresAt: '', active: true });
      await fetchDiscountCodes();
    } catch (err) {
      console.error('Error saving discount code:', err);
      setDiscountError(err.response?.data?.message || 'Error al guardar el código');
    } finally {
      setSavingDiscount(false);
    }
  };

  const handleDeleteDiscount = (id) => {
    setConfirmModal({
      title: 'Eliminar código',
      message: '¿Seguro que quieres eliminar este código de descuento?',
      confirmLabel: 'Eliminar',
      confirmClassName: 'bg-red-600 hover:bg-red-700',
      onConfirm: async () => {
        try {
          await axios.delete(getApiUrl(`/api/admin/discount-codes/${id}`), {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSuccessMessage('Código eliminado');
          await fetchDiscountCodes();
        } catch (err) {
          setDiscountError(err.response?.data?.message || 'Error al eliminar el código');
        }
      }
    });
  };

  const handleToggleDiscount = async (discount) => {
    try {
      await axios.put(getApiUrl(`/api/admin/discount-codes/${discount._id}`), { active: !discount.active }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchDiscountCodes();
    } catch (err) {
      setDiscountError('Error al cambiar el estado del código');
    }
  };

  const openEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setDiscountForm({
      code: discount.code,
      description: discount.description || '',
      discountType: discount.discountType,
      discountValue: String(discount.discountValue),
      minOrderAmount: String(discount.minOrderAmount || ''),
      maxUsages: discount.maxUsages !== null ? String(discount.maxUsages) : '',
      expiresAt: discount.expiresAt ? new Date(discount.expiresAt).toISOString().split('T')[0] : '',
      active: discount.active
    });
    setShowDiscountForm(true);
  };

  const fetchApprovalMode = useCallback(async () => {
    try {
      setLoadingMode(true);
      const response = await axios.get(getApiUrl('/api/admin/settings/approval-mode'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setApprovalMode(response.data.mode || 'auto');
    } catch (err) {
      console.error('Error fetching approval mode:', err);
      setApprovalMode('auto'); // Default to auto
    } finally {
      setLoadingMode(false);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const response = await axios.get(getApiUrl('/api/admin/stats'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [token]);

  const handleToggleApprovalMode = async () => {
    const newMode = approvalMode === 'auto' ? 'manual' : 'auto';
    setConfirmModal({
      title: `Cambiar a ${newMode === 'auto' ? 'Automático' : 'Manual'}`,
      message: newMode === 'auto'
        ? 'Las nuevas órdenes se aprobarán automáticamente.'
        : 'Las nuevas órdenes requerirán aprobación manual del administrador.',
      confirmLabel: 'Cambiar modo',
      confirmClassName: 'bg-blue-600 hover:bg-blue-700',
      onConfirm: async () => {
        setChangingMode(true);
        setError('');

        try {
          const response = await axios.put(
            getApiUrl('/api/admin/settings/approval-mode'),
            { mode: newMode },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          setApprovalMode(newMode);
          setSuccessMessage(response.data.message || 'Modo de aprobación actualizado correctamente');
        } catch (err) {
          console.error('Error updating approval mode:', err);
          setError(err.response?.data?.message || 'Error al actualizar el modo de aprobación');
        } finally {
          setChangingMode(false);
        }
      }
    });
  };

  const fetchOrders = useCallback(async () => {
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

      const response = await axios.get(getApiUrl('/api/admin/orders'), {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });

      setOrders(response.data.orders || []);
      setTotalPages(response.data.totalPages || 1);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response?.status === 403) {
        setError('No tienes permisos de administrador');
        navigate('/bitacora');
      } else {
        setError('Error al cargar las órdenes. Por favor recarga la página.');
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

    // Check if user is admin or superadmin
    if (!isAdmin) {
      navigate('/bitacora');
      return;
    }

    fetchOrders();
    fetchApprovalMode();
    fetchStats();
    fetchDiscountCodes();
  }, [fetchApprovalMode, fetchOrders, fetchStats, fetchDiscountCodes, isAdmin, navigate, token]);

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

  const handleApprove = async () => {
    if (selectedOrders.length === 0) {
      setError('Por favor selecciona al menos una orden');
      return;
    }

    setConfirmModal({
      title: 'Aprobar órdenes',
      message: `¿Estás seguro de aprobar ${selectedOrders.length} orden(es)?`,
      confirmLabel: 'Aprobar',
      confirmClassName: 'bg-green-600 hover:bg-green-700',
      onConfirm: async () => {
        setProcessing(true);
        setError('');

        try {
          const response = await axios.post(
            getApiUrl('/api/admin/orders/approve'),
            { orderIds: selectedOrders },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          setSuccessMessage(response.data.message || 'Órdenes aprobadas correctamente');
          setSelectedOrders([]);
          await fetchOrders();
        } catch (err) {
          console.error('Error approving orders:', err);
          setError(err.response?.data?.message || 'Error al aprobar las órdenes');
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  const handleReject = async () => {
    if (selectedOrders.length === 0) {
      setError('Por favor selecciona al menos una orden');
      return;
    }

    if (!rejectReason.trim()) {
      setError('Por favor proporciona una razón para el rechazo');
      return;
    }

    setConfirmModal({
      title: 'Rechazar órdenes',
      message: `¿Estás seguro de rechazar ${selectedOrders.length} orden(es)?`,
      confirmLabel: 'Rechazar',
      confirmClassName: 'bg-red-600 hover:bg-red-700',
      onConfirm: async () => {
        setProcessing(true);
        setError('');

        try {
          const response = await axios.post(
            getApiUrl('/api/admin/orders/reject'),
            { 
              orderIds: selectedOrders,
              reason: rejectReason
            },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          setSuccessMessage(response.data.message || 'Órdenes rechazadas correctamente');
          setSelectedOrders([]);
          setRejectReason('');
          setShowRejectModal(false);
          await fetchOrders();
        } catch (err) {
          console.error('Error rejecting orders:', err);
          setError(err.response?.data?.message || 'Error al rechazar las órdenes');
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  const handleDelete = async (orderIds = selectedOrders) => {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      setError('Por favor selecciona al menos una orden');
      return;
    }

    setPendingDeleteOrderIds(orderIds);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteOrders = async () => {
    const orderIds = pendingDeleteOrderIds;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      setShowDeleteConfirmModal(false);
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const response = await axios.post(
        getApiUrl('/api/admin/orders/delete'),
        { orderIds },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccessMessage(response.data.message || 'Órdenes borradas correctamente');
      setSelectedOrders((prev) => prev.filter((id) => !orderIds.includes(id)));
      if (selectedOrder && orderIds.includes(selectedOrder._id)) {
        setSelectedOrder(null);
        setShowOrderModal(false);
      }
      setPendingDeleteOrderIds([]);
      setShowDeleteConfirmModal(false);
      await fetchOrders();
    } catch (err) {
      console.error('Error deleting orders:', err);
      setError(err.response?.data?.message || 'Error al borrar las órdenes');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await axios.get(
        getApiUrl(`/api/admin/orders/${orderId}`),
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
      setError('Error al cargar los detalles de la orden');
    }
  };

  const handleDownloadOrderPdf = async (orderId) => {
    try {
      setProcessing(true);
      const response = await axios.get(
        getApiUrl(`/api/admin/orders/${orderId}/pdf-url`),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data?.url) {
        setError('No se pudo obtener la URL del PDF');
        return;
      }

      const isAbsolute = /^https?:\/\//i.test(response.data.url);
      const url = response.data.source === 'local' && !isAbsolute
        ? getApiUrl(response.data.url)
        : response.data.url;
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error downloading order PDF:', err);
      setError(err.response?.data?.message || 'Error al descargar el PDF de la orden');
    } finally {
      setProcessing(false);
    }
  };

  const handleResendOrderEmail = async (orderId) => {
    setConfirmModal({
      title: 'Reenviar correo',
      message: '¿Reenviar el correo de esta orden al usuario?',
      confirmLabel: 'Reenviar',
      confirmClassName: 'bg-indigo-600 hover:bg-indigo-700',
      onConfirm: async () => {
        try {
          setProcessing(true);
          const response = await axios.post(
            getApiUrl(`/api/admin/orders/${orderId}/resend-email`),
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          setSuccessMessage(response.data?.message || 'Correo reenviado correctamente');
          await fetchOrders();
        } catch (err) {
          console.error('Error resending order email:', err);
          setError(err.response?.data?.message || 'Error al reenviar correo de la orden');
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  const handleResendOrderEmailToOther = async (orderId) => {
    setOtherEmailOrderId(orderId);
    setOtherEmailInput('');
    setShowOtherEmailModal(true);
  };

  const submitResendOrderEmailToOther = async () => {
    if (!otherEmailOrderId) {
      return;
    }

    const cleanEmail = otherEmailInput.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!isValidEmail) {
      setError('El correo ingresado no es válido');
      return;
    }

    try {
      setProcessing(true);
      const response = await axios.post(
        getApiUrl(`/api/admin/orders/${otherEmailOrderId}/resend-email`),
        { targetEmail: cleanEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccessMessage(response.data?.message || `Correo reenviado correctamente a ${cleanEmail}`);
      setShowOtherEmailModal(false);
      setOtherEmailOrderId(null);
      setOtherEmailInput('');
      await fetchOrders();
    } catch (err) {
      console.error('Error resending order email to other recipient:', err);
      setError(err.response?.data?.message || 'Error al reenviar correo al destinatario indicado');
    } finally {
      setProcessing(false);
    }
  };

  const executeConfirmModal = async () => {
    if (!confirmModal?.onConfirm) {
      setConfirmModal(null);
      return;
    }

    const action = confirmModal.onConfirm;
    setConfirmModal(null);
    await action();
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
      const labels = value
        .map((item) => getExamLabel(item))
        .filter(Boolean);

      return labels.join(', ');
    }

    if (value && typeof value === 'object') {
      const directLabel =
        value.examName ||
        value.nombre ||
        value.name ||
        value.title ||
        value.label;

      if (typeof directLabel === 'string') {
        return directLabel;
      }

      if (Array.isArray(value.exams)) {
        return getExamLabel(value.exams);
      }

      // Last-resort fallback to avoid rendering [object Object]
      const firstPrimitive = Object.values(value).find(
        (item) => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
      );
      if (firstPrimitive !== undefined) {
        return String(firstPrimitive);
      }
    }

    return '';
  };

  const getDisplayExamLabel = (value) => {
    const normalized = getExamLabel(value);
    return normalized || 'N/A';
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

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Administración
          </h1>
          <p className="text-xl text-gray-600">
            Panel de administración del sistema
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-xl shadow-lg p-1 mb-8 max-w-sm">
          <button
            onClick={() => setActiveSection('orders')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition ${
              activeSection === 'orders'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaClipboardList className="mr-2" />
            Órdenes
          </button>
          <button
            onClick={() => setActiveSection('discounts')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition ${
              activeSection === 'discounts'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaTag className="mr-2" />
            Descuentos
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Accesos rápidos de prueba</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/calendario')}
              className="px-4 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition flex items-center"
            >
              <FaCalendarAlt className="mr-2" />
              Ir a Calendario
            </button>
            <button
              onClick={() => navigate('/telemedicina')}
              className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition flex items-center"
            >
              <FaVideo className="mr-2" />
              Ir a Telemedicina
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* ── ORDERS SECTION ─────────────────────────────── */}
        {activeSection === 'orders' && (
          <>

        {/* KPI Cards */}
        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            {/* KPI 1: Órdenes Hoy vs Promedio Móvil */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Órdenes Hoy</h3>
                <FaChartLine className="text-2xl text-blue-500" />
              </div>
              <div className="mb-2">
                <p className="text-3xl font-bold text-gray-900">{stats.ordersToday}</p>
                <p className="text-xs text-gray-500 mt-1">Promedio 30 días: {stats.movingAverage30Days}</p>
              </div>
              <div className={`flex items-center text-sm ${
                stats.ordersTodayVsAverage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.ordersTodayVsAverage >= 0 ? '↑' : '↓'} {Math.abs(stats.ordersTodayVsAverage)}%
                <span className="ml-2 text-gray-500">vs promedio</span>
              </div>
            </div>

            {/* KPI 2: Exámenes Más Pedidos */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Top Examen</h3>
                <FaFlask className="text-2xl text-purple-500" />
              </div>
              <div className="mb-2">
                <p className="text-lg font-bold text-gray-900 truncate">
                  {stats.topExams && stats.topExams.length > 0 ? getDisplayExamLabel(stats.topExams[0].examName) : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.topExams && stats.topExams.length > 0 ? `${stats.topExams[0].count} pedidos` : 'Sin datos'}
                </p>
              </div>
              <div className="text-xs text-gray-500">
                {stats.topExams && stats.topExams.length > 1 && (
                  <span>Top 5 exámenes disponibles</span>
                )}
              </div>
            </div>

            {/* KPI 3: Órdenes Pendientes */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Pendientes</h3>
                <FaClock className="text-2xl text-yellow-500" />
              </div>
              <div className="mb-2">
                <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Órdenes en espera</p>
              </div>
              <div className="text-sm text-gray-500">
                {stats.processingOrders > 0 && (
                  <span>{stats.processingOrders} en proceso</span>
                )}
              </div>
            </div>

            {/* KPI 4: Usuarios Nuevos Hoy */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Nuevos Usuarios</h3>
                <FaUserPlus className="text-2xl text-green-500" />
              </div>
              <div className="mb-2">
                <p className="text-3xl font-bold text-gray-900">{stats.newUsersToday}</p>
                <p className="text-xs text-gray-500 mt-1">Registrados hoy</p>
              </div>
              <div className="text-sm text-gray-500">
                Total: {stats.totalOrders || 0} órdenes
              </div>
            </div>

            {/* KPI 5: Tasa de Aprobación */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Tasa Aprobación</h3>
                <FaPercent className="text-2xl text-indigo-500" />
              </div>
              <div className="mb-2">
                <p className="text-3xl font-bold text-gray-900">{stats.approvalRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.completedOrders} de {stats.totalOrders} completadas
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.approvalRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Top 5 Exámenes Detallados */}
        {stats && stats.topExams && stats.topExams.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <FaClipboardList className="text-xl text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Top 5 Exámenes Más Pedidos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {stats.topExams.map((exam, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">#{index + 1}</span>
                    <span className="text-lg font-bold text-purple-600">{exam.count}</span>
                  </div>
                  <p className="text-sm text-gray-900 truncate" title={getDisplayExamLabel(exam.examName)}>
                    {getDisplayExamLabel(exam.examName)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approval Mode Toggle */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaCog className="text-2xl text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Modo de Aprobación</h3>
                <p className="text-sm text-gray-600">
                  {approvalMode === 'auto' 
                    ? 'Las órdenes se aprueban automáticamente al crearse'
                    : 'Las órdenes requieren aprobación manual del administrador'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-sm font-semibold ${
                  approvalMode === 'auto' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {approvalMode === 'auto' ? 'AUTOMÁTICO' : 'MANUAL'}
                </div>
                <div className="text-xs text-gray-500">
                  {loadingMode ? 'Cargando...' : 'Modo actual'}
                </div>
              </div>
              <button
                onClick={handleToggleApprovalMode}
                disabled={changingMode || loadingMode}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  approvalMode === 'auto' 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                } ${changingMode || loadingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    approvalMode === 'auto' ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              {approvalMode === 'auto' ? (
                <FaToggleOn className="text-3xl text-green-600" />
              ) : (
                <FaToggleOff className="text-3xl text-gray-400" />
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-start space-x-2 text-xs text-gray-600">
              <div className={`flex-1 p-2 rounded ${
                approvalMode === 'auto' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <strong className="block mb-1">Modo Automático:</strong>
                <span>Las órdenes médicas se aprueban automáticamente cuando son creadas por los usuarios.</span>
              </div>
              <div className={`flex-1 p-2 rounded ${
                approvalMode === 'manual' 
                  ? 'bg-orange-50 border border-orange-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <strong className="block mb-1">Modo Manual:</strong>
                <span>Las órdenes médicas quedan pendientes hasta que un administrador las apruebe o rechace.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email del usuario..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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

        {/* Action Buttons */}
        {selectedOrders.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex items-center justify-between">
            <div className="text-gray-700">
              <strong>{selectedOrders.length}</strong> orden(es) seleccionada(s)
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleApprove}
                disabled={processing}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center disabled:opacity-50"
              >
                <FaCheck className="mr-2" />
                Aprobar
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={processing}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center disabled:opacity-50"
              >
                <FaTimes className="mr-2" />
                Rechazar
              </button>
              <button
                onClick={() => handleDelete(selectedOrders)}
                disabled={processing}
                className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition flex items-center disabled:opacity-50"
              >
                <FaTrash className="mr-2" />
                Borrar
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
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
                    Usuario
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
                    Aprobado Por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No se encontraron órdenes
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
                            <div className="text-sm text-gray-500">
                              {order.userId?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getOrderExamDisplay(order)}
                        </div>
                        {Array.isArray(order?.cartItems) && order.cartItems.some((item) => String(item?.pricingType || '').toLowerCase() === 'pack') ? (
                          <div className="text-xs text-gray-500">
                            Aprobación por orden completa del pack
                          </div>
                        ) : order.exams && order.exams.length > 0 && (
                          <div className="text-xs text-gray-500">
                            {order.exams.length} examen(es)
                          </div>
                        )}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.approvedBy ? (
                          <div>
                            <div className="font-medium">{order.approvedBy?.name || 'N/A'}</div>
                            {order.approvedAt && (
                              <div className="text-xs">
                                {format(new Date(order.approvedAt), 'dd/MM/yyyy')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleViewOrder(order._id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <FaEye className="mr-1" />
                            Ver Detalles
                          </button>
                          <button
                            onClick={() => handleDownloadOrderPdf(order._id)}
                            disabled={processing}
                            className="text-emerald-700 hover:text-emerald-900 flex items-center disabled:opacity-50"
                            title="Descargar PDF"
                          >
                            <FaDownload className="mr-1" />
                            PDF
                          </button>
                          <button
                            onClick={() => handleResendOrderEmail(order._id)}
                            disabled={processing}
                            className="text-indigo-700 hover:text-indigo-900 flex items-center disabled:opacity-50"
                            title="Reenviar correo"
                          >
                            <FaEnvelope className="mr-1" />
                            Reenviar correo
                          </button>
                          <button
                            onClick={() => handleResendOrderEmailToOther(order._id)}
                            disabled={processing}
                            className="text-violet-700 hover:text-violet-900 flex items-center disabled:opacity-50"
                            title="Reenviar a otro correo"
                          >
                            <FaEnvelope className="mr-1" />
                            Reenviar a otro correo
                          </button>
                          <button
                            onClick={() => handleDelete([order._id])}
                            disabled={processing}
                            className="text-gray-700 hover:text-black flex items-center disabled:opacity-50"
                            title="Borrar orden"
                          >
                            <FaTrash className="mr-1" />
                            Borrar
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

          </> /* end orders section */
        )}

        {/* ── DISCOUNTS SECTION ──────────────────────────── */}
        {activeSection === 'discounts' && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Códigos de Descuento</h2>
                <p className="text-gray-600 text-sm mt-1">Crea y gestiona códigos que los compradores pueden aplicar en el carrito</p>
              </div>
              <button
                onClick={() => {
                  setEditingDiscount(null);
                  setDiscountForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUsages: '', expiresAt: '', active: true });
                  setShowDiscountForm(true);
                }}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition"
              >
                <FaPlus className="mr-2" />
                Nuevo Código
              </button>
            </div>

            {discountError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {discountError}
              </div>
            )}

            {/* Create/Edit Form */}
            {showDiscountForm && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingDiscount ? 'Editar Código' : 'Crear Nuevo Código'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                    <input
                      type="text"
                      value={discountForm.code}
                      onChange={(e) => setDiscountForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      disabled={!!editingDiscount}
                      placeholder="ej: VERANO20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <input
                      type="text"
                      value={discountForm.description}
                      onChange={(e) => setDiscountForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="ej: Descuento de verano"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Descuento *</label>
                    <select
                      value={discountForm.discountType}
                      onChange={(e) => setDiscountForm(f => ({ ...f, discountType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Monto Fijo (CLP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor * {discountForm.discountType === 'percentage' ? '(%)' : '($CLP)'}
                    </label>
                    <input
                      type="number"
                      value={discountForm.discountValue}
                      onChange={(e) => setDiscountForm(f => ({ ...f, discountValue: e.target.value }))}
                      placeholder={discountForm.discountType === 'percentage' ? 'ej: 20' : 'ej: 5990'}
                      min="1"
                      max={discountForm.discountType === 'percentage' ? '100' : undefined}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Mínimo ($CLP)</label>
                    <input
                      type="number"
                      value={discountForm.minOrderAmount}
                      onChange={(e) => setDiscountForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                      placeholder="0 = sin mínimo"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usos Máximos</label>
                    <input
                      type="number"
                      value={discountForm.maxUsages}
                      onChange={(e) => setDiscountForm(f => ({ ...f, maxUsages: e.target.value }))}
                      placeholder="Vacío = ilimitado"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Expiración</label>
                    <input
                      type="date"
                      value={discountForm.expiresAt}
                      onChange={(e) => setDiscountForm(f => ({ ...f, expiresAt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {editingDiscount && (
                    <div className="flex items-center space-x-3 mt-2">
                      <label className="text-sm font-medium text-gray-700">Activo:</label>
                      <button
                        type="button"
                        onClick={() => setDiscountForm(f => ({ ...f, active: !f.active }))}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${discountForm.active ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${discountForm.active ? 'translate-x-8' : 'translate-x-1'}`} />
                      </button>
                      <span className={`text-sm font-medium ${discountForm.active ? 'text-green-600' : 'text-gray-500'}`}>
                        {discountForm.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowDiscountForm(false);
                      setEditingDiscount(null);
                      setDiscountError('');
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveDiscount}
                    disabled={savingDiscount || !discountForm.code || !discountForm.discountValue}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 flex items-center"
                  >
                    {savingDiscount ? <><FaSpinner className="animate-spin mr-2" />Guardando...</> : (editingDiscount ? 'Actualizar' : 'Crear Código')}
                  </button>
                </div>
              </div>
            )}

            {/* Codes Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {loadingDiscounts ? (
                <div className="p-12 text-center">
                  <FaSpinner className="animate-spin text-blue-600 text-3xl mx-auto mb-3" />
                  <p className="text-gray-500">Cargando códigos...</p>
                </div>
              ) : discountCodes.length === 0 ? (
                <div className="p-12 text-center">
                  <FaTag className="text-gray-300 text-5xl mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay códigos de descuento</h3>
                  <p className="text-gray-500 text-sm">Crea tu primer código de descuento usando el botón "Nuevo Código"</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {discountCodes.map((dc) => (
                        <tr key={dc._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded text-sm">{dc.code}</span>
                              {dc.description && <p className="text-xs text-gray-500 mt-1">{dc.description}</p>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {dc.discountType === 'percentage'
                              ? <span className="font-semibold text-green-700">{dc.discountValue}% off</span>
                              : <span className="font-semibold text-green-700">${dc.discountValue.toLocaleString('es-CL')} off</span>
                            }
                            {dc.minOrderAmount > 0 && (
                              <p className="text-xs text-gray-500">Mín: ${dc.minOrderAmount.toLocaleString('es-CL')}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {dc.usedCount}
                            {dc.maxUsages !== null ? ` / ${dc.maxUsages}` : ' / ∞'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {dc.expiresAt ? format(new Date(dc.expiresAt), 'dd/MM/yyyy') : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => handleToggleDiscount(dc)} className="focus:outline-none">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${dc.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {dc.active ? 'Activo' : 'Inactivo'}
                              </span>
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openEditDiscount(dc)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Editar"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteDiscount(dc._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Eliminar"
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
              )}
            </div>
          </div>
        )}

      </div>
      <SaludSimpleFooter />

      {/* Reject Modal */}
      {showRejectModal && (
        <ModalShell
          isOpen
          onClose={() => {
            setShowRejectModal(false);
            setRejectReason('');
          }}
          title="Rechazar orden(es)"
          description={`Estás a punto de rechazar ${selectedOrders.length} orden(es). Por favor proporciona una razón para el rechazo:`}
          icon={<FaTimes className="text-lg" />}
          iconClassName="bg-red-100 text-red-600"
          widthClassName="max-w-md"
          footer={(
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          )}
        >
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Razón del rechazo..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              />
        </ModalShell>
      )}

      {/* Order Details Modal */}
      {selectedOrder && showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles de la Orden
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

              {/* Order Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Usuario</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nombre:</strong> {selectedOrder.userId?.name || 'N/A'}</div>
                    <div><strong>Email:</strong> {selectedOrder.userId?.email || 'N/A'}</div>
                    <div><strong>Teléfono:</strong> {selectedOrder.userId?.phone || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de la Orden</h3>
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
                        <li key={idx} className="text-sm">{getDisplayExamLabel(exam)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">{getDisplayExamLabel(selectedOrder.examName)}</p>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <ModalShell
          isOpen
          onClose={() => {
            setShowDeleteConfirmModal(false);
            setPendingDeleteOrderIds([]);
          }}
          title="Confirmar borrado"
          description={`¿Seguro que quieres borrar ${pendingDeleteOrderIds.length} orden(es)? Esta acción no se puede deshacer.`}
          icon={<FaTrash className="text-lg" />}
          iconClassName="bg-red-100 text-red-600"
          footer={(
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setPendingDeleteOrderIds([]);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition"
                disabled={processing}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteOrders}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                disabled={processing}
              >
                {processing ? 'Borrando...' : 'Sí, borrar'}
              </button>
            </div>
          )}
        />
      )}

      {/* Resend to Other Email Modal */}
      {showOtherEmailModal && (
        <ModalShell
          isOpen
          onClose={() => {
            setShowOtherEmailModal(false);
            setOtherEmailOrderId(null);
            setOtherEmailInput('');
          }}
          title="Reenviar a otro correo"
          description="Ingresa el correo destino (ej: centro medico)."
          icon={<FaEnvelope className="text-lg" />}
          iconClassName="bg-violet-100 text-violet-600"
          footer={(
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOtherEmailModal(false);
                  setOtherEmailOrderId(null);
                  setOtherEmailInput('');
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition"
                disabled={processing}
              >
                Cancelar
              </button>
              <button
                onClick={submitResendOrderEmailToOther}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                disabled={processing}
              >
                {processing ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          )}
        >
          <input
            type="email"
            value={otherEmailInput}
            onChange={(e) => setOtherEmailInput(e.target.value)}
            placeholder="destino@centromedico.cl"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </ModalShell>
      )}

      {/* Generic Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mr-3">
                <FaCog className="text-lg" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{confirmModal.title}</h3>
            </div>
            <p className="text-slate-600 mb-6 leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={executeConfirmModal}
                className={`flex-1 text-white px-4 py-2.5 rounded-xl transition disabled:opacity-50 ${confirmModal.confirmClassName || 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={processing}
              >
                {confirmModal.confirmLabel || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successMessage && (
        <ModalShell
          isOpen
          onClose={() => setSuccessMessage('')}
          title="Operación completada"
          description={successMessage}
          icon={<FaCheck className="text-lg" />}
          iconClassName="bg-emerald-100 text-emerald-700"
          footer={(
            <button
              onClick={() => setSuccessMessage('')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition"
            >
              Entendido
            </button>
          )}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
