/**
 * Non-destructive data migration notes / soft alias script for SiempreSleep.
 *
 * Does NOT delete production data.
 * Optionally dual-writes helpContacts from panicAlertContacts for readability.
 *
 * Dry-run (default):
 *   node scripts/migrateHelpButtonAliases.js
 *
 * Apply:
 *   node scripts/migrateHelpButtonAliases.js --apply
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const APPLY = process.argv.includes('--apply');

async function main() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/siempresalud';
  await mongoose.connect(mongoUrl);

  const users = await User.find({
    'wellnessProfile.panicAlertContacts': { $exists: true }
  }).select('email wellnessProfile.panicAlertContacts wellnessProfile.helpContacts');

  console.log(`Found ${users.length} users with panicAlertContacts`);
  console.log(APPLY ? 'APPLY mode — writing helpContacts aliases' : 'DRY RUN — no writes');

  let updated = 0;
  for (const user of users) {
    const contacts = user.wellnessProfile?.panicAlertContacts;
    if (!contacts) continue;
    if (!APPLY) {
      console.log(` would alias helpContacts for ${user.email}`);
      continue;
    }
    user.wellnessProfile.helpContacts = contacts;
    // Keep panicAlertContacts for APK compatibility — do not delete
    await user.save();
    updated += 1;
  }

  console.log(`Done. Updated=${updated}. Historical panic_alert logs retained.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
