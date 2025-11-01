// src/App.tsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
	const location = useLocation();
	const hideNavbar = ['/login', '/register'].includes(location.pathname);
	const { loading } = useAuth();

	return (
		<div className='min-h-dvh bg-base-200'>
			{loading && <LoadingScreen />}
			{!hideNavbar && <Navbar />}
			<div className='container mx-auto p-4'>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/login' element={<Login />} />
					<Route path='/profile' element={<Profile />} />
					<Route path='*' element={<Navigate to='/' replace />} />
					<Route path='/register' element={<Register />} />
				</Routes>
			</div>
		</div>
	);
}
