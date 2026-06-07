// src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { calibrationRoutes } from './modules/calibrations/calibration.routes';
import { recipeRoutes } from './modules/recipes/recipe.routes';
import { userRoutes } from './modules/users/user.routes';
import { coffeeRoutes } from './modules/coffees/coffee.routes';
import type { IncomingMessage, ServerResponse } from 'http';

const fastify = Fastify({ 
  logger: true
});

fastify.register(cors, {
  origin: [
    'http://localhost:4200', 
    'https://onbar-frontend.vercel.app'
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// 🔌 Endpoints / Módulos de OnBar
fastify.register(calibrationRoutes, { prefix: '/api/calibrations' });
fastify.register(recipeRoutes, { prefix: '/api/recipes' });
fastify.register(userRoutes, { prefix: '/api/users' });
fastify.register(coffeeRoutes, { prefix: '/api/coffees' });

fastify.get('/', async () => {
  return { status: 'OnBar Machine is Ready ☕' };
});

// 🚀 Handler para Vercel Serverless Functions
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await fastify.ready();
    fastify.server.emit('request', req, res);
  } catch (error) {
    console.error('❌ Error en el handler de Vercel:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
}

// 🖥️ Servidor local de desarrollo
if (process.env.NODE_ENV !== 'production') {
  const start = async () => {
    try {
      await fastify.listen({ port: 3000, host: '0.0.0.0' });
      console.log('🚀 Servidor local de OnBar corriendo en http://localhost:3000');
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };
  start();
}