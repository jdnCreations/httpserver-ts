import { and, asc, eq } from 'drizzle-orm';
import { db } from '../index.js';
import { chirps, NewChirp } from '../schema.js';

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getAllChirps() {
  const results = await db.select().from(chirps).orderBy(asc(chirps.createdAt));
  return results;
}

export async function getAllChirpsForAuthor(authorId: string) {
  const results = await db
    .select()
    .from(chirps)
    .orderBy(asc(chirps.createdAt))
    .where(eq(chirps.userId, authorId));
  return results;
}

export async function getChirpById(chirpId: string) {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
  return result;
}

export async function deleteChirpById(chirpId: string) {
  const [result] = await db.delete(chirps).where(eq(chirps.id, chirpId));
  return result;
}
