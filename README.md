# Tarevity - Task Manager

![Tarevity Logo](public/logo.png)

Tarevity is a modern task management app built with Next.js, React, TypeScript, and Supabase. It provides an intuitive interface to help users organize their daily tasks with ease.

## 🚀 Features

- ✅ Complete task management (create, edit, delete, mark as completed)
- 🔄 Task filtering by status, priority, and text search
- 🔐 Secure authentication system (Email/Password, Google, GitHub)
- 🌓 Light/Dark mode with automatic system preference detection
- 📱 Responsive design for all devices
- 📊 Task statistics in the user profile
- 🔑 Secure password recovery via email

## 🛠️ Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind v4
- **Authentication**: NextAuth.js
- **Backend/Database**: Supabase
- **Email**: Resend
- **Forms**: React Hook Form, Zod
- **Others**: date-fns, react-icons, react-hot-toast

## 📷 Screenshots

### Home Page
![Home Page](public/screenshots/home.png)

### Dashboard de Tarefas
![Dashboard](public/screenshots/dashboard.png)

### Perfil do Usuário
![Profile](public/screenshots/profile.png)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm
- Supabase account (for the database)
- Resend account (for email sending)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/esdrassantos06/tarevity.git
   cd tarevity
   ```

2. Install dependencies
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. Setup environment variables
   Create a .env.local file in the root of the project and add the following variables:

   ```env
   # Next Auth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=seu_segredo_super_seguro
   # Tip: You can generate with: openssl rand -base64 32

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Environment
   NODE_ENV=development || production 

   # OAuth Providers
   GITHUB_ID=seu_github_client_id
   GITHUB_SECRET=seu_github_client_secret
   GOOGLE_ID=seu_google_client_id
   GOOGLE_SECRET=seu_google_client_secret

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=sua_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=sua_supabase_service_role_key

   # Email (Resend)
   RESEND_API_KEY=sua_resend_api_key
   EMAIL_FROM=noreply@seudominio.com
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Configure the Supabase database
   - Create a new organization and project in Supabase.
   - Run the SQL scripts in `database/schema.sql` to create the necessary tables, or use the Supabase web editor.
   - Set up Row Level Security (RLS) policies as needed.

5. Start the development server
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

6. Acess the app at [http://localhost:3000](http://localhost:3000)

## 🗃️ Project Structure

```
/src
  /app                   # Routes and pages (Next.js App Router)
    /api                 # API routes
    /auth                # Authentication pages
    /dashboard           # Main dashboard
    /profile             # User profile
    /settings            # User settings
  /components            # Reusable React components
    /auth                # Authentication-related components
    /common              # Common components (buttons, cards, etc.)
    /layout              # Layout components (header, footer, etc.)
    /profile             # Profile-related components
    /settings            # Settings-related components
    /todos               # Task-related components
  /lib                   # Utilities and hooks
  /types                 # TypeScript type definitions
```

## 📱 Planned Features

- [ ] Refactor task searches for better performance
- [x] Task organization
- [ ] Categories/Tags for tasks
- [ ] Subtasks
- [ ] Notifications for deadlines
- [ ] Calendar view
- [ ] Advanced statistics
- [ ] Data export
- [ ] Integration with other apps

## 🤝 Contribuindo

Contributions are welcome! Feel free to open issues or pull requests.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- **Esdras Santos** - [Github](https://github.com/esdrassantos06)

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Supabase](https://supabase.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)
