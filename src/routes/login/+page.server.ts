import { fail, redirect } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import { prisma } from '$lib/server/db';
import { Scrypt } from 'oslo/password';

export const load = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}
	return {};
};

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (typeof email !== 'string' || typeof password !== 'string') {
			return fail(400, { message: 'Invalid credentials' });
		}

		const user = await prisma.user.findUnique({
			where: { email }
		});

		if (!user) {
			return fail(400, { message: 'Incorrect email or password' });
		}

		const validPassword = await new Scrypt().verify(user.password, password);
		if (!validPassword) {
			return fail(400, { message: 'Incorrect email or password' });
		}

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
