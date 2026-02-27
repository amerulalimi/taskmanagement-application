export function TaskTableSkeleton() {
  const rows = Array.from({ length: 4 })

  return (
    <div className="rounded-md border">
      <div className="divide-y divide-border">
        {rows.map((_, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 px-4 py-3"
          >
            <div className="h-4 w-6 animate-pulse rounded bg-muted" />
            <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="ml-auto flex gap-2">
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

