import { describe, it, expect, beforeAll } from 'vitest';
import {
  checkPasswordHash,
  getBearerToken,
  hashPassword,
  makeJWT,
  validateJWT,
} from './auth';
import { Request } from 'express';

describe('Password Hashing', () => {
  const password1 = 'correctPassword123!';
  const password2 = 'anotherPassword456!';
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it('should return true for the correct password', async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});

describe('JWT Token generating and validation', () => {
  const token = makeJWT('2f08bdce-5cc8-40e8-8558-a318d4c88e03', 600, 'bald');

  it('should return true for matching user id', () => {
    const result = validateJWT(token, 'bald');
    expect(result).toBe('2f08bdce-5cc8-40e8-8558-a318d4c88e03');
  });
});

describe('JWT Expired', () => {
  const token = makeJWT('2f08bdce-5cc8-40e8-8558-a318d4c88e03', -1000, 'bald');
  it('should throw error for expired token', () => {
    expect(() => validateJWT(token, 'bald')).toThrowError('invalid token');
  });
});

describe('Invalid JWT secret', () => {
  const token = makeJWT('2f08bdce-5cc8-40e8-8558-a318d4c88e03', -1000, 'bald');

  it('should throw error', () => {
    expect(() => validateJWT(token, 'hairy')).toThrowError('invalid token');
  });
});

describe('Get Bearer Token', () => {
  const req: Request = {
    headers: {
      authorization: 'Bearer bilbo',
    },
    get: (headerName: string) => {
      if (headerName.toLowerCase() === 'authorization') {
        return 'Bearer bilbo';
      }
      return undefined;
    },
  } as unknown as Request;

  const bearerToken = getBearerToken(req);

  it('should give us bilbo', () => {
    expect(bearerToken).toBe('bilbo');
  });
});

describe('Invalid Bearer Token', () => {
  const req: Request = {
    headers: {
      authorization: 'Be bilbo',
    },
    get: (headerName: string) => {
      if (headerName.toLowerCase() === 'authorization') {
        return 'Be bilbo';
      }
      return undefined;
    },
  } as unknown as Request;

  it('should give us error', () => {
    expect(() => getBearerToken(req)).toThrowError();
  });
});
