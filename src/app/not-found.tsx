import { Metadata } from 'next'
import NotFoundComponent from '@/components/not-found/NotFoundComponent'

export const metadata: Metadata = {
  title: 'Page Not Found | Tarevity',
  description: 'The page you are looking for could not be found. Navigate back to Tarevity\'s main sections.',
  robots: 'noindex, nofollow',
}

export default function NotFound() {
  return <NotFoundComponent/>
}