// src/components/Navbar.tsx
import { useAuth } from '../context/AuthContext';
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
			<div className='flex-none gap-2'>
				{user ? (
					<>
						<span className='hidden sm:inline opacity-70'>
							Hi, {user.name.split(' ')[0]}
						</span>
						<Link className='btn btn-ghost' to='/tasks'>
							Tasks
						</Link>
						<Link className='btn btn-ghost' to='/profile'>
							Profile
						</Link>
						<button
							className='btn btn-outline'
							onClick={async () => {
								await logout();
								nav('/', { replace: true });
							}}>
							Logout
						</button>
					</>
				) : (
					<>
						<Link className='btn btn-ghost' to='/register'>
							Register
						</Link>
						<Link className='btn btn-primary' to='/login'>
							Login
						</Link>
					</>
				)}
			</div>
		</div>
	);
}
