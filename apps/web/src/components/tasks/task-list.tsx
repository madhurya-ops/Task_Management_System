'use client';

import type { Task } from '../../types';
import { TaskItem } from './task-item';

interface UpdatePayload {
  title?: string;
  description?: string | null;
  completed?: boolean;
  dueDate?: string | null;
}

interface TaskListProps {
  tasks: Task[];
  onUpdate: (taskId: string, payload: UpdatePayload) => Promise<void>;
  onToggle: (taskId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskList({ tasks, onUpdate, onToggle, onDelete }: TaskListProps) {
  if (!tasks.length) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-zinc-700">No tasks yet</p>
        <p className="mt-1 text-sm text-zinc-500">Create your first task to get started.</p>
      </div>
    );
  }

  return (
    <section className="grid gap-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onUpdate={onUpdate} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </section>
  );
}
