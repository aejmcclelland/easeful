// src/pages/Tasks.tsx
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

export default function Tasks() {
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
