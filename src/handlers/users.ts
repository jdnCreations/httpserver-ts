import { Request, Response } from 'express';
import { createUser } from '../db/queries/users.js';
import { BadRequestError } from '../errors.js';

export async function handlerCreateUser(req: Request, res: Response) {
  type parameters = {
    email: string;
  };

  const emailRegex = /[\w-\.]+@([\w-]+\.)[\w-]{2, 4}$/;
  const params: parameters = req.body;

  if (params.email.search(emailRegex)) {
    try {
      const user = await createUser({ email: params.email });
      res.status(201).json({
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
      });
    } catch (error) {
      res.status(500).json({ error: error });
      console.log(error);
    }
  } else {
    throw new BadRequestError('invalid email');
  }
}
