import express, { NextFunction, Request, Response } from 'express';
import { config } from './config.js';
import { middlewareLogResponses, middlewareMetricsInc } from './middleware.js';
import { replaceProfaneWords } from './utils/profanity.js';

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
    res.status(400).send({ error: 'Chirp is too long' });
  } else {
    const replaced = replaceProfaneWords(params.body);
    res.status(200).send({ cleanedBody: replaced });
  }
}

// API
app.get('/api/healthz', handlerReadiness);
app.post('/api/validate_chirp', handlerValidateChirp);

// ADMIN
app.post('/admin/reset', handlerResetMetrics);
app.get('/admin/metrics', handlerAdminMetrics);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
