import { dev } from '$app/environment';
import { Lucia } from 'lucia';
import { adapter } from '$lib/server/prisma';

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			id: attributes.id,
			username: attributes.username,
			password_hash: attributes.password_hash
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	id: string;
	username: string;
	password_hash: string;
}
