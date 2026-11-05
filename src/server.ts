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

fastify.get('/emy', async (request, reply) => {
  reply.type('text/html');
  return `
    <html>
      <head>
        <title>OnBar</title>
        <style>
          body { 
            background-color: #fcfaf7; 
            font-family: sans-serif; 
            text-align: center; 
            padding: 50px; 
            color: #e698bd;
          }
          img { 
            max-width: 100%; 
            height: auto; 
            border-radius: 20px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Hola Emy</h1>        
        <img src="https://i.pinimg.com/1200x/f8/f7/f8/f8f7f812400511a7994578575569e563.jpg" alt="Pinterest Coffee Art" />
      </body>
    </html>
  `;
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