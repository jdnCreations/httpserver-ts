import { compare, genSaltSync, hash } from 'bcrypt';

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
