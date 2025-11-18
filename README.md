# Tarevity - Modern Task Management System

![Tarevity Logo](public/logo.png)

Tarevity is a sophisticated task management application built with Next.js 16, React 19, TypeScript, and Prisma. It provides an intuitive and secure interface to help users organize their tasks with efficiency and style.

**Current Version: 2.0.0** (November 2025)

> **🚀 Major Update**: This application has been completely refactored from the ground up, featuring a modern tech stack, improved architecture, enhanced security, internationalization support, and a polished user experience.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Key Features

### 📋 Task Management

- **Create, Edit & Complete** tasks with a user-friendly interface
- **Priority Levels** (Low, Medium, High) with visual indicators
- **Status Workflow** (Active, Review, Completed) for organized task progression
- **Due Date Management** with date picker integration
- **Sorting & Filtering** capabilities for better organization
- **Visual Indicators** showing task priority and status at a glance
- **Search Functionality** to quickly find tasks by title or description
- **Calendar View** with interactive calendar showing tasks by due date
- **Task Statistics** on profile page showing created, completed, and pending tasks

### 🛡️ Enterprise-Grade Security

- **Password Security**: Argon2 hashing algorithm for secure password storage
- **Session Management** with configurable expiration and cookie caching
- **Secure Authentication** with GitHub and Google OAuth options
- **Email/Password Authentication** with validation
- **Password Reset** functionality with secure token-based email verification
- **Forgot Password** flow with email notifications
- **Content Security Policy** implementation to prevent XSS attacks
- **Rate Limiting** on sensitive endpoints to prevent brute force attacks
- **Admin Role System** with role-based access control

### 📊 Analytics Dashboard

- **Task Statistics** with visual donut chart representation
- **Distribution Charts** showing task status breakdown
- **Real-time Updates** for task completion metrics
- **Profile Statistics** displaying user task metrics

### 🔔 Smart Notifications

- **Due Date Alerts** to keep users informed of approaching deadlines
- **Scheduled Notifications** for timely task management
- **Email Notifications** for password reset and important task reminders
- **In-app Notifications** with dropdown interface

### 🌍 Internationalization (i18n)

- **Multi-language Support** with next-intl integration
- **Supported Languages**: English (en), Portuguese (pt), Spanish (es)
- **Language Selector** in navigation for easy language switching
- **Localized Content** for all user-facing text and messages
- **SEO-friendly** URL structure with locale prefixes

### 🎨 Polished UX/UI

- **Light & Dark Mode** support with system preference detection
- **Theme Customization** in settings (Light, Dark, System)
- **Responsive Design** optimized for all screen sizes
- **Animated Transitions** for a smooth user experience
- **Interactive Components** with accessibility features
- **Cookie Consent Banner** for GDPR compliance
- **Toast Notifications** for user feedback
- **Profile Management** with avatar upload and user information editing
- **Account Settings** with theme preferences and account management

### 👥 Admin Panel

- **User Management** with comprehensive user data table
- **User Roles** (User, Admin, Superadmin) with role-based access control
- **User Actions**: View, Edit, and Delete users
- **User Statistics** showing task counts per user
- **Email Filtering** for quick user search
- **Bulk Operations** support for user management

## 🚀 Technology Stack

### Frontend

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Styling**: TailwindCSS v4 with custom theming
- **Type Safety**: TypeScript
- **Form Validation**: Zod with React Hook Form
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React & Iconify
- **Notifications**: Sonner for toast notifications
- **Internationalization**: next-intl for multi-language support
- **Date Handling**: date-fns for date manipulation and formatting

### Backend & Database

- **Authentication**: Better Auth with Prisma adapter
- **Database**: PostgreSQL with Prisma ORM
- **API Architecture**: RESTful with Next.js API routes
- **Password Hashing**: Argon2 via @node-rs/argon2
- **Rate Limiting**: Redis via Upstash
- **Storage**: Supabase Storage (for file uploads)
- **Email Service**: Resend for transactional emails
- **Server Actions**: Next.js Server Actions for form handling

## 📱 Responsive Design

Tarevity implements a mobile-first approach with:

- Fluid layouts for all screen sizes
- Adaptive navigation with collapsible menus
- Touch-friendly UI elements
- Optimized forms and task cards
- Grid and Flex layouts that adapt to screen size

## 🔒 Security Features

Security is a core focus of Tarevity with comprehensive protection measures:

- **Content Security Policy (CSP)**: Strict CSP implementation via middleware with:
  - Nonce-based script execution in production for XSS prevention
  - `strict-dynamic` directive for enhanced script security
  - Environment-specific policies (relaxed for development, strict for production)
  - Whitelisted external resources (Iconify, Supabase) with proper domain restrictions
  - Frame blocking (`frame-ancestors 'none'`) to prevent clickjacking
  - Form action restrictions to prevent form hijacking
- **CSRF Protection**: Built-in CSRF protection provided by Better Auth library
- **Security Headers**: Multiple security headers including:
  - `X-Frame-Options: DENY` - Prevents clickjacking
  - `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
  - `Strict-Transport-Security` - Enforces HTTPS
  - `Referrer-Policy` - Controls referrer information
  - `Permissions-Policy` - Restricts browser features
  - `Cross-Origin` policies for enhanced security
- **HttpOnly Cookies** for secure session management
- **Input Validation** using Zod schema validation on all forms and API endpoints
- **API Protection** with request validation middleware
- **Rate Limiting** with Redis-backed storage to prevent brute force attacks
- **Password Hashing** using industry-standard Argon2 algorithm
- **Session Security** with configurable expiration and cookie caching
- **Role-Based Access Control** (RBAC) for admin features
- **User Banning System** with expiration tracking

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm
- PostgreSQL database
- Redis instance (for rate limiting) - Upstash recommended
- GitHub OAuth App (optional, for GitHub login)
- Google OAuth Credentials (optional, for Google login)
- Supabase account (optional, for file storage)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/esdrassantos06/tarevity.git
   cd tarevity
   ```

2. Install dependencies

   ```bash
   npm install
   # or yarn install
   # or pnpm install
   ```

3. Set up environment variables

   Create a `.env` file in the root directory with the following variables:

   ```bash
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/tarevity"
   DIRECT_URL="postgresql://user:password@localhost:5432/tarevity"

   # Better Auth
   BETTER_AUTH_SECRET="your-secret-key-here"
   BETTER_AUTH_URL="http://localhost:3000"

   # OAuth Providers (optional)
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_SECRET="your-google-client-secret"

   # Redis (for rate limiting)
   UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
   UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"

   # Supabase (optional, for file storage)
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

   # Resend (for email sending)
   RESEND_API_KEY="your-resend-api-key"
   RESEND_FROM_EMAIL="noreply@yourdomain.com" # Optional, defaults to onboarding@resend.dev

   # Environment
   NODE_ENV="development"
   ```

4. Set up the database

   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev
   ```

5. Run the development server

   ```bash
   npm run dev
   ```

   - Access the app at [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- `npm run dev` - Start the development server with Prisma client generation
- `npm run build` - Build the application for production with Prisma client generation
- `npm run start` - Start the production server with Prisma client generation
- `npm run lint` - Run ESLint to check code quality
- `npm run format` - Format code using Prettier

## 🗺️ Main Routes

### Public Routes

- `/` - Landing page with application overview
- `/auth/login` - User login page
- `/auth/register` - User registration page
- `/auth/forgot-password` - Request password reset
- `/auth/reset-password` - Reset password with token
- `/privacy` - Privacy policy page
- `/terms` - Terms of use page

### Protected Routes (Require Authentication)

- `/dashboard` - Main task dashboard with task list and analytics
- `/calendar` - Calendar view showing tasks by due date
- `/tasks/new` - Create a new task
- `/tasks/[id]` - View individual task details
- `/tasks/[id]/edit` - Edit an existing task
- `/profile` - User profile page with statistics and avatar management
- `/settings` - User settings (theme, account management, admin panel)

### Admin Routes (Require Admin Role)

- `/settings` (Admin Panel Tab) - Admin panel with user management features

### API Routes

- `/api/auth/[...all]` - Better Auth authentication endpoints
- `/api/tasks` - Task CRUD operations
- `/api/tasks/[id]` - Individual task operations
- `/api/tasks/calendar` - Calendar view data endpoint
- `/api/notifications` - User notifications endpoint
- `/api/admin` - Admin panel endpoints (admin only)
- `/api/ping` - Health check endpoint

## 📁 Project Structure

```bash
/app                   # Next.js App Router routes
   /api               # API endpoints
      /admin          # Admin route
      /auth           # Authentication routes
      /tasks          # Task CRUD operations
         /[id]        # Individual task API endpoints
         /calendar    # Calendar view API endpoints
      /notifications  # Notifications API endpoints
      /ping           # Health check endpoint
   /auth              # Authentication pages
      /login          # Login page
      /register       # Registration page
      /forgot-password # Password reset request page
      /reset-password  # Password reset page
   /calendar          # Calendar view page
   /dashboard         # Main task dashboard
   /profile           # User profile page with statistics
   /settings          # User settings page (theme, account, admin panel)
   /privacy           # Privacy policy page
   /terms             # Terms of use page
   /tasks             # Task detail and edit pages
      /[id]           # Individual task view
         /edit        # Edit task page
      /new            # Create new task page
/components           # React components
   /admin             # Admin panel components
      - admin-panel.tsx
      - users-data-table.tsx
      - edit-user-dialog.tsx
      - view-user-dialog.tsx
   /auth              # Authentication components
      - LoginForm.tsx
      - RegisterForm.tsx
      - ForgotPasswordForm.tsx
      - ResetPasswordForm.tsx
      - AuthButtons.tsx
   /calendar          # Calendar-related components
      - task-date-popover.tsx
   /intl              # Internationalization components
      - language-selector.tsx
   /tasks             # Task-related components
      - create-task.tsx
      - edit-task.tsx
      - complete-task-button.tsx
      - complete-task-checkbox.tsx
      - delete-task-button.tsx
      - submit-to-review-button.tsx
      - tasks-donut-chart.tsx
   /notifications     # Notification components
      - notifications-dropdown.tsx
   /ui                # Reusable UI components (shadcn/ui)
   - header.tsx       # Main navigation header
   - footer.tsx       # Footer component
   - cookie-banner.tsx # GDPR cookie consent
   - search-component.tsx # Global search component
   - theme-provider.tsx # Theme context provider
/actions              # Server actions
   - admin-actions.ts # Admin panel server actions
   - sign-in-email-actions.ts
   - sign-up-email-actions.ts
   - update-user-actions.ts
   - delete-user-image-action.ts
   - request-password-reset-action.ts
   - reset-password-action.ts
/i18n                 # Internationalization configuration
   - routing.ts       # Locale routing configuration
   - navigation.ts    # Navigation utilities
   - request.ts       # Request utilities
/lib                  # Utility functions and configurations
   /generated/prisma  # Generated Prisma Client
   - auth.ts          # Better Auth configuration
   - auth-client.ts   # Client-side auth utilities
   - prisma.ts        # Prisma client instance
   - redis.ts         # Redis/Upstash configuration
   - supabase-server.ts # Supabase server utilities
   - email.ts         # Email sending utilities
   - argon2.ts        # Password hashing utilities
   - utils.ts         # General utilities
   - api-locale.ts    # API locale utilities
   - logger.ts        # Logging utilities
   - pingDb.ts        # Database health check
/messages             # Internationalization message files
   - en.json          # English translations
   - pt.json          # Portuguese translations
   - es.json          # Spanish translations
/prisma               # Prisma schema and migrations
   - schema.prisma    # Database schema
   /migrations        # Database migration files
/validation           # Zod validation schemas
   - SignInSchema.ts
   - SignUpSchema.ts
   - TaskSchema.ts
   - TaskQuerySchema.ts
   - updateUserSchema.ts
   - ForgotPasswordSchema.ts
   - ResetPasswordSchema.ts
   - schemas.ts       # Shared validation schemas
/utils                # Helper utilities
   - text.ts          # Text manipulation utilities
/types                # TypeScript type definitions
   - Notification.ts  # Notification types
   - TaskCount.ts     # Task count types
```

## 📄 Legal & Compliance

Tarevity includes comprehensive legal pages for transparency and compliance:

- **Privacy Policy** (`/privacy`) - Detailed information about data collection, usage, and user rights
- **Terms of Use** (`/terms`) - Terms and conditions for using the application
- **Cookie Consent** - GDPR-compliant cookie consent banner
- **Data Security** - Industry-standard security measures for user data protection

## 🔮 Future Enhancements

- [x] Task status workflow (Active, Review, Completed)
- [x] Priority levels
- [x] Analytics dashboard
- [x] Search functionality
- [x] Notifications
- [x] Calendar view integration
- [x] Password reset functionality
- [x] Profile management with avatar upload
- [x] Theme customization
- [x] Privacy policy and terms pages
- [x] Multi-language support (English, Portuguese, Spanish)
- [x] Admin panel with user management
- [x] GitHub Actions CI/CD pipeline
- [ ] Mobile application
- [ ] Advanced filtering and sorting options

## 🚀 Deployment

### GitHub Actions CI/CD

The project includes GitHub Actions workflows for automated testing and code quality:

- **CI Pipeline** (`.github/workflows/ci.yml`):
  - Runs on push and pull requests to `main` and `develop` branches
  - Performs linting with ESLint
  - Type checking with TypeScript
  - Builds the application to ensure it compiles correctly
  - Generates Prisma Client as part of the build process

- **CodeQL Analysis** (`.github/workflows/codeql.yml`):
  - Security analysis for JavaScript and TypeScript
  - Runs on push to main, pull requests, and weekly schedule
  - Helps identify potential security vulnerabilities

**Important**: The CI workflow uses dummy/fallback values for environment variables. **You don't need to configure GitHub Secrets** for the CI to work - the build process only needs valid format, not actual connections. The workflow will work out of the box with the default dummy values.

To set up deployment workflows, you can add additional workflows for:

- **CD Pipeline**: Deploy to production on main branch merges
- **Database Migrations**: Automatically run Prisma migrations on deployment

### Environment Variables for Production

Make sure to set all required environment variables in your hosting platform:

- Vercel: Use the Environment Variables section in project settings
- Railway: Use the Variables tab
- Other platforms: Follow their respective documentation

**Important**: Never commit `.env` files to version control. Use environment variable management provided by your hosting platform.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- **Esdras Santos** - [GitHub](https://github.com/esdrassantos06)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! We appreciate your help in making Tarevity better.

### How to Contribute

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the project's code style
3. **Test your changes** thoroughly
4. **Submit a Pull Request** using our [PR template](.github/pull_request_template.md)

### Reporting Issues

When reporting bugs or requesting features, please use our issue templates:

- 🐛 [Bug Report](https://github.com/esdrassantos06/tarevity/issues/new?template=bug_report.yml) - For reporting bugs or unexpected behavior
- ✨ [Feature Request](https://github.com/esdrassantos06/tarevity/issues/new?template=feature_request.yml) - For suggesting new features or enhancements

This helps us understand and address your issue more effectively.

### Pull Request Guidelines

- Use a clear and descriptive title
- Follow the [Pull Request template](.github/pull_request_template.md)
- Ensure all tests pass
- Update documentation if needed
- Keep PRs focused on a single change

Feel free to check the [issues page](https://github.com/esdrassantos06/tarevity/issues) for open issues and discussions.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Better Auth](https://www.better-auth.com/) - Authentication library
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

Star ⭐ this repository if you find it helpful!
