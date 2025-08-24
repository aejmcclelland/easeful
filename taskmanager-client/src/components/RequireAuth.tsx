'use client';

import { useEffect } from 'react';
import { getMe } from '@/lib/auth';

export default function RequireAuth() {
	useEffect(() => {
		(async () => {
			const me = await getMe();
			if (!me) window.location.href = '/login';
		})();
	}, []);
	return null; // just a guard
}
