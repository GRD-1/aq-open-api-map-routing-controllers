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
- Docker and Docker Compose
- npm or yarn package manager

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/aq-open-api-map-routing-controllers.git
cd aq-open-api-map-routing-controllers
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.sample .env
```

4. Start the database using Docker:
```bash
docker-compose up -d
```

5. Run in development mode:
```bash
npm run dev
```

The API will be available at:
- API endpoints: `http://localhost:3000/api/v1/`
- Swagger documentation: `http://localhost:3000/api-docs`


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

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api-docs` - Get api map
