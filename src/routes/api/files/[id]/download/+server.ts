import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { generateDownloadUrl } from '$lib/server/s3';

export async function GET({ params, locals }) {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const file = await prisma.file.findUnique({
			where: { id: params.id }
		});

		if (!file) {
			return new Response('File not found', { status: 404 });
		}

		if (file.userId !== locals.user.id) {
			return new Response('Forbidden', { status: 403 });
		}

		const downloadUrl = await generateDownloadUrl(file.s3Key);

		return json({ downloadUrl });
	} catch (error) {
		console.error('Error getting download url:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}
