# Tarevity - Modern Task Management System

![Tarevity Logo](public/logo.png)

Tarevity is a sophisticated task management application built with Next.js 15, React 19, TypeScript, and Supabase. It provides an intuitive and secure interface to help users organize their tasks with efficiency and style.

## ✨ Key Features

### 📋 Task Management

- **Create, Edit & Complete** tasks with a user-friendly interface
- **Priority Levels** (Low, Medium, High) with visual indicators
- **Status Workflow** (Active, Review, Completed) for organized task progression
- **Due Date Management** with automated reminders
- **Sorting & Filtering** capabilities for better organization
- **Visual Indicators** showing task priority and status at a glance

### 🛡️ Enterprise-Grade Security

- **Password Security**: Integration with Have I Been Pwned API to detect compromised passwords
- **JWT Token Rotation** for enhanced protection
- **Progressive Lockout** after multiple failed login attempts
- **Secure Authentication** with GitHub and Google OAuth options
- **Content Security Policy** implementation to prevent XSS attacks
- **Rate Limiting** on sensitive endpoints to prevent brute force attacks

### 📊 Analytics Dashboard

- **Task Statistics** with visual representations of completion metrics
- **Distribution Charts** showing task status and priority breakdown
- **Performance Insights** to track productivity patterns

### 🔔 Smart Notifications

- **Automatic Reminders** based on task due dates
- **Priority-Based Styling** for visual importance indicators
- **Customizable Alerts** for approaching deadlines

### 🎨 Polished UX/UI

- **Light & Dark Mode** support with system preference detection
- **Responsive Design** optimized for all screen sizes
- **Animated Transitions** for a smooth user experience
- **Interactive Components** with accessibility features

## 🚀 Technology Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: TailwindCSS v4 with custom theming
- **Type Safety**: TypeScript
- **State Management**: React Query v5
- **Form Validation**: Zod with React Hook Form
- **UI Components**: Radix UI primitives

### Backend & Database

- **Authentication**: NextAuth.js v4
- **Database**: Supabase (PostgreSQL)
- **API Architecture**: RESTful with Next.js API routes
- **Storage**: Supabase Storage
- **Rate Limiting**: Redis via Upstash
- **Email Service**: Brevo API

## 📱 Responsive Design

Tarevity implements a mobile-first approach with:

- Fluid layouts for all screen sizes
- Adaptive navigation with collapsible menus
- Touch-friendly UI elements
- Optimized forms and task cards

## 🔒 Security Features

Security is a core focus of Tarevity with:

- **Strict CSP Headers** to prevent XSS attacks
- **CSRF Protection** for all state-changing operations
- **HttpOnly Cookies** for secure session management
- **Input Validation** using Zod schema validation
- **API Protection** with request validation middleware

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm
- Supabase account (for database)
- Redis instance (for rate limiting)

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
   ```

3. Set up environment variables
   Create a `.env.local` file with the following variables:

   ```env
   # Next Auth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secure_secret

   # OAuth Providers
   GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret
   GOOGLE_ID=your_google_client_id
   GOOGLE_SECRET=your_google_client_secret

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Email (Brevo)
   BREVO_API_KEY=your_brevo_api_key
   EMAIL_FROM=noreply@yourdomain.com

   # Rate Limiting (Redis)
   REDIS_URL=your_redis_url
   REDIS_TOKEN=your_redis_token
   ```

4. Start the development server

   ```bash
   npm run dev
   ```

5. Access the app at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
/src
  /app                   # Next.js App Router routes
    /api                 # API endpoints
    /auth                # Authentication pages
    /dashboard           # Main task dashboard
    /profile             # User profile page
    /settings            # User settings page
    /todo                # Task detail and edit pages
  /components            # React components
  /hooks                 # Custom React hooks
  /lib                   # Utility functions
  /middleware           # Global middleware
  /types                 # TypeScript type definitions
```

## 🔮 Future Enhancements

- [ ] Calendar view integration
- [ ] Categories/Tags for tasks
- [ ] Subtasks and task dependencies
- [ ] Mobile application (Futureeeeee.....)

## 🤝 Contribution Guidelines
Contributions are welcome! Please feel free to open issues or submit pull requests. Please review our [CONTRIBUTING](CONTRIBUTING.MD) for detailed contribution protocols.


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- **Esdras Santos** - [GitHub](https://github.com/esdrassantos06)

---

Star ⭐ this repository if you find it helpful!