'use client';

import { FormEvent, useState } from 'react';

interface TaskFormPayload {
  title: string;
  description?: string;
  dueDate?: string;
}

interface TaskFormProps {
  pending?: boolean;
  onSubmit: (payload: TaskFormPayload) => Promise<void>;
}

export function TaskForm({ pending = false, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    const dueDateIso = dueDate ? new Date(`${dueDate}T00:00:00.000Z`).toISOString() : undefined;

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDateIso
    });

    setTitle('');
    setDescription('');
    setDueDate('');
  };

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold text-zinc-900">Create task</h2>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Task title"
          required
          className="rounded-xl border px-3 py-2.5 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="rounded-xl border px-3 py-2.5 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
        />
        <label className="grid gap-1 text-sm text-zinc-700">
          <span className="font-medium">Due date (optional)</span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="rounded-xl border px-3 py-2.5 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? 'Creating...' : 'Create task'}
        </button>
      </form>
    </section>
  );
}
