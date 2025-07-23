// import { PrismaClient } from '@prisma/client';

// /**
//  * In development Next.js reloads files on every save, which can cause
//  * “PrismaClient is already running” errors if we create a new instance
//  * each time.  We stash the instance on `global` so it’s reused.
//  */
// const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// const prisma =
//   globalForPrisma.prisma ?? // reuse during dev hot-reloads
//   new PrismaClient({
//     // log: ['query', 'error', 'warn'],   // ← uncomment if you want verbose logs
//   });

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma;      // store for next reload
// }

// export default prisma;  // so you can:  import prisma from '@/lib/prisma'
// export { prisma };      // optional named export
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// ✅ globalForPrisma lives on the Node global object only in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"], // suppress noisy "query" logs
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// ✅ During development reuse the same instance on every hot reload.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}


