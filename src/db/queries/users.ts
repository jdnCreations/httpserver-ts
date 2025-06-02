import { eq } from 'drizzle-orm';
import { db } from '../index.js';
import { NewUser, refresh_tokens, users } from '../schema.js';

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteAllUsers() {
  await db.delete(users);
}

export async function getUserByEmail(email: string) {
  const [result] = await db.select().from(users).where(eq(users.email, email));
  return result;
}

export async function getUserFromRefreshToken(token: string) {
  const [result] = await db
    .select()
    .from(refresh_tokens)
    .innerJoin(users, eq(refresh_tokens.userId, users.id))
    .where(eq(refresh_tokens.token, token));
  return result?.users;
}
