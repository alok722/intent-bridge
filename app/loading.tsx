export default function Loading() {
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-zinc-100 animate-pulse">
      {/* Sidebar skeleton */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-zinc-200 p-4 shrink-0">
        <div className="h-8 w-40 bg-zinc-200 rounded mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-zinc-100 rounded-lg" />
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 p-4 md:p-8 space-y-6 bg-zinc-50/95">
        <div className="space-y-3 mb-10">
          <div className="h-10 w-80 bg-zinc-200 rounded" />
          <div className="h-5 w-96 bg-zinc-200/70 rounded" />
        </div>
        <div className="h-64 bg-zinc-200/80 rounded-xl" />
        <div className="h-16 bg-zinc-200/80 rounded-xl" />
      </main>
    </div>
  );
}
