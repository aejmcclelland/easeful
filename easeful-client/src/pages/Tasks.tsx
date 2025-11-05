// src/pages/Tasks.tsx
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 

export default function Tasks() {
  const { user, loading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	// Redirect to login when not authenticated
	useEffect(() => {
		if (!loading && !user) {
			const from = location.pathname + location.search;
			navigate(`/login?from=${encodeURIComponent(from)}`, { replace: true });
		}
	}, [loading, user, navigate, location]);

	if (loading) return null; // or a spinner
	if (!user) return null;
           
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-primary text-center">Tasks</h1>
        <p className="text-base-content/70 text-center">
          Create and manage your tasks with quick due options and repeat scheduling.
        </p>
      </div>
      <TaskForm />
      <div className="divider">Your Tasks</div>
      <TaskList />
    </div>
  );
}
