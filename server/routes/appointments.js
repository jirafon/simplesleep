const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { generateMeetingLink } = require('../services/telemedicineService');

// Create a new telemedicine appointment
router.post('/create', auth, async (req, res) => {
  try {
    const { appointmentDate, appointmentTime, consultationType, notes, durationMinutes } = req.body;

    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({ 
        message: 'La fecha y hora de la cita son requeridas' 
      });
    }

    // Check if the date is in the future
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({ 
        message: 'La cita debe ser en una fecha y hora futura' 
      });
    }

    const allowedDurations = [15, 30, 45, 60];
    const defaultDurationByType = {
      general: 30,
      specialist: 45,
      'follow-up': 20
    };

    const computedDuration = Number(durationMinutes)
      || defaultDurationByType[consultationType]
      || 30;

    if (!allowedDurations.includes(computedDuration)) {
      return res.status(400).json({
        message: 'Duración inválida. Usa 15, 30, 45 o 60 minutos.'
      });
    }

    const appointmentEndDateTime = new Date(appointmentDateTime.getTime() + computedDuration * 60000);

    // Basic business hours validation: 08:00 - 20:00
    const startHour = appointmentDateTime.getHours();
    const endHour = appointmentEndDateTime.getHours();
    if (startHour < 8 || endHour >= 21) {
      return res.status(400).json({
        message: 'El horario disponible es de 08:00 a 20:00.'
      });
    }

    // Prevent schedule overlaps for the telemedicine doctor
    const dayStart = new Date(appointmentDateTime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(appointmentDateTime);
    dayEnd.setHours(23, 59, 59, 999);

    const sameDayAppointments = await Appointment.find({
      doctorName: 'Roberto Merino',
      status: 'scheduled',
      appointmentDate: { $gte: dayStart, $lte: dayEnd }
    }).select('appointmentDate durationMinutes consultationType');

    const hasConflict = sameDayAppointments.some((existing) => {
      const existingStart = new Date(existing.appointmentDate);
      const existingDuration = Number(existing.durationMinutes)
        || defaultDurationByType[existing.consultationType]
        || 30;
      const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000);

      return appointmentDateTime < existingEnd && appointmentEndDateTime > existingStart;
    });

    if (hasConflict) {
      return res.status(409).json({
        message: 'Ya existe una cita en ese bloque horario. Elige otro horario.'
      });
    }

    const appointment = new Appointment({
      userId: req.user._id,
      appointmentDate: appointmentDateTime,
      appointmentTime,
      durationMinutes: computedDuration,
      consultationType: consultationType || 'general',
      notes: notes || '',
      status: 'scheduled'
    });

    // Save appointment first to get the _id
    await appointment.save();

    // Generate telemedicine meeting link after saving (so we have the _id)
    try {
      const meetingLink = generateMeetingLink({
        _id: appointment._id,
        userId: appointment.userId,
        appointmentDate: appointment.appointmentDate
      });
      appointment.meetingLink = meetingLink;
      await appointment.save(); // Save again with the meeting link
      console.log(`✅ Meeting link generated for appointment ${appointment._id}: ${meetingLink}`);
    } catch (error) {
      console.error('⚠️ Error generating meeting link:', error);
      // Continue without meeting link - it can be generated later
    }

    // Add to user's bitácora
    const user = await User.findById(req.user._id);
    user.bitacora.push({
      type: 'appointment',
      appointmentId: appointment._id,
      date: new Date()
    });
    await user.save();

    res.status(201).json({
      message: 'Cita de telemedicina agendada exitosamente',
      appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ 
      message: 'Error al agendar la cita',
      error: error.message 
    });
  }
});

// Get all appointments for the authenticated user
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .sort({ appointmentDate: 1 });

    res.json({
      appointments,
      total: appointments.length
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      message: 'Error al obtener las citas',
      error: error.message 
    });
  }
});

// Get a specific appointment
router.get('/:appointmentId', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.appointmentId,
      userId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ 
      message: 'Error al obtener la cita',
      error: error.message 
    });
  }
});

// Cancel an appointment
router.put('/:appointmentId/cancel', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.appointmentId,
      userId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'La cita ya está cancelada' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      message: 'Cita cancelada exitosamente',
      appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ 
      message: 'Error al cancelar la cita',
      error: error.message 
    });
  }
});

module.exports = router;
