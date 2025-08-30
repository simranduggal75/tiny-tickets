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


## Projects Endpoints

All project routes require authentication.
Use your JWT token in the header:

Authorization: Bearer <token>

pOST /projects

Create a new project. Caller becomes OWNER.

Request

{
  "name": "Alpha",
  "description": "Demo project"
}


Response (201)

{
  "id": "proj_123",
  "name": "Alpha",
  "description": "Demo project",
  "createdAt": "2025-08-28T12:34:56.000Z"
}

GET /projects

List all projects where caller is owner or member.

Response (200)

[
  {
    "id": "proj_123",
    "name": "Alpha",
    "description": "Demo project",
    "createdAt": "...",
    "ownerId": "user_abc",
    "members": [
      {
        "role": "OWNER",
        "user": {
          "id": "user_abc",
          "email": "owner@example.com",
          "name": "Owner"
        }
      }
    ]
  }
]

GET /projects/:id

Get full details of a specific project.
Caller must be owner or member.

Response (200)

{
  "id": "proj_123",
  "name": "Alpha",
  "description": "Demo project",
  "createdAt": "...",
  "owner": {
    "id": "user_abc",
    "email": "owner@example.com",
    "name": "Owner"
  },
  "members": [
    {
      "role": "OWNER",
      "user": {
        "id": "user_abc",
        "email": "owner@example.com",
        "name": "Owner"
      }
    },
    {
      "role": "MEMBER",
      "user": {
        "id": "user_xyz",
        "email": "member@example.com",
        "name": "Member"
      }
    }
  ],
  "_count": { "tickets": 0 }
}

POST /projects/:id/members

Add a member to a project.
Only OWNER can call this.

Request

{ "email": "member@example.com" }


Response (201)

{
  "role": "MEMBER",
  "user": {
    "id": "user_xyz",
    "email": "member@example.com",
    "name": "Member"
  }
}


## Errors 

403 if caller is not owner(if you try  adding members through members jwt token instead of owners)

404 if project not found

404 if user not found
  

## Postman Collection

A ready-to-use Postman collection is included:
backend/postman/TinyTickets.postman_collection.json

Import this into Postman to test the endpoints directly.