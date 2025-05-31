import { Request, Response } from 'express';
import { config } from '../config.js';
import { ForbiddenError } from '../errors.js';
import { deleteAllUsers } from '../db/queries/users.js';

export function handlerAdminMetrics(req: Request, res: Response) {
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

export async function handlerReset(req: Request, res: Response) {
  if (config.platform != 'dev') {
    throw new ForbiddenError('not in development mode');
  } else {
    res.set('content-type', 'text/plain');
    res.send('OK');
    config.fileserverHits = 0;
    await deleteAllUsers();
  }
}
