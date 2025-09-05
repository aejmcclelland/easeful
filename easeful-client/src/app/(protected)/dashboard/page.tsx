// app/(protected)/dashboard/page.tsx
import { getSession } from '@/lib/api';
import { redirect } from 'next/navigation';

export default async function Page() {
  const me = await getSession();
  if (!me || me.data.role !== 'admin') {
    redirect('/profile');
  }

  return <div>Admin Dashboard – Welcome, {me.data.name}</div>;
}
