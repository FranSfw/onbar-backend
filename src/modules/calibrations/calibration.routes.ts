// src/modules/calibrations/calibration.routes.ts
import { FastifyInstance } from 'fastify';
import { db } from '../../config/firebase';

// 🔴 Importaciones separadas elegantemente:
import { createCalibrationSchema } from './calibration.schema';
import { CreateCalibrationInput } from './calibration.types';

export async function calibrationRoutes(fastify: FastifyInstance) {
  
  // 💾 POST: Crear Calibración
  fastify.post<{ Body: CreateCalibrationInput }>(
    '/',
    { schema: { body: createCalibrationSchema } },
    async (request, reply) => {
      const { userID, coffeeDetails, parameters, sensory } = request.body;

      // Cálculo automático del ratio matemático de OnBar
      const calculatedRatio = parseFloat((parameters.waterOut / parameters.coffeeIn).toFixed(2));

      const calibrationDocument = {
        userID,
        createdAt: new Date().toISOString(),
        coffeeDetails,
        parameters: {
          ...parameters,
          ratio: calculatedRatio
        },
        sensory
      };

      try {
        const docRef = await db.collection('espresso_calibrations').add(calibrationDocument);
        return reply.code(201).send({
          message: '¡Calibración guardada exitosamente en Firestore! ☕',
          calibrationID: docRef.id,
          data: calibrationDocument
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: 'Error de conexión con Firestore',
          details: error.message
        });
      }
    }
  );

  // 🔍 GET: Obtener las calibraciones de un barista específico
  fastify.get<{ Querystring: { userID: string } }>(
    '/',
    async (request, reply) => {
      const { userID } = request.query;

      if (!userID) {
        return reply.code(400).send({ error: 'El parámetro query "userID" es requerido.' });
      }

      try {
        const snapshot = await db.collection('espresso_calibrations')
          .where('userID', '==', userID)
          .orderBy('createdAt', 'desc')
          .get();

        const calibrations = snapshot.docs.map(doc => ({
          calibrationID: doc.id,
          ...doc.data()
        }));

        return reply.send(calibrations);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al consultar las calibraciones en Firestore' });
      }
    }
  );
}