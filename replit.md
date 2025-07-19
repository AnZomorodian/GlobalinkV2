# Corporate Messenger - Full Stack Application

## Overview

This is a full-stack corporate messaging application built with React, Express.js, and PostgreSQL. It features real-time messaging, voice/video calling capabilities, user management, and a modern UI built with shadcn/ui components. The application uses Replit's authentication system for secure user access.

## User Preferences

- **Communication Style**: Simple, everyday language
- **UI/UX Improvements**: Focus on professional appearance, proper icon visibility, and intuitive user experience
- **Team Management**: Zin Code functionality for team identification (12-character unique codes)
- **Contact Management**: Enhanced user search by ID with proper validation and feedback
- **Profile Management**: Comprehensive user profile with bio, company information, and professional details

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

## Recent Changes

### January 2025 - Complete Group Functionality & Reply System Fix
- **✓ Group System Implementation**: Complete backend implementation with PostgreSQL schemas, API routes, and storage functions
- **✓ Group Manager Enhancement**: Fixed mock implementation to use real API calls with proper cache invalidation
- **✓ Reply Message Fix**: Corrected reply data fetching to show actual message content and sender names instead of IDs
- **✓ Group Creation Styling**: Enhanced group creation UI with modern glass-morphism design and privacy settings
- **✓ README Improvements**: Comprehensive documentation update with detailed feature descriptions and setup instructions
- **✓ Database Integration**: Added complete group tables (groups, group_members, group_messages) with proper relationships
- **✓ API Routes**: Implemented all group-related endpoints for creation, member management, and messaging
- **✓ Real-time Group Messaging**: WebSocket broadcasting for group messages to all connected members

### January 2025 - Voice Messages & UI Enhancement Complete
- **✓ Logo Removal**: Removed logo from welcome page, keeping only text as requested
- **✓ Voice Message Player**: Implemented advanced voice message player with play/pause controls, progress bar, and time display
- **✓ Enhanced Contact Management**: Added comprehensive ContactList component with search, actions, and status indicators
- **✓ Group Manager**: Built complete group management system with creation, member selection, and administration
- **✓ Notification Settings**: Implemented fully functional notification settings with browser permissions, sound controls, and quiet hours
- **✓ Improved Sidebar**: Enhanced sidebar with 4-button layout including contacts, groups, and notifications
- **✓ Professional Styling**: Updated all components with modern glass-morphism design and improved user experience

### January 2025 - Enhanced User Discovery & Comprehensive Documentation
- **✓ Auto-Discovery System**: Newly signed users automatically appear in recent chats for better discoverability
- **✓ Enhanced Add Contact**: Added discoverable users section with improved contact management interface
- **✓ Comprehensive README**: Complete documentation with deployment options, environment variables, and REPL_ID location
- **✓ Improved Main Page**: Enhanced welcome screen with feature cards and professional styling
- **✓ Contact Management**: Better add contact flow with discovery and direct chat initiation
- **✓ Database Optimization**: Enhanced recent chats to include recently active users for team collaboration
- **✓ Voice Compression**: Advanced audio compression with 16kHz sample rate and WAV encoding for smaller payloads

### January 2025 - UI/UX Enhancement & Performance Optimization
- **✓ Logo Background Fix**: Removed background from GLOBALINK logo for clean transparent appearance
- **✓ Enhanced Contact Details**: Added comprehensive contact information display including job title, company, location, Zin code, and member since date
- **✓ Voice Message Fix**: Fixed payload too large error by increasing Express limits to 50mb and implementing audio compression
- **✓ Minimal Icon Design**: Redesigned add contact area with minimal icons for Add Contact, Contact List, and Create Group
- **✓ Audio Compression**: Implemented advanced audio compression with 16kHz sample rate to reduce voice message payload size
- **✓ Modern Contact Actions**: Added clean button layout with glass-morphism effects and proper hover states
- **✓ Performance Optimization**: Enhanced voice message encoding with WAV compression for better transmission

### January 2025 - Migration, Enhancements & Legal Compliance Complete
- **✓ Successful Migration**: Migrated project from Replit Agent to Replit environment
- **✓ Database Setup**: Created PostgreSQL database and pushed schema successfully
- **✓ Configuration Fix**: Resolved all dependency and environment configuration issues
- **✓ Reply Message Fix**: Fixed message reply functionality by fetching complete reply data with sender information
- **✓ Legal & Compliance Pages**: Added comprehensive Terms of Service and Privacy Policy pages
- **✓ Group Database Schema**: Created complete database schema for groups, group members, and group messages
- **✓ Legal Page Integration**: Added routing and navigation links from settings modal to legal pages
- **✓ Globalink Logo Integration**: Added official Globalink logo to sidebar and welcome screen
- **✓ Contact Info Fix**: Fixed "Contact not found!" issue by implementing fallback user lookup
- **✓ UI Improvements**: Enhanced welcome screen with proper logo display and professional branding
- **✓ Application Stability**: Confirmed all core features working including authentication, messaging, and real-time communication

### January 2025 - Migration & Enhancement Complete
- **✓ Successful Replit Migration**: Project successfully migrated from Replit Agent to Replit environment
- **✓ Database Integration**: PostgreSQL database created and configured with all schemas
- **✓ Contact Not Found Fix**: Enhanced contact info lookup to work with direct user search
- **✓ GLOBALINK Logo Integration**: Added company logo throughout the application interface
- **✓ Enhanced User Search**: Improved add contact functionality with direct chat creation
- **✓ Profile Error Handling**: Detailed error messages for profile update failures
- **✓ Email Security**: Prevented email editing for security compliance
- **✓ Account Settings Enhancement**: Comprehensive account management with security features

### January 2025 - Comprehensive Modern Transformation
- **✓ Glass-Morphism Design System**: Implemented cutting-edge glass-morphism effects with backdrop blur and transparency
- **✓ Modern Color Palette**: Updated to contemporary gradients with purple, blue, and teal accent colors
- **✓ Floating Elements**: Added elevation effects with hover animations and shadow variations
- **✓ Enhanced Typography**: Integrated Inter font with gradient text effects for headings
- **✓ Advanced Animations**: Implemented slide-up, fade-in, pulse-slow, and smooth transitions
- **✓ Custom Scrollbars**: Styled scrollbars with modern appearance and smooth interactions
- **✓ Professional Status System**: Redesigned status indicators with animated elements and modern badges

### Advanced Component Overhaul
- **✓ EnhancedChatInput**: Created comprehensive chat input with emoji picker, attachments, voice recording
- **✓ ModernMessageBubble**: Implemented message bubbles with reactions, reply system, and hover actions
- **✓ AdvancedFeaturesPack**: Built comprehensive settings panel with performance monitoring and feature toggles
- **✓ Modern Welcome Screen**: Transformed empty chat state with gradient backgrounds and feature highlights
- **✓ Ultra-Modern Chat Header**: Redesigned with glass panels, status rings, and floating action buttons
- **✓ Enhanced Settings Modal**: Added advanced features tab with real-time system monitoring
- **✓ Professional Loading States**: Implemented branded loading screens with smooth animations

### User Experience Enhancements
- **✓ Responsive Glass Panels**: All components now use consistent glass-morphism design
- **✓ Gradient Backgrounds**: Multi-layer gradient system for depth and visual appeal
- **✓ Floating Action Elements**: Buttons and interactive elements with elevation effects
- **✓ Modern Animation System**: Custom CSS animations for enhanced user interactions
- **✓ Professional Avatar Rings**: Status indicators with gradient borders and real-time updates
- **✓ Enhanced Modal Overlays**: Backdrop blur effects for modal dialogs and overlays

### Previous Updates
- **✓ Icon Color Fix**: Resolved icon visibility issues with proper color management for different backgrounds
- **✓ Zin Code Implementation**: Added unique 12-character team identification codes for organizational management
- **✓ Enhanced User Search**: Fixed contact search functionality with proper ID-based user lookup
- **✓ Settings Modal Enhancement**: Added comprehensive Team Management section with Zin Code display
- **✓ Profile Improvements**: Enhanced user profile with bio, company information, job title, and location fields
- **✓ README Documentation**: Created comprehensive English documentation covering all features and usage
- **✓ Database Schema Updates**: Added zinCode field to users table for team identification
- **✓ Contact Modal Fix**: Improved add contact functionality with better user search and validation
- **✓ Authentication Integration**: Ensured proper Zin Code generation during user registration process

### Architecture Changes
- **Database**: Added `zinCode` field to users table (VARCHAR 12 characters)
- **Backend**: Enhanced user search and profile management APIs
- **Frontend**: Complete UI overhaul with modern glass-morphism design system
- **Styling**: Revolutionary CSS architecture with gradient variables, glass effects, and modern animations
- **Design System**: Implemented comprehensive design tokens for consistent modern appearance
- **Component Library**: Enhanced all UI components with floating effects and modern styling
- **Animation Framework**: Custom CSS animations for improved user experience
- **Documentation**: Complete README rewrite with English documentation and usage instructions