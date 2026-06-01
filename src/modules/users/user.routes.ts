// src/modules/users/user.routes.ts
import { FastifyInstance } from 'fastify';
import { db } from '../../config/firebase';
import { createUserSchema, updateUserSchema } from './user.schema';
import { CreateUserInput, UpdateUserInput } from './user.types';
import * as admin from 'firebase-admin';

export async function userRoutes(fastify: FastifyInstance) {

    // 📝 POST: Registrar o sincronizar un nuevo usuario
    fastify.post<{ Body: CreateUserInput }>(
        '/',
        { schema: { body: createUserSchema } },
        async (request, reply) => {
            // 😎 Quitamos 'skills' de la desestructuración
            const { uid, username, name, email, bio, profilePhotoURL, coverPhotoURL, role } = request.body;

            try {
                const userRef = db.collection('users').doc(uid);
                const doc = await userRef.get();

                if (doc.exists) {
                    return reply.code(400).send({ error: 'El usuario con este UID ya existe.' });
                }

                const usernameSnapshot = await db.collection('users')
                    .where('username', '==', username)
                    .get();

                if (!usernameSnapshot.empty) {
                    return reply.code(400).send({ error: 'El nombre de usuario ya está en uso. Elige otro ☕.' });
                }

                // Construimos el documento base para la base de datos
                const userDocument = {
                    uid,
                    username,
                    name,
                    email,
                    bio,
                    profilePhotoURL,
                    coverPhotoURL,
                    role,
                    skills: [], // 🎯 Se inicializa como un arreglo vacío listo para llenarse después
                    metrics: {
                        followersCount: 0,
                        followingCount: 0
                    },
                    joinedAt: new Date().toISOString(),
                    // Inicializamos los sub-objetos dependiendo del rol que eligieron
                    ...(role === 'barista' && { baristaInfo: { isVerifiedByCafe: false } }),
                    ...(role === 'manager' && { cafeInfo: { carouselImages: [], activeBaristas: [], pendingBaristas: [] } })
                };

                await userRef.set(userDocument);

                return reply.code(201).send({
                    message: '¡Perfil de OnBar creado con éxito! 🚀',
                    data: userDocument
                });
            } catch (error) {
                fastify.log.error(error);
                return reply.code(500).send({ error: 'Error al registrar el usuario en Firestore.' });
            }
        }
    );

    // 🔍 GET: Obtener el perfil de un usuario por su UID o Username
    fastify.get<{ Params: { idOrUsername: string } }>(
        '/:idOrUsername',
        async (request, reply) => {
            const { idOrUsername } = request.params;

            try {
                // Primero intentamos buscar por documento directo (UID)
                let userRef = db.collection('users').doc(idOrUsername);
                let doc = await userRef.get();

                // Si no existe por UID, buscamos por el campo 'username'
                if (!doc.exists) {
                    const usernameSnapshot = await db.collection('users')
                        .where('username', '==', idOrUsername)
                        .get();

                    if (usernameSnapshot.empty) {
                        return reply.code(404).send({ error: 'Barista no encontrado.' });
                    }

                    const userDoc = usernameSnapshot.docs[0];
                    return reply.send({ ...userDoc.data() });
                }

                return reply.send({ ...doc.data() });
            } catch (error) {
                fastify.log.error(error);
                return reply.code(500).send({ error: 'Error al consultar el perfil.' });
            }
        }
    );

    // ✏️ PATCH: Actualizar el perfil del barista
    fastify.patch<{ Params: { uid: string }; Body: UpdateUserInput }>(
        '/:uid',
        { schema: { body: updateUserSchema } },
        async (request, reply) => {
            const { uid } = request.params;
            const updateData = request.body;

            try {
                const userRef = db.collection('users').doc(uid);
                const doc = await userRef.get();

                if (!doc.exists) {
                    return reply.code(404).send({ error: 'El usuario no existe.' });
                }

                // 🔥 ¡LISTO! Al haber agregado la firma de índice [key: string]: any,
                // Firestore acepta 'updateData' sin ningún error de compilación.
                await userRef.update(updateData);

                return reply.send({
                    message: '¡Perfil actualizado correctamente! 🎨',
                    updatedFields: updateData
                });
            } catch (error) {
                fastify.log.error(error);
                return reply.code(500).send({ error: 'Error al actualizar el perfil en la base de datos.' });
            }
        }
    );

    // ☕ PATCH: Barista solicita unirse a una cafetería (Multi-barra)
  fastify.patch<{ Params: { uid: string }; Body: { cafeID: string } }>(
    '/:uid/request-cafe',
    async (request, reply) => {
      const { uid } = request.params;
      const { cafeID } = request.body;

      try {
        const baristaRef = db.collection('users').doc(uid);
        const cafeRef = db.collection('users').doc(cafeID);

        const [baristaDoc, cafeDoc] = await Promise.all([baristaRef.get(), cafeRef.get()]);

        if (!baristaDoc.exists || !cafeDoc.exists) {
          return reply.code(404).send({ error: 'Barista o Cafetería no encontrados.' });
        }

        const cafeData = cafeDoc.data();
        if (cafeData?.role !== 'manager') {
          return reply.code(400).send({ error: 'El ID proporcionado no pertenece a una cuenta de Cafetería/Manager.' });
        }

        // Usamos transacciones nativas de Firestore para actualizar de forma segura ambas listas pendientes
        await db.runTransaction(async (transaction) => {
          transaction.update(baristaRef, {
            'baristaInfo.pendingCafes': admin.firestore.FieldValue.arrayUnion(cafeID)
          });
          transaction.update(cafeRef, {
            'cafeInfo.pendingBaristas': admin.firestore.FieldValue.arrayUnion(uid)
          });
        });

        return reply.send({ message: '¡Solicitud de vinculación enviada a la cafetería con éxito! 📬' });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al procesar la solicitud de vinculación.' });
      }
    }
  );

  // 🔑 PATCH: Manager aprueba a un Barista pendiente
  fastify.patch<{ Params: { cafeUid: string }; Body: { baristaUid: string } }>(
    '/:cafeUid/approve-barista',
    async (request, reply) => {
      const { cafeUid } = request.params;
      const { baristaUid } = request.body;

      try {
        const cafeRef = db.collection('users').doc(cafeUid);
        const baristaRef = db.collection('users').doc(baristaUid);

        const [cafeDoc, baristaDoc] = await Promise.all([cafeRef.get(), baristaRef.get()]);

        if (!cafeDoc.exists || !baristaDoc.exists) {
          return reply.code(404).send({ error: 'Documentos no encontrados.' });
        }

        await db.runTransaction(async (transaction) => {
          // 1. Modificar listas de la Cafetería
          transaction.update(cafeRef, {
            'cafeInfo.pendingBaristas': admin.firestore.FieldValue.arrayRemove(baristaUid),
            'cafeInfo.activeBaristas': admin.firestore.FieldValue.arrayUnion(baristaUid)
          });
          // 2. Modificar listas del Barista
          transaction.update(baristaRef, {
            'baristaInfo.pendingCafes': admin.firestore.FieldValue.arrayRemove(cafeUid),
            'baristaInfo.activeCafes': admin.firestore.FieldValue.arrayUnion(cafeUid)
          });
        });

        return reply.send({ message: '¡Barista verificado y añadido al equipo de la barra con éxito! 🤝' });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al aprobar al barista en la base de datos.' });
      }
    }
  );

  // 🔍 GET: Listar el equipo de baristas activos de una cafetería específica
  fastify.get<{ Params: { cafeID: string } }>(
    '/cafe/:cafeID/team',
    async (request, reply) => {
      const { cafeID } = request.params;

      try {
        const cafeDoc = await db.collection('users').doc(cafeID).get();
        if (!cafeDoc.exists) {
          return reply.code(404).send({ error: 'Cafetería no encontrada.' });
        }

        const activeBaristasIds = cafeDoc.data()?.cafeInfo?.activeBaristas || [];

        if (activeBaristasIds.length === 0) {
          return reply.send([]);
        }

        // Traemos en bloque los perfiles públicos de los baristas de esta barra
        const baristasSnapshot = await db.collection('users')
          .where('uid', 'in', activeBaristasIds)
          .get();

        const team = baristasSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            uid: data.uid,
            username: data.username,
            name: data.name,
            profilePhotoURL: data.profilePhotoURL,
            skills: data.skills
          };
        });

        return reply.send(team);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Error al obtener el equipo de la cafetería.' });
      }
    }
  );
}