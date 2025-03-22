# User Services API

A microservice handling user authentication and management for the Countries Explorer application.

## Features

- User registration
- User authentication (login)
- JWT-based authentication
- Rate limiting
- Security middleware (Helmet)
- PostgreSQL database with Prisma ORM

## Tech Stack

- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT for authentication
- bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- yarn or npm

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3100
JWT_SECRET="your-secret-key"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/user_db"
```

## Installation

1. Clone the repository
2. Install dependencies:

```bash
yarn install
```

3. Set up the database:

   Make sure your PostgreSQL database is:

- Running
- Accessible
- The credentials in your DATABASE_URL are correct
- Run these Prisma commands to ensure your database is properly set up:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev
```

4. Start the development server:

```bash
yarn dev
```

## API Endpoints

### POST /api/register

Register a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "token": "jwt-token",
  "message": "Registration successful, this token will expire in 24 hours"
}
```

### POST /api/login

Authenticate a user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "token": "jwt-token",
  "message": "Login successful, this token will expire in 24 hours"
}
```

## Rate Limiting

The API implements rate limiting with the following rules:

- 2 requests per second per IP address
- Exceeding this limit will return a 429 status code

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Helmet.js for security headers
- CORS enabled
- Rate limiting protection

## Available Scripts

| Command         | Description               |
| --------------- | ------------------------- |
| `yarn dev`      | Start development server  |
| `yarn build`    | Build for production      |
| `yarn start`    | Start production server   |
| `yarn test`     | Run tests                 |
| `yarn lint`     | Run linter                |
| `yarn lint:fix` | Fix linting issues        |
| `yarn format`   | Format code with Prettier |
| `yarn seed`     | Seed the database         |

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 429: Too Many Requests
- 500: Internal Server Error

## Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  role      String   @default("USER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Author

Sibabale Joja

## License

ISC
