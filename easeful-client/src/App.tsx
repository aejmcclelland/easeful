// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Navbar from './components/Navbar';

export default function App() {
	return (
		<div className='min-h-dvh bg-base-200'>
			<Navbar />
			<div className='container mx-auto p-4'>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/login' element={<Login />} />
					<Route path='/profile' element={<Profile />} />
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
			</div>
		</div>
	);
}
