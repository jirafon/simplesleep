import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import ModalShell from '../components/ui/ModalShell';
import { FaFileMedical, FaDownload, FaClock, FaFlask, FaStethoscope, FaUserMd, FaFileSignature, FaUser, FaFile, FaImage, FaTrash, FaEnvelope, FaCheck, FaPaperPlane, FaShareAlt, FaEnvelopeOpenText, FaExternalLinkAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import { getApiUrl } from '../config/api';
import { getCookie, removeCookie } from '../utils/cookies';

function Bitacora() {
  const navigate = useNavigate();
  const [bitacora, setBitacora] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormType, setAddFormType] = useState(null);
  const [addFormData, setAddFormData] = useState({
    title: '',
    description: '',
    status: 'completed',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [adding, setAdding] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null); // null = todos, o 'exam', 'control', etc.
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showResendConfirmModal, setShowResendConfirmModal] = useState(false);
  const [showOtherEmailModal, setShowOtherEmailModal] = useState(false);
  const [selectedOrderForEmail, setSelectedOrderForEmail] = useState(null);
  const [otherEmailInput, setOtherEmailInput] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  const normalizeEntryId = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      if (typeof value._id === 'string') return value._id;
      if (typeof value.$oid === 'string') return value.$oid;
      if (typeof value.toString === 'function') return value.toString();
    }
    return String(value);
  };

  const fetchBitacora = useCallback(async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        setError('No hay sesión activa. Por favor inicia sesión.');
        setLoading(false);
        navigate('/login');
        return;
      }

      const apiUrl = getApiUrl('/api/user/bitacora');
      console.log('Fetching bitácora from:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Bitácora response:', response.data);
      setBitacora(response.data.bitacora || []);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching bitácora:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });

      if (err.response?.status === 401) {
        setError('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        removeCookie('token');
        removeCookie('user');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 500) {
        setError('Error del servidor al cargar la bitácora. Por favor intenta más tarde.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al cargar la bitácora. Por favor recarga la página.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Delete a specific bitácora entry
  const deleteEntry = async (entryId) => {
    const normalizedEntryId = normalizeEntryId(entryId);
    if (!normalizedEntryId) {
      setError('No se pudo identificar el registro a eliminar');
      return;
    }

    setDeleting(true);
    try {
      const token = getCookie('token');
      const apiUrl = getApiUrl(`/api/user/bitacora/${normalizedEntryId}`);
      
      const response = await axios.delete(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Remove the entry from local state
        setBitacora(bitacora.filter(entry => normalizeEntryId(entry._id) !== normalizedEntryId));
        setError('');
        setSuccessMessage('Registro eliminado exitosamente');
      } else {
        setError('Error al eliminar el registro');
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Error al eliminar el registro: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteEntryId(null);
    }
  };

  // Delete all bitácora entries
  const deleteAllEntries = async () => {
    setDeleting(true);
    try {
      const token = getCookie('token');
      const apiUrl = getApiUrl('/api/user/bitacora');
      
      const response = await axios.delete(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setBitacora([]);
        setError('');
        setSuccessMessage(`Se eliminaron ${response.data.deletedCount} registros de la bitácora`);
      } else {
        setError('Error al eliminar todos los registros');
      }
    } catch (err) {
      console.error('Error deleting all entries:', err);
      setError('Error al eliminar registros: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
      setShowDeleteAllConfirm(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (entryId) => {
    const normalizedEntryId = normalizeEntryId(entryId);
    if (!normalizedEntryId) {
      setError('No se pudo identificar el registro a eliminar');
      return;
    }
    setDeleteEntryId(normalizedEntryId);
    setShowDeleteConfirm(true);
  };

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchBitacora();
  }, [fetchBitacora, navigate]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      scheduled: 'bg-purple-100 text-purple-800',
      signed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      processing: 'En Proceso',
      completed: 'Completado',
      cancelled: 'Cancelado',
      scheduled: 'Programado',
      signed: 'Firmado'
    };

    return labels[status] || (status ? String(status) : 'N/A');
  };

  const getOrderTypeLabel = (orderOrType) => {
    const order = orderOrType && typeof orderOrType === 'object' ? orderOrType : null;

    const hasPackItems = Array.isArray(order?.cartItems)
      && order.cartItems.some((item) => String(item?.pricingType || '').toLowerCase() === 'pack');

    if (hasPackItems) {
      return 'Pack';
    }

    const orderType = order?.type ?? orderOrType;
    const normalizedType = String(orderType || '').toLowerCase();

    const labels = {
      custom: 'Personalizada',
      pap: 'PAP',
      thyroid: 'Tiroides',
      hypertension: 'Hipertensión',
      mammography: 'Mamografía'
    };

    return labels[normalizedType] || (orderType ? String(orderType) : 'N/A');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Filter to only allow PDFs and images
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      setError('Algunos archivos no son válidos. Solo se permiten PDFs e imágenes.');
    }
    
    // Limit to 5 files max
    const filesToAdd = validFiles.slice(0, 5 - selectedFiles.length);
    setSelectedFiles([...selectedFiles, ...filesToAdd]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    if (!addFormData.title.trim()) {
      setError('El título es requerido');
      return;
    }

    setAdding(true);
    setError('');

    try {
      const token = getCookie('token');
      const endpoint = `/api/user/bitacora/${addFormType}`;
      const apiUrl = getApiUrl(endpoint);

      // Create FormData to support file uploads
      const formData = new FormData();
      formData.append('title', addFormData.title);
      formData.append('description', addFormData.description || '');
      formData.append('status', addFormData.status);
      formData.append('date', addFormData.date);

      // Append files
      selectedFiles.forEach((file) => {
        formData.append('documents', file);
      });

      const response = await axios.post(apiUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Record added successfully:', response.data);
      setShowAddModal(false);
      setAddFormType(null);
      setAddFormData({
        title: '',
        description: '',
        status: 'completed',
        date: new Date().toISOString().split('T')[0]
      });
      setSelectedFiles([]);

      // Reload bitácora
      await fetchBitacora();
    } catch (err) {
      console.error('Error adding record:', err);
      setError(err.response?.data?.message || 'Error al agregar el registro. Por favor intenta nuevamente.');
    } finally {
      setAdding(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      exam: 'Examen',
      control: 'Control',
      consultation: 'Consulta',
      consent: 'Consentimiento'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      exam: FaFlask,
      control: FaStethoscope,
      consultation: FaUserMd,
      consent: FaFileSignature
    };
    return icons[type] || FaFileMedical;
  };

  const handleViewDocument = async (s3Key) => {
    try {
      const token = getCookie('token');
      const apiUrl = getApiUrl(`/api/user/bitacora/document/${encodeURIComponent(s3Key)}`);
      
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.url) {
        window.open(response.data.url, '_blank');
      }
    } catch (err) {
      console.error('Error getting document URL:', err);
      setError('Error al abrir el documento. Por favor intenta nuevamente.');
    }
  };

  const resolveOrderPdfUrl = async (order) => {
    const token = getCookie('token');

    // Resolve URL through backend (also generates PDF if missing)
    const apiUrl = getApiUrl(`/api/orders/${order._id}/pdf-url`);
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.data?.url) {
      throw new Error('No PDF URL found');
    }

    const isAbsolute = /^https?:\/\//i.test(response.data.url);
    let finalUrl = response.data.url;

    // When backend returns a relative local path (e.g. /downloads/orders/*.pdf),
    // resolve it against the backend origin to avoid React Router handling it.
    if (!isAbsolute) {
      const backendResponseUrl = response?.request?.responseURL;

      if (backendResponseUrl) {
        finalUrl = new URL(response.data.url, backendResponseUrl).toString();
      } else if (/^https?:\/\//i.test(apiUrl)) {
        finalUrl = new URL(response.data.url, apiUrl).toString();
      } else {
        finalUrl = new URL(response.data.url, window.location.origin).toString();
      }
    }

    return finalUrl;
  };

  const handleViewOrderPdf = async (order) => {
    try {
      const finalUrl = await resolveOrderPdfUrl(order);
      window.open(finalUrl, '_blank');
    } catch (err) {
      console.error('Error getting order PDF URL:', err);
      setError('Error al abrir el PDF de la orden. Por favor intenta nuevamente.');
    }
  };

  const handleDownloadOrderPdf = async (order) => {
    try {
      const finalUrl = await resolveOrderPdfUrl(order);
      const link = document.createElement('a');
      link.href = finalUrl;
      link.download = `orden-medica-${order._id}.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading order PDF:', err);
      setError('Error al descargar el PDF de la orden. Por favor intenta nuevamente.');
    }
  };

  const openDetailModal = (item) => {
    setSelectedDetailItem(item);
  };

  const closeDetailModal = () => {
    setSelectedDetailItem(null);
  };

  const renderDetailContent = (item) => {
    if (!item) return null;

    if (item.type === 'order' && item.orderId) {
      return (
        <div className="space-y-5">
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Tipo</div>
            <div className="text-slate-900 font-medium">Orden médica</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Nombre</div>
            <div className="text-slate-900 font-medium">{item.orderId.examName || 'Exámenes médicos'}</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Estado</div>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.orderId.status)}`}>
              {getStatusLabel(item.orderId.status || 'pending')}
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-2">Exámenes incluidos</div>
            {Array.isArray(item.orderId.exams) && item.orderId.exams.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                {item.orderId.exams.map((exam, index) => (
                  <li key={index}>{exam}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Sin exámenes registrados.</p>
            )}
          </div>
          {item.orderId.cartItems?.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-2">Productos del carrito</div>
              <div className="space-y-2">
                {item.orderId.cartItems.map((cartItem, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <div className="font-medium text-slate-900">{cartItem.name || cartItem.title || 'Ítem'}</div>
                    <div className="text-sm text-slate-600">
                      {cartItem.pricingType === 'pack' ? 'Pack' : 'Personalizado'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Fecha</div>
            <div className="text-slate-900">{format(new Date(item.date), "d 'de' MMMM, yyyy")}</div>
          </div>
        </div>
      );
    }

    if (item.type === 'appointment' && item.appointmentId) {
      return (
        <div className="space-y-5">
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Tipo</div>
            <div className="text-slate-900 font-medium">Cita de telemedicina</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Doctor</div>
            <div className="text-slate-900 font-medium">{item.appointmentId.doctorName || 'Roberto Merino'}</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Fecha y hora</div>
            <div className="text-slate-900">{format(new Date(item.appointmentId.appointmentDate), "d 'de' MMMM, yyyy 'a las' HH:mm")}</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Estado</div>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.appointmentId.status)}`}>
              {getStatusLabel(item.appointmentId.status || 'scheduled')}
            </span>
          </div>
          {item.appointmentId.meetingLink && (
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Enlace</div>
              <a
                href={item.appointmentId.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 break-all"
              >
                Abrir reunión
              </a>
            </div>
          )}
        </div>
      );
    }

    if (item.type === 'exam') {
      return (
        <div className="space-y-5">
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Tipo</div>
            <div className="text-slate-900 font-medium">Examen</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Título</div>
            <div className="text-slate-900 font-medium">{item.title || 'Examen Médico'}</div>
          </div>
          {item.description && (
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Descripción</div>
              <div className="text-slate-700">{item.description}</div>
            </div>
          )}
          {item.examId?.examName && (
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Examen relacionado</div>
              <div className="text-slate-900">{item.examId.examName}</div>
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Fecha</div>
            <div className="text-slate-900">{format(new Date(item.date), "d 'de' MMMM, yyyy")}</div>
          </div>
        </div>
      );
    }

    if (item.type === 'control') {
      return (
        <div className="space-y-5">
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Tipo</div>
            <div className="text-slate-900 font-medium">Control</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Título</div>
            <div className="text-slate-900 font-medium">{item.title || 'Control Médico'}</div>
          </div>
          {item.description && (
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Descripción</div>
              <div className="text-slate-700">{item.description}</div>
            </div>
          )}
          {item.controlId?.examName && (
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Examen relacionado</div>
              <div className="text-slate-900">{item.controlId.examName}</div>
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Fecha</div>
            <div className="text-slate-900">{format(new Date(item.date), "d 'de' MMMM, yyyy")}</div>
          </div>
        </div>
      );
    }

    if (item.type === 'consultation') {
      return (
        <div className="space-y-5">
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Tipo</div>
            <div className="text-slate-900 font-medium">Consulta</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Título</div>
            <div className="text-slate-900 font-medium">{item.title || 'Consulta Médica'}</div>
          </div>
          {item.description && (
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Descripción</div>
              <div className="text-slate-700">{item.description}</div>
            </div>
          )}
          {item.consultationId?.doctorName && (
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Doctor</div>
              <div className="text-slate-900">Dr. {item.consultationId.doctorName}</div>
            </div>
          )}
          {item.consultationId?.meetingLink && (
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Enlace</div>
              <a
                href={item.consultationId.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 break-all"
              >
                Abrir detalle
              </a>
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Fecha</div>
            <div className="text-slate-900">{format(new Date(item.date), "d 'de' MMMM, yyyy")}</div>
          </div>
        </div>
      );
    }

    if (item.type === 'consent') {
      return (
        <div className="space-y-5">
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Tipo</div>
            <div className="text-slate-900 font-medium">Consentimiento</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Título</div>
            <div className="text-slate-900 font-medium">{item.title || 'Consentimiento Informado'}</div>
          </div>
          {item.description && (
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Descripción</div>
              <div className="text-slate-700">{item.description}</div>
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Estado</div>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status || 'signed')}`}>
              {getStatusLabel(item.status || 'signed')}
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Fecha</div>
            <div className="text-slate-900">{format(new Date(item.date), "d 'de' MMMM, yyyy")}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-slate-700">No hay más detalles disponibles para este registro.</div>
      </div>
    );
  };

  const handleResendOrderEmail = async (order) => {
    setSelectedOrderForEmail(order);
    setShowResendConfirmModal(true);
  };

  const confirmResendToMyEmail = async () => {
    if (!selectedOrderForEmail) {
      return;
    }

    try {
      const token = getCookie('token');
      const apiUrl = getApiUrl(`/api/orders/${selectedOrderForEmail._id}/resend-email`);
      const response = await axios.post(apiUrl, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccessMessage(response.data?.message || 'Correo reenviado correctamente');
      setShowResendConfirmModal(false);
      setSelectedOrderForEmail(null);
    } catch (err) {
      console.error('Error resending order email:', err);
      setError(err.response?.data?.message || 'Error al reenviar el correo de la orden.');
    }
  };

  const handleResendOrderEmailToOther = async (order) => {
    setSelectedOrderForEmail(order);
    setOtherEmailInput('');
    setShowOtherEmailModal(true);
  };

  const submitResendToOtherEmail = async () => {
    if (!selectedOrderForEmail) {
      return;
    }

    const cleanEmail = otherEmailInput.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!isValidEmail) {
      setError('El correo ingresado no es válido.');
      return;
    }

    try {
      const token = getCookie('token');
      const apiUrl = getApiUrl(`/api/orders/${selectedOrderForEmail._id}/resend-email`);
      const response = await axios.post(apiUrl, { targetEmail: cleanEmail }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccessMessage(response.data?.message || `Correo reenviado correctamente a ${cleanEmail}`);
      setShowOtherEmailModal(false);
      setSelectedOrderForEmail(null);
      setOtherEmailInput('');
    } catch (err) {
      console.error('Error resending order email to other recipient:', err);
      setError(err.response?.data?.message || 'Error al reenviar el correo a otro destinatario.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tu bitácora...</p>
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
          <div className="flex items-center justify-between mb-4">
            <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Mi Bitácora Personal
          </h1>
          <p className="text-xl text-gray-600">
            Control detallado de tu historial médico
          </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate('/profile')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition flex items-center"
              >
                <FaUser className="mr-2" />
                Perfil
              </button>
            </div>
          </div>
          
          {/* Summary Cards - Clickable Filters */}
          {bitacora.length > 0 && (
            <div className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'order' ? null : 'order')}
                  className={`rounded-lg p-4 text-center transition transform hover:scale-105 ${
                    activeFilter === 'order' 
                      ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300' 
                      : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <div className={`text-2xl font-bold ${activeFilter === 'order' ? 'text-white' : 'text-blue-600'}`}>
                    {bitacora.filter(item => item.type === 'order').length}
                  </div>
                  <div className={`text-sm mt-1 ${activeFilter === 'order' ? 'text-blue-100' : 'text-gray-600'}`}>Órdenes</div>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'appointment' ? null : 'appointment')}
                  className={`rounded-lg p-4 text-center transition transform hover:scale-105 ${
                    activeFilter === 'appointment' 
                      ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-300' 
                      : 'bg-green-50 hover:bg-green-100'
                  }`}
                >
                  <div className={`text-2xl font-bold ${activeFilter === 'appointment' ? 'text-white' : 'text-green-600'}`}>
                    {bitacora.filter(item => item.type === 'appointment').length}
                  </div>
                  <div className={`text-sm mt-1 ${activeFilter === 'appointment' ? 'text-green-100' : 'text-gray-600'}`}>Citas</div>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'exam' ? null : 'exam')}
                  className={`rounded-lg p-4 text-center transition transform hover:scale-105 ${
                    activeFilter === 'exam' 
                      ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-300' 
                      : 'bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  <div className={`text-2xl font-bold ${activeFilter === 'exam' ? 'text-white' : 'text-purple-600'}`}>
                    {bitacora.filter(item => item.type === 'exam').length}
                  </div>
                  <div className={`text-sm mt-1 ${activeFilter === 'exam' ? 'text-purple-100' : 'text-gray-600'}`}>Exámenes</div>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'control' ? null : 'control')}
                  className={`rounded-lg p-4 text-center transition transform hover:scale-105 ${
                    activeFilter === 'control' 
                      ? 'bg-orange-600 text-white shadow-lg ring-2 ring-orange-300' 
                      : 'bg-orange-50 hover:bg-orange-100'
                  }`}
                >
                  <div className={`text-2xl font-bold ${activeFilter === 'control' ? 'text-white' : 'text-orange-600'}`}>
                    {bitacora.filter(item => item.type === 'control').length}
                  </div>
                  <div className={`text-sm mt-1 ${activeFilter === 'control' ? 'text-orange-100' : 'text-gray-600'}`}>Controles</div>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'consultation' ? null : 'consultation')}
                  className={`rounded-lg p-4 text-center transition transform hover:scale-105 ${
                    activeFilter === 'consultation' 
                      ? 'bg-teal-600 text-white shadow-lg ring-2 ring-teal-300' 
                      : 'bg-teal-50 hover:bg-teal-100'
                  }`}
                >
                  <div className={`text-2xl font-bold ${activeFilter === 'consultation' ? 'text-white' : 'text-teal-600'}`}>
                    {bitacora.filter(item => item.type === 'consultation').length}
                  </div>
                  <div className={`text-sm mt-1 ${activeFilter === 'consultation' ? 'text-teal-100' : 'text-gray-600'}`}>Consultas</div>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'consent' ? null : 'consent')}
                  className={`rounded-lg p-4 text-center transition transform hover:scale-105 ${
                    activeFilter === 'consent' 
                      ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-300' 
                      : 'bg-indigo-50 hover:bg-indigo-100'
                  }`}
                >
                  <div className={`text-2xl font-bold ${activeFilter === 'consent' ? 'text-white' : 'text-indigo-600'}`}>
                    {bitacora.filter(item => item.type === 'consent').length}
                  </div>
                  <div className={`text-sm mt-1 ${activeFilter === 'consent' ? 'text-indigo-100' : 'text-gray-600'}`}>Consentimientos</div>
                </button>
              </div>
              
              {/* Filter Status and Clear Button */}
              {activeFilter && (
                <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Mostrando:</span>
                    <span className="font-semibold text-gray-900">
                      {getTypeLabel(activeFilter)} ({bitacora.filter(item => item.type === activeFilter).length} registros)
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveFilter(null)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Ver todos
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/personaliza-tu-orden')}
            className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition text-left"
          >
            <FaFileMedical className="text-2xl mb-2" />
            <h3 className="font-semibold text-lg mb-1">Nueva Orden Médica</h3>
            <p className="text-sm opacity-90">Solicita exámenes preventivos</p>
          </button>
          <button
            onClick={() => {
              setShowAddModal(true);
              setAddFormType('quick');
            }}
            className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition text-left"
          >
            <FaFileSignature className="text-2xl mb-2" />
            <h3 className="font-semibold text-lg mb-1">Agregar Registro</h3>
            <p className="text-sm opacity-90">Examen, control, consulta o consentimiento</p>
          </button>
        </div>

        {/* Bitácora Items */}
        {(() => {
          // Filter bitácora based on activeFilter
          const filteredBitacora = activeFilter 
            ? bitacora.filter(item => item.type === activeFilter)
            : bitacora;
          
          // Sort by date (most recent first)
          const sortedBitacora = [...filteredBitacora].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
          });

          if (bitacora.length === 0) {
            return (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaClock className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              Tu bitácora está vacía
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza creando una orden médica o registrando tus exámenes, controles, consultas y consentimientos
            </p>
            <button
              onClick={() => navigate('/servicios')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Ver Servicios
            </button>
          </div>
            );
          } else if (sortedBitacora.length === 0 && activeFilter) {
            return (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">
                  {(() => {
                    const Icon = getTypeIcon(activeFilter);
                    return <Icon className="text-gray-300 mx-auto" />;
                  })()}
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  No hay {getTypeLabel(activeFilter).toLowerCase()} registrados
                </h3>
                <p className="text-gray-600 mb-6">
                  No tienes registros de {getTypeLabel(activeFilter).toLowerCase()} en tu bitácora aún.
                </p>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => setActiveFilter(null)}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                  >
                    Ver todos los registros
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(true);
                      setAddFormType(activeFilter);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Agregar {getTypeLabel(activeFilter)}
                  </button>
                </div>
              </div>
            );
          } else {
            return (
          <div className="space-y-4">
                {sortedBitacora.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`${item.type === 'order' ? 'bg-blue-100' : item.type === 'appointment' ? 'bg-green-100' : item.type === 'exam' ? 'bg-purple-100' : item.type === 'control' ? 'bg-orange-100' : item.type === 'consultation' ? 'bg-teal-100' : 'bg-indigo-100'} rounded-full p-3`}>
                      {(() => {
                        const Icon = getTypeIcon(item.type);
                        return <Icon className={`${item.type === 'order' ? 'text-blue-600' : item.type === 'appointment' ? 'text-green-600' : item.type === 'exam' ? 'text-purple-600' : item.type === 'control' ? 'text-orange-600' : item.type === 'consultation' ? 'text-teal-600' : 'text-indigo-600'} text-xl`} />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => openDetailModal(item)}
                        className="group inline-flex max-w-full items-center gap-2 font-semibold text-lg text-gray-900 mb-1 text-left hover:text-blue-600 transition cursor-pointer"
                      >
                        <span className="truncate group-hover:underline underline-offset-4">
                          {item.type === 'order' && item.orderId && `Orden médica: ${item.orderId.examName || 'Exámenes médicos'}`}
                          {item.type === 'appointment' && 'Cita de telemedicina'}
                          {item.type === 'exam' && (item.title || 'Examen Médico')}
                          {item.type === 'control' && (item.title || 'Control Médico')}
                          {item.type === 'consultation' && (item.title || 'Consulta Médica')}
                          {item.type === 'consent' && (item.title || 'Consentimiento Informado')}
                        </span>
                        <FaExternalLinkAlt className="text-xs text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.type === 'order' && item.orderId && (
                      <>
                        <button
                          onClick={() => handleViewOrderPdf(item.orderId)}
                          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 px-2 py-2"
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={() => handleResendOrderEmail(item.orderId)}
                          className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 px-2 py-2"
                          title="Reenviar a mi correo"
                        >
                          <FaPaperPlane />
                        </button>
                        <button
                          onClick={() => handleResendOrderEmailToOther(item.orderId)}
                          className="inline-flex items-center space-x-2 text-violet-700 hover:text-violet-800 px-2 py-2"
                          title="Reenviar a otro correo"
                        >
                          <FaShareAlt />
                        </button>
                      </>
                    )}
                    {item.type !== 'order' && (
                      <button
                        onClick={() => handleDeleteClick(item._id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                        disabled={deleting}
                        title="Eliminar registro"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
            );
          }
        })()}
      </div>
      <SaludSimpleFooter />

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {addFormType === 'quick' ? 'Agregar Registro' : `Agregar ${getTypeLabel(addFormType)}`}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddFormType(null);
                    setError('');
                    setSelectedFiles([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {addFormType === 'quick' && (
                <div className="mb-4">
                  <p className="text-gray-600 mb-4">Selecciona el tipo de registro:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAddFormType('exam')}
                      className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-left transition border-2 border-purple-200"
                    >
                      <FaFlask className="text-purple-600 text-xl mb-2" />
                      <div className="font-semibold text-purple-900">Examen</div>
                    </button>
                    <button
                      onClick={() => setAddFormType('control')}
                      className="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg text-left transition border-2 border-orange-200"
                    >
                      <FaStethoscope className="text-orange-600 text-xl mb-2" />
                      <div className="font-semibold text-orange-900">Control</div>
                    </button>
                    <button
                      onClick={() => setAddFormType('consultation')}
                      className="bg-teal-50 hover:bg-teal-100 p-4 rounded-lg text-left transition border-2 border-teal-200"
                    >
                      <FaUserMd className="text-teal-600 text-xl mb-2" />
                      <div className="font-semibold text-teal-900">Consulta</div>
                    </button>
                    <button
                      onClick={() => setAddFormType('consent')}
                      className="bg-indigo-50 hover:bg-indigo-100 p-4 rounded-lg text-left transition border-2 border-indigo-200"
                    >
                      <FaFileSignature className="text-indigo-600 text-xl mb-2" />
                      <div className="font-semibold text-indigo-900">Consentimiento</div>
                    </button>
                  </div>
                </div>
              )}

              {addFormType && addFormType !== 'quick' && (
                <form onSubmit={handleSubmitRecord} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={addFormData.title}
                      onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Ej: ${getTypeLabel(addFormType)} de...`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={addFormData.description}
                      onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Agregar detalles adicionales..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <select
                        value={addFormData.status}
                        onChange={(e) => setAddFormData({ ...addFormData, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {addFormType === 'consent' ? (
                          <>
                            <option value="signed">Firmado</option>
                            <option value="pending">Pendiente</option>
                          </>
                        ) : (
                          <>
                            <option value="completed">Completado</option>
                            <option value="pending">Pendiente</option>
                            <option value="processing">En Proceso</option>
                            <option value="cancelled">Cancelado</option>
                          </>
                        )}
                      </select>
                    </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={addFormData.date}
                      onChange={(e) => setAddFormData({ ...addFormData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documentos (PDFs o imágenes) - Opcional
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={selectedFiles.length >= 5}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo 5 archivos. Tamaño máximo: 10MB por archivo.
                  </p>
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700 truncate flex-1">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setAddFormType(null);
                        setError('');
                        setSelectedFiles([]);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      disabled={adding}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 px-4 py-2 text-white rounded-lg transition ${
                        addFormType === 'exam' ? 'bg-purple-600 hover:bg-purple-700' :
                        addFormType === 'control' ? 'bg-orange-600 hover:bg-orange-700' :
                        addFormType === 'consultation' ? 'bg-teal-600 hover:bg-teal-700' :
                        addFormType === 'consent' ? 'bg-indigo-600 hover:bg-indigo-700' :
                        'bg-blue-600 hover:bg-blue-700'
                      }`}
                      disabled={adding}
                    >
                      {adding ? 'Agregando...' : 'Agregar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para borrar registro individual */}
      {showDeleteConfirm && (
        <ModalShell
          isOpen
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeleteEntryId(null);
          }}
          title="Confirmar eliminación"
          description="¿Estás seguro de que quieres eliminar este registro de tu bitácora? Esta acción no se puede deshacer."
          icon={<FaTrash className="text-lg" />}
          iconClassName="bg-red-100 text-red-600"
          footer={(
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteEntryId(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteEntry(deleteEntryId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition flex items-center justify-center"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  'Sí, Eliminar'
                )}
              </button>
            </div>
          )}
        />
      )}

      {/* Modal de confirmación para borrar todos los registros */}
      {showDeleteAllConfirm && (
        <ModalShell
          isOpen
          onClose={() => setShowDeleteAllConfirm(false)}
          title="Confirmar eliminación total"
          description={`¿Estás seguro de que quieres eliminar TODOS los registros de tu bitácora? Esta acción eliminará ${bitacora.length} registros y no se puede deshacer.`}
          icon={<FaTrash className="text-lg" />}
          iconClassName="bg-red-100 text-red-600"
          footer={(
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteAllEntries()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition flex items-center justify-center"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  'Sí, Eliminar Todo'
                )}
              </button>
            </div>
          )}
        />
      )}

      {/* Confirmación: reenviar a mi correo */}
      {showResendConfirmModal && (
        <ModalShell
          isOpen
          onClose={() => {
            setShowResendConfirmModal(false);
            setSelectedOrderForEmail(null);
          }}
          title="Reenviar a mi correo"
          description="¿Deseas reenviar esta orden médica al correo de tu cuenta?"
          icon={<FaPaperPlane className="text-lg" />}
          iconClassName="bg-indigo-100 text-indigo-600"
          footer={(
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResendConfirmModal(false);
                  setSelectedOrderForEmail(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmResendToMyEmail}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition"
              >
                Reenviar
              </button>
            </div>
          )}
        />
      )}

      {/* Modal: reenviar a otro correo */}
      {showOtherEmailModal && (
        <ModalShell
          isOpen
          onClose={() => {
            setShowOtherEmailModal(false);
            setSelectedOrderForEmail(null);
            setOtherEmailInput('');
          }}
          title="Reenviar a otro correo"
          description="Ingresa el correo destino (ej: centro medico)."
          icon={<FaEnvelopeOpenText className="text-lg" />}
          iconClassName="bg-violet-100 text-violet-600"
          footer={(
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOtherEmailModal(false);
                  setSelectedOrderForEmail(null);
                  setOtherEmailInput('');
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={submitResendToOtherEmail}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl transition"
              >
                Enviar
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

      {/* Modal de éxito */}
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

      {selectedDetailItem && (
        <ModalShell
          isOpen
          onClose={closeDetailModal}
          title={
            selectedDetailItem.type === 'order' && selectedDetailItem.orderId
              ? `Detalle de orden: ${selectedDetailItem.orderId.examName || 'Exámenes médicos'}`
              : selectedDetailItem.type === 'appointment'
                ? 'Detalle de cita'
                : selectedDetailItem.type === 'exam'
                  ? (selectedDetailItem.title || 'Detalle de examen')
                  : selectedDetailItem.type === 'control'
                    ? (selectedDetailItem.title || 'Detalle de control')
                    : selectedDetailItem.type === 'consultation'
                      ? (selectedDetailItem.title || 'Detalle de consulta')
                      : 'Detalle del registro'
          }
          description=""
          icon={<FaFileMedical className="text-lg" />}
          iconClassName="bg-blue-100 text-blue-600"
          widthClassName="max-w-2xl"
          footer={
            selectedDetailItem.type === 'order' && selectedDetailItem.orderId ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                <button
                  onClick={() => handleViewOrderPdf(selectedDetailItem.orderId)}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-xl transition"
                >
                  <FaExternalLinkAlt />
                  Ver PDF
                </button>
                <button
                  onClick={() => handleDownloadOrderPdf(selectedDetailItem.orderId)}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2.5 rounded-xl transition"
                >
                  <FaDownload />
                  Descargar
                </button>
                <button
                  onClick={() => handleResendOrderEmail(selectedDetailItem.orderId)}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2.5 rounded-xl transition"
                >
                  <FaPaperPlane />
                  Mi correo
                </button>
                <button
                  onClick={() => handleResendOrderEmailToOther(selectedDetailItem.orderId)}
                  className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-3 py-2.5 rounded-xl transition"
                >
                  <FaEnvelope />
                  Reenviar Email
                </button>
                <button
                  onClick={closeDetailModal}
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2.5 rounded-xl transition"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <button
                onClick={closeDetailModal}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl transition"
              >
                Cerrar
              </button>
            )
          }
        >
          {renderDetailContent(selectedDetailItem)}
        </ModalShell>
      )}

    </div>
  );
}

export default Bitacora;
