#!/usr/bin/env node

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Order = require('./models/Order');
const User = require('./models/User');
const { generateMedicalOrderPdf } = require('./services/orderPdfService');

// Diagnostic logging
console.log('\n🚀 ========== SERVER STARTING ==========');
console.log('📂 __dirname:', __dirname);
console.log('📂 process.cwd():', process.cwd());
console.log('📂 NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('📂 PORT:', process.env.PORT || '5001');
console.log('📂 Directory contents:');
try {
  const files = fs.readdirSync(__dirname);
  files.slice(0, 15).forEach(file => {
    const stats = fs.statSync(path.join(__dirname, file));
    console.log(`   ${stats.isDirectory() ? '📁' : '📄'} ${file}`);
  });
  if (files.length > 15) {
    console.log(`   ... and ${files.length - 15} more`);
  }
} catch (err) {
  console.error('❌ Error reading directory:', err.message);
}
console.log('=======================================\n');

// Load environment variables from server directory
const envPath = path.join(__dirname, '.env');
console.log('📁 Loading .env from:', envPath);
console.log('📁 .env file exists:', fs.existsSync(envPath));

const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.error('❌ Error loading .env:', envResult.error.message);
} else {
  console.log('✅ .env loaded successfully');
}

console.log('\n🔧 Starting Siempresalud Backend Server...\n');
console.log('📂 Environment:', process.env.NODE_ENV || 'development');
console.log('🔑 JWT_SECRET configured:', !!process.env.JWT_SECRET);
console.log('🔗 MONGO_URL configured:', !!process.env.MONGO_URL);
if (process.env.MONGO_URL) {
  console.log('🔗 MONGO_URL (sanitized):', process.env.MONGO_URL.replace(/\/\/.*@/, '//***:***@'));
}
console.log('🤖 OPEN_API_KEY configured:', !!process.env.OPEN_API_KEY);
if (process.env.OPEN_API_KEY) {
  const apiKey = process.env.OPEN_API_KEY.trim();
  const preview = apiKey.length > 10 
    ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}` 
    : '***';
  console.log('🤖 OPEN_API_KEY preview:', preview);
  if (!apiKey.startsWith('sk-')) {
    console.warn('⚠️  OPEN_API_KEY no parece ser una API key válida de OpenAI (debería comenzar con "sk-")');
  }
}

const app = express();

// Configurar timeouts del servidor para evitar cuelgues
app.use((req, res, next) => {
  // Timeout de 30 segundos para todas las requests
  res.setTimeout(30000, () => {
    console.error(`⏰ Request timeout: ${req.method} ${req.path}`);
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        message: 'Request timeout',
        error: 'Server response timeout after 30 seconds'
      });
    }
  });
  next();
});

// IMMEDIATE TEST - Log every single request at the very start
app.use('*', (req, res, next) => {
  console.log(`🔴 RAW REQUEST: ${req.method} ${req.originalUrl} ${req.path}`);
  next();
});

// EARLY logging middleware - captures ALL requests immediately
app.use((req, res, next) => {
  console.log(`\n🔔 INCOMING REQUEST: ${req.method} ${req.originalUrl || req.path}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log(`   IP: ${req.ip || req.connection.remoteAddress}`);
  next();
});

// Middleware with explicit CORS configuration
app.use(cors({
  origin: true, // Allow all origins in development/production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DEBUG: Intercept res.json to see what's being sent
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    console.log('🔍 DEBUG res.json() intercepted:');
    console.log('   Path:', req.path);
    console.log('   Data type:', typeof data);
    console.log('   Data is null:', data === null);
    console.log('   Data is undefined:', data === undefined);
    console.log('   Data keys:', data ? Object.keys(data) : 'N/A');
    console.log('   Stringified length:', JSON.stringify(data).length);
    console.log('   First 200 chars:', JSON.stringify(data).substring(0, 200));
    return originalJson(data);
  };
  next();
});

// Fallback download route for order PDFs.
// In Render, local files may disappear between deploys/restarts, so we regenerate on demand.
app.get('/downloads/orders/:fileName', async (req, res, next) => {
  try {
    const { fileName } = req.params;
    const localFilePath = path.join(__dirname, 'downloads', 'orders', fileName);
    const orderMatch = /^orden-medica-([a-fA-F0-9]{24})(?:-\d+)?\.pdf$/i.exec(fileName);
    const setNoCacheHeaders = () => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Surrogate-Control', 'no-store');
    };

    // For medical orders, regenerate before serving so old stored files don't miss updated signature/name.
    if (!orderMatch && fs.existsSync(localFilePath)) {
      setNoCacheHeaders();
      return res.sendFile(localFilePath);
    }

    if (!orderMatch) {
      return next();
    }

    const order = await Order.findById(orderMatch[1]);
    if (!order) {
      return res.status(404).send('Archivo no encontrado');
    }

    const user = await User.findById(order.userId).select('name email');
    if (!user) {
      return res.status(404).send('Archivo no encontrado');
    }

    const generatedPdf = await generateMedicalOrderPdf({ order, user });

    if (fs.existsSync(localFilePath)) {
      setNoCacheHeaders();
      return res.sendFile(localFilePath);
    }

    if (generatedPdf?.filePath && fs.existsSync(generatedPdf.filePath)) {
      setNoCacheHeaders();
      return res.sendFile(generatedPdf.filePath);
    }

    return res.status(404).send('Archivo no encontrado');
  } catch (error) {
    console.error('❌ Error serving order PDF download:', error);
    return res.status(500).send('Error al preparar la descarga del PDF');
  }
});

// Public downloads (PDFs, etc.)
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

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
  
  // Use 'finish' event instead of wrapping response methods
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '❌' : res.statusCode >= 300 ? '⚠️' : '✅';
    console.log(`${statusColor} [${timestamp}] ${req.method} ${req.originalUrl || req.path} -> ${res.statusCode} (${duration}ms)`);
    if (res.statusCode === 404) {
      console.log(`  ⚠️  Route not found: ${req.method} ${req.originalUrl || req.path}`);
    }
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  });
  
  next();
});

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud';

let isMongoConnected = false;

console.log('\n🔍 MongoDB Connection Debug:');
console.log('   MONGO_URL from env:', process.env.MONGO_URL ? '✅ Found' : '❌ NOT FOUND');
if (process.env.MONGO_URL) {
  console.log('   MONGO_URL (sanitized):', process.env.MONGO_URL.replace(/\/\/.*@/, '//***:***@'));
} else {
  console.log('   ⚠️  Using default localhost URL (MONGO_URL not set in .env)');
}
console.log('   Final MONGO_URL (sanitized):', MONGO_URL.replace(/\/\/.*@/, '//***:***@'));

console.log('\nIntentando conectar a MongoDB...');
console.log('URI:', MONGO_URL.replace(/\/\/.*@/, '//***:***@')); // Ocultar credenciales en logs

// Configuración de MongoDB con timeouts optimizados para producción
const mongooseOptions = {
  serverSelectionTimeoutMS: 15000,    // 15s para selección de servidor
  connectTimeoutMS: 15000,            // 15s para conectar
  socketTimeoutMS: 20000,             // 20s para operaciones de socket
  heartbeatFrequencyMS: 5000,         // 5s ping para mantener conexión
  maxPoolSize: 10,                    // Pool de conexiones
  minPoolSize: 2,                     // Mínimo de conexiones activas
  maxIdleTimeMS: 30000,               // 30s antes de cerrar conexiones idle
  // Removidas opciones deprecated/no soportadas:
  // bufferCommands: false,           // No compatible con versiones nuevas
  // bufferMaxEntries: 0,             // No compatible con versiones nuevas
  // useNewUrlParser: true,           // Deprecated
  // useUnifiedTopology: true,        // Deprecated
};

console.log('🔧 MongoDB Configuration:', {
  serverSelectionTimeout: mongooseOptions.serverSelectionTimeoutMS + 'ms',
  connectTimeout: mongooseOptions.connectTimeoutMS + 'ms', 
  socketTimeout: mongooseOptions.socketTimeoutMS + 'ms',
  maxPoolSize: mongooseOptions.maxPoolSize,
});

// Función para iniciar el servidor solo después de MongoDB
async function startServer() {
  try {
    console.log('🔄 Waiting for MongoDB connection...');
    await mongoose.connect(MONGO_URL, mongooseOptions);
    
    console.log('✅ MongoDB connected successfully');
    console.log('   Database:', mongoose.connection.db.databaseName);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Port:', mongoose.connection.port);
    console.log('   ReadyState:', mongoose.connection.readyState);
    isMongoConnected = true;
    
    // Test de escritura inicial para verificar que todo funciona
    console.log('🧪 Testing MongoDB write operation...');
    const TestModel = mongoose.model('StartupTest', new mongoose.Schema({ test: String, timestamp: Date }));
    const testDoc = await TestModel.create({ test: 'server-startup', timestamp: new Date() });
    console.log('✅ MongoDB write test successful:', testDoc._id);
    await TestModel.deleteOne({ _id: testDoc._id });
    
    // AHORA que MongoDB está listo, iniciar el servidor HTTP
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log('\n🎉 ===== SERVER READY =====');
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API endpoints: http://localhost:${PORT}/api`);
      console.log('✅ MongoDB: Connected and ready');
      console.log('🔧 Flow Service: Configured with mock for development');
      console.log('========================\n');
    });
      
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('\n📋 DIAGNÓSTICO DE CONNECTION ERROR:');
    
    if (err.message.includes('ENOTFOUND')) {
      console.error('🌐 DNS/HOST ERROR:');
      console.error('   - Host no encontrado en MONGO_URL');
      console.error('   - Verificar formato de connection string');
      console.error('   - Revisar configuración de DNS');
    }
    
    if (err.message.includes('authentication failed')) {
      console.error('🔐 AUTHENTICATION ERROR:');
      console.error('   - Usuario/contraseña incorrectos');
      console.error('   - Usuario no tiene permisos en la base de datos');
      console.error('   - Verificar credenciales en MongoDB Atlas');
    }
    
    if (err.message.includes('timeout')) {
      console.error('⏰ TIMEOUT ERROR:');
      console.error('   - MongoDB Atlas cluster pausado/dormido');
      console.error('   - IP no autorizada en Network Access List');
      console.error('   - Conectividad de red lenta');
      console.error('   - Firewall bloqueando puerto 27017');
    }
    
    console.error('\n📋 SOLUCIONES POSIBLES:');
    console.error('1. Verificar que MONGO_URL en .env sea correcta');
    console.error('2. Verificar que tu IP esté permitida en MongoDB Atlas (0.0.0.0/0 para desarrollo)');
    console.error('3. Verificar usuario y contraseña en MongoDB Atlas');
    console.error('4. Verificar que el cluster esté activo (no pausado)');
    console.error('5. Instalar MongoDB localmente: https://www.mongodb.com/try/download/community');
    console.error('6. Usar MongoDB Atlas (gratis): https://www.mongodb.com/cloud/atlas');
    console.error('\n❌ El servidor NO se iniciará hasta que MongoDB esté conectado.\n');
    process.exit(1);
  }
}

// Event listeners para monitorear conexión
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
  isMongoConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
  isMongoConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
  isMongoConnected = false;
});

// Middleware para verificar conexión MongoDB con diagnóstico detallado
app.use('/api', (req, res, next) => {
  const currentReadyState = mongoose.connection.readyState;
  const stateNames = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  
  // Log estado de MongoDB para requests de health data
  if (req.path.includes('/health/data')) {
    console.log(`🔍 MongoDB Status Check for ${req.method} ${req.path}:`);
    console.log(`   ReadyState: ${currentReadyState} (${stateNames[currentReadyState]})`);
    console.log(`   isMongoConnected flag: ${isMongoConnected}`);
  }
  
  if (currentReadyState !== 1) {
    console.error(`❌ MongoDB not ready for request: ${req.method} ${req.path}`);
    console.error(`   Current state: ${stateNames[currentReadyState]} (${currentReadyState})`);
    console.error(`   Connection host: ${mongoose.connection.host || 'unknown'}`);
    console.error(`   Connection db: ${mongoose.connection.name || 'unknown'}`);
    
    return res.status(503).json({ 
      success: false,
      message: 'Database service unavailable',
      error: 'MongoDB connection not ready',
      debug: {
        mongoState: stateNames[currentReadyState],
        stateCode: currentReadyState,
        host: mongoose.connection.host,
        dbName: mongoose.connection.name
      },
      solutions: [
        'Check MongoDB Atlas cluster status',
        'Verify Network Access whitelist', 
        'Check MONGO_URL environment variable',
        'Restart server after fixing connection'
      ]
    });
  }
  next();
});

// Routes
console.log('📍 Registering API routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/health', require('./routes/health'));
app.use('/api/wellness', require('./routes/wellness'));
app.use('/api/sleep/v1', require('./routes/sleep'));
app.use('/api/mobile', require('./routes/mobile'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/doctor', require('./routes/doctor'));

// Backward-compatible aliases for older mobile clients that call routes without /api
app.use('/health', require('./routes/health'));
app.use('/mobile', require('./routes/mobile'));
console.log('✅ API routes registered');
console.log('   Available routes:');
console.log('   - POST /api/auth/register');
console.log('   - POST /api/auth/login');
console.log('   - GET  /api/user/bitacora');
console.log('   - POST /api/health/data');
console.log('   - GET  /api/health/status');
console.log('   - GET  /api/sleep/v1/today');
console.log('   - POST /api/orders/create');
console.log('   - POST /api/payments/create');
console.log('   - POST /api/appointments/create');
console.log('   - GET  /health');

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested from:', req.ip || req.connection.remoteAddress);
  res.json({
    status: 'ok',
    mongodb: isMongoConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    server: 'siempresalud-server',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Environment diagnostic endpoint (for debugging only)
app.get('/api/debug/env', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasMongoUrl: !!process.env.MONGO_URL,
    mongoConnected: isMongoConnected,
    jwtSecretLength: process.env.JWT_SECRET?.length,
    port: process.env.PORT || 5001
  });
});

// Test endpoint to debug JSON responses
app.get('/api/test/json', (req, res) => {
  console.log('🧪 TEST ENDPOINT CALLED: /api/test/json');
  const testData = {
    success: true,
    message: 'This is a test response',
    token: 'test-token-12345',
    user: {
      id: '123',
      name: 'Test User',
      email: 'test@example.com'
    },
    timestamp: new Date().toISOString()
  };
  console.log('🧪 Sending test data:', JSON.stringify(testData));
  res.json(testData);
});

// Build diagnostic endpoint
app.get('/api/debug/build-info', (req, res) => {
  const possiblePaths = [
    path.join(__dirname, 'public'),
    path.join(__dirname, '../client/build'),
    path.join(__dirname, '../build')
  ];

  const buildInfo = {
    nodeEnv: process.env.NODE_ENV,
    currentDir: __dirname,
    paths: possiblePaths.map(p => ({
      path: p,
      exists: fs.existsSync(p),
      hasIndex: fs.existsSync(path.join(p, 'index.html')),
      contents: fs.existsSync(p) ? fs.readdirSync(p).slice(0, 10) : []
    }))
  };

  res.json(buildInfo);
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Try multiple possible locations for frontend build
  const possiblePaths = [
    path.join(__dirname, 'public'),           // First: /server/public (copied during build)
    path.join(__dirname, '../client/build'),  // Fallback: /client/build (original location)
    path.join(__dirname, '../build')          // Alternative: /build at root level
  ];
  
  let buildPath = null;
  let indexPath = null;
  
  console.log('\n📦 Production mode: Searching for React build...');
  console.log('   Current directory (__dirname):', __dirname);
  console.log('   Checking paths:');
  
  for (const tryPath of possiblePaths) {
    const tryIndexPath = path.join(tryPath, 'index.html');
    const pathExists = fs.existsSync(tryPath);
    const indexExists = fs.existsSync(tryIndexPath);
    
    console.log(`     - ${tryPath}`);
    console.log(`       Directory exists: ${pathExists}`);
    if (pathExists) {
      const files = fs.readdirSync(tryPath).slice(0, 5); // First 5 files
      console.log(`       Contents (first 5): ${files.join(', ')}`);
    }
    console.log(`       index.html exists: ${indexExists}`);
    
    if (indexExists) {
      buildPath = tryPath;
      indexPath = tryIndexPath;
      console.log(`\n   ✅ Frontend found at: ${buildPath}`);
      break; // Use the first valid path
    }
  }
  
  if (buildPath && indexPath) {
    console.log(`\n✅ Serving static files from: ${buildPath}`);

    // Serve static files ONLY for non-API routes
    app.use((req, res, next) => {
      // Skip static file serving for API routes
      if (req.path.startsWith('/api/')) {
        console.log('🔀 Skipping static serving for API route:', req.path);
        return next();
      }
      express.static(buildPath, {
        maxAge: '1d',
        etag: true
      })(req, res, next);
    });

    // Catch-all handler: serve React app for any non-API routes
    app.get('*', (req, res) => {
      // Skip API routes
      if (req.path.startsWith('/api')) {
        return res.status(404).json({
          error: 'Route not found',
          message: `API endpoint ${req.method} ${req.path} not found`
        });
      }
      
      // Log non-API requests in production for debugging
      console.log(`📄 Serving index.html for: ${req.path}`);
      
      // Serve React app for all other routes
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('❌ Error sending index.html:', err);
          res.status(500).json({
            error: 'Error serving frontend',
            message: err.message
          });
        }
      });
    });
  } else {
    console.error('\n❌ Frontend build files NOT FOUND!');
    console.error('   Searched in:');
    possiblePaths.forEach(p => {
      console.error(`     - ${p} (${fs.existsSync(p) ? 'exists but no index.html' : 'does not exist'})`);
    });
    console.error('\n⚠️  The server will return 500 for non-API routes.');
    console.error('   Please check that the build process completed successfully.');
    
    // Fallback error handler
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({
          error: 'Route not found',
          message: `API endpoint ${req.method} ${req.path} not found`
        });
      }
      
      console.error(`❌ Request to ${req.path} failed - no frontend build available`);
      res.status(500).json({
        error: 'Frontend not built',
        message: 'The React app build files are missing. Please ensure the build completed successfully and the frontend files were copied to server/public.',
        checkedPaths: possiblePaths
      });
    });
  }
} else {
  // 404 handler for undefined routes (development only)
  app.use((req, res, next) => {
    // Skip 404 for API routes that might be proxied
    if (req.path.startsWith('/api')) {
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
    } else {
      // For non-API routes in development, just return a message
      res.status(404).json({
        error: 'Route not found',
        message: `In development, the frontend should be running separately on port 3000. This is the backend API server.`,
        note: 'Run the frontend with: cd client && npm start'
      });
    }
  });
}

const PORT = process.env.PORT || 5001;

// INICIAR SERVIDOR - Solo después de que MongoDB esté conectado
startServer();
