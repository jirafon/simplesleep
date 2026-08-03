require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const flowService = require('../services/flowService');

async function main() {
  const missingVars = ['FLOW_API_KEY', 'FLOW_SECRET_KEY'].filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    console.error('Missing required Flow environment variables:', missingVars.join(', '));
    process.exit(1);
  }

  const timestamp = Date.now();
  const paymentData = {
    commerceOrder: `flow-smoke-${timestamp}`,
    subject: `Smoke test Flow ${flowService.environment} Siempresalud`,
    amount: 1000,
    email: 'test@siempresalud.com',
    urlConfirmation: process.env.BACKEND_URL || 'https://example.com/api/payments/confirm',
    urlReturn: process.env.FRONTEND_URL || 'https://example.com/payment/result',
    currency: 'CLP',
    taxes: 0
  };

  console.log(`Testing Flow ${flowService.environment} payment creation...`);
  console.log({
    environment: flowService.environment,
    baseUrl: flowService.baseUrl,
    commerceOrder: paymentData.commerceOrder,
    amount: paymentData.amount
  });

  const result = await flowService.createPayment(paymentData);

  if (!result.success) {
    console.error(`Flow ${flowService.environment} test failed.`);
    console.error(result);
    process.exit(1);
  }

  console.log(`Flow ${flowService.environment} test succeeded.`);
  console.log({
    token: result.token,
    url: result.url,
    flowOrder: result.flowOrder
  });
}

main().catch((error) => {
  console.error('Unexpected error running Flow sandbox test:', error.message);
  process.exit(1);
});