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

**REQUEST**

{
  "email": "alice@example.com",
  "name": "Alice",
  "password": "test1234"
}

**RESPONSE**

{
  "id": "user_id",
  "email": "alice@example.com",
  "name": "Alice",
  "createdAt": "2025-08-28T12:00:00.000Z"
}

POST /auth/login

Logs in an existing user.

**Request**

{
  "email": "alice@example.com",
  "password": "test1234"
}

**RESPONSE**

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

**Request**

{
  "name": "Alpha",
  "description": "Demo project"
}


**Response (201)**

{
  "id": "proj_123",
  "name": "Alpha",
  "description": "Demo project",
  "createdAt": "2025-08-28T12:34:56.000Z"
}

GET /projects

List all projects where caller is owner or member.

**Response (200)**

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

**Response (200)**

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

**Request**

{ "email": "member@example.com" }


**Response (201)**

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
  

## Tickets Endpoints

All ticket routes require authentication **and project membership**.  
Use your JWT token in the header:

Authorization: Bearer <token>

POST /projects/:id/tickets.

Create a new ticket inside a project.  
Caller must be an **OWNER** or **MEMBER** of the project.

**Request**

{
  "title": "Fix login bug",
  "description": "Users cannot log in",
  "priority": "HIGH",
  "status": "OPEN",
  "assigneeId": "user_123"   // optional, must be project member
}

Allowed values:-

status: OPEN | IN_PROGRESS | RESOLVED | CLOSED

priority: LOW | MEDIUM | HIGH

**Response (201)**

{
  "id": "ticket_abc",
  "title": "Fix login bug",
  "status": "OPEN",
  "priority": "HIGH",
  "assigneeId": null,
  "createdAt": "2025-08-28T12:34:56.000Z",
  "updatedAt": "2025-08-28T12:34:56.000Z"
}

Errors:-

403 if caller is not a project member

400 if assigneeId is not a member of the project

GET /projects/:id/tickets.

List all tickets in a project.
Supports filtering.

Query Parameters:-

status - filter by status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)

priority - filter by priority (LOW, MEDIUM, HIGH)

assigneeId - filter by user id

search - text search in title (case-insensitive)

Examples :-

GET /projects/:id/tickets?status=OPEN
GET /projects/:id/tickets?priority=HIGH
GET /projects/:id/tickets?search=login
GET /projects/:id/tickets?assigneeId=user_123

**Response (200)**

[
  {
    "id": "ticket_abc",
    "title": "Fix login bug",
    "description": "Users cannot log in",
    "status": "OPEN",
    "priority": "HIGH",
    "assignee": { "id": "user_123", "email": "member@example.com", "name": "Member" },
    "createdAt": "2025-08-28T12:34:56.000Z",
    "updatedAt": "2025-08-28T12:34:56.000Z"
  }
]

GET /tickets/:id .

Get full details of a specific ticket.
Caller must be an OWNER or MEMBER of the project.

**Response (200)**

{
  "id": "ticket_abc",
  "title": "Fix login bug",
  "description": "Users cannot log in",
  "status": "OPEN",
  "priority": "HIGH",
  "assignee": { "id": "user_123", "email": "member@example.com", "name": "Member" },
  "projectId": "proj_123",
  "createdAt": "2025-08-28T12:34:56.000Z",
  "updatedAt": "2025-08-28T12:34:56.000Z"
}

Errors :-

403 if caller is not a project member

404 if ticket not found

PUT /tickets/:id.

Update a ticket (title, description, status, priority, assignee).
Caller must be an OWNER or MEMBER of the project.

**Request**


{ "status": "RESOLVED", "priority": "LOW", "assigneeId": "user_123" }

**Response (200)**

{
  "id": "ticket_abc",
  "title": "Fix login bug",
  "description": "Users cannot log in",
  "status": "RESOLVED",
  "priority": "LOW",
  "assigneeId": "user_123",
  "createdAt": "2025-08-28T12:34:56.000Z",
  "updatedAt": "2025-08-28T13:22:00.000Z"
}

Errors:-

403 if caller is not a project member

400 if assigneeId is not a project member

404 if ticket not found

DELETE /tickets/:id.

Delete a ticket.
Caller must be an OWNER or MEMBER of the project.

**Response (204)** - No Content

Errors :-

403 if caller is not a project member

404 if ticket not found

## Postman Collection

A ready-to-use Postman collection is included:
backend/postman/TinyTickets.postman_collection.json

Import this into Postman to test the endpoints directly.