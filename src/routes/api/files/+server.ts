import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export async function POST({ request, locals }) {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { name, type, size, s3Key } = await request.json();

	try {
		const file = await prisma.file.create({
			data: {
				name,
				type,
				size,
				s3Key,
				userId: locals.user.id
			}
		});

		return json({ file });
	} catch (error) {
		console.error('Error creating file record:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}

export async function GET({ locals }) {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const files = await prisma.file.findMany({
			where: { userId: locals.user.id },
			orderBy: { createdAt: 'desc' }
		});

		return json({ files });
	} catch (error) {
		console.error('Error fetching files:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}
