import express, { Request, Response } from 'express';

const app = express();
const PORT = 8080;

app.use('/app', express.static('./src/app'));

function handlerReadiness(req: Request, res: Response) {
  res.set('content-type', 'text/plain; charset=utf-8');
  res.send('OK');
}

app.get('/healthz', handlerReadiness);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
