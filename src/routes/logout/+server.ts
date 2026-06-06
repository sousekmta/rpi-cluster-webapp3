import { lucia } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const POST = async ({ locals, cookies }) => {
	if (!locals.session) {
		return new Response('Unauthorized', { status: 401 });
	}
	await lucia.invalidateSession(locals.session.id);
	const sessionCookie = lucia.createBlankSessionCookie();
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
	redirect(302, '/login');
};
