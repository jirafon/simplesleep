const User = require('../models/User');

/**
 * Middleware para verificar que el usuario es doctor
 */
const doctor = async (req, res, next) => {
  try {
    // El middleware auth ya debe haber ejecutado y agregado req.user
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado. Debes iniciar sesión.' });
    }

    // Verificar si el usuario es doctor
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Permitir acceso a perfiles 'doctor', 'admin' y 'superadmin'
    const allowedProfiles = ['doctor', 'admin', 'superadmin'];
    if (!allowedProfiles.includes(user.userprofile)) {
      console.log(`❌ Acceso denegado a doctor: ${user.email} (userprofile: ${user.userprofile})`);
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requieren permisos de doctor.' 
      });
    }

    // Usuario es doctor, continuar
    next();
  } catch (error) {
    console.error('Error en middleware doctor:', error);
    res.status(500).json({ 
      message: 'Error al verificar permisos de doctor',
      error: error.message 
    });
  }
};

module.exports = doctor;
