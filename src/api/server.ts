import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import { healthRoutes } from './routes/health.js';
import { boletosRoutes } from './routes/boletos.js';

const API_KEY = process.env.API_KEY;
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

const app = Fastify({ logger: true });

app.register(sensible);

app.addHook('onRequest', async (req, reply) => {
  if (req.url.startsWith('/api/')) {
    if (!API_KEY) return;

    const key = req.headers['x-api-key'];
    if (key !== API_KEY) {
      return reply.status(401).send({ error: 'API key inválida ou ausente' });
    }
  }
});

app.register(healthRoutes);
app.register(boletosRoutes);

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export default app;
