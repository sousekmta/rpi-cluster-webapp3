import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { deleteS3Object } from '$lib/server/s3';

export async function DELETE({ params, locals }) {
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

		// Delete from S3
		await deleteS3Object(file.s3Key);

		// Delete from DB
		await prisma.file.delete({
			where: { id: params.id }
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting file:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}
