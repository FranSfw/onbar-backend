// src/modules/calibrations/calibration.routes.ts
import { FastifyInstance } from 'fastify';
import { db } from '../../config/firebase';
import { createCalibrationSchema } from './calibration.schema';
import { CreateCalibrationInput } from './calibration.types';

export async function calibrationRoutes(fastify: FastifyInstance) {
  
  // 💾 POST: Crear Calibración (Personal o de Barra de Cafetería)
  fastify.post<{ Body: CreateCalibrationInput }>(
    '/',
    { schema: { body: createCalibrationSchema } },
    async (request, reply) => {
      // 🎯 Corregido: Rescatamos 'cafeID' que viene opcional si están en turno laboral
      const { userID, cafeID, coffeeDetails, parameters, sensory } = request.body;

      // Cálculo automático del ratio matemático de OnBar
      const calculatedRatio = parseFloat((parameters.waterOut / parameters.coffeeIn).toFixed(2));

      const calibrationDocument = {
        userID,
        cafeID: cafeID || null, // 🎯 Se guarda el ID de la tienda o null si es en casa
        createdAt: new Date().toISOString(),
        coffeeDetails,
        parameters: {
          ...parameters,
          ratio: calculatedRatio
        },
        sensory
      };

      try {
        // 🎯 Corregido: Apuntamos de forma uniforme a 'espresso_calibrations'
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

  // 🔍 GET: Obtener el historial completo de calibraciones de un Barista (Uso Personal)
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

  // 🔍 GET: Obtener el log compartido de calibraciones de una barra específica (Sincronización de Equipo)
  fastify.get<{ Params: { cafeID: string } }>(
    '/cafe/:cafeID', 
    async (request, reply) => {
      const { cafeID } = request.params;

      try {
        const snapshot = await db.collection('espresso_calibrations')
          .where('cafeID', '==', cafeID)
          .orderBy('createdAt', 'desc')
          .get();

        const logs = snapshot.docs.map(doc => ({
          calibrationID: doc.id,
          ...doc.data()
        }));

        return reply.send(logs);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al obtener el log de la barra' });
      }
    }
  );

  // 🔍 GET: Obtener el detalle extendido de una calibración específica (Para ver el Radar Sensorial y Timeline)
  fastify.get<{ Params: { id: string } }>(
    '/:id', 
    async (request, reply) => {
      const { id } = request.params;

      try {
        const doc = await db.collection('espresso_calibrations').doc(id).get();

        if (!doc.exists) {
          return reply.code(404).send({ error: 'La calibración especificada no existe.' });
        }

        return reply.send({ calibrationID: doc.id, ...doc.data() });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al consultar el detalle de la calibración.' });
      }
    }
  );

  // 🗑️ DELETE: Eliminar un registro de molienda erróneo
  fastify.delete<{ Params: { id: string } }>(
    '/:id', 
    async (request, reply) => {
      const { id } = request.params;

      try {
        const docRef = db.collection('espresso_calibrations').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
          return reply.code(404).send({ error: 'No se encontró la calibración que deseas eliminar.' });
        }

        await docRef.delete();
        return reply.send({ message: 'Registro de calibración eliminado correctamente de la barra. 🧹' });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al eliminar el registro de Firestore.' });
      }
    }
  );

}