import { FastifyInstance } from 'fastify';
import { db } from '../../config/firebase';

import { createRecipeSchema, createVersionSchema } from './recipe.schema';
import { CreateRecipeInput, CreateRecipeVersionInput } from './recipe.types';

import * as admin from 'firebase-admin'; 

export async function recipeRoutes(fastify: FastifyInstance) {
  
  // POST: Crear Receta Base v1.0
  fastify.post<{ Body: CreateRecipeInput }>(
    '/',
    { schema: { body: createRecipeSchema } },
    async (request, reply) => {
      const { userID, name, description, privacy, difficulty, photoURL, initialVersion } = request.body;

      const recipeDocument = {
        userID,
        name,
        description,
        privacy,
        difficulty,
        photoURL,
        featured: false,
        starsCount: 0,
        createdAt: new Date().toISOString(),
        currentVersion: 'v1.0',
        versions: {
          'v1.0': {
            createdAt: new Date().toISOString(),
            ...initialVersion
          }
        }
      };

      try {
        const docRef = await db.collection('recipes').add(recipeDocument);
        return reply.code(201).send({
          message: '¡Receta publicada en Firestore! 🌿',
          recipeID: docRef.id,
          data: recipeDocument
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({ 
          error: 'Error de conexión con Firestore', 
          details: error.message // 👈 Esto te dirá el motivo exacto en Postman
        });
      }
    }
  );

  // GET: Listar todas las recetas públicas para el Feed de Exploración
  fastify.get('/', async (request, reply) => {
    try {
      const snapshot = await db.collection('recipes')
        .where('privacy', '==', 'public')
        .orderBy('createdAt', 'desc')
        .get();

      const recipes = snapshot.docs.map(doc => ({
        recipeID: doc.id,
        ...doc.data()
      }));

      return reply.send(recipes);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Error al obtener el feed de recetas' });
    }
  });

  // GET: Obtener una receta específica por su ID unico
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const doc = await db.collection('recipes').doc(id).get();

      if (!doc.exists) {
        return reply.code(404).send({ error: 'La receta no existe' });
      }

      return reply.send({ recipeID: doc.id, ...doc.data() });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Error al buscar la receta' });
    }
  });

  // POST: Crear un nuevo "Commit / Versión" dentro de una receta existente
  fastify.post<{ Params: { id: string }; Body: CreateRecipeVersionInput }>(
    '/:id/versions',
    { schema: { body: createVersionSchema } }, 
    async (request, reply) => {
      const { id } = request.params;
      const newVersionData = request.body; 

      const versionName = newVersionData.versionName || `v${Math.random().toString(36).substring(2, 5)}`;

      try {
        const recipeRef = db.collection('recipes').doc(id);
        const doc = await recipeRef.get();

        if (!doc.exists) {
          return reply.code(404).send({ error: 'Receta no encontrada' });
        }

        const versionPayload = {
          createdAt: new Date().toISOString(),
          preparationTime: newVersionData.preparationTime,
          servingType: newVersionData.servingType,
          servingsNumber: newVersionData.servingsNumber,
          ingredients: newVersionData.ingredients,
          steps: newVersionData.steps,
          notes: newVersionData.notes
        };

        await recipeRef.update({
          currentVersion: versionName,
          [`versions.${versionName}`]: versionPayload
        });

        return reply.send({
          message: `¡Versión ${versionName} agregada exitosamente! 🚀`,
          versionName,
          data: versionPayload
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al registrar la nueva versión' });
      }
    }
  );
}