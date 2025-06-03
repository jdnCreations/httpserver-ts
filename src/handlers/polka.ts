import { Request, Response } from 'express';
import { upgradeToChirpyRed } from '../db/queries/users.js';
import { getAPIKey } from '../auth/auth.js';
import { config } from '../config.js';

export async function handlerPolkaEvent(req: Request, res: Response) {
  type parameters = {
    event: string;
    data: {
      userId: string;
    };
  };
  const params: parameters = req.body;

  const apiKey = getAPIKey(req);
  if (apiKey !== config.polka) {
    res.status(401).send();
    return;
  }

  if (params.event !== 'user.upgraded') {
    res.status(204).send();
    return;
  }

  const upgraded = await upgradeToChirpyRed(params.data.userId);
  if (!upgraded) {
    res.status(404).send();
    return;
  }
  res.status(204).send();
}
