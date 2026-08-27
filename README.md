# HyperLocal Backend

A production-grade Express.js backend built with TypeScript.

## Features

- ✅ TypeScript for type safety
- ✅ Express.js framework
- ✅ Helmet for security headers
- ✅ CORS support
- ✅ Winston logging
- ✅ Input validation with Joi
- ✅ Error handling middleware
- ✅ Environment configuration
- ✅ ESLint + Prettier code quality
- ✅ Graceful shutdown handling

## Prerequisites

- Node.js 16+ 
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** (`.env`):
   ```
   NODE_ENV=development
   PORT=3000
   LOG_LEVEL=info
   CORS_ORIGIN=*
   ```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

This uses `ts-node` for direct TypeScript execution.

## Production

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

The compiled JavaScript will be in the `dist/` directory.

## Code Quality

- **Lint:** `npm run lint`
- **Fix linting issues:** `npm run lint:fix`
- **Format code:** `npm run format`
- **Type check:** `npm run type-check`

## Project Structure

```
src/
├── app.ts                 # Express app setup
├── index.ts              # Server entry point
├── config/
│   └── index.ts          # Configuration management
├── middleware/
│   ├── errorHandler.ts   # Global error handler
│   ├── requestLogger.ts  # Request logging
│   └── validate.ts       # Input validation
├── routes/
│   └── index.ts          # API routes
└── utils/
    ├── logger.ts         # Winston logger
    └── response.ts       # Response utilities
```

## Middleware

### Error Handler
Centralized error handling with logging and proper status codes.

### Request Logger
Logs all incoming requests with method, path, IP, and user agent.

### Request Validation
Joi-based request validation middleware for body, query, and params.

## API Endpoints

### Health Check
```
GET /health
```

### Status
```
GET /api/status
```

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "statusCode": 200,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Logging

Logs are written to:
- `logs/error.log` - Error level logs
- `logs/combined.log` - All logs
- Console (development only)

## Best Practices Implemented

1. **Type Safety** - Strict TypeScript configuration
2. **Security** - Helmet middleware, CORS configuration
3. **Logging** - Winston for structured logging
4. **Error Handling** - Comprehensive error handling middleware
5. **Validation** - Joi for request validation
6. **Code Quality** - ESLint + Prettier integration
7. **Environment Management** - dotenv for configuration
8. **Graceful Shutdown** - Proper cleanup on SIGTERM/SIGINT

## Next Steps

1. Add database integration (MongoDB, PostgreSQL, etc.)
2. Implement authentication (JWT, OAuth)
3. Create domain-specific routes and controllers
4. Add unit and integration tests
5. Set up CI/CD pipeline
6. Add API documentation (Swagger/OpenAPI)

Server Deployment:
```sudo -u postgres psql -d localtalent```
```cd /var/www/backend;git pull;npm run build;pm2 delete 0 1;pm2 start dist/index.js --name hyperlocal-api;pm2 start dist/worker.js --name hyperlocal-worker;pm2 save;```

## License

ISC
