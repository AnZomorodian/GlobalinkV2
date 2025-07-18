# Corporate Messenger - Full Stack Application

## Overview

This is a full-stack corporate messaging application built with React, Express.js, and PostgreSQL. It features real-time messaging, voice/video calling capabilities, user management, and a modern UI built with shadcn/ui components. The application uses Replit's authentication system for secure user access.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **UI Components**: Comprehensive set of accessible components using Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript throughout the stack
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit's OpenID Connect (OIDC) authentication system
- **Real-time Communication**: WebSocket implementation for live messaging and call signaling
- **Session Management**: PostgreSQL-backed session storage

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon (serverless PostgreSQL)
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Storage**: PostgreSQL table-based session management
- **Schema Management**: Drizzle Kit for database migrations

## Key Components

### Authentication System
- **Provider**: Replit's OIDC authentication
- **Session Management**: Express sessions with PostgreSQL storage
- **Security**: HTTP-only cookies with secure flags
- **User Management**: Automatic user creation/updates on authentication

### Database Schema
- **Users**: Profile information, status, department, bio
- **Contacts**: Friend relationships with blocking capabilities
- **Messages**: Real-time messaging with read status tracking
- **Calls**: Voice/video call history and metadata
- **Sessions**: Secure session storage (required for Replit Auth)

### Real-time Features
- **WebSocket Server**: Custom WebSocket implementation for live communication
- **Message Broadcasting**: Real-time message delivery to connected users
- **Call Signaling**: WebRTC signaling for voice/video calls
- **Status Updates**: Live user status synchronization

### UI Components
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessibility**: ARIA-compliant components using Radix UI
- **Theme Support**: Dark/light mode capability
- **Corporate Styling**: Professional color scheme and typography

## Data Flow

### Authentication Flow
1. User accesses the application
2. If not authenticated, redirected to Replit's OIDC provider
3. Upon successful authentication, user data is synchronized
4. Session is established with PostgreSQL-backed storage
5. User gains access to the messaging interface

### Messaging Flow
1. User composes message in chat interface
2. Message is sent via REST API to Express server
3. Message is stored in PostgreSQL database
4. WebSocket broadcasts message to recipient if online
5. Real-time UI updates for both sender and recipient

### Call Flow
1. User initiates voice/video call
2. WebSocket signaling establishes WebRTC connection
3. Call metadata is stored in database
4. Real-time audio/video streams via WebRTC
5. Call duration and status tracked upon completion

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query
- **Backend**: Express.js, Node.js runtime
- **Database**: PostgreSQL via Neon serverless, Drizzle ORM
- **Authentication**: Replit's OpenID Connect system

### UI and Styling
- **Radix UI**: Comprehensive accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe variant management

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **Vite**: Fast development server and build tool
- **ESBuild**: Fast JavaScript bundler for production
- **Drizzle Kit**: Database schema management and migrations

### Real-time Communication
- **WebSocket**: Native WebSocket implementation
- **WebRTC**: Browser-native peer-to-peer communication
- **Date-fns**: Date manipulation and formatting utilities

## Deployment Strategy

### Development Environment
- **Replit Integration**: Optimized for Replit's development environment
- **Hot Module Replacement**: Vite provides fast development feedback
- **Environment Variables**: Database URL and session secrets via environment
- **Development Server**: Concurrent Express and Vite development servers

### Production Build
- **Frontend**: Vite builds optimized React application to `dist/public`
- **Backend**: ESBuild compiles TypeScript Express server to `dist/index.js`
- **Database**: Drizzle migrations ensure schema consistency
- **Static Assets**: Express serves built React application

### Runtime Configuration
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Authentication**: Replit's OIDC configuration with session secrets
- **Session Storage**: PostgreSQL table for secure session management
- **WebSocket**: Integrated with HTTP server for real-time features

The application follows a monorepo structure with shared TypeScript types, making it easy to maintain consistency between frontend and backend while leveraging Replit's integrated development environment.