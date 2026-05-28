# NEXUS Backend

A lightweight Express backend for the NEXUS gaming portal with JWT auth, local user storage, and Cloudinary avatar uploads.

## Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Set your values for `PORT`, `JWT_SECRET`, and Cloudinary credentials.
3. Install dependencies:

```bash
cd backend
npm install
```

4. Start the server:

```bash
npm run dev
```

## API Endpoints

- `POST /api/auth/register` - Register new users and merge guest progression data (`xp`, `level`, `badges`).
- `POST /api/auth/login` - Authenticate and receive JWT + user data.
- `GET /api/user/profile` - Protected profile endpoint.
- `PUT /api/user/profile/update` - Protected update profile / sync progression endpoint.
- `POST /api/user/profile/avatar` - Protected avatar upload using `multipart/form-data` under field `avatar`.

## Notes

- The backend uses ES modules and `type: module` in `backend/package.json`.
- Avatar uploads are stored in Cloudinary and old avatars are deleted when replaced.
- All async routes use try/catch blocks and structured JSON error responses.
