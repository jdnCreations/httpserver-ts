import { Request, Response } from 'express';
import { BadRequestError } from '../errors.js';
import { replaceProfaneWords } from '../utils/profanity.js';
import {
  createChirp,
  getAllChirps,
  getChirpById,
} from '../db/queries/chirps.js';

export async function handlerCreateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
    userId: string;
  };

  const params: parameters = req.body;

  if (params.body.length > 140) {
    throw new BadRequestError('Chirp is too long. Max length is 140');
  } else {
    const replaced = replaceProfaneWords(params.body);
    try {
      const chirp = await createChirp({
        body: replaced,
        userId: params.userId,
      });
      res.status(201).send(chirp);
    } catch (error) {
      res.status(500).json({ error: 'could not create chirp' });
      console.log(error);
    }
  }
}

export async function handlerGetChirps(req: Request, res: Response) {
  try {
    const chirps = await getAllChirps();
    res.status(200).json(chirps);
  } catch {
    res.status(500).json({ error: 'could not get all chirps' });
  }
}

export async function handlerGetChirpById(req: Request, res: Response) {
  try {
    const id = req.params.chirpID;
    const chirp = await getChirpById(id);
    res.status(200).json(chirp);
  } catch {
    res.status(404);
  }
}
