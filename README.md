# TinyTickets 

A simple issue tracking system built with **Express + TypeScript + Prisma + PostgreSQL** (backend) and **Next.js** (frontend, later).



## Backend Setup

1. Start Postgres with Docker:
   
   docker compose up -d db

2. Copy environment file:

cd backend
cp .env.example .env

3. Install dependencies and run migrations:

npm install
npx prisma generate
npx prisma migrate dev --name init

4. Start the API server:

npm run dev

## Auth Endpoints

POST /auth/register

Registers a new user.

REQUEST

{
  "email": "alice@example.com",
  "name": "Alice",
  "password": "test1234"
}

RESPONSE

{
  "id": "user_id",
  "email": "alice@example.com",
  "name": "Alice",
  "createdAt": "2025-08-28T12:00:00.000Z"
}

POST /auth/login

Logs in an existing user.

Request

{
  "email": "alice@example.com",
  "password": "test1234"
}

RESPONSE

{
  "token": "JWT_TOKEN_STRING"
}

The token must be sent in the Authorization header for protected routes:

Authorization: Bearer <token>

## Postman Collection

A ready-to-use Postman collection is included:
backend/postman/TinyTickets.postman_collection.json

Import this into Postman to test the endpoints directly.