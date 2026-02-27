import { Button } from '@/components/ui/button'

type Props = {
  onLogout: () => void
}

export function DashboardSidebar({ onLogout }: Props) {
  return (
    <aside className="hidden w-64 border-r bg-background/80 p-4 md:flex md:flex-col">
      <div className="mb-6">
        <h1 className="text-lg font-semibold tracking-tight">Task Manager</h1>
        <p className="text-xs text-muted-foreground">Quick navigation</p>
      </div>
      <nav className="space-y-1 text-sm">
        <div className="rounded-md bg-primary/10 px-3 py-2 font-medium text-primary">
          Data Table
        </div>
      </nav>
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <Button
          variant="ghost"
          onClick={onLogout}
        >
          Logout
        </Button>
      </div>
    </aside>
  )
}

