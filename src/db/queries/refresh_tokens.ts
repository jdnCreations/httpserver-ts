import { refresh_tokens } from '../schema.js';
import { db } from '../index.js';
import { eq } from 'drizzle-orm';

export async function createRefreshToken(token: string, userId: string) {
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
  const sixtyDays = new Date(Date.now() + sixtyDaysMs);
  const [result] = await db
    .insert(refresh_tokens)
    .values({ token: token, expiresAt: sixtyDays, userId: userId })
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function revokeRefreshToken(token: string) {
  const now = new Date(Date.now());
  const [result] = await db
    .update(refresh_tokens)
    .set({ revokedAt: now, updatedAt: now })
    .where(eq(refresh_tokens.token, token))
    .returning();
  return result;
}

export async function isRefreshTokenValid(token: string) {
  const [result] = await db
    .select()
    .from(refresh_tokens)
    .where(eq(refresh_tokens.token, token));
  if (result.expiresAt.valueOf() < Date.now() || result.revokedAt) {
    return false;
  } else {
    return true;
  }
}
