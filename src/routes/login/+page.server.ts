import { Argon2id } from 'oslo/password';
import { fail, redirect } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import { prisma } from '$lib/server/prisma';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (typeof password !== 'string' || password.length < 3 || password.length > 255) {
			return fail(400, {
				message: 'Invalid password'
			});
		}

		const user = await prisma.userAccount.findFirst({
			where: {
				username: username
			}
		});

		if (!user) {
			return fail(400, {
				message: 'Invalid credentials'
			});
		}

		const validPass = await new Argon2id().verify(user.password_hash, password);
		if (!validPass) {
			return fail(400);
		}

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		redirect(303, '/logout');
	}
};
