// src/modules/recipes/recipe.routes.ts
import { FastifyInstance } from 'fastify';
import { db } from '../../config/firebase';
import { createRecipeSchema, updateRecipeSchema } from './recipe.schema';
import { CreateRecipeInput, UpdateRecipeInput } from './recipe.types';

export async function recipeRoutes(fastify: FastifyInstance) {

  // 📝 POST: Publicar una nueva receta
  fastify.post<{ Body: CreateRecipeInput }>(
    '/',
    { schema: { body: createRecipeSchema } },
    async (request, reply) => {
      const bodyData = request.body;

      const recipeDocument = {
        ...bodyData, 
        featured: false,
        starsCount: 0,
        createdAt: new Date().toISOString()
      };

      try {
        const docRef = await db.collection('recipes').add(recipeDocument);
        return reply.code(201).send({
          message: `¡Receta [${bodyData.name}] guardada exitosamente en OnBar! ☕`,
          recipeID: docRef.id,
          data: recipeDocument
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al publicar la receta' });
      }
    }
  );

  // 🔍 GET: Listar todas las recetas públicas para el Feed de Exploración
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

  // 🔍 GET: Obtener el catálogo de recetas creadas por un usuario específico (Para su perfil / mis recetas)
  fastify.get<{ Params: { userID: string } }>(
    '/user/:userID', 
    async (request, reply) => {
      const { userID } = request.params;

      try {
        const snapshot = await db.collection('recipes')
          .where('userID', '==', userID)
          .orderBy('createdAt', 'desc')
          .get();

        const userRecipes = snapshot.docs.map(doc => ({
          recipeID: doc.id,
          ...doc.data()
        }));

        return reply.send(userRecipes);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al obtener las recetas del barista.' });
      }
    }
  );

  // 🔍 GET: Obtener una receta específica por su ID único
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

  // ✏️ PATCH: Editar la receta directamente (Sobrescribe los datos anteriores al instante)
  fastify.patch<{ Params: { id: string }; Body: UpdateRecipeInput }>(
    '/:id',
    { schema: { body: updateRecipeSchema } },
    async (request, reply) => {
      const { id } = request.params;
      const updateData = request.body;

      try {
        const recipeRef = db.collection('recipes').doc(id);
        const doc = await recipeRef.get();

        if (!doc.exists) {
          return reply.code(404).send({ error: 'La receta que intentas editar no existe.' });
        }

        await recipeRef.update(updateData);
        return reply.send({
          message: '¡Receta actualizada en la barra correctamente! 🎨',
          updatedFields: updateData
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al actualizar la receta en Firestore.' });
      }
    }
  );

  // 🗑️ DELETE: Eliminar una receta por completo del ecosistema
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    async (request, reply) => {
      const { id } = request.params;

      try {
        const recipeRef = db.collection('recipes').doc(id);
        const doc = await recipeRef.get();

        if (!doc.exists) {
          return reply.code(404).send({ error: 'No se encontró la receta que deseas eliminar.' });
        }

        await recipeRef.delete();
        return reply.send({ message: 'Receta eliminada correctamente del ecosistema OnBar. 🧹' });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al eliminar la receta de Firestore.' });
      }
    }
  );

}