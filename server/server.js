const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`📨 ${timestamp} | ${method} ${url} | IP: ${ip}`);
  
  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`📤 ${timestamp} | ${method} ${url} | Status: ${res.statusCode}`);
    return originalSend.call(this, data);
  };
  
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/admin', require('./routes/admin'));
const healthRoutes = require('./routes/health');

// Health API routes
app.use('/health', healthRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud';

let isMongoConnected = false;

mongoose.connect(MONGO_URL, {
  serverSelectionTimeoutMS: 5000, // Timeout después de 5 segundos
})
.then(() => {
  console.log('MongoDB connected successfully');
  isMongoConnected = true;
})
.catch((err) => {
  console.error('MongoDB connection error:', err.message);
  console.error('Por favor verifique que MongoDB esté corriendo o configure MONGO_URL en .env');
  console.error('El servidor iniciará pero las operaciones de base de datos fallarán');
  isMongoConnected = false;
});

// Middleware para verificar conexión MongoDB antes de rutas que la requieren
app.use('/api', (req, res, next) => {
  if (!isMongoConnected && mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Servicio no disponible. La base de datos no está conectada.',
      error: 'MongoDB connection failed. Please check your MongoDB connection or MONGO_URL in .env file'
    });
  }
  next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (!isMongoConnected) {
    console.warn('⚠️  WARNING: MongoDB is not connected. API endpoints will return errors.');
  }
});
