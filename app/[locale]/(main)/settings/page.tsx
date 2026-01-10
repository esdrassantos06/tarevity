import { SettingsClient } from '@/components/pages/settings-client';
import { auth, SessionWithUser } from '@/lib/auth';
import { redirect } from '@/i18n/navigation';
import { headers } from 'next/headers';
import { getLocaleFromRequest } from '@/lib/api-locale';

export default async function Settings() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  const locale = await getLocaleFromRequest();
  if (!session) {
    return redirect({ href: '/auth/login', locale });
  }
  return <SettingsClient session={session as SessionWithUser} />;
}
