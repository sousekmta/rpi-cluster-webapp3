import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const load = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const files = await prisma.file.findMany({
		where: { userId: locals.user.id },
		orderBy: { createdAt: 'desc' }
	});

	return {
		files
	};
};
