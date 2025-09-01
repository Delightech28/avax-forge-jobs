// scripts/migrate-verified-basic.js
// Run this script to update all users in Firestore to have verified: 'Basic' if missing.

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

async function migrateVerifiedBasic() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  let updated = 0;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (!data.verified) {
      await docSnap.ref.update({ verified: 'Basic' });
      updated++;
      console.log(`Updated user: ${docSnap.id}`);
    }
  }
  console.log(`Migration complete. Updated ${updated} users.`);
}

migrateVerifiedBasic().catch(console.error);
