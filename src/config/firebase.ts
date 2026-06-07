// src/config/firebase.ts
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

if (!admin.apps.length) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountEnv) {
    // 🌐 Producción (Vercel): Leer credenciales desde la variable de entorno
    const serviceAccount = JSON.parse(serviceAccountEnv);
    
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // 🖥️ Desarrollo local: Leer credenciales desde el archivo JSON
    const localKeyPath = path.resolve(__dirname, '../../firebase-credentials.json');
    
    if (!fs.existsSync(localKeyPath)) {
      throw new Error(
        '❌ No se encontró firebase-credentials.json ni la variable de entorno FIREBASE_SERVICE_ACCOUNT.\n' +
        '   → Para desarrollo local: coloca firebase-credentials.json en la raíz del proyecto.\n' +
        '   → Para Vercel: configura la variable FIREBASE_SERVICE_ACCOUNT en el dashboard de Vercel.'
      );
    }

    const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf-8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
}

export const db = getFirestore(admin.app(), 'on-bar');
db.settings({ ignoreUndefinedProperties: true });