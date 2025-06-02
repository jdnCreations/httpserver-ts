import { revokeRefreshToken } from '../db/queries/refresh_tokens.js';
import { getBearerToken } from '../auth/auth.js';
import { Request, Response } from 'express';

export async function handlerRevokeRefreshToken(req: Request, res: Response) {
  const token = getBearerToken(req);
  const revoked = await revokeRefreshToken(token);
  console.log(`revoked token: ${revoked.token}`);
  res.status(204).send();
}
