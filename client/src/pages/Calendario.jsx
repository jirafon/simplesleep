import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { 
  FaCalendarAlt, FaVideo, FaClock, FaUserMd, FaExternalLinkAlt, 
  FaSpinner, FaPlus, FaFilter, FaList, FaCalendarWeek, FaCalendarDay,
  FaChevronLeft, FaChevronRight, FaTimes
} from 'react-icons/fa';
import { 
  format, isPast, isToday, isFuture, parseISO, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths,
  addWeeks, subWeeks, isSameMonth, addDays
} from 'date-fns';
import { getApiUrl } from '../config/api';
import { getCookie, removeCookie } from '../utils/cookies';

const SLOT_INTERVAL_MINUTES = 15;
const BUSINESS_START_MINUTES = 8 * 60;
const BUSINESS_END_MINUTES = 20 * 60;

function Calendario() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // 'list', 'month', 'week'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past', 'today'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [suggestionsLookaheadDays, setSuggestionsLookaheadDays] = useState(30);
  const [createForm, setCreateForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    durationMinutes: 30,
    consultationType: 'general',
    notes: ''
  });

  const fetchAppointments = useCallback(async () => {
    try {
      const token = getCookie('token');
      const response = await axios.get(getApiUrl('/api/appointments/my-appointments'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAppointments(response.data.appointments || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      if (err.response?.status === 401) {
        removeCookie('token');
        removeCookie('user');
        navigate('/login');
      } else {
        setError('Error al cargar las citas. Por favor recarga la página.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAppointments();
  }, [fetchAppointments, navigate]);

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'Programada',
      completed: 'Completada',
      cancelled: 'Cancelada',
      'no-show': 'No asistió'
    };
    return labels[status] || status;
  };

  const getConsultationTypeLabel = (type) => {
    const labels = {
      general: 'Consulta General',
      specialist: 'Especialista',
      'follow-up': 'Seguimiento'
    };
    return labels[type] || type;
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.appointmentDate);
      return isSameDay(appointmentDate, date);
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const navigateWeek = (direction) => {
    setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const resetCreateForm = () => {
    setCreateForm({
      appointmentDate: '',
      appointmentTime: '',
      durationMinutes: 30,
      consultationType: 'general',
      notes: ''
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setSuggestionsLookaheadDays(30);
    resetCreateForm();
  };

  const openCreateModalWithDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slots = buildTimeSlots(dateStr, createForm.durationMinutes);
    const firstAvailable = slots.find((slot) => !slot.disabled);

    setCreateForm((prev) => ({
      appointmentDate: dateStr,
      appointmentTime: firstAvailable ? firstAvailable.value : '',
      durationMinutes: Number(prev.durationMinutes || 30),
      consultationType: 'general',
      notes: ''
    }));
    setSuggestionsLookaheadDays(30);
    setError('');
    setShowCreateModal(true);
  };

  const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const buildTimeSlots = useCallback((dateStr, durationMinutes) => {
    if (!dateStr) return [];

    const duration = Number(durationMinutes || 30);
    const now = new Date();
    const requestedDay = parseISO(`${dateStr}T00:00:00`);
    const isSameDayAsToday = isSameDay(requestedDay, now);

    const sameDayScheduledAppointments = appointments.filter((existing) => {
      if (existing.status !== 'scheduled') return false;
      return isSameDay(parseISO(existing.appointmentDate), requestedDay);
    });

    const slots = [];
    for (
      let startMinutes = BUSINESS_START_MINUTES;
      startMinutes + duration <= BUSINESS_END_MINUTES;
      startMinutes += SLOT_INTERVAL_MINUTES
    ) {
      const hhmm = minutesToTime(startMinutes);
      const slotStart = parseISO(`${dateStr}T${hhmm}:00`);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      const isPastSlot = isSameDayAsToday && slotStart <= now;
      const hasConflict = sameDayScheduledAppointments.some((existing) => {
        const existingStart = parseISO(existing.appointmentDate);
        const existingDuration = Number(existing.durationMinutes || 30);
        const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000);

        return slotStart < existingEnd && slotEnd > existingStart;
      });

      slots.push({
        value: hhmm,
        disabled: isPastSlot || hasConflict,
        reason: isPastSlot ? 'No disponible' : hasConflict ? 'Ocupado' : ''
      });
    }

    return slots;
  }, [appointments]);

  const getAvailabilityForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slots = buildTimeSlots(dateStr, createForm.durationMinutes);
    const total = slots.length;
    const available = slots.filter((slot) => !slot.disabled).length;

    let label = 'Sin cupo';
    let badgeClass = 'bg-red-100 text-red-700';

    if (available > 6) {
      label = 'Alta';
      badgeClass = 'bg-emerald-100 text-emerald-700';
    } else if (available > 2) {
      label = 'Media';
      badgeClass = 'bg-amber-100 text-amber-700';
    } else if (available > 0) {
      label = 'Baja';
      badgeClass = 'bg-orange-100 text-orange-700';
    }

    return {
      available,
      total,
      label,
      badgeClass
    };
  };

  const getNextAvailableDateSuggestions = (startDateStr, durationMinutes, maxSuggestions = 3, lookaheadDays = 30) => {
    if (!startDateStr) return [];

    const baseDate = parseISO(`${startDateStr}T00:00:00`);
    if (Number.isNaN(baseDate.getTime())) return [];

    const suggestions = [];
    for (let offset = 1; offset <= lookaheadDays && suggestions.length < maxSuggestions; offset += 1) {
      const date = addDays(baseDate, offset);
      const dateStr = format(date, 'yyyy-MM-dd');
      const slots = buildTimeSlots(dateStr, durationMinutes);
      const firstAvailable = slots.find((slot) => !slot.disabled);

      if (firstAvailable) {
        suggestions.push({
          date,
          dateStr,
          firstTime: firstAvailable.value,
          label: format(date, "EEE d 'de' MMM")
        });
      }
    }

    return suggestions;
  };

  useEffect(() => {
    if (!createForm.appointmentDate || !createForm.appointmentTime) {
      return;
    }

    const slots = buildTimeSlots(createForm.appointmentDate, createForm.durationMinutes);
    const selectedSlot = slots.find((slot) => slot.value === createForm.appointmentTime);

    if (!selectedSlot || selectedSlot.disabled) {
      setCreateForm((prev) => ({ ...prev, appointmentTime: '' }));
    }
  }, [buildTimeSlots, createForm.appointmentDate, createForm.appointmentTime, createForm.durationMinutes]);

  useEffect(() => {
    setSuggestionsLookaheadDays(30);
  }, [createForm.appointmentDate, createForm.durationMinutes]);

  const handleCreateAppointment = async (e) => {
    e.preventDefault();

    if (!createForm.appointmentDate || !createForm.appointmentTime) {
      setError('Selecciona fecha y hora para agendar la cita.');
      return;
    }

    const selectedDateTime = new Date(`${createForm.appointmentDate}T${createForm.appointmentTime}`);
    if (Number.isNaN(selectedDateTime.getTime()) || selectedDateTime <= new Date()) {
      setError('La cita debe ser en una fecha y hora futura.');
      return;
    }

    const selectedEndDateTime = new Date(
      selectedDateTime.getTime() + Number(createForm.durationMinutes || 30) * 60000
    );

    const hasLocalConflict = appointments.some((existing) => {
      if (existing.status !== 'scheduled') return false;
      const existingStart = parseISO(existing.appointmentDate);
      const existingDuration = Number(existing.durationMinutes || 30);
      const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000);

      return selectedDateTime < existingEnd && selectedEndDateTime > existingStart;
    });

    if (hasLocalConflict) {
      setError('Ese bloque horario ya está ocupado. Elige otra hora.');
      return;
    }

    try {
      setCreating(true);
      setError('');
      const token = getCookie('token');

      await axios.post(
        getApiUrl('/api/appointments/create'),
        {
          appointmentDate: createForm.appointmentDate,
          appointmentTime: createForm.appointmentTime,
          durationMinutes: Number(createForm.durationMinutes || 30),
          consultationType: createForm.consultationType,
          notes: createForm.notes
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      closeCreateModal();
      await fetchAppointments();
      setView('list');
      setFilter('upcoming');
    } catch (err) {
      console.error('Error creating appointment:', err);
      if (err.response?.status === 401) {
        removeCookie('token');
        removeCookie('user');
        navigate('/login');
        return;
      }
      setError(err.response?.data?.message || 'Error al agendar la cita. Intenta nuevamente.');
    } finally {
      setCreating(false);
    }
  };

  // Filter appointments based on filter
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = parseISO(appointment.appointmentDate);
    
    switch (filter) {
      case 'upcoming':
        return isFuture(appointmentDate) && appointment.status === 'scheduled';
      case 'past':
        return isPast(appointmentDate) || appointment.status === 'completed';
      case 'today':
        return isToday(appointmentDate);
      default:
        return true;
    }
  });

  // Sort appointments: upcoming first, then by date
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = parseISO(a.appointmentDate);
    const dateB = parseISO(b.appointmentDate);
    
    if (isFuture(dateA) && isPast(dateB)) return -1;
    if (isPast(dateA) && isFuture(dateB)) return 1;
    
    return dateA - dateB;
  });

  const upcomingCount = appointments.filter(a => isFuture(parseISO(a.appointmentDate)) && a.status === 'scheduled').length;
  const todayCount = appointments.filter(a => isToday(parseISO(a.appointmentDate))).length;
  const pastCount = appointments.filter(a => isPast(parseISO(a.appointmentDate)) || a.status === 'completed').length;
  const createTimeSlots = buildTimeSlots(createForm.appointmentDate, createForm.durationMinutes);
  const hasAvailableCreateSlots = createTimeSlots.some((slot) => !slot.disabled);
  const nextAvailableDateSuggestions = !hasAvailableCreateSlots
    ? getNextAvailableDateSuggestions(
        createForm.appointmentDate,
        createForm.durationMinutes,
        3,
        suggestionsLookaheadDays
      )
    : [];
  const canExpandSuggestionsWindow = suggestionsLookaheadDays < 90;

  // Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const availability = getAvailabilityForDate(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-24 p-2 border rounded-lg ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isTodayDate ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className={`text-sm font-semibold mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isTodayDate ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </div>
                <button
                  type="button"
                  onClick={() => openCreateModalWithDate(day)}
                  className={`mb-1 w-full rounded px-1 py-0.5 text-[10px] font-semibold text-left ${availability.badgeClass} ${!isCurrentMonth ? 'opacity-60' : ''}`}
                  title={`Disponibles: ${availability.available}/${availability.total}`}
                >
                  {availability.label}
                </button>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map(appointment => (
                    <div
                      key={appointment._id}
                      className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate cursor-pointer hover:bg-blue-200"
                      onClick={() => {
                        const element = document.getElementById(`appointment-${appointment._id}`);
                        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    >
                      {format(parseISO(appointment.appointmentDate), 'HH:mm')}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayAppointments.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(currentDate, { weekStartsOn: 1 })
    });

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map(day => {
            const dayAppointments = getAppointmentsForDate(day);
            const isTodayDate = isToday(day);
            const availability = getAvailabilityForDate(day);

            return (
              <div
                key={day.toISOString()}
                className={`border rounded-lg p-3 ${isTodayDate ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'}`}
              >
                <div className={`text-center mb-3 ${isTodayDate ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                  <div className="text-xs uppercase">{format(day, 'EEE')}</div>
                  <div className="text-lg">{format(day, 'd')}</div>
                </div>
                <button
                  type="button"
                  onClick={() => openCreateModalWithDate(day)}
                  className={`mb-2 w-full rounded px-2 py-1 text-[11px] font-semibold text-left ${availability.badgeClass}`}
                  title={`Disponibles: ${availability.available}/${availability.total}`}
                >
                  Disponibilidad: {availability.label}
                </button>
                <div className="space-y-2">
                  {dayAppointments.map(appointment => (
                    <div
                      key={appointment._id}
                      className="bg-blue-100 text-blue-800 rounded p-2 text-xs cursor-pointer hover:bg-blue-200"
                      onClick={() => {
                        const element = document.getElementById(`appointment-${appointment._id}`);
                        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    >
                      <div className="font-semibold">
                        {format(parseISO(appointment.appointmentDate), 'HH:mm')}
                      </div>
                      <div className="truncate">
                        {getConsultationTypeLabel(appointment.consultationType)}
                      </div>
                      <div className="truncate text-[11px] text-blue-700">
                        {appointment.durationMinutes || 30} min
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // List View
  const renderListView = () => {
    return (
      <div className="space-y-4">
        {sortedAppointments.map((appointment) => {
          const appointmentDate = parseISO(appointment.appointmentDate);
          const isUpcoming = isFuture(appointmentDate) && appointment.status === 'scheduled';
          const isPastAppointment = isPast(appointmentDate) || appointment.status === 'completed';
          const isTodayAppointment = isToday(appointmentDate);

          return (
            <div
              key={appointment._id}
              id={`appointment-${appointment._id}`}
              className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition ${
                isTodayAppointment ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className={`rounded-full p-4 ${
                      isUpcoming ? 'bg-green-100' : 
                      isPastAppointment ? 'bg-gray-100' : 
                      'bg-blue-100'
                    }`}>
                      <FaCalendarAlt className={`text-xl ${
                        isUpcoming ? 'text-green-600' : 
                        isPastAppointment ? 'text-gray-600' : 
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {getConsultationTypeLabel(appointment.consultationType)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>

                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FaUserMd className="text-gray-400" />
                          <span className="font-medium">{appointment.doctorName || 'Dr. Roberto Merino'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaClock className="text-gray-400" />
                          <span>
                            {format(appointmentDate, "EEEE, d 'de' MMMM, yyyy 'a las' HH:mm")}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            {appointment.durationMinutes || 30} min
                          </span>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-gray-500 mt-2">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                  {appointment.meetingLink && isUpcoming && (
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                    >
                      <FaVideo className="mr-2" />
                      <span>Unirse a la Videollamada</span>
                      <FaExternalLinkAlt className="text-sm" />
                    </a>
                  )}
                  {appointment.meetingLink && isPastAppointment && appointment.status === 'completed' && (
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center space-x-2"
                    >
                      <FaVideo className="mr-2" />
                      <span>Ver Link de Reunión</span>
                      <FaExternalLinkAlt className="text-sm" />
                    </a>
                  )}
                  {!appointment.meetingLink && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm">
                      Link de reunión pendiente
                    </div>
                  )}
                  <button
                    onClick={() => navigate('/bitacora')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Ver en Bitácora
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando citas...</p>
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
                <FaCalendarAlt className="mr-3 text-blue-600" />
                Mi Calendario
              </h1>
              <p className="text-xl text-gray-600">
                Gestiona tus citas médicas remotas
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              <FaPlus className="mr-2" />
              Nueva Cita
            </button>
          </div>

          {/* View Toggle and Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* View Toggle Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaList />
                <span>Lista</span>
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                  view === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaCalendarWeek />
                <span>Semanal</span>
              </button>
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                  view === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaCalendarDay />
                <span>Mensual</span>
              </button>
            </div>

            {/* Date Navigation */}
            {(view === 'month' || view === 'week') && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => view === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Hoy
                </button>
                <button
                  onClick={() => view === 'month' ? navigateMonth('next') : navigateWeek('next')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <FaChevronRight />
                </button>
                <div className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                  {view === 'month' 
                    ? format(currentDate, 'MMMM yyyy')
                    : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM yyyy')}`
                  }
                </div>
              </div>
            )}

            {(view === 'month' || view === 'week') && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-medium">Disponibilidad:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Alta</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700">Media</span>
                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700">Baja</span>
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700">Sin cupo</span>
              </div>
            )}

            {/* Filter Tabs (only for list view) */}
            {view === 'list' && (
              <div className="flex space-x-2 overflow-x-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaFilter className="inline mr-2" />
                  Todas ({appointments.length})
                </button>
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    filter === 'upcoming'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Próximas ({upcomingCount})
                </button>
                <button
                  onClick={() => setFilter('today')}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    filter === 'today'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Hoy ({todayCount})
                </button>
                <button
                  onClick={() => setFilter('past')}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    filter === 'past'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Pasadas ({pastCount})
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Render Selected View */}
        {sortedAppointments.length === 0 && view === 'list' ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              {filter === 'all' 
                ? 'No tienes citas agendadas' 
                : filter === 'upcoming'
                ? 'No tienes citas próximas'
                : filter === 'today'
                ? 'No tienes citas hoy'
                : 'No hay citas pasadas'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Agenda tu primera cita de telemedicina para comenzar'
                : 'Intenta con otro filtro o agenda una nueva cita'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Agendar Nueva Cita
            </button>
          </div>
        ) : (
          <>
            {view === 'list' && renderListView()}
            {view === 'week' && renderWeekView()}
            {view === 'month' && renderMonthView()}
            
            {/* Show list below calendar views */}
            {(view === 'month' || view === 'week') && sortedAppointments.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Citas del Período</h2>
                {renderListView()}
              </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Agendar Cita de Telemedicina</h2>
              <button
                onClick={closeCreateModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Cerrar"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={createForm.appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <select
                  value={createForm.appointmentTime}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, appointmentTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!createForm.appointmentDate}
                >
                  <option value="" disabled>
                    {createForm.appointmentDate ? 'Selecciona un horario' : 'Primero selecciona fecha'}
                  </option>
                  {createTimeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value} disabled={slot.disabled}>
                      {slot.value}{slot.reason ? ` - ${slot.reason}` : ''}
                    </option>
                  ))}
                </select>
                {createForm.appointmentDate && !hasAvailableCreateSlots && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-red-600">No hay horarios disponibles para esta fecha y duración.</p>
                    {nextAvailableDateSuggestions.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Próximas fechas con disponibilidad:</p>
                        <div className="flex flex-wrap gap-2">
                          {nextAvailableDateSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.dateStr}
                              type="button"
                              onClick={() => {
                                setCreateForm((prev) => ({
                                  ...prev,
                                  appointmentDate: suggestion.dateStr,
                                  appointmentTime: suggestion.firstTime
                                }));
                              }}
                              className="px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs hover:bg-emerald-100"
                            >
                              {suggestion.label} - {suggestion.firstTime}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {nextAvailableDateSuggestions.length === 0 && (
                      <p className="text-xs text-gray-600">No encontramos cupos en los próximos {suggestionsLookaheadDays} días.</p>
                    )}
                    {canExpandSuggestionsWindow && (
                      <button
                        type="button"
                        onClick={() => setSuggestionsLookaheadDays((prev) => Math.min(prev + 30, 90))}
                        className="text-xs font-medium text-blue-700 hover:text-blue-800"
                      >
                        Ver más fechas
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                <select
                  value={createForm.durationMinutes}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Horario disponible para agendar: 08:00 a 20:00</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de consulta</label>
                <select
                  value={createForm.consultationType}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, consultationType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">Consulta General</option>
                  <option value="specialist">Especialista</option>
                  <option value="follow-up">Seguimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                <textarea
                  rows="3"
                  value={createForm.notes}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Describe brevemente el motivo de la consulta"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={creating}
                >
                  {creating ? 'Agendando...' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <SaludSimpleFooter />
    </div>
  );
}

export default Calendario;
