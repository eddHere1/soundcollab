# SoundCollab

A full-stack music collaboration platform for upcoming artists — upload beats & songs, discover talent, follow artists, send DMs, request collabs, and buy beats.

**Stack:** React + Vite + TailwindCSS · Node.js + Express · PostgreSQL · JWT auth · local file storage

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run dev
```

API runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`

## Features (MVP)

- **Auth** — Register/login with JWT
- **Profiles** — Bio, role (artist/producer/both), genres, location
- **Posts** — Upload beats or songs with genre & "looking for" tags
- **Feed** — Newest/trending, filters by type, genre, collab tags, following
- **Follow** — Follow artists, see their posts in feed
- **DMs** — 1-on-1 messaging between users
- **Collab requests** — Request collab on posts, accept/reject, collab chat threads
- **Marketplace** — List beats for sale, mock purchase transactions

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/posts/feed` | Feed with filters |
| POST | `/api/posts` | Create post (multipart) |
| POST | `/api/follows/:id` | Follow user |
| POST | `/api/messages/dm` | Send DM |
| POST | `/api/collab/:postId` | Collab request |
| POST | `/api/beats/:postId/purchase` | Mock beat purchase |

## Project Structure

```
soundcollab/
├── backend/
│   └── src/
│       ├── config/       # DB connection
│       ├── controllers/  # Route handlers
│       ├── middleware/   # Auth, file upload
│       ├── models/       # Schema & migrations
│       ├── routes/       # API routes
│       └── services/     # Business logic
├── frontend/
│   └── src/
│       ├── api/          # API client
│       ├── components/   # UI components
│       ├── context/      # Auth state
│       └── pages/        # Page views
└── docker-compose.yml    # PostgreSQL
```
