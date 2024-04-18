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

		const user = await prisma.userAccount.findUnique({
			where: {
				username: username
			}
		});

		if (user) {
			return fail(409);
		}

		if (typeof password !== 'string' || password.length < 3 || password.length > 255) {
			return fail(400, {
				message: 'Invalid password'
			});
		}

		const userId = generateId(15);
		const hashedPass = await new Argon2id().hash(password);

		await prisma.userAccount.create({
			data: {
				username: username,
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

		return redirect(302, '/');
	}
};
