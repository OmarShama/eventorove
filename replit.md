# Stagea - Premium Venue Booking Platform

## Overview

Stagea is a venue booking platform designed for Cairo, Egypt, allowing venue hosts to list their spaces and guests to make instant bookings. The application supports hourly venue rentals with a minimum 30-minute duration, operates in Cairo timezone, and provides features like venue search, Google Maps integration, and instant booking without payment processing (pay at venue model).

The platform uses a full-stack TypeScript architecture with React frontend, Express.js backend, and PostgreSQL database. It's designed for deployment on Replit with integrated authentication and file storage capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with Tailwind CSS styling using shadcn/ui design system
- **Routing**: Wouter for client-side routing with role-based access control
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture  
- **Framework**: Express.js with TypeScript running in ESM mode
- **Database ORM**: Drizzle ORM with PostgreSQL using Neon serverless database
- **Authentication**: Replit's OIDC authentication system with session management
- **API Design**: RESTful endpoints following route → middleware → controller → service pattern
- **File Storage**: Google Cloud Storage integration via Replit's sidecar proxy
- **Email Service**: SendGrid integration for notifications

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Key Entities**: Users (guest/host/admin roles), Venues, Bookings, Availability Rules, Blackout Periods
- **Session Storage**: Database-backed sessions using connect-pg-simple
- **Timezone Handling**: All date operations use Cairo timezone (Africa/Cairo)

### Authentication & Authorization
- **Provider**: Replit OIDC authentication with automatic user provisioning
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Role-Based Access**: Three user roles (guest, host, admin) with route-level protection
- **Security**: HTTP-only cookies with secure flags for session management

### File Upload System
- **Storage Backend**: Google Cloud Storage accessed through Replit's sidecar proxy
- **Upload Strategy**: Direct-to-cloud uploads using presigned URLs
- **File Management**: Uppy.js for frontend file handling with progress tracking
- **Access Control**: Custom ACL system for object-level permissions

### Search & Discovery
- **Venue Search**: Full-text search with filtering by location, category, capacity, and price
- **Availability Checking**: Real-time availability validation considering venue hours and blackout periods  
- **Maps Integration**: Google Maps API for venue location display and search

### Booking System
- **Booking Model**: Instant booking without upfront payment (pay at venue)
- **Time Management**: 30-minute minimum bookings with hourly increments
- **Validation**: Multi-layer validation for capacity, availability, and venue status
- **Notifications**: Automated email confirmations to guests and hosts

### Deployment Architecture
- **Platform**: Replit with Node.js 20+ runtime
- **Build Process**: Vite for frontend bundling, ESBuild for backend compilation
- **Environment**: Development and production configurations with environment-specific features
- **Asset Management**: Static file serving with Vite middleware in development

## External Dependencies

### Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Google Cloud Storage**: File storage service accessed via Replit sidecar proxy
- **Replit Database**: Session storage and potential caching layer

### Authentication & Communication
- **Replit OIDC**: Primary authentication provider with user management
- **SendGrid**: Transactional email service for booking confirmations and notifications

### APIs & Services
- **Google Maps API**: Location services, geocoding, and map visualization
- **Replit Runtime Services**: Development tools and deployment infrastructure

### Frontend Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **TanStack Query**: Server state management with caching and synchronization
- **date-fns**: Date manipulation and timezone handling utilities

### Development Tools
- **TypeScript**: Static typing across frontend and backend
- **Vite**: Frontend build tool with HMR and development server
- **Drizzle Kit**: Database schema management and migrations
- **Uppy**: File upload handling with progress tracking and validation