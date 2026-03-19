'use client';

import { useState } from 'react';
import type { Task } from '../../types';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onUpdate: (taskId: string, payload: { title?: string; description?: string | null; dueDate?: string | null; completed?: boolean }) => Promise<void>;
}

export function TaskItem({ task, onToggle, onDelete, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');

  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm transition hover:border-zinc-300">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="grid gap-2">
              <input
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <textarea
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                value={description}
                rows={2}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          ) : (
            <>
              <h3 className="text-base font-semibold text-zinc-900">{task.title}</h3>
              <p className="mt-1 text-sm text-zinc-600">{task.description || 'No description'}</p>
            </>
          )}
          <p className="mt-2 text-xs text-zinc-500">
            <span className="mr-2 inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
              {task.completed ? 'Completed' : 'Pending'}
            </span>
            {task.dueDate ? ` • Due ${new Date(task.dueDate).toLocaleDateString()}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              className="h-4 w-4 rounded border-zinc-300 text-slate-700 focus:ring-zinc-200"
            />
            {task.completed ? 'Completed' : 'Pending'}
          </label>
          {isEditing ? (
            <>
              <button
                type="button"
                className="rounded-xl bg-accent px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
                onClick={async () => {
                  await onUpdate(task.id, {
                    title,
                    description: description || null
                  });
                  setIsEditing(false);
                }}
              >
                Save
              </button>
              <button
                type="button"
                className="rounded-xl border px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                onClick={() => {
                  setTitle(task.title);
                  setDescription(task.description ?? '');
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="rounded-xl border px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}
          <button
            type="button"
            className="rounded-xl border px-3 py-2 text-xs font-medium text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-700"
            onClick={() => onDelete(task.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
