// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import { useAuth } from './hooks/useAuth';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
	const { loading } = useAuth();

	return (
		<div className='min-h-dvh bg-base-200'>
			{loading && <LoadingScreen />}
			<Navbar />
			<div className='container mx-auto p-4'>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/login' element={<Login />} />
					<Route path='/tasks' element={<Tasks />} />
					<Route path='/profile' element={<Profile />} />
					<Route path='*' element={<Navigate to='/' replace />} />
					<Route path='/register' element={<Register />} />
				</Routes>
			</div>
		</div>
	);
}
