#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

function buildPaymentNumber(index) {
  return `PAY-${String(index).padStart(8, '0')}`;
}

async function syncPaymentCounter(db, maxSequence) {
  const counters = db.collection('counters');
  await counters.updateOne(
    { _id: 'paymentNumber' },
    {
      $set: {
        seq: maxSequence,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );
}

async function ensurePaymentNumberIndex(collection) {
  const indexes = await collection.indexes();
  const existing = indexes.find((index) => index.name === 'paymentNumber_1');

  if (existing) {
    await collection.dropIndex('paymentNumber_1');
  }

  await collection.createIndex(
    { paymentNumber: 1 },
    {
      name: 'paymentNumber_1',
      unique: true,
      partialFilterExpression: {
        paymentNumber: { $type: 'string' }
      }
    }
  );
}

async function run() {
  const apply = process.argv.includes('--apply');
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('MONGO_URL is not configured');
  }

  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  });

  const collection = mongoose.connection.db.collection('payments');
  const db = mongoose.connection.db;

  const payments = await collection
    .find({}, { projection: { _id: 1, createdAt: 1 } })
    .sort({ createdAt: 1, _id: 1 })
    .toArray();

  console.log(`Payments found: ${payments.length}`);

  if (payments.length === 0) {
    console.log('No payments to resequence.');
    return;
  }

  const operations = payments.map((payment, idx) => ({
    updateOne: {
      filter: { _id: payment._id },
      update: {
        $set: {
          paymentNumber: buildPaymentNumber(idx)
        }
      }
    }
  }));

  console.log('Preview first payment numbers:');
  payments.slice(0, 5).forEach((payment, idx) => {
    console.log(`- ${payment._id} -> ${buildPaymentNumber(idx)}`);
  });

  if (!apply) {
    console.log('Dry-run mode. No changes were written.');
    console.log('Run again with --apply to execute the resequencing.');
    return;
  }

  console.log('Recreating paymentNumber index for safe resequencing...');
  await ensurePaymentNumberIndex(collection);

  console.log('Applying resequencing updates...');
  const result = await collection.bulkWrite(operations, { ordered: true });
  console.log(`Modified documents: ${result.modifiedCount}`);

  console.log('Re-validating paymentNumber index...');
  await ensurePaymentNumberIndex(collection);

  const maxSequence = payments.length - 1;
  console.log(`Syncing payment counter to ${maxSequence}...`);
  await syncPaymentCounter(db, maxSequence);

  console.log('Payment number resequencing completed successfully.');
}

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Failed to resequence payment numbers:', error.message);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Disconnect error:', disconnectError.message);
    }
    process.exit(1);
  });
