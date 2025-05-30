import express, { NextFunction, Request, Response } from 'express';
import { config } from './config.js';
import {
  middlewareHandleErrors,
  middlewareLogResponses,
  middlewareMetricsInc,
} from './middleware.js';
import { replaceProfaneWords } from './utils/profanity.js';
import { BadRequestError, NotFoundError } from './errors.js';

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(middlewareLogResponses);
app.use('/app', middlewareMetricsInc, express.static('./src/app'));

function handlerReadiness(req: Request, res: Response) {
  res.set('content-type', 'text/plain; charset=utf-8');
  res.send('OK');
}

function handlerAdminMetrics(req: Request, res: Response) {
  const html = '';
  res.set('content-type', 'text/html; charset=utf-8');
  res.send(
    `<html>
      <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.fileserverHits} times!</p>
      </body>
    </html>`
  );
}

function handlerResetMetrics(req: Request, res: Response) {
  res.set('content-type', 'text/plain');
  res.send('OK');
  config.fileserverHits = 0;
}

function handlerValidateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;

  if (params.body.length > 140) {
    throw new BadRequestError('Chirp is too long. Max length is 140');
  } else {
    const replaced = replaceProfaneWords(params.body);
    res.status(200).send({ cleanedBody: replaced });
  }
}

// API
app.get('/api/healthz', (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.post('/api/validate_chirp', (req, res, next) => {
  Promise.resolve(handlerValidateChirp(req, res)).catch(next);
});

// ADMIN
app.post('/admin/reset', (req, res, next) => {
  Promise.resolve(handlerResetMetrics(req, res)).catch(next);
});
app.get('/admin/metrics', (req, res, next) => {
  Promise.resolve(handlerAdminMetrics(req, res)).catch(next);
});

app.use(middlewareHandleErrors);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
