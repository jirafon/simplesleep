const User = require('../models/User');

/**
 * Middleware para verificar que el usuario es admin
 */
const admin = async (req, res, next) => {
  try {
    // El middleware auth ya debe haber ejecutado y agregado req.user
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado. Debes iniciar sesión.' });
    }

    // Verificar si el usuario es admin
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    if (user.userprofile !== 'admin' && user.userprofile !== 'superadmin') {
      console.log(`❌ Acceso denegado a admin: ${user.email} (userprofile: ${user.userprofile})`);
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }

    // Usuario es admin, continuar
    next();
  } catch (error) {
    console.error('Error en middleware admin:', error);
    res.status(500).json({ 
      message: 'Error al verificar permisos de administrador',
      error: error.message 
    });
  }
};

module.exports = admin;
