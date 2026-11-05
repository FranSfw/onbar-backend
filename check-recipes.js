const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const localKeyPath = path.resolve(__dirname, 'firebase-credentials.json');
const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkRecipes() {
  console.log('Fetching all recipes...');
  const snapshot = await db.collection('recipes').get();
  console.log(`Total recipes found: ${snapshot.docs.length}`);
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`\nRecipe ID: ${doc.id}`);
    console.log(`Name: ${data.name}`);
    console.log(`Privacy: ${data.privacy}`);
    console.log(`Keys: ${Object.keys(data).join(', ')}`);
  });
}

checkRecipes().catch(console.error);
