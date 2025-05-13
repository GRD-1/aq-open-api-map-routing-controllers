# AQ Open API Map generator

A TypeScript-based REST API project built with routing-controllers and OpenAPI/Swagger documentation.

## Features

- RESTful API endpoints for user management (CRUD operations)
- OpenAPI/Swagger documentation with detailed schema descriptions
- PostgreSQL database integration with Sequelize ORM
- Input validation using class-validator
- Automatic OpenAPI specification generation
- Custom decorators for enhanced documentation

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables in `.env`:
```env
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
```

3. Run in development mode:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Run in production:
```bash
npm start
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running. You can:

1. View and test API endpoints interactively
2. See detailed request/response schemas
3. Execute API calls directly from the Swagger UI

To regenerate the OpenAPI specification:
```bash
npm run generate:openapi
```

## API Endpoints

### Users Controller

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

