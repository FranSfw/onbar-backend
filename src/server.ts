import Fastify from 'fastify';
import cors from '@fastify/cors';
import { calibrationRoutes } from './modules/calibrations/calibration.routes';
import { recipeRoutes } from './modules/recipes/recipe.routes';
import { userRoutes } from './modules/users/user.routes';

const fastify = Fastify({
  logger: true
});

fastify.register(cors, {
  origin: '*'
});

// Endpoints
fastify.register(calibrationRoutes, { prefix: '/api/calibrations' });
fastify.register(recipeRoutes, { prefix: '/api/recipes' });
fastify.register(userRoutes, { prefix: '/api/users' });

fastify.get('/ping', async () => {
  return { status: 'OnBar Machine is Ready ☕' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Servidor corriendo en http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();