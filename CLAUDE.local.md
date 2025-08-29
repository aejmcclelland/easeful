# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo task management application with two main packages:
- `taskmanager-client/` - Next.js 15 frontend (React 19, TypeScript, Tailwind CSS, DaisyUI)
- `taskmanager-server/` - Express.js backend (MongoDB, JWT auth, Cloudinary integration)

## Development Commands

### Start Development Servers
```bash
# Start both client and server concurrently
pnpm dev

# Start individual services
pnpm dev:server  # Server on port 3000
pnpm dev:client  # Client on port 3001 (uses Turbopack)
```

### Client-specific Commands
```bash
cd taskmanager-client
pnpm dev        # Development with Turbopack
pnpm build      # Production build
pnpm start      # Start production build
```

### Server-specific Commands
```bash
cd taskmanager-server
pnpm dev        # Development with nodemon
pnpm start      # Production server
```

## Architecture Overview

### Client Architecture (taskmanager-client)
- **Framework**: Next.js 15 with App Router
- **UI**: Tailwind CSS 4.1.12 + DaisyUI 5.0.50
- **Key Directories**:
  - `src/app/` - App router pages and API routes
  - `src/components/` - Reusable React components (Navbar, TaskCard, RequireAuth)
  - `src/lib/` - Utilities, API client, types, and validation schemas

### Server Architecture (taskmanager-server)
- **Framework**: Express.js with MongoDB/Mongoose
- **Key Directories**:
  - `src/controllers/` - Business logic (auth.js, tasks.js, users.js)
  - `src/models/` - Mongoose schemas (User.js, Tasks.js)
  - `src/routes/` - Express route definitions
  - `src/middleware/` - Custom middleware (auth, validation, error handling)
  - `src/utils/` - Utility functions (email, geocoding, error responses)

### API Structure
- `/api/auth/` - Authentication endpoints (login, register, logout, profile)
- `/api/taskman/` - Task CRUD operations with filtering and image uploads
- `/api/users/` - User management (admin only)

## Validation System

The project uses a dual-layer validation approach:

### Client-side Validation (Zod)
- Location: `taskmanager-client/src/lib/validation/`
- **task.ts**: Task creation/update schemas with priority, status, labels validation
- **auth.ts**: User authentication schemas (register, login, profile updates)
- **index.ts**: Utility functions for validation result handling

### Server-side Validation (express-validator)
- Location: `taskmanager-server/src/middleware/validation.js`
- Provides final security layer with input sanitization and XSS protection
- Validates task creation, user registration, login, and query parameters
- Rejects unexpected fields for security

## Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcryptjs
- Rate limiting and CORS protection
- Input validation and XSS protection via express-validator
- MongoDB injection prevention with express-mongo-sanitize
- File upload validation with Cloudinary integration

## Database Models

### User Model
- Authentication fields (email, password, role)
- Avatar management with Cloudinary integration
- Password reset functionality

### Task Model
- Core task fields (task, description, priority, status)
- Rich features: labels array, due dates, image uploads
- Image gallery support with Cloudinary (multiple images with { public_id, url, width, height, bytes })
- Location support with geocoding
- User scoping and sharing capabilities

## Key Components

### Client Components
- **RequireAuth**: HOC for protected routes
- **Navbar**: User authentication state and navigation
- **TaskCard**: Individual task display with status management
- **TaskImageGallery**: Responsive grid of task images with modal lightbox support

### Server Middleware
- **auth.js**: JWT verification and role-based authorization
- **validation.js**: Request validation using express-validator
- **advancedresults.js**: Query filtering, sorting, and pagination
- **async.js**: Error handling wrapper for async route handlers

## Development Guidelines

1. **Validation**: Always use both client and server validation. Client schemas in `src/lib/validation/`, server validation in middleware
2. **Authentication**: Protected routes use `RequireAuth` component (client) and `protect` middleware (server)
3. **Error Handling**: Server uses consistent error responses via `ErrorResponse` class
4. **File Uploads**: Images handled via Cloudinary integration in src/cloudinary/; tasks accept multiple images with validation. Client displays thumbnails in a responsive gallery with modal lightbox, using Cloudinary transformations (w_400,h_300,c_fill,q_auto,f_auto) for fast, cached thumbs.
5. **Database Operations**: Use Mongoose with proper error handling and user scoping

## Environment Variables

### Server (.env)
- Database: `MONGO_URI`
- JWT: `JWT_SECRET`, `JWT_EXPIRE`, `JWT_COOKIE_EXPIRE`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`
- Email: SMTP configuration for password reset

### Client (.env.local)
- `NEXT_PUBLIC_API_BASE`: Backend API URL (defaults to http://localhost:3000)