// app/(protected)/dashboard/page.tsx
import { cookies } from 'next/headers';

async function getMe() {
	const res = await fetch('http://localhost:3000/api/auth/me', {
		credentials: 'include',
		headers: { cookie: cookies().toString() },
		cache: 'no-store',
	});
	if (!res.ok) return null;
	return res.json();
}

export default async function Page() {
	const data = await getMe();
	if (!data) return <meta httpEquiv='refresh' content='0;url=/login' />;
	return <div>Welcome, {data.data.name}</div>;
}
