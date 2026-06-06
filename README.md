# MTA Drive

A cloud file storage web application inspired by services like Google Drive. Built with SvelteKit, PostgreSQL, and MinIO (S3-compatible object storage).

## Features

- User registration and authentication (via Lucia v3)
- Drag & drop file upload via presigned S3 URLs
- File listing with type-based icons (image, video, generic)
- Inline preview for images and videos
- File download via presigned URLs
- File deletion (removes from both S3 and database)
- Dark/light theme support

## Tech Stack

| Layer      | Technology                                     |
| ---------- | ---------------------------------------------- |
| Frontend   | Svelte 5, SvelteKit 2, Tailwind CSS            |
| Backend    | SvelteKit server routes, Lucia v3 auth         |
| Database   | PostgreSQL 15 (via Prisma ORM)                 |
| Storage    | MinIO (S3-compatible API, AWS SDK v3)          |
| Runtime    | Node.js 20, Docker Compose                     |

## Architecture

- **PostgreSQL** stores application data — users, sessions, and file metadata.
- **MinIO** stores the actual file blobs. Files are uploaded and downloaded directly by the client using time-limited presigned URLs, so the server never handles file bytes directly.
- **SvelteKit** serves the UI and provides REST API endpoints for authentication, file metadata, and presigned URL generation.

## Run the project with docker compose

### Prerequisites

- Docker and Docker Compose

### Run

```bash
docker compose up --build
```

The app will be available at `http://localhost:3005`.

The Compose setup starts three services:

- `app` — the SvelteKit application (port 3005)
- `db` — PostgreSQL 15 (port 5432)
- `s3` — MinIO (API port 9000, console port 9001)
- `createbuckets` — one-shot init container that creates the `drive-files` bucket

### Environment Variables

| Variable              | Description                          | Default                    |
| --------------------- | ------------------------------------ | -------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string         | `postgresql://drive:drivepass@db:5432/drive` |
| `S3_ENDPOINT`         | Internal S3 endpoint (container)     | `http://s3:9000`           |
| `S3_PUBLIC_ENDPOINT`  | Public S3 endpoint (browser-facing)  | `http://localhost:9000`    |
| `S3_REGION`           | S3 region                            | `us-east-1`                |
| `S3_ACCESS_KEY`       | MinIO access key                     | `admin`                    |
| `S3_SECRET_KEY`       | MinIO secret key                     | `admin123`                 |
| `S3_BUCKET_NAME`      | S3 bucket for file storage           | `drive-files`              |
| `ORIGIN`              | App origin (for CSRF protection)     | `http://localhost:3005`    |


## API Endpoints used in this app

| Method | Path                              | Auth Required | Description                |
| ------ | --------------------------------- | ------------- | -------------------------- |
| POST   | `/register`                       | No            | Create an account          |
| POST   | `/login`                          | No            | Sign in                    |
| POST   | `/logout`                         | Yes           | Sign out                   |
| POST   | `/api/upload`                     | Yes           | Get presigned upload URL   |
| POST   | `/api/files`                      | Yes           | Save file metadata         |
| GET    | `/api/files`                      | Yes           | List user's files          |
| GET    | `/api/files/:id/download`         | Yes           | Get presigned download URL |
| DELETE | `/api/files/:id`                  | Yes           | Delete a file              |
