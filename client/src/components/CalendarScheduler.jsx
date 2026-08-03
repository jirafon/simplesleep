import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { format, isBefore, startOfDay, addMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-calendar/dist/Calendar.css';
import GOOGLE_CALENDAR_CONFIG from '../config/googleCalendar';

const CalendarScheduler = ({ isOpen, onClose, selectedStartup, onOpenDemo }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [meetingType, setMeetingType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Date, 2: Time, 3: Details, 4: Confirmation

  // Usar configuración centralizada
  const businessHours = GOOGLE_CALENDAR_CONFIG.BUSINESS_HOURS;
  const meetingTypes = GOOGLE_CALENDAR_CONFIG.MEETING_TYPES;
  const meetingDurations = GOOGLE_CALENDAR_CONFIG.MEETING_DURATIONS;

  // Generar horarios disponibles
  const generateTimeSlots = (date) => {
    if (!date) return [];
    
    const dayOfWeek = format(date, 'EEEE', { locale: es }).toLowerCase();
    const hours = businessHours[dayOfWeek];
    
    if (!hours) return []; // Día cerrado
    
    const slots = [];
    const startHour = parseInt(hours.start.split(':')[0]);
    const endHour = parseInt(hours.end.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  };

  // Filtrar fechas disponibles (excluir fines de semana y fechas pasadas)
  const tileDisabled = ({ date, view }) => {
    if (view !== 'month') return false;
    
    const today = startOfDay(new Date());
    const selectedDateStart = startOfDay(date);
    
    // No permitir fechas pasadas
    if (isBefore(selectedDateStart, today)) return true;
    
    // No permitir domingos
    const dayOfWeek = format(date, 'EEEE', { locale: es }).toLowerCase();
    if (dayOfWeek === 'sunday') return true;
    
    return false;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);
  };

  const handleMeetingTypeChange = (type) => {
    setMeetingType(type);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Aquí iría la lógica para crear el evento en Google Calendar
      const eventData = {
        summary: `Reunión ${selectedStartup?.name || 'Unbiax'} - ${meetingType}`,
        description: `
          Cliente: ${formData.name}
          Empresa: ${formData.company}
          Email: ${formData.email}
          Teléfono: ${formData.phone}
          Notas: ${formData.notes}
          Startup: ${selectedStartup?.name || 'Unbiax'}
          Tipo: ${meetingType}
          Duración: ${selectedDuration} minutos
        `,
        start: {
          dateTime: `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00-03:00`,
          timeZone: GOOGLE_CALENDAR_CONFIG.TIMEZONE
        },
        end: {
          dateTime: `${format(selectedDate, 'yyyy-MM-dd')}T${format(addMinutes(selectedDate, selectedDuration), 'HH:mm')}:00-03:00`,
          timeZone: GOOGLE_CALENDAR_CONFIG.TIMEZONE
        },
        attendees: [
          { email: formData.email },
          { email: GOOGLE_CALENDAR_CONFIG.CONTACT_EMAIL }
        ],
        reminders: GOOGLE_CALENDAR_CONFIG.EVENT_CONFIG.REMINDERS,
        conferenceData: GOOGLE_CALENDAR_CONFIG.EVENT_CONFIG.CONFERENCE_DATA
      };

      // Enviar a backend para crear evento en Google Calendar
      const response = await fetch('https://unbiax.onrender.com/calendar/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        setStep(4);
      } else {
        throw new Error('Error al crear el evento');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agendar la reunión. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedDuration(60);
    setMeetingType('');
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      notes: ''
    });
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-t-3xl p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold mb-2">Agendar Reunión</h2>
          <p className="text-blue-100">
            {selectedStartup ? `Reunión con ${selectedStartup.name}` : 'Selecciona una fecha y hora'}
          </p>
          
          {/* Progress Steps */}
          <div className="flex justify-center mt-6 space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNumber ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-white' : 'bg-blue-400'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Selecciona una fecha</h3>
              <div className="flex justify-center">
                <Calendar
                  onChange={handleDateSelect}
                  tileDisabled={tileDisabled}
                  minDate={new Date()}
                  className="rounded-xl shadow-lg border-0"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">
                Horarios disponibles para {format(selectedDate, 'EEEE, d \'de\' MMMM', { locale: es })}
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {generateTimeSlots(selectedDate).map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 font-semibold"
                  >
                    {time}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                ← Volver a seleccionar fecha
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Detalles de la reunión</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de reunión
                  </label>
                  <select
                    value={meetingType}
                    onChange={(e) => handleMeetingTypeChange(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  >
                    <option value="">Selecciona el tipo de reunión</option>
                    {selectedStartup && meetingTypes[selectedStartup.name]?.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duración
                  </label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    {meetingDurations.map((duration) => (
                      <option key={duration.value} value={duration.value}>
                        {duration.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notas adicionales
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Describe brevemente el objetivo de la reunión..."
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
                  >
                    ← Volver
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !meetingType}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Agendando...' : 'Confirmar Reunión'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✅</span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800">¡Reunión Agendada!</h3>
              
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <p className="text-gray-600">
                  <strong>Fecha:</strong> {format(selectedDate, 'EEEE, d \'de\' MMMM', { locale: es })}
                </p>
                <p className="text-gray-600">
                  <strong>Hora:</strong> {selectedTime}
                </p>
                <p className="text-gray-600">
                  <strong>Duración:</strong> {selectedDuration} minutos
                </p>
                <p className="text-gray-600">
                  <strong>Tipo:</strong> {meetingType}
                </p>
              </div>
              
              <p className="text-gray-600">
                Hemos enviado una confirmación a tu email con los detalles de la reunión y el enlace de Google Meet.
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700"
                >
                  Cerrar
                </button>
                
                <button
                  onClick={() => {
                    handleClose();
                    if (onOpenDemo) onOpenDemo();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800"
                >
                  Agendar Otra Reunión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarScheduler; 