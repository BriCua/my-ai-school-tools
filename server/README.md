# Backend API Server

Backend for the ai-school application built with Express.js.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Project Structure

```
server/
├── src/
│   ├── server.js          # Main server file
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   └── utils/             # Utility functions
├── .env.example           # Environment variables template
├── package.json
└── README.md
```

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Example Routes
- `GET /api/hello` - Example GET endpoint
- `POST /api/echo` - Example POST endpoint (requires `message` in body)

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

## Adding New Routes

1. Create a new file in `src/routes/`
2. Define your routes using Express Router
3. Import and use the router in `src/server.js`

## Error Handling

The server includes built-in error handling middleware that:
- Catches unhandled errors
- Logs errors to console
- Returns consistent JSON error responses
- Includes stack traces in development mode
