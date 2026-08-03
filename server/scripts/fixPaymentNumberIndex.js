#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    console.error('MONGO_URL is not configured');
    process.exit(1);
  }

  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  });

  const collection = mongoose.connection.db.collection('payments');

  console.log('Inspecting indexes on payments...');
  const indexes = await collection.indexes();
  indexes.forEach((index) => {
    console.log('-', index.name, JSON.stringify(index.key));
  });

  const paymentNumberIndex = indexes.find((index) => index.name === 'paymentNumber_1');

  if (!paymentNumberIndex) {
    console.log('No paymentNumber_1 index found. Nothing to fix.');
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log('Dropping existing paymentNumber_1 index...');
  await collection.dropIndex('paymentNumber_1');

  console.log('Creating partial unique index for paymentNumber (ignore null/missing)...');
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

  console.log('Index recreated successfully.');
  await mongoose.disconnect();
}

run()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Failed to fix paymentNumber index:', error.message);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Disconnect error:', disconnectError.message);
    }
    process.exit(1);
  });
