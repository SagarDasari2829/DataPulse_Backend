# DataPulse Backend

Backend service for DataPulse built with Node.js, Express, MongoDB, and WebSocket support.

## Features

- REST API for authentication and posts
- MongoDB persistence with Mongoose
- JWT-based authentication
- Startup sync for posts from `jsonplaceholder.typicode.com`
- WebSocket server initialization alongside the HTTP server

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JSON Web Tokens
- WebSocket (`ws`)

## Project Structure

```text
backend/
|-- api/
|-- config/
|-- controllers/
|-- middleware/
|-- models/
|-- routes/
|-- utils/
|-- websocket/
|-- app.js
|-- server.js
|-- package.json
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file based on `.env.example`.

```env
PORT=5000
CORS_ORIGIN=http://localhost:5173,https://data-pulse-frontend-beta.vercel.app
MONGODB_URI=mongodb://127.0.0.1:27017/datapulse
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
```

### 3. Run the server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The server starts on the configured `PORT` and connects to MongoDB before accepting traffic.

## API Endpoints

### Health

- `GET /` - Basic status message
- `GET /health` - Health check endpoint

### Auth

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Log in and receive a JWT
- `POST /auth/logout` - Log out the current user (requires auth)
- `GET /auth/me` - Get the current authenticated user (requires auth)

### Posts

- `GET /posts` - Fetch all posts
- `GET /posts/:id` - Fetch a post by external numeric id or MongoDB id

## Authentication

Protected routes expect a bearer token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

## Startup Behavior

When the server boots, it:

1. Connects to MongoDB
2. Fetches posts from `https://jsonplaceholder.typicode.com/posts`
3. Upserts them into the database
4. Starts the HTTP and WebSocket servers

If the external sync fails but posts already exist in MongoDB, the app continues running.

## Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server in watch mode

## Notes

- `CORS_ORIGIN` can be a comma-separated list of allowed origins.
- The repo ignores `.env` and `node_modules` through `.gitignore`.

## Deploying To Vercel

- Set the Vercel project root directory to `backend` if you are deploying from the repo root.
- Add `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `CORS_ORIGIN` in Vercel project environment variables.
- For `CORS_ORIGIN`, include your frontend URL, for example `https://data-pulse-frontend-beta.vercel.app`.
- After deploy, call the backend with the `/api` prefix, for example `https://your-backend.vercel.app/api/health`.
