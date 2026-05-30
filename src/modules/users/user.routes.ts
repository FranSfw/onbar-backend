// src/modules/users/user.routes.ts
import { FastifyInstance } from 'fastify';
import { db } from '../../config/firebase';
import { createUserSchema, updateUserSchema } from './user.schema';
import { CreateUserInput, UpdateUserInput } from './user.types';

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
}