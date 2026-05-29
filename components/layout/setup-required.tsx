export function SetupRequired({ title, description }: { title: string; description: string }) {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <section className="mx-auto max-w-3xl rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">{description}</p>
        <pre className="mt-4 overflow-x-auto rounded-md border border-neutral-200 bg-neutral-100 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...`}
        </pre>
      </section>
    </main>
  );
}
