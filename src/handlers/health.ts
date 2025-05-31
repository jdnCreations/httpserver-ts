import { Request, Response } from 'express';

export function handlerReadiness(req: Request, res: Response) {
  res.set('content-type', 'text/plain; charset=utf-8');
  res.send('OK');
}
