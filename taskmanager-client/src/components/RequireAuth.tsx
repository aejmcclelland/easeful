'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/auth';

interface RequireAuthProps {
	children: ReactNode;
	fallbackPath?: string;
}

export default function RequireAuth({ children, fallbackPath = '/login' }: RequireAuthProps) {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const user = await getMe();
				if (!user) {
					router.push(fallbackPath);
					return;
				}
				setIsAuthenticated(true);
			} catch {
				router.push(fallbackPath);
			}
		};

		checkAuth();
	}, [router, fallbackPath]);

	// Don't render anything while checking auth to prevent flash
	if (isAuthenticated === null) {
		return null;
	}

	// Only render children if authenticated
	return isAuthenticated ? <>{children}</> : null;
}
