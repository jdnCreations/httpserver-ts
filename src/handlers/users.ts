import { Request, Response } from 'express';
import { createUser, getUserByEmail, updateUser } from '../db/queries/users.js';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from '../errors.js';
import {
  checkPasswordHash,
  getBearerToken,
  hashPassword,
  makeJWT,
  makeRefreshToken,
  validateJWT,
} from '../auth/auth.js';
import { config } from '../config.js';
import { NewUser } from '../db/schema.js';

type UserWithoutPassword = Omit<NewUser, 'hashedPassword'>;

function validEmail(email: string): boolean {
  const emailRegex = /[\w-\.]+@([\w-]+\.)[\w-]{2, 4}$/;
  if (email.search(emailRegex)) {
    return true;
  } else {
    return false;
  }
}

export async function handlerCreateUser(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };

  const params: parameters = req.body;

  if (!params.password || params.password.length === 0) {
    throw new BadRequestError('you must provide a password');
  }

  if (validEmail(params.email)) {
    const hashedPassword = await hashPassword(params.password);
    const user = await createUser({
      email: params.email,
      hashedPassword: hashedPassword,
    });
    if (!user) {
      throw new ConflictError('user with that email already exists');
    }
    const userResponse: UserWithoutPassword = {
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      isChirpyRed: user.isChirpyRed,
    };
    res.status(201).json(userResponse);
  } else {
    throw new BadRequestError('invalid email');
  }
}

export async function handlerLogin(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };

  const params: parameters = req.body;

  if (validEmail(params.email)) {
    const user = await getUserByEmail(params.email);
    if (!user) {
      throw new UnauthorizedError('incorrect email or password');
    }
    const match = await checkPasswordHash(params.password, user.hashedPassword);
    if (match) {
      const hour = 60 * 60 * 1000;
      const { hashedPassword, ...userWithoutPassword } = user;
      const accessToken = makeJWT(user.id, hour, config.secret);
      const refreshToken = makeRefreshToken(user.id);
      let userResponse: UserWithoutPassword & {
        token: string;
        refreshToken: string;
      } = {
        ...userWithoutPassword,
        token: accessToken,
        refreshToken: refreshToken,
      };
      res.status(200).json(userResponse);
    } else {
      throw new UnauthorizedError('incorrect email or password');
    }
  }
}

export async function handlerUpdateUser(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };
  const params: parameters = req.body;
  const bearer = getBearerToken(req);
  const userId = validateJWT(bearer, config.secret);

  const hashedPassword = await hashPassword(params.password);

  const updatedUser = await updateUser({
    id: userId,
    email: params.email,
    hashedPassword: hashedPassword,
  });

  res.status(200).json({
    id: updatedUser.id,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
    email: updatedUser.email,
  });
}
