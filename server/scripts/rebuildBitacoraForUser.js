require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');

function parseArgs(argv) {
  const args = { email: '', apply: false };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    if ((current === '--email' || current === '-e') && next) {
      args.email = String(next).trim();
      i += 1;
      continue;
    }

    if (current === '--apply') {
      args.apply = true;
    }
  }

  return args;
}

function buildOrderBitacoraEntry(order) {
  const packItem = Array.isArray(order.cartItems)
    ? order.cartItems.find((item) => String(item?.pricingType || '').toLowerCase() === 'pack')
    : null;

  const title = packItem?.name
    ? `Orden Medica (${packItem.name})`
    : `Orden Medica (${order.examName || 'Examenes medicos'})`;

  return {
    type: 'order',
    orderId: order._id,
    title,
    description: packItem ? 'Orden tipo pack en historial' : 'Orden medica en historial',
    status: order.status || 'pending',
    date: order.createdAt || new Date(),
    documents: []
  };
}

async function main() {
  const { email, apply } = parseArgs(process.argv.slice(2));

  if (!email) {
    console.error('Uso: node scripts/rebuildBitacoraForUser.js --email <correo> [--apply]');
    process.exit(1);
  }

  if (!process.env.MONGO_URL) {
    console.error('Falta MONGO_URL en el entorno.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL);

  try {
    const user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } })
      .select('_id email name bitacora')
      .lean();

    if (!user) {
      console.error(`Usuario no encontrado: ${email}`);
      process.exit(1);
    }

    const orders = await Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .select('_id status createdAt examName cartItems')
      .lean();

    const orderBitacora = orders.map((order) => buildOrderBitacoraEntry(order));

    const result = {
      dryRun: !apply,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name || null
      },
      ordersFound: orders.length,
      bitacoraCurrent: Array.isArray(user.bitacora) ? user.bitacora.length : 0,
      bitacoraRebuilt: orderBitacora.length,
      preview: orderBitacora.slice(0, 10).map((entry) => ({
        title: entry.title,
        status: entry.status,
        date: entry.date,
        orderId: String(entry.orderId)
      }))
    };

    if (apply) {
      await User.updateOne(
        { _id: user._id },
        { $set: { bitacora: orderBitacora } }
      );
      result.applied = true;
      result.message = 'Bitacora reconstruida correctamente';
    } else {
      result.applied = false;
      result.message = 'Dry-run completado. Usa --apply para guardar cambios';
    }

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('Error reconstruyendo bitacora:', error.message);
  process.exit(1);
});
