// src/components/Navbar.tsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
	const { user, logout } = useAuth();
	const nav = useNavigate();
	return (
		<div className='navbar bg-base-100'>
			<div className='flex-1'>
				<a className='btn btn-ghost text-xl' href='/'>
					Easeful
				</a>
			</div>
			<div className='flex-none gap-2'>
				{user ? (
					<>
						<span className='hidden sm:inline opacity-70'>
							Hi, {user.name.split(' ')[0]}
						</span>
						<a className='btn btn-ghost' href='/profile'>
							Profile
						</a>
						<button
							className="btn btn-outline"
							onClick={async () => {
								await logout();
								nav('/', { replace: true });
							}}
						>
							Logout
						</button>
					</>
				) : (
					<>
						<a className='btn btn-ghost' href='/register'>
							Register
						</a>
						<a className='btn btn-primary' href='/login'>
							Login
						</a>
					</>
				)}
			</div>
		</div>
	);
}
