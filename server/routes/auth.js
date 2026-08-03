const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { normalizeRut, isValidChileanRut } = require('../utils/rut');

// Generate JWT token
const generateToken = (userId) => {
  // Clean JWT_SECRET: remove spaces, quotes, and trim
  let jwtSecret = process.env.JWT_SECRET || 'saludsimple_secret_key_change_in_production';
  jwtSecret = jwtSecret.trim().replace(/^["']|["']$/g, ''); // Remove quotes and spaces
  return jwt.sign({ userId }, jwtSecret, {
    expiresIn: '30d'
  });
};

// Register - 2-minute registration process
router.post('/register', async (req, res) => {
  try {
    const { name, apellidoPaterno, apellidoMaterno, rut, email, password } = req.body;

    const normalizedName = String(name || '').trim();
    const normalizedApellidoPaterno = String(apellidoPaterno || '').trim();
    const normalizedApellidoMaterno = String(apellidoMaterno || '').trim();
    const normalizedRut = normalizeRut(rut);
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Validation
    if (!normalizedName || !normalizedApellidoPaterno || !normalizedApellidoMaterno || !normalizedRut || !normalizedEmail || !password) {
      return res.status(400).json({ 
        message: 'Por favor complete todos los campos requeridos' 
      });
    }

    if (!isValidChileanRut(normalizedRut)) {
      return res.status(400).json({
        message: 'El RUT ingresado no es valido'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Este email ya está registrado' 
      });
    }

    const existingRut = await User.findOne({ rut: normalizedRut });
    if (existingRut) {
      return res.status(400).json({
        message: 'Este RUT ya está registrado'
      });
    }

    // Create new user
    const user = new User({
      name: normalizedName,
      apellidoPaterno: normalizedApellidoPaterno,
      apellidoMaterno: normalizedApellidoMaterno,
      rut: normalizedRut,
      email: normalizedEmail,
      password,
      bitacora: []
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user._id,
        name: user.name,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno,
        rut: user.rut,
        email: user.email,
        userprofile: user.userprofile || 'user'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error al registrar usuario',
      error: error.message 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('\n🚨 ========== LOGIN ROUTE HIT ==========');
  console.log('Request headers:', req.headers);
  console.log('Request body:', { ...req.body, password: req.body?.password ? '***' : undefined });
  
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email, hasPassword: !!password });

    // Validation
    if (!email || !password) {
      console.log('❌ Login failed: Missing email or password');
      return res.status(400).json({ 
        message: 'Por favor ingrese email y contraseña' 
      });
    }

    // Find user (normalize email to lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔍 Searching for user:', normalizedEmail);
    
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log('❌ Login failed: User not found for email:', normalizedEmail);
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    console.log('✅ User found:', { id: user._id, email: user.email });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Login failed: Password mismatch for user:', user.email);
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    console.log('✅ Password match confirmed for user:', user.email);

    // Generate token
    console.log('🔐 Generating JWT token...');
    const token = generateToken(user._id);
    console.log('✅ Token generated, length:', token?.length);

    console.log('✅ Login successful for user:', user.email);

    const responseData = {
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno,
        rut: user.rut,
        email: user.email,
        userprofile: user.userprofile || 'user'
      }
    };

    console.log('📤 ABOUT TO SEND RESPONSE:');
    console.log('   Response data:', JSON.stringify(responseData, null, 2));
    console.log('   Token exists:', !!responseData.token);
    console.log('   Token type:', typeof responseData.token);
    console.log('   Token length:', responseData.token?.length);
    console.log('   User exists:', !!responseData.user);
    console.log('   User._id:', user._id);
    console.log('   User._id type:', typeof user._id);
    console.log('   User._id toString:', user._id.toString());
    console.log('   JSON string length:', JSON.stringify(responseData).length);
    
    // Try different serialization methods
    console.log('🧪 Testing serialization:');
    try {
      const test1 = JSON.stringify(responseData);
      console.log('   JSON.stringify works:', test1.length, 'chars');
      const test2 = JSON.parse(test1);
      console.log('   JSON.parse works:', !!test2);
    } catch (e) {
      console.error('   ❌ Serialization error:', e.message);
    }
    
    console.log('🚀 CALLING res.json() NOW...');
    console.log('   res.headersSent:', res.headersSent);
    console.log('   res.statusCode:', res.statusCode);
    
    // FORCE Content-Type header
    res.setHeader('Content-Type', 'application/json');
    
    // Create a clean response object with string ID
    const cleanResponse = {
      message: 'Login exitoso',
      token: responseData.token,
      user: {
        id: user._id.toString(), // Convert ObjectId to string explicitly
        name: user.name,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno,
        rut: user.rut,
        email: user.email,
        userprofile: user.userprofile || 'user'
      }
    };
    
    console.log('🧹 Clean response:', JSON.stringify(cleanResponse, null, 2));
    
    // Explicitly set status and send
    res.status(200).json(cleanResponse);
    
    console.log('✅ res.json() CALLED');
    console.log('   res.headersSent after:', res.headersSent);
    console.log('🚨 ========== LOGIN ROUTE END ==========\n');
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error al iniciar sesión',
      error: error.message 
    });
  }
});

// Forgot Password - Generate reset token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Por favor ingrese su email' 
      });
    }

    // Find user
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return res.json({ 
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' 
      });
    }

    // Generate reset token (simple 6-digit code for demo)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the token before saving (for security)
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Save token and expiration (15 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutos
    await user.save();

    console.log('🔑 Password reset requested for:', user.email);
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔑 Reset token (dev only):', resetToken);
    }

    // Enviar email con Mailgun si está configurado
    let mailSent = false;
    let mailError = null;
    if (emailService && emailService.isConfigured && emailService.isConfigured()) {
      try {
        const result = await emailService.sendPasswordResetEmail(normalizedEmail, resetToken);
        mailSent = !!result?.success;
        console.log('📧 Mailgun send result:', result);
      } catch (err) {
        mailError = err.message || String(err);
        console.error('❌ Error enviando email con Mailgun:', mailError);
      }
    } else {
      console.warn('⚠️  Mailgun no está configurado. Configura MAILGUN_API_KEY y MAILGUN_DOMAIN para envío de emails.');
    }

    res.json({
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      emailSent: mailSent,
      emailError: process.env.NODE_ENV !== 'production' ? mailError : undefined,
      // SOLO PARA DESARROLLO: Retornar el token en dev para pruebas rápidas
      devToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Error al procesar solicitud',
      error: error.message 
    });
  }
});

// Reset Password - Validate token and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ 
        message: 'Por favor complete todos los campos' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Find user
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Token inválido o expirado' 
      });
    }

    // Hash the provided token to compare
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Verify token matches and hasn't expired
    if (user.resetPasswordToken !== hashedToken) {
      return res.status(400).json({ 
        message: 'Token inválido o expirado' 
      });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ 
        message: 'Token inválido o expirado' 
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    console.log('✅ Password reset successful for:', user.email);

    res.json({
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Error al restablecer contraseña',
      error: error.message 
    });
  }
});

module.exports = router;
