import { DashboardClient } from '@/components/pages/dashboard-client';
import { auth, SessionWithUser } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from '@/i18n/navigation';
import { getLocaleFromRequest } from '@/lib/api-locale';

export default async function Dashboard() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  const locale = await getLocaleFromRequest();
  if (!session) {
    return redirect({ href: '/auth/login', locale });
  }

  return <DashboardClient session={session as SessionWithUser} />;
}
