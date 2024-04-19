import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { dev } from '$app/environment';

const prisma = globalThis.prisma || new PrismaClient();

if (dev) {
	globalThis.prisma = prisma;
}

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export { prisma, adapter };
