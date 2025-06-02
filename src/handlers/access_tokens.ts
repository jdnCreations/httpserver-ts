import { Request, Response } from 'express';
import { getBearerToken, makeJWT } from '../auth/auth.js';
import { getUserFromRefreshToken } from '../db/queries/users.js';
import { UnauthorizedError } from '../errors.js';
import { isRefreshTokenValid } from '../db/queries/refresh_tokens.js';
import { config } from '../config.js';

export async function handlerRefresh(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  const valid = await isRefreshTokenValid(refreshToken);
  if (!valid) {
    throw new UnauthorizedError('invalid token');
  }
  const user = await getUserFromRefreshToken(refreshToken);
  if (!user) {
    throw new UnauthorizedError('invalid token');
  }
  const accessToken = makeJWT(user.id, 60 * 60 * 1000, config.secret);
  res.status(200).json({ token: accessToken });
}
