# MonoNestNext

A monorepo with NestJS backend and Next.js frontend.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:

Create a `.env` file in the root directory with:

```env
# Database
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=stagea

# App
PORT=5000
NODE_ENV=development
TZ=Africa/Cairo

# Optional
SENDGRID_API_KEY=your_sendgrid_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

3. Database Setup:

Make sure PostgreSQL is installed and running on your machine.

Create the database:
```bash
createdb stagea
```

Run migrations:
```bash
npm run typeorm:run
```

4. Start the Development Server:

```bash
# Start both backend and frontend
npm run dev
```

The application will be available at:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Development

### Database Migrations

Generate a new migration:
```bash
npm run typeorm:gen
```

Apply migrations:
```bash
npm run typeorm:run
```

Revert last migration:
```bash
npm run typeorm:revert
```

## Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

```
├── client/              # React frontend (Vite)
│   └── src/
│       ├── components/  # React components
│       ├── hooks/       # Custom hooks
│       ├── lib/         # Utilities
│       ├── pages/       # Application pages
│       └── types/       # Frontend TypeScript types
└── server/              # NestJS backend
    └── src/
        ├── shared/      # Backend types and schemas
        ├── db/          # Database configuration
        ├── migrations/  # TypeORM migrations
        ├── users/       # Users module
        ├── venues/      # Venues module
        └── bookings/    # Bookings module
```

## Technologies

- Backend:
  - NestJS
  - TypeORM
  - PostgreSQL
  - TypeScript

- Frontend:
  - React (Vite)
  - React Query
  - TailwindCSS
  - TypeScript

## Features

- User authentication and authorization
- Venue management
- Booking system with availability rules
- Image uploads
- Google Maps integration
- TypeScript end-to-end
- Separate frontend and backend services communicating via REST API