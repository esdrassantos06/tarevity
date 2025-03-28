# Tarevity - Modern Task Management System

![Tarevity Logo](public/logo.png)

Tarevity is a sophisticated task management application built with Next.js 15, React 19, TypeScript, and Supabase. It provides an intuitive and secure interface to help users organize their tasks with efficiency and style.

**Current Version: 1.0.9** (March 28, 2025)

## ✨ Key Features

### 📋 Task Management

- **Create, Edit & Complete** tasks with a user-friendly interface
- **Priority Levels** (Low, Medium, High) with visual indicators
- **Status Workflow** (Active, Review, Completed) for organized task progression
- **Due Date Management** with automated reminders
- **Sorting & Filtering** capabilities for better organization
- **Visual Indicators** showing task priority and status at a glance
- **Calendar Integration** for date-based task visualization and management

### 🌐 Internationalization

- **Multi-language Support** with Next Intl integration
- **Locale Detection** to automatically switch to user's preferred language
- **Dynamic Content Translation** across the entire application
- **Date & Time Formatting** according to locale preferences

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
- **Optimized Cache Configuration** for improved navigation performance
- **Back/Forward Cache Support** for seamless browsing experience

## 🚀 Technology Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: TailwindCSS v4 with custom theming
- **Type Safety**: TypeScript
- **State Management**: React Query v5
- **Form Validation**: Zod with React Hook Form
- **UI Components**: shadcn/ui and Radix UI
- **Internationalization**: Next Intl with locale routing

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

## 🌍 Internationalization

Tarevity provides extensive internationalization support:

- **Supported Languages**: English & Portuguese
- **Integration**: Deep integration with Next.js App Router through Next Intl
- **Translation Management**: Structured JSON files for easy translation updates
- **Locale-specific Routes**: URL paths adapt to the selected language

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
   The project includes an .env.local.example file with all the environment variables required for the application to function properly.

   1. Copy the example file to create your own configuration file:

   ```bash
   cp .env.local.example .env.local
   ```

   2. Open the .env.local file and replace the example values with your own credentials:

   - NextAuth configuration
   - Supabase settings
   - Email configuration (Brevo)
   - Redis settings for rate limiting
   - Cron (For notifications)
   - Default and supported locales

4. Start the development server

   ```bash
   npm run dev
   ```

5. Access the app at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
/src
  /app                   # Next.js App Router routes
    /[locale]            # Locale-specific routes
      /api               # API endpoints
      /auth              # Authentication pages
      /dashboard         # Main task dashboard
      /profile           # User profile page
      /settings          # User settings page
      /todo              # Task detail and edit pages
  /components            # React components
  /hooks                 # Custom React hooks
  /lib                   # Utility functions
  /middleware           # Global middleware
  /messages             # Translation files
  /types                 # TypeScript type definitions
```

## 🔮 Future Enhancements

- [x] Calendar view integration
- [x] Multi-language support
- [ ] Categories/Tags for tasks
- [ ] Subtasks and task dependencies
- [ ] Mobile application (Future...)

## 🤝 Contribution Guidelines

Contributions are welcome! Please feel free to open issues or submit pull requests. Please review our [CONTRIBUTING](CONTRIBUTING.MD) for detailed contribution protocols.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- **Esdras Santos** - [GitHub](https://github.com/esdrassantos06)

---

Star ⭐ this repository if you find it helpful!
