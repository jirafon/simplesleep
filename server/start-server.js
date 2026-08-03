#!/usr/bin/env node

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n🔧 Starting Siempresalud Backend Server...\n');
console.log('📂 Environment:', process.env.NODE_ENV || 'development');
console.log('🔑 JWT_SECRET configured:', !!process.env.JWT_SECRET);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware - MUST be before routes
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.path}`);
  console.log(`  IP: ${req.ip || req.connection.remoteAddress}`);
  console.log(`  User-Agent: ${req.get('user-agent') || 'N/A'}`);
  
  // Log request body (hide sensitive data)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    console.log(`  Body:`, JSON.stringify(sanitizedBody));
  }
  
  // Log query parameters if any
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`  Query:`, JSON.stringify(req.query));
  }
  
  // Log response status when it finishes
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '❌' : res.statusCode >= 300 ? '⚠️' : '✅';
    console.log(`${statusColor} [${timestamp}] ${req.method} ${req.originalUrl || req.path} -> ${res.statusCode} (${duration}ms)`);
    if (res.statusCode === 404) {
      console.log(`  ⚠️  Route not found: ${req.method} ${req.originalUrl || req.path}`);
    }
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    originalSend.call(this, data);
  };
  
  res.json = function(data) {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '❌' : res.statusCode >= 300 ? '⚠️' : '✅';
    console.log(`${statusColor} [${timestamp}] ${req.method} ${req.originalUrl || req.path} -> ${res.statusCode} (${duration}ms)`);
    if (res.statusCode === 404) {
      console.log(`  ⚠️  Route not found: ${req.method} ${req.originalUrl || req.path}`);
    }
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    originalJson.call(this, data);
  };
  
  next();
});

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud';

let isMongoConnected = false;

console.log('Intentando conectar a MongoDB...');
console.log('URI:', MONGO_URL.replace(/\/\/.*@/, '//***:***@')); // Ocultar credenciales en logs

mongoose.connect(MONGO_URL, {
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('   Database:', mongoose.connection.db.databaseName);
  console.log('   Host:', mongoose.connection.host);
  isMongoConnected = true;
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('\n📋 Soluciones posibles:');
  console.error('1. Verificar que MONGO_URL en .env sea correcta');
  console.error('2. Verificar que tu IP esté permitida en MongoDB Atlas (Network Access)');
  console.error('3. Verificar usuario y contraseña');
  console.error('4. Instalar MongoDB localmente: https://www.mongodb.com/try/download/community');
  console.error('5. Usar MongoDB Atlas (gratis): https://www.mongodb.com/cloud/atlas');
  console.error('\n⚠️  El servidor iniciará pero las operaciones de base de datos fallarán.\n');
  isMongoConnected = false;
});

// Middleware para verificar conexión MongoDB
app.use('/api', (req, res, next) => {
  if (!isMongoConnected && mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Servicio no disponible. La base de datos no está conectada.',
      error: 'MongoDB connection failed',
      solutions: [
        'Instalar MongoDB localmente',
        'Usar MongoDB Atlas (gratis)',
        'Configurar MONGO_URL en .env'
      ]
    });
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/appointments', require('./routes/appointments'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: isMongoConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  console.log(`\n❌ 404 - Route not found: ${req.method} ${req.originalUrl || req.path}`);
  console.log(`   Available routes:`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET  /api/user/bitacora`);
  console.log(`   - GET  /api/user/profile`);
  console.log(`   - POST /api/orders/create`);
  console.log(`   - POST /api/appointments/create`);
  console.log(`   - GET  /health\n`);
  
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl || req.path}`,
    availableRoutes: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/user/bitacora',
      'GET /api/user/profile',
      'POST /api/orders/create',
      'POST /api/appointments/create',
      'GET /health'
    ]
  });
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API endpoints: http://localhost:${PORT}/api`);
  console.log('\n📋 Available endpoints:');
  console.log('   POST /api/auth/register - Register user');
  console.log('   POST /api/auth/login - Login user');
  console.log('   GET  /api/user/bitacora - Get user history');
  console.log('   GET  /api/user/profile - Get user profile');
  console.log('   POST /api/orders/create - Create order');
  console.log('   POST /api/appointments/create - Create appointment');
  console.log('');
  
  // Check MongoDB connection status after a short delay
  setTimeout(() => {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB connection status: CONNECTED');
      console.log('✅ Database:', mongoose.connection.db.databaseName);
    } else if (mongoose.connection.readyState === 2) {
      console.log('⏳ MongoDB connection status: CONNECTING...');
    } else {
      console.warn('⚠️  MongoDB connection status: DISCONNECTED');
      console.warn('⚠️  API endpoints will return errors until MongoDB is connected.');
    }
    console.log('');
  }, 1000);
});
