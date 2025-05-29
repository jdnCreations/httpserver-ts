import express, { NextFunction, Request, Response } from 'express';
import { config } from './config.js';

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use('/app', middlewareMetricsInc, express.static('./src/app'));

function handlerReadiness(req: Request, res: Response) {
  res.set('content-type', 'text/plain; charset=utf-8');
  res.send('OK');
}

function handlerNumberRequests(req: Request, res: Response) {
  res.set('content-type', 'text/plain');
  res.send(`Hits: ${config.fileserverHits}`);
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

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
  config.fileserverHits++;
  next();
}

function middlewareLogResponses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      console.log(
        `[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`
      );
    }
  });
  next();
}

app.get('/api/healthz', handlerReadiness);
app.get('/admin/reset', handlerResetMetrics);
app.get('/admin/metrics', handlerAdminMetrics);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
