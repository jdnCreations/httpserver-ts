import { Request, Response } from 'express';
import { upgradeToChirpyRed } from '../db/queries/users.js';

export async function handlerPolkaEvent(req: Request, res: Response) {
  type parameters = {
    event: string;
    data: {
      userId: string;
    };
  };
  const params: parameters = req.body;

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
