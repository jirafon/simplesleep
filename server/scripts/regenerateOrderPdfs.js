#!/usr/bin/env node

/**
 * Regenera PDFs de ordenes medicas para aplicar plantilla/firma actualizada.
 *
 * Uso (simulacion):
 *   node scripts/regenerateOrderPdfs.js
 *
 * Uso (aplicar cambios):
 *   node scripts/regenerateOrderPdfs.js --apply
 *
 * Filtros opcionales:
 *   --limit=100
 *   --orderId=<mongoObjectId>
 *   --userEmail=<email>
 */

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Order = require('../models/Order');
const User = require('../models/User');
const { generateMedicalOrderPdf } = require('../services/orderPdfService');

const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

function parseArgs(argv) {
  const args = {
    apply: false,
    limit: 0,
    orderId: '',
    userEmail: ''
  };

  argv.forEach((arg) => {
    if (arg === '--apply') {
      args.apply = true;
      return;
    }

    if (arg.startsWith('--limit=')) {
      const value = Number.parseInt(arg.split('=')[1], 10);
      args.limit = Number.isFinite(value) && value > 0 ? value : 0;
      return;
    }

    if (arg.startsWith('--orderId=')) {
      args.orderId = String(arg.split('=')[1] || '').trim();
      return;
    }

    if (arg.startsWith('--userEmail=')) {
      args.userEmail = String(arg.split('=')[1] || '').trim().toLowerCase();
    }
  });

  return args;
}

function buildSummary(counters) {
  return [
    `Total evaluadas: ${counters.total}`,
    `Regeneradas: ${counters.regenerated}`,
    `Omitidas (sin usuario): ${counters.skippedNoUser}`,
    `Errores: ${counters.failed}`
  ].join('\n');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('MONGO_URL no esta configurado en server/.env');
  }

  if (options.orderId && !mongoose.Types.ObjectId.isValid(options.orderId)) {
    throw new Error('orderId invalido. Debe ser un ObjectId valido.');
  }

  console.log('Iniciando regeneracion de PDFs de ordenes...');
  console.log(`Modo: ${options.apply ? 'APLICAR' : 'SIMULACION'}`);

  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 1,
  });

  const query = {};

  if (options.orderId) {
    query._id = options.orderId;
  }

  if (options.userEmail) {
    const user = await User.findOne({ email: options.userEmail }).select('_id');
    if (!user) {
      console.log(`No existe usuario con email: ${options.userEmail}`);
      await mongoose.disconnect();
      return;
    }
    query.userId = user._id;
  }

  let orderQuery = Order.find(query).sort({ createdAt: -1 });
  if (options.limit > 0) {
    orderQuery = orderQuery.limit(options.limit);
  }

  const orders = await orderQuery;

  if (!orders.length) {
    console.log('No se encontraron ordenes para procesar.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Ordenes encontradas: ${orders.length}`);

  const counters = {
    total: 0,
    regenerated: 0,
    skippedNoUser: 0,
    failed: 0,
  };

  for (const order of orders) {
    counters.total += 1;

    try {
      const user = await User.findById(order.userId).select('name email');
      if (!user) {
        counters.skippedNoUser += 1;
        console.log(`[SKIP] ${order._id} -> usuario no encontrado`);
        continue;
      }

      if (!options.apply) {
        console.log(`[DRY-RUN] ${order._id} -> se regeneraria PDF para ${user.email}`);
        continue;
      }

      const { fileName, s3Key, s3Url } = await generateMedicalOrderPdf({ order, user });
      order.pdfLink = `/downloads/orders/${fileName}`;

      if (s3Key) {
        order.pdfS3Key = s3Key;
      }

      if (s3Url) {
        order.digitalDownloadLink = s3Url;
      }

      order.logs.push({
        action: 'pdf_generated',
        performedBy: null,
        performedByName: 'Sistema (regeneracion masiva)',
        previousStatus: order.status,
        newStatus: order.status,
        notes: 'PDF regenerado para actualizar firma y plantilla'
      });

      await order.save();
      counters.regenerated += 1;
      console.log(`[OK] ${order._id} -> ${fileName}`);
    } catch (error) {
      counters.failed += 1;
      console.error(`[ERROR] ${order._id} -> ${error.message}`);
    }
  }

  console.log('\nResumen');
  console.log(buildSummary(counters));

  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('Fallo en regeneracion:', error.message);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    process.exit(1);
  });
