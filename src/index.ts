import express, { NextFunction, Request, Response } from 'express';

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use('/app', express.static('./src/app'));

function handlerReadiness(req: Request, res: Response) {
  res.set('content-type', 'text/plain; charset=utf-8');
  res.send('OK');
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

app.get('/healthz', handlerReadiness);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
