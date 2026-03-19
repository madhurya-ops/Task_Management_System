'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { useTasks } from '../../../hooks/useTasks';
import { TaskFilters } from '../../../components/tasks/task-filters';
import { TaskForm } from '../../../components/tasks/task-form';
import { TaskList } from '../../../components/tasks/task-list';

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logoutMutation } = useAuth();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState<'' | 'completed' | 'pending'>(
    (searchParams.get('status') as '' | 'completed' | 'pending' | null) ?? ''
  );
  const limit = 10;
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim());

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 250);

    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    const urlSearch = searchParams.get('search') ?? '';
    const urlStatus = (searchParams.get('status') as '' | 'completed' | 'pending' | null) ?? '';
    if (urlSearch !== search) setSearch(urlSearch);
    if (urlStatus !== status) setStatus(urlStatus);
  }, [search, searchParams, status]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedSearch) next.set('search', debouncedSearch);
    if (status) next.set('status', status);
    next.set('limit', String(limit));
    const query = next.toString();
    const target = query ? `${pathname}?${query}` : pathname;
    const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    if (target !== current) {
      router.replace(target);
    }
  }, [debouncedSearch, limit, pathname, router, searchParams, status]);

  const { query, createMutation, updateMutation, toggleMutation, deleteMutation } = useTasks({
    search: debouncedSearch || undefined,
    status: status || undefined,
    limit,
    enabled: Boolean(user)
  });

  const tasks = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Task Manager</p>
            <h1 className="text-lg font-semibold text-zinc-900">Dashboard</h1>
          </div>
          <button
            className="rounded-xl border px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            onClick={async () => {
              try {
                await logoutMutation.mutateAsync();
                toast.success('Signed out');
              } catch (error) {
                toast.error((error as Error).message);
              }
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-600">Signed in as {user?.email}</p>
        </section>

        <TaskForm
          pending={createMutation.isPending}
          onSubmit={async (payload) => {
            try {
              await createMutation.mutateAsync(payload);
              toast.success('Task created');
            } catch (error) {
              toast.error((error as Error).message);
            }
          }}
        />

        <TaskFilters search={search} status={status} onSearchChange={setSearch} onStatusChange={setStatus} />

        {query.isLoading ? (
          <section className="grid gap-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="animate-pulse rounded-2xl border bg-white p-4 shadow-sm">
                <div className="h-4 w-1/3 rounded bg-zinc-200" />
                <div className="mt-3 h-3 w-2/3 rounded bg-zinc-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-zinc-100" />
              </div>
            ))}
          </section>
        ) : query.error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load tasks. Try refreshing the page.
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onUpdate={async (taskId, payload) => {
              try {
                await updateMutation.mutateAsync({ taskId, payload });
                toast.success('Task saved');
              } catch (error) {
                toast.error((error as Error).message);
              }
            }}
            onToggle={async (taskId) => {
              try {
                await toggleMutation.mutateAsync(taskId);
                toast.success('Task updated');
              } catch (error) {
                toast.error((error as Error).message);
              }
            }}
            onDelete={async (taskId) => {
              try {
                await deleteMutation.mutateAsync(taskId);
                toast.success('Task deleted');
              } catch (error) {
                toast.error((error as Error).message);
              }
            }}
          />
        )}

        {query.hasNextPage && (
          <button
            className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={query.isFetchingNextPage}
            onClick={() => query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? 'Loading...' : 'Load more'}
          </button>
        )}
      </main>
    </div>
  );
}
