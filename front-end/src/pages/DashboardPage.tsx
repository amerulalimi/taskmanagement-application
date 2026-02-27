import { Suspense, lazy, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { TaskTableSkeleton } from '@/components/TaskTableSkeleton'
import { TaskAddDialog } from '@/components/TaskAddDialog'
import { TaskEditDialog } from '@/components/TaskEditDialog'

const TaskTable = lazy(() =>
  import('@/components/TaskTable').then((m) => ({ default: m.TaskTable }))
)

type TaskStatus = 'pending' | 'completed' | 'in_progress'

const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['pending', 'in_progress', 'completed']),
})

type TaskFormValues = z.infer<typeof taskSchema>

type Task = {
  id: number
  title: string
  status: TaskStatus | string
  description?: string
}

export type { TaskFormValues }

export function DashboardPage() {
  const { logout } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
    },
  })

  const loadTasks = async () => {
    try {
      const res = await api.get<Task[]>('/tasks')
      setTasks(res.data)
    } catch (error: unknown) {
      console.error(error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTasks()
  }, [])

  const resetForm = () => {
    reset({
      title: '',
      description: '',
      status: 'pending',
    })
  }

  const onAddTask = async (values: TaskFormValues) => {
    try {
      await api.post('/tasks', values)
      await loadTasks()
      toast.success('Task created')
      setAddOpen(false)
      resetForm()
    } catch (error: unknown) {
      console.error(error)
      toast.error('Failed to create task')
    }
  }

  const onUpdateTask = async (values: TaskFormValues) => {
    if (!editingTask) return
    try {
      await api.put(`/tasks/${editingTask.id}`, values)
      await loadTasks()
      toast.success('Task updated')
      setEditOpen(false)
      setEditingTask(null)
      resetForm()
    } catch (error: unknown) {
      console.error(error)
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (task: Task) => {
    const ok = window.confirm('Are you sure you want to delete this task?')
    if (!ok) return
    try {
      await api.delete(`/tasks/${task.id}`)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
      toast.success('Task deleted')
    } catch (error: unknown) {
      console.error(error)
      toast.error('Failed to delete task')
    }
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    reset({
      title: task.title,
      description: task.description ?? '',
      status: (task.status as TaskStatus) ?? 'pending',
    })
    setEditOpen(true)
  }

  return (
    <div className="flex min-h-svh bg-muted/40">
      <DashboardSidebar onLogout={logout} />

      {/* Main content */}
      <div className="flex min-h-svh flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-4 md:px-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Task Dashboard</h2>
            <p className="text-sm text-muted-foreground">View and manage your tasks.</p>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAddOpen(true)
                resetForm()
              }}
            >
              Add Task
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold">Data Table</h3>
                  <p className="text-xs text-muted-foreground">
                    List of your current tasks with status and actions.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setAddOpen(true)
                    resetForm()
                  }}
                >
                  Add Task
                </Button>
              </div>
              <div className="p-4">
                <Suspense fallback={<TaskTableSkeleton />}>
                  <TaskTable
                    tasks={tasks}
                    loading={loading}
                    onEdit={openEditModal}
                    onDelete={handleDeleteTask}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </main>
      </div>

      <TaskAddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleSubmit(onAddTask)}
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
        onCancel={() => setAddOpen(false)}
      />

      <TaskEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleSubmit(onUpdateTask)}
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
        onCancel={() => setEditOpen(false)}
      />
    </div>
  )
}

