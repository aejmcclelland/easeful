// src/components/Navbar.tsx
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
	const { user, logout } = useAuth();
	const nav = useNavigate();

	return (
		<div className='navbar bg-base-100'>
			<div className='flex-1'>
				<Link className='btn btn-ghost text-xl' to='/'>
					Easeful
				</Link>
			</div>
			<div className='flex-none flex items-center space-x-2'>
				{user ? (
					<>
						<span className='hidden sm:inline opacity-70'>
							Hi, {user.name.split(' ')[0]}
						</span>
						<Link className='btn btn-sm btn-soft btn-default' to='/tasks'>
							Tasks
						</Link>
						<Link className='btn btn-sm btn-soft btn-default' to='/profile'>
							Profile
						</Link>
						<button
							className='btn btn-sm btn-soft btn-default'
							onClick={async () => {
								await logout();
								nav('/', { replace: true });
							}}>
							Logout
						</button>
					</>
				) : (
					<>
						<Link className='btn btn-sm btn-soft btn-default' to='/register'>
							Register
						</Link>
						<Link className='btn btn-sm btn-soft btn-default' to='/login'>
							Login
						</Link>
					</>
				)}
			</div>
		</div>
	);
}
