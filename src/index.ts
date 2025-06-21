import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { SaveDataRequest } from './models/data';
import { createData, updateData, getPageData, getPageHistoryData, getPageRevisionData } from './utils/controller';
import { config } from './config/environment';
import { closeDb } from './db/kysely';

const app = new Hono();

app.use(logger());
app.use(
  '*',
  cors({
    origin: config.CORS_ORIGINS,
    allowHeaders: ['Upgrade-Insecure-Requests', 'Content-Type'],
    allowMethods: ['POST', 'GET', 'PATCH', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

app.get('/', async (c) => {
  return c.json({
    message: 'Welcome to the Wikitext Previewer API',
    version: '1.0.0',
    environment: config.NODE_ENV,
    endpoints: {
      health: '/v1/health',
      data: '/v1/data',
      history: '/v1/data/:shortId/history',
      revision: '/v1/data/:shortId/revision/:revisionId'
    }
  });
});

app.get('/v1/health', async (c) => {
  return c.json({
    status: 'healthy',
    version: '1.0.0',
    environment: config.NODE_ENV
  });
});

app.post('/v1/data', async (c) => {
  try {
    const { title, source, createdBy } = await c.req.json<SaveDataRequest>();
    const responseData = await createData(title, source, createdBy);
    console.debug('POST /v1/data response:', JSON.stringify(responseData));
    return c.json(responseData);
  } catch (error) {
    console.error('Error in POST /data:', error);
    return c.json({ data: null, error: 'Invalid request data' }, 400);
  }
});

app.patch('/v1/data/:shortId', async (c) => {
  try {
    const shortId = c.req.param('shortId');
    const { title, source, createdBy } = await c.req.json<SaveDataRequest>();
    const responseData = await updateData(shortId, title, source, createdBy);
    console.debug('PATCH /v1/data response:', JSON.stringify(responseData));
    return c.json(responseData);
  } catch (error) {
    console.error('Error in PATCH /data/:shortId:', error);
    return c.json({ data: null, error: 'Invalid request data' }, 400);
  }
});

app.get('/v1/data/:shortId', async (c) => {
  try {
    const shortId = c.req.param('shortId');
    const response = await getPageData(shortId);
    return c.json(response);
  } catch (error) {
    console.error('Error in GET /data/:shortId:', error);
    return c.json({ data: null, error: 'Failed to retrieve data' }, 500);
  }
});

app.post('/v1/data/:shortId/history', async (c) => {
  try {
    const shortId = c.req.param('shortId');
    const response = await getPageHistoryData(shortId);
    return c.json(response);
  } catch (error) {
    console.error('Error in POST /data/:shortId/history:', error);
    return c.json({ data: null, error: 'Failed to retrieve history' }, 500);
  }
});

app.post('/v1/data/:shortId/revision/:revisionId', async (c) => {
  try {
    const shortId = c.req.param('shortId');
    const revisionId = Number.parseInt(c.req.param('revisionId'), 10);

    if (Number.isNaN(revisionId)) {
      return c.json({ data: null, error: 'Invalid revision ID' }, 400);
    }

    const response = await getPageRevisionData(shortId, revisionId);
    return c.json(response);
  } catch (error) {
    console.error('Error in POST /data/:shortId/revision/:revisionId:', error);
    return c.json({ data: null, error: 'Failed to retrieve revision' }, 500);
  }
});

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(
    {
      data: null,
      error: config.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message
    },
    500
  );
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await closeDb();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await closeDb();
  process.exit(0);
});

const port = config.PORT;

console.log(`Starting server on port ${port}...`);

if (typeof globalThis.Bun !== 'undefined') {
  const server = Bun.serve({
    port,
    fetch: app.fetch,
  });
  console.log(`Bun server is running at ${server.hostname}:${server.port}`);
} else {
  serve({
    fetch: app.fetch,
    port,
  });
  console.log(`Node.js server is running on port ${port}`);
}

export { app };