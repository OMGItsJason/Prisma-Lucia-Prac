import { Argon2id } from 'oslo/password';
import { fail, redirect } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import { prisma } from '$lib/server/prisma';
import type { Actions } from './$types';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

const logInSchema = z.object({
	username: z.string({ required_error: 'Invalid Email' }).min(1),
	password: z.string({ required_error: 'Invalid Password' }).min(1)
});

export const load = async () => {
	const form = await superValidate(zod(logInSchema));
	return {
		form
	};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await superValidate(event, zod(logInSchema));

		if (!formData) {
			return fail(400, {
				formData,
				error: 'Invalid form data'
			});
		}

		const { username, password } = formData.data;

		const db = await prisma.user.findFirst({
			where: {
				username
			}
		});

		if (!db) {
			return fail(400, {
				formData,
				message: 'Invalid Username'
			});
		}

		if (typeof password !== 'string' || password.length < 3 || password.length > 255) {
			return fail(400, {
				formData,
				message: 'Invalid Password'
			});
		}

		const validPass = await new Argon2id().verify(db.password_hash, password);
		if (!validPass) {
			return fail(400);
		}

		const session = await lucia.createSession(db.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		redirect(303, '/logout');
	}
};
