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

export async function updateUser(user: {
  id: string;
  email: string;
  hashedPassword: string;
}) {
  const [result] = await db
    .update(users)
    .set({
      email: user.email,
      hashedPassword: user.hashedPassword,
      updatedAt: new Date(Date.now()),
    })
    .where(eq(users.id, user.id))
    .returning();
  return result;
}

export async function upgradeToChirpyRed(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    return false;
  }
  const [result] = await db
    .update(users)
    .set({ isChirpyRed: true })
    .where(eq(users.id, userId))
    .returning();
  return result.isChirpyRed;
}
