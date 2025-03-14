# Tarevity - Modern Task Management System

![Tarevity Logo](public/logo.png)

Tarevity is a sophisticated task management application built with Next.js 15, React 19, TypeScript, and Supabase. It provides an intuitive and secure interface to help users organize their tasks with efficiency and style, focusing on security, performance, and user experience.

## 🚀 Features

- ✅ **Comprehensive Task Management**
  - Create, edit, delete, and mark tasks as completed
  - Task priority levels (Low, Medium, High) with visual indicators
  - Task status workflow (Active, Review, Completed)
  - Detailed task descriptions and due dates
  - Task filtering and search capabilities

- 🔑 **Robust Authentication**
  - Multi-provider authentication (Email/Password, Google, GitHub) via NextAuth.js
  - Progressive account lockout after multiple failed attempts
  - Secure password reset flow with time-limited tokens
  - Password strength evaluation and breach checking via HIBP API

- 🎨 **Modern UI/UX**
  - Light/Dark modes with system preference detection
  - Fully responsive design optimized for all devices
  - Interactive toast notifications for user feedback
  - Animated transitions and skeleton loading states
  - Priority-based color coding for visual task management

- 📊 **Personal Analytics**
  - Task statistics dashboard with completion metrics
  - Visual representation of task distribution
  - Task status breakdown

- 👤 **User Profile Management**
  - Profile customization with image upload
  - Account settings and preferences
  - Secure account deletion

- 🛡️ **Enterprise-Grade Security**
  - Comprehensive Content Security Policy (CSP) implementation
  - Secure HTTP-only cookies
  - CSRF protection
  - Input validation on both client and server
  - Rate limiting on sensitive endpoints
  - Secure password handling and storage

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 with custom theming
- **Type Safety**: TypeScript
- **State Management**: TanStack React Query v5
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: react-icons
- **Notifications**: react-toastify
- **Date Handling**: date-fns
- **Theme Management**: next-themes

### Backend & Database
- **Authentication**: NextAuth.js v4
- **Database**: Supabase (PostgreSQL)
- **API Architecture**: Next.js API routes with RESTful design
- **File Storage**: Supabase Storage
- **Rate Limiting**: Upstash Redis

### DevOps & Tooling
- **Package Manager**: npm/yarn
- **Code Formatting**: Prettier
- **Linting**: ESLint with Next.js config
- **Build Tool**: Next.js built-in bundler

## 📱 Responsive Design

Tarevity implements a mobile-first approach with:

- Responsive layouts for all screen sizes
- Adaptive navigation with collapsible menus
- Touch-friendly UI elements
- Optimized forms and task cards
- Dynamic component rendering based on viewport

## 🔒 Security Features

Security is a core focus of Tarevity, featuring:

- **Password Security**: Integration with Have I Been Pwned API to detect compromised passwords
- **Content Security Policy**: Strict CSP headers to prevent XSS attacks
- **Secure Authentication**: HttpOnly cookies, session management, and CSRF protection
- **Rate Limiting**: Prevention of brute force attacks on authentication endpoints
- **Input Validation**: Comprehensive server and client-side validation using Zod
- **Progressive Lockout**: Increasing lockout periods after failed login attempts
- **Token Security**: Refresh token rotation and secure storage

## 📊 Data Management

Tarevity implements sophisticated data handling:

- **Query Management**: TanStack React Query for server state
- **Optimistic Updates**: Immediate UI feedback with background synchronization
- **Form Validation**: React Hook Form with Zod schema validation
- **API Error Handling**: Consistent error management with user feedback
- **Data Caching**: Smart caching strategies for optimized performance

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm
- Supabase account (for database)
- Resend account (for email services)
- Redis instance (for rate limiting) - optional but recommended

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/esdrassantos06/tarevity.git
   cd tarevity
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Next Auth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secure_secret
   # Tip: Generate with: openssl rand -base64 32

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Environment
   NODE_ENV=development # or production

   # OAuth Providers
   GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret
   GOOGLE_ID=your_google_client_id
   GOOGLE_SECRET=your_google_client_secret

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Email (Resend)
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=noreply@yourdomain.com

   # Rate Limiting (Redis)
   REDIS_URL=your_redis_url
   REDIS_TOKEN=your_redis_token
   ```

4. Configure the Supabase database

   - Create tables for: `users`, `todos`, `password_reset_tokens`, and `refresh_tokens`
   - Set up appropriate Row Level Security (RLS) policies
   - Configure storage buckets for profile images

5. Start the development server

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. Access the app at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
/src
  /app                   # Next.js App Router routes and pages
    /api                 # API routes for backend functionality
    /auth                # Authentication pages
    /dashboard           # Main task dashboard
    /profile             # User profile page
    /settings            # User settings page
    /todo                # Task detail and edit pages
  /components            # React components
    /auth                # Authentication components
    /common              # Shared UI components
    /layout              # Layout components
    /logo                # Logo components
    /profile             # Profile components
    /settings            # Settings components
    /todos               # Task management components
  /hooks                 # Custom React hooks
  /lib                   # Utility functions and services
  /types                 # TypeScript type definitions
  /middleware.ts         # Global middleware for security and auth
```

## 🔮 Future Enhancements

- [ ] Categories/Tags for tasks
- [ ] Subtasks and task dependencies
- [ ] Calendar view with drag-and-drop interface
- [ ] Advanced statistics and productivity insights
- [ ] Notifications and reminders
- [ ] Integration with third-party calendars

## 🤝 Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- **Esdras Santos** - [GitHub](https://github.com/esdrassantos06)