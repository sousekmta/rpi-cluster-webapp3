import { json } from '@sveltejs/kit';
import { generateUploadUrl } from '$lib/server/s3';
import { randomUUID } from 'crypto';

export async function POST({ request, locals }) {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { filename, contentType } = await request.json();
	if (!filename || !contentType) {
		return new Response('Missing filename or contentType', { status: 400 });
	}

	const s3Key = `${locals.user.id}/${randomUUID()}-${filename}`;
	
	try {
		const presignedUrl = await generateUploadUrl(s3Key, contentType);
		console.log("Generated presigned URL:", presignedUrl);
		return json({ presignedUrl, s3Key });
	} catch (error) {
		console.error('Error generating presigned URL:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}
