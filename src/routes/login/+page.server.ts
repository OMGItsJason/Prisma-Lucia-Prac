import { Argon2id } from 'oslo/password';
import type { PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import { prisma } from '$lib/server/prisma';
import type { Actions } from './$types';
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
		const formData = await superValidate(event, zod(validateSchema));
		const { username, password } = formData.data;

		if (!formData) {
			return fail(400, {
				formData,
				error: 'Invalid form data'
			});
		}

		const db = await prisma.user.findFirst({
			where: {
				username
			}
		});

		if (!db) {
			return fail(400, {
				formData,
				error: 'Invalid Username'
			});
		}

		const validPass = await new Argon2id().verify(db.password_hash, password);
		if (!validPass) {
			return error(400);
		}

		const session = await lucia.createSession(db.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		if (db.username === 'vsAdmin') {
			redirect(300, '/adminpage');
		}
		if (db.username === 'vsDesk') {
			redirect(300, '/deskpage');
		} else {
			redirect(301, '/logout');
		}
	}
};
