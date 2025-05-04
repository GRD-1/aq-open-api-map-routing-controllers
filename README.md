# AQ Error Library

A TypeScript-based error library built with reef-framework.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Run in production:
```bash
npm start
```

## API Endpoints

### Example Controller

- `GET /api/v1/example` - Get all items
- `GET /api/v1/example/:id` - Get item by ID
- `POST /api/v1/example` - Create new item

## Project Structure

```
.
├── src/
│   ├── controllers/
│   │   └── example.controller.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Development

The project uses TypeScript and reef-framework. To add new controllers, create them in the `src/controllers` directory with the `.controller.ts` suffix. 