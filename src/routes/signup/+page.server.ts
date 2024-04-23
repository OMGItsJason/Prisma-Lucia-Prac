import { lucia } from '$lib/server/auth';
import { generateId } from 'lucia';
import { error, fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { Argon2id } from 'oslo/password';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { validateSchema } from '$lib/config/zodschema';

export const load = (async () => {
	return {
		form: await superValidate(zod(validateSchema))
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(validateSchema));
		const { username, password } = form.data;
		const regex = /\d/;

		if (!username) {
			return error(400);
		}

		const db = await prisma.user.findFirst({
			where: {
				username: username
			}
		});

		if (!regex.test(username) || /^\d+$/.test(username)) {
			return error(400);
		}

		if (db) {
			return error(400);
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
		// const session = await lucia.createSession(userId, {});
		// const sessionCookie = lucia.createSessionCookie(session.id);
		// event.cookies.set(sessionCookie.name, sessionCookie.value, {
		// 	path: '.',
		// 	...sessionCookie.attributes
		// });
		redirect(302, '/login');
	}
};
