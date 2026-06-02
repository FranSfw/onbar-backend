// src/modules/coffees/coffee.routes.ts
import { FastifyInstance } from 'fastify';
import { db } from '../../config/firebase';
import { createCoffeeSchema, updateCoffeeSchema } from './coffee.schema';
import { CreateCoffeeInput, UpdateCoffeeInput } from './coffee.types';

export async function coffeeRoutes(fastify: FastifyInstance) {

  // 📝 POST: Registrar un nuevo grano de café en el catálogo
  fastify.post<{ Body: CreateCoffeeInput }>(
    '/',
    { schema: { body: createCoffeeSchema } },
    async (request, reply) => {
      const bodyData = request.body;

      const coffeeDocument = {
        ...bodyData,
        createdAt: new Date().toISOString()
      };

      try {
        const docRef = await db.collection('coffees').add(coffeeDocument);
        return reply.code(201).send({
          message: '¡Café de especialidad registrado en el catálogo! 🍒',
          coffeeID: docRef.id,
          data: coffeeDocument
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al registrar el café en Firestore.' });
      }
    }
  );

  // 🔍 GET: Obtener todos los cafés de una cafetería específica (Filtrado para el dropdown de Angular)
  fastify.get<{ Querystring: { cafeID: string } }>(
    '/',
    async (request, reply) => {
      const { cafeID } = request.query;

      if (!cafeID) {
        return reply.code(400).send({ error: 'El parámetro query "cafeID" es requerido para listar los granos.' });
      }

      try {
        const snapshot = await db.collection('coffees')
          .where('cafeID', '==', cafeID)
          .orderBy('createdAt', 'desc')
          .get();

        const coffees = snapshot.docs.map(doc => ({
          coffeeID: doc.id,
          ...doc.data()
        }));

        return reply.send(coffees);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al consultar el catálogo de granos.' });
      }
    }
  );

  // ✏️ PATCH: Editar parámetros o estatus del café (Ej: cambiar photoURL o desactivarlo 'isActive: false')
  fastify.patch<{ Params: { id: string }; Body: UpdateCoffeeInput }>(
    '/:id',
    { schema: { body: updateCoffeeSchema } },
    async (request, reply) => {
      const { id } = request.params;
      const updateData = request.body;

      try {
        const coffeeRef = db.collection('coffees').doc(id);
        const doc = await coffeeRef.get();

        if (!doc.exists) {
          return reply.code(404).send({ error: 'El café especificado no existe.' });
        }

        await coffeeRef.update(updateData);
        return reply.send({
          message: '¡Datos del grano actualizados correctamente! 🎨',
          updatedFields: updateData
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al actualizar el café en Firestore.' });
      }
    }
  );

  // 🗑️ DELETE: Eliminar un grano obsoleto del inventario visual
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const coffeeRef = db.collection('coffees').doc(id);
      const doc = await coffeeRef.get();

      if (!doc.exists) {
        return reply.code(404).send({ error: 'No se encontró el café que deseas remover.' });
      }

      await coffeeRef.delete();
      return reply.send({ message: 'Grano eliminado del catálogo de la cafetería con éxito.' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Error al eliminar el registro.' });
    }
  });

}