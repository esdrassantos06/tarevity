import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tarevity - Task Management',
    short_name: 'Tarevity',
    description:
      "Elevate your productivity with Tarevity's secure, intuitive task management platform",
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#003cff',
    orientation: 'portrait',
    lang: 'en-US',
    dir: 'ltr',
    categories: ['productivity', 'utilities', 'task management'],
    screenshots: [
      {
        src: '/screenshots/dashboard.png',
        sizes: '1280x720',
        type: 'image/png',
        label: 'Dashboard View',
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: 'New Task',
        url: '/todo/new',
        description: 'Create a new task',
      },
      {
        name: 'Dashboard',
        url: '/dashboard',
        description: 'View your task dashboard',
      },
    ],
  }
}
