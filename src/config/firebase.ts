// src/config/firebase.ts
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountEnv) {
    // Si estamos en Vercel (Producción), parseamos el string JSON de la variable de entorno
    const serviceAccount = JSON.parse(serviceAccountEnv);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Si estás en local, puedes seguir usando tu archivo de desarrollo local (añadido al .gitignore)
    const serviceAccount = require('../../firebase-key.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
}

export const db = admin.firestore();
// Configuración para que ignore campos undefined al hacer PATCH
db.settings({ ignoreUndefinedProperties: true });