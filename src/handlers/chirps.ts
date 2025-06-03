import { Request, Response } from 'express';
import { BadRequestError, ForbiddenError } from '../errors.js';
import { replaceProfaneWords } from '../utils/profanity.js';
import {
  createChirp,
  deleteChirpById,
  getAllChirps,
  getAllChirpsForAuthor,
  getChirpById,
} from '../db/queries/chirps.js';
import { getBearerToken, validateJWT } from '../auth/auth.js';
import { config } from '../config.js';

export async function handlerCreateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const bearer = getBearerToken(req);
  const userId = validateJWT(bearer, config.secret);

  const params: parameters = req.body;

  if (params.body.length > 140) {
    throw new BadRequestError('Chirp is too long. Max length is 140');
  } else {
    const replaced = replaceProfaneWords(params.body);
    try {
      const chirp = await createChirp({
        body: replaced,
        userId: userId,
      });
      res.status(201).send(chirp);
    } catch (error) {
      res.status(500).json({ error: 'could not create chirp' });
      console.log(error);
    }
  }
}

export async function handlerGetChirps(req: Request, res: Response) {
  let authorId = '';
  let authorIdQuery = req.query.authorId;
  let sortQuery = req.query.sort;
  if (typeof authorIdQuery === 'string') {
    authorId = authorIdQuery;
  }

  let chirps = [];

  if (authorId) {
    chirps = await getAllChirpsForAuthor(authorId);
  } else {
    chirps = await getAllChirps();
  }

  if (typeof sortQuery === 'string') {
    if (sortQuery === 'desc') {
      // sort chirps desc
      chirps.sort((a, b) => {
        return b.createdAt.valueOf() - a.createdAt.valueOf();
      });
    } else {
      chirps.sort((a, b) => {
        return a.createdAt.valueOf() - b.createdAt.valueOf();
      });
    }
  }
  res.status(200).json(chirps);
}

export async function handlerGetChirpById(req: Request, res: Response) {
  const id = req.params.chirpID;
  const chirp = await getChirpById(id);
  if (!chirp) {
    res.status(404).send();
    return;
  }
  res.status(200).json(chirp);
}

export async function handlerDeleteChirp(req: Request, res: Response) {
  const id = req.params.chirpID;
  // check if user is authenticated
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.secret);
  if (!userId) {
    res.status(403).send();
    return;
  }

  // check if chirp exists
  const chirp = await getChirpById(id);

  // if there is no chirp wih that id
  if (!chirp) {
    res.status(404).send();
    return;
  }

  if (chirp.userId === userId) {
    await deleteChirpById(id);
    res.status(204).send();
    return;
  }

  res.status(403).send();
}
