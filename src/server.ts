// src/index.ts (o app.ts)
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { calibrationRoutes } from './modules/calibrations/calibration.routes';
import { recipeRoutes } from './modules/recipes/recipe.routes';
import { userRoutes } from './modules/users/user.routes';
import { coffeeRoutes } from './modules/coffees/coffee.routes';

const fastify = Fastify({ 
  logger: true
});

// 🛡️ Configuración de CORS optimizada para tu Front en Angular
fastify.register(cors, {
  origin: ['http://localhost:4200'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// 🔌 Endpoints / Módulos de OnBar
fastify.register(calibrationRoutes, { prefix: '/api/calibrations' });
fastify.register(recipeRoutes, { prefix: '/api/recipes' });
fastify.register(userRoutes, { prefix: '/api/users' });
fastify.register(coffeeRoutes, { prefix: '/api/coffees' });

// ☕ Test de salud del servidor
fastify.get('/ping', async () => {
  return { status: 'OnBar Machine is Ready ☕' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Servidor de OnBar corriendo exitosamente');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();