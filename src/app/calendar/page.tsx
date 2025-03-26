import Calendar from '@/components/calendar'
import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'

export const metadata: Metadata = {
  title: 'Task Calendar | Tarevity',
  description:
    'Stay organized and productive with Tarevity. Use the task calendar to manage your schedule, prioritize tasks, and track your progress effectively.',
  robots: 'index, follow',
  keywords:
    'Tarevity, task calendar, productivity, task management, schedule tracking',
}

export default function Home() {
  return (
    <Layout>
      <div className="max-w-8xl mx-auto flex">
        <Calendar />
      </div>
    </Layout>
  )
}
