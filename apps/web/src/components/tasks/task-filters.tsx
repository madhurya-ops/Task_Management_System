'use client';

interface TaskFiltersProps {
  search: string;
  status: '' | 'completed' | 'pending';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: '' | 'completed' | 'pending') => void;
}

export function TaskFilters({ search, status, onSearchChange, onStatusChange }: TaskFiltersProps) {
  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="grid flex-1 gap-1 text-sm text-zinc-700">
          <span className="font-medium">Search tasks</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by title or description"
            className="rounded-xl border px-3 py-2.5 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          />
        </label>

        <label className="grid gap-1 text-sm text-zinc-700 sm:w-52">
          <span className="font-medium">Status</span>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as '' | 'completed' | 'pending')}
            className="rounded-xl border px-3 py-2.5 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </div>
    </section>
  );
}
