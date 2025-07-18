# Globalink - Corporate Messenger

A modern, secure corporate messaging platform built with React, Express.js, and PostgreSQL. Features real-time messaging, voice/video calling, user management, and team collaboration tools.

## Features

### 🔐 Authentication & Security
- **Secure Authentication**: Integrated with Replit's OIDC authentication system
- **Session Management**: PostgreSQL-backed session storage with secure cookies
- **Team Identification**: Unique Zin Codes for organizational management
- **Privacy Controls**: Comprehensive privacy settings and user status management

### 💬 Real-Time Communication
- **Instant Messaging**: WebSocket-powered real-time messaging with delivery confirmation
- **Voice & Video Calls**: WebRTC-based peer-to-peer calling with call history
- **File Sharing**: Support for attachments and file sharing in conversations
- **Message Types**: Text, images, files, and reply functionality

### 👥 Contact Management
- **User Search**: Find users by ID, name, or email
- **Contact Lists**: Organize and manage your professional contacts
- **Team Discovery**: Use Zin Codes to identify team members
- **Status Indicators**: Real-time user presence and availability status

### 🎨 Modern User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Professional Theme**: Corporate-friendly color scheme and typography
- **Accessibility**: ARIA-compliant components using Radix UI
- **Dark/Light Mode**: Customizable appearance settings

### 🛠️ Technical Excellence
- **TypeScript**: Full type safety across frontend and backend
- **Real-time Updates**: WebSocket integration for live features
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Performance**: Optimized with React Query for efficient data fetching

## Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database access
- Replit account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/globalink-messenger.git
   cd globalink-messenger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_secure_session_secret
   REPL_ID=your_replit_app_id
   REPLIT_DOMAINS=your_replit_domain
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Usage

### Getting Started
1. **Sign In**: Use your Replit credentials to authenticate
2. **Complete Profile**: Add your professional information and avatar
3. **Find Your Zin Code**: Check Settings > Team Management for your unique team identifier
4. **Add Contacts**: Search for colleagues by their user ID
5. **Start Messaging**: Begin conversations with your team members

### Team Management
- Share your **Zin Code** with team members for easy identification
- Use the search function to find colleagues by ID, name, or email
- Manage your availability status (Online, Away, Busy, Offline)
- Organize contacts and maintain professional connections

### Communication Features
- **Real-time Messaging**: Send and receive messages instantly
- **Voice/Video Calls**: Initiate calls directly from chat interface
- **File Sharing**: Share documents and images with colleagues
- **Message History**: Access complete conversation history

## Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── index.css       # Global styles
│   └── index.html          # HTML entry point
├── server/                 # Express.js backend
│   ├── db.ts              # Database configuration
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data access layer
│   ├── replitAuth.ts      # Authentication setup
│   └── index.ts           # Server entry point
├── shared/                 # Shared TypeScript types
│   └── schema.ts          # Database schema and types
├── package.json           # Project dependencies
└── README.md             # This file
```

## Database Schema

### Users Table
- User profile information (name, email, avatar)
- Professional details (department, job title, company)
- Status management (online, away, busy, offline)
- Unique Zin Code for team identification

### Messages Table
- Real-time message storage with sender/receiver relationships
- Support for different message types (text, file, image)
- Read status tracking and reply functionality
- Timestamp indexing for efficient history retrieval

### Contacts Table
- Professional contact relationships
- Contact status management (pending, accepted, blocked)
- Team-based contact organization

### Calls Table
- Voice and video call history
- Call duration and status tracking
- Caller and receiver relationship management

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user information
- `GET /api/login` - Initiate authentication
- `GET /api/logout` - Sign out user
- `PUT /api/auth/user` - Update user profile

### Users
- `GET /api/users/search` - Search users by query
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/status` - Update user status

### Contacts
- `GET /api/contacts` - Get user's contacts
- `POST /api/contacts` - Add new contact
- `DELETE /api/contacts/:id` - Remove contact

### Messages
- `GET /api/messages/:contactId` - Get conversation history
- `POST /api/messages` - Send new message
- `GET /api/chats` - Get recent conversations

### Calls
- `POST /api/calls` - Initiate call
- `PUT /api/calls/:id/status` - Update call status

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run check` - Run TypeScript type checking

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript, WebSocket
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OIDC
- **Real-time**: WebSocket for live features
- **Build**: Vite for frontend, ESBuild for backend

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting standards
- **Husky**: Git hooks for quality checks

## Security Features

### Authentication Security
- Secure OIDC authentication with Replit
- HTTP-only cookies with secure flags
- Session timeout and refresh token handling
- CSRF protection for all API endpoints

### Data Protection
- Encrypted database connections
- Secure session storage in PostgreSQL
- Input validation and sanitization
- Rate limiting for API endpoints

### Privacy Controls
- User status visibility settings
- Contact blocking and privacy options
- Secure team identification with Zin Codes
- Message encryption in transit

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure responsive design compatibility
- Maintain accessibility standards

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- **Documentation**: Check this README and inline comments
- **Issues**: Open an issue on GitHub
- **Email**: support@globalink.com

## Acknowledgments

- **Replit**: For providing authentication and hosting infrastructure
- **Radix UI**: For accessible component primitives
- **Tailwind CSS**: For utility-first CSS framework
- **Drizzle ORM**: For type-safe database operations
- **React Query**: For efficient data fetching and caching

---

**Globalink** - Professional communication made simple and secure.