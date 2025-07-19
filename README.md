# GLOBALINK - Corporate Messenger

A modern, full-stack corporate messaging application built with React, Express.js, and PostgreSQL. Features real-time messaging, voice/video calling, contact management, and professional workplace communication tools.

## 🚀 Features

- **Real-time Messaging**: Instant messaging with live updates via WebSocket
- **Voice & Video Calls**: WebRTC-powered voice and video communication
- **Contact Management**: Enhanced contact discovery and management with Zin codes
- **Voice Messages**: Compressed audio messages with advanced encoding
- **Professional UI**: Modern glass-morphism design with dark/light mode support
- **Team Management**: 12-character Zin codes for team identification
- **Secure Authentication**: Replit's OpenID Connect (OIDC) authentication
- **File Sharing**: Support for images, documents, and attachments
- **Mobile Responsive**: Optimized for all device sizes

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **TanStack Query** for server state management
- **Tailwind CSS** with shadcn/ui components
- **Wouter** for client-side routing

### Backend
- **Node.js** with Express.js
- **TypeScript** throughout the stack
- **PostgreSQL** with Drizzle ORM
- **WebSocket** for real-time communication
- **Replit Auth** for secure authentication

### Database
- **PostgreSQL** (Neon serverless)
- **Drizzle ORM** for type-safe operations
- **Session storage** in PostgreSQL

## 🔧 Environment Variables

### Required Environment Variables

| Variable | Description | Location | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Provided by Replit | `postgres://user:pass@host:port/db` |
| `REPL_ID` | Replit project ID | Provided by Replit | `your-repl-id-123` |
| `REPLIT_DOMAINS` | Replit domains | Provided by Replit | `your-repl.replit.app` |
| `NODE_ENV` | Environment mode | Manual | `development` or `production` |
| `SESSION_SECRET` | Session encryption key | Manual/Generated | Auto-generated if not set |

### Finding Your REPL_ID

Your **REPL_ID** is available in several ways:

1. **Replit Shell**: Run `echo $REPL_ID` in the shell
2. **Environment Variables**: Check the environment variables in your Replit project
3. **URL**: It's part of your Replit URL: `https://replit.com/@username/REPL_ID`
4. **Code**: Access it in your application with `process.env.REPL_ID`

## 📦 Installation & Setup

### 1. Replit Deployment (Recommended)

1. **Fork this repository** to your Replit account
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up database**:
   ```bash
   npm run db:push
   ```
4. **Start the application**:
   ```bash
   npm run dev
   ```

### 2. Local Development

#### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

#### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd globalink-messenger
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/globalink
   NODE_ENV=development
   REPL_ID=your-local-repl-id
   REPLIT_DOMAINS=localhost:5000
   ```

4. **Set up database**:
   ```bash
   # Create database
   createdb globalink
   
   # Push schema
   npm run db:push
   ```

5. **Start the application**:
   ```bash
   npm run dev
   ```

### 3. Docker Deployment

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   RUN npm run build
   
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Build and run**:
   ```bash
   docker build -t globalink-messenger .
   docker run -p 5000:5000 -e DATABASE_URL=your-db-url globalink-messenger
   ```

### 4. Cloud Deployment Options

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Heroku
```bash
# Install Heroku CLI
npm i -g heroku

# Create app
heroku create globalink-messenger

# Set environment variables
heroku config:set DATABASE_URL=your-db-url

# Deploy
git push heroku main
```

#### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

## 🗄️ Database Setup

### Schema Management

The application uses Drizzle ORM for database schema management:

```bash
# Push schema changes to database
npm run db:push

# Generate migration files
npm run db:generate

# View database in Drizzle Studio
npm run db:studio
```

### Database Providers

#### Neon (Serverless PostgreSQL) - Recommended
- **Sign up**: [https://neon.tech](https://neon.tech)
- **Create database**: Get connection string
- **Set DATABASE_URL**: Use the connection string

#### Supabase
- **Sign up**: [https://supabase.com](https://supabase.com)
- **Create project**: Get PostgreSQL connection
- **Set DATABASE_URL**: Use the connection string

#### Local PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Start service
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Ubuntu

# Create database
createdb globalink
```

## 📱 Usage

### Getting Started

1. **Sign in** with your Replit account - authentication is automatic
2. **Complete your profile** with name, job title, and company details
3. **Get your Zin code** from settings - this is your unique team identifier
4. **Add contacts** using the sidebar or discover new team members
5. **Start conversations** by selecting contacts or creating groups
6. **Send messages** including text, voice recordings, and files

### Key Features

#### 👥 Contact Management
- **Smart Discovery**: Automatically find team members by Zin codes
- **Direct Search**: Add contacts by user ID with instant verification
- **Rich Profiles**: View job titles, companies, locations, and status
- **Team Organization**: Organize contacts by department or project

#### 💬 Advanced Messaging
- **Real-time Chat**: Instant message delivery with WebSocket technology
- **Reply System**: Quote and reply to specific messages in conversations
- **Voice Messages**: Compressed audio with one-tap recording and playback
- **File Sharing**: Send images, documents, and attachments up to 50MB
- **Message Search**: Find conversations quickly with built-in search

#### 📞 Communication Tools
- **Voice Calls**: High-quality WebRTC audio calls
- **Video Calls**: Face-to-face meetings with camera support
- **Call History**: Track all communication with detailed logs
- **Group Calls**: Multi-participant voice/video conferences

#### 🏢 Team Collaboration
- **Group Messaging**: Create public/private groups for projects
- **Team Discovery**: Auto-discover colleagues through Zin codes
- **Status Management**: Share availability (online, away, busy, offline)
- **Notification Control**: Customize alerts and quiet hours

## 🔧 Development

### Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   └── hooks/         # Custom hooks
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry
├── shared/                # Shared types/schemas
│   └── schema.ts          # Database schema
└── package.json           # Dependencies
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema to database
npm run db:generate  # Generate migrations
npm run db:studio    # Open Drizzle Studio

# Utilities
npm run type-check   # TypeScript type checking
npm run lint         # ESLint code linting
```

### Adding New Features

1. **Update schema** in `shared/schema.ts`
2. **Add storage methods** in `server/storage.ts`
3. **Create API routes** in `server/routes.ts`
4. **Build UI components** in `client/src/components/`
5. **Update types** and run `npm run db:push`

## ⚡ Performance & Features

### Audio Optimization
- **Advanced Compression**: 16kHz sample rate with WAV encoding
- **Smart Recording**: Automatic noise reduction and volume normalization
- **Instant Playback**: Pre-buffered audio for immediate voice message play
- **File Size Reduction**: Up to 80% smaller voice message files

### Caching & Speed
- **Intelligent Caching**: TanStack Query for lightning-fast data loading
- **Browser Optimization**: Smart static asset caching for faster loads
- **Session Persistence**: Seamless reconnection without data loss
- **Lazy Loading**: Load conversations and media only when needed

### Real-time Experience
- **WebSocket Technology**: Sub-100ms message delivery
- **Live Status Updates**: Instant typing indicators and status changes
- **Auto-reconnection**: Seamless recovery from connection drops
- **Offline Support**: Queue messages when offline, sync when back online

### Modern UI/UX
- **Glass-morphism Design**: Beautiful transparent effects with backdrop blur
- **Responsive Layout**: Perfect on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Automatic theme switching based on system preference
- **Accessibility**: Full keyboard navigation and screen reader support

## 🔒 Security

### Authentication
- **Replit OIDC** for secure authentication
- **Session management** with PostgreSQL storage
- **HTTP-only cookies** for security

### Data Protection
- **Encrypted connections** (HTTPS/WSS)
- **Input validation** with Zod schemas
- **SQL injection prevention** with Drizzle ORM

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open pull request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

#### Database Connection
- **Check DATABASE_URL** environment variable
- **Verify PostgreSQL** is running
- **Run schema push**: `npm run db:push`

#### Authentication Issues
- **Check REPL_ID** environment variable
- **Verify Replit domains** configuration
- **Clear browser cache** and cookies

#### WebSocket Connection
- **Check firewall settings**
- **Verify WebSocket support** in browser
- **Check network connectivity**

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this README for setup instructions
- **Community**: Join discussions in the repository

---

**Built with ❤️ using Replit, React, and PostgreSQL**

*For the latest updates and features, check the [Recent Changes](replit.md) section.*