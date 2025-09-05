import { getSession } from '@/lib/api';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const me = await getSession();
	if (!me) redirect('/login');
	return <>{children}</>;
}
