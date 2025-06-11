import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Only initialize Prisma if not in build mode
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
  prisma = new PrismaClient()
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient()
  }
  prisma = globalForPrisma.prisma
}

export { prisma }
export default prisma
