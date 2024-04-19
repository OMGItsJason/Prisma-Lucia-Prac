import { lucia } from '$lib/server/auth';
import { generateId } from 'lucia';
import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { Argon2id } from 'oslo/password';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!username) {
			return fail(400);
		}

		if (typeof password !== 'string' || password.length < 3 || password.length > 255) {
			return fail(400, {
				message: 'Invalid password'
			});
		}

		const db = await prisma.user.findFirst({
			where: {
				username: username
			}
		});

		if (db) {
			return fail(409);
		}

		const userId = generateId(15);
		const hashedPass = await new Argon2id().hash(password);

		await prisma.user.create({
			data: {
				username,
				id: userId,
				password_hash: hashedPass
			}
		});

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		redirect(302, '/logout');
	}
};
