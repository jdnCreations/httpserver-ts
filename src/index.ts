import express from 'express';
import { config } from './config.js';
import {
  middlewareHandleErrors,
  middlewareLogResponses,
  middlewareMetricsInc,
} from './middleware.js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import { handlerAdminMetrics, handlerReset } from './handlers/admin.js';
import {
  handlerCreateChirp,
  handlerDeleteChirp,
  handlerGetChirpById,
  handlerGetChirps,
} from './handlers/chirps.js';
import { handlerReadiness } from './handlers/health.js';
import {
  handlerCreateUser,
  handlerLogin,
  handlerUpdateUser,
} from './handlers/users.js';
import { handlerRevokeRefreshToken } from './handlers/refresh_tokens.js';
import { handlerRefresh } from './handlers/access_tokens.js';

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(middlewareLogResponses);
app.use('/app', middlewareMetricsInc, express.static('./src/app'));
app.use(middlewareHandleErrors);

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

// API
app.get('/api/healthz', (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get('/api/chirps', (req, res, next) => {
  Promise.resolve(handlerGetChirps(req, res)).catch(next);
});
app.get('/api/chirps/:chirpID', (req, res, next) => {
  Promise.resolve(handlerGetChirpById(req, res)).catch(next);
});
app.post('/api/chirps', (req, res, next) => {
  Promise.resolve(handlerCreateChirp(req, res)).catch(next);
});
app.delete('/api/chirps/:chirpID', (req, res, next) => {
  Promise.resolve(handlerDeleteChirp(req, res)).catch(next);
});

// ADMIN
app.post('/admin/reset', (req, res, next) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
});
app.get('/admin/metrics', (req, res, next) => {
  Promise.resolve(handlerAdminMetrics(req, res)).catch(next);
});

// USER
app.post('/api/users', (req, res, next) => {
  Promise.resolve(handlerCreateUser(req, res)).catch(next);
});
app.post('/api/login', (req, res, next) => {
  Promise.resolve(handlerLogin(req, res)).catch(next);
});
app.put('/api/users', (req, res, next) => {
  Promise.resolve(handlerUpdateUser(req, res)).catch(next);
});

// TOKENS
app.post('/api/refresh', (req, res, next) => {
  Promise.resolve(handlerRefresh(req, res)).catch(next);
});
app.post('/api/revoke', (req, res, next) => {
  Promise.resolve(handlerRevokeRefreshToken(req, res)).catch(next);
});

app.use(middlewareHandleErrors);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
