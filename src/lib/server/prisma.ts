import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';

const client = new PrismaClient();

const adapter = new PrismaAdapter(client.session, client.userAccount);

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'Development') {
	globalThis.prisma = new PrismaClient();
}

export { prisma, adapter };
