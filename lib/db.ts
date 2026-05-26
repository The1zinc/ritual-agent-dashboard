/* ──────────────────────────────────────────────
 *  Prisma Client — Singleton for serverless
 *  Prevents connection exhaustion in Next.js dev/serverless
 *  Updated for Prisma 7: uses driver adapter + custom output path
 * ────────────────────────────────────────────── */

import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // During build / static generation, DATABASE_URL may not be available.
    // Return a proxy that will throw a clear error if actually used at runtime.
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (prop === 'then' || prop === Symbol.toPrimitive) return undefined;
        throw new Error(
          `DATABASE_URL is not set — cannot use Prisma at build time. ` +
            `Set DATABASE_URL in your .env file to connect to the database.`
        );
      },
    });
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
