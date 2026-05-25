// src/config/firebase.ts
import * as admin from 'firebase-admin';
// Importa getFirestore para acceder a la instancia de Firestore, especialmente si tienes varias bases de datos
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

const serviceAccountPath = path.join(process.cwd(), 'firebase-credentials.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`\n❌ [OnBar Error]: No se encontró el archivo de credenciales en: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Inicializamos la app y guardamos la referencia de la instancia
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

console.log(`🔥 ¡Conexión con Firebase Admin establecida! Proyecto: ${serviceAccount.project_id}`);

// 🎯 SOLUCIÓN AL ERROR DE TIPADO:
// Usamos getFirestore para inicializar Firestore apuntando a 'on-bar'
const firestoreInstance = getFirestore(app, 'on-bar');

// Ignorar propiedades indefinidas (Evita errores al no mandar campos opcionales)
firestoreInstance.settings({ ignoreUndefinedProperties: true });

export const db = firestoreInstance;
