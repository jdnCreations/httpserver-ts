import { JwtPayload } from './../../node_modules/@types/jsonwebtoken/index.d';
import { compare, genSaltSync, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors.js';
import { Request } from 'express';
import crypto from 'node:crypto';
import { createRefreshToken } from '../db/queries/refresh_tokens.js';

export async function hashPassword(password: string): Promise<string> {
  const salt = genSaltSync(10);
  const hashed = await hash(password, salt);
  return hashed;
}

export async function checkPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await compare(password, hash);
  } catch (err) {
    console.log('error checking pw');
    console.log(err);
    return false;
  }
}

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string
): string {
  type Payload = Pick<JwtPayload, 'iss' | 'sub' | 'iat' | 'exp'>;
  const iat = Math.floor(Date.now() / 1000);
  const payload: Payload = {
    iss: 'chirpy',
    sub: userID,
    iat: iat,
    exp: iat + expiresIn,
  };
  return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
  try {
    const payload = jwt.verify(tokenString, secret);
    if (!payload.sub) {
      throw new Error('no sub property on payload');
    }
    return payload.sub.toString();
  } catch {
    throw new UnauthorizedError('invalid token');
  }
}

export function getBearerToken(req: Request): string {
  if (
    !req.get('authorization') ||
    !req.get('authorization')?.includes('Bearer ')
  ) {
    throw new UnauthorizedError('invalid bearer token');
  }
  const auth = req.get('authorization');
  const bearer = auth?.replace('Bearer ', '');
  return bearer || '';
}

export function makeRefreshToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  createRefreshToken(token, userId);
  return token;
}
