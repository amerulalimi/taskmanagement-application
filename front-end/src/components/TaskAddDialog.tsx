import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { TaskFormValues } from '@/pages/DashboardPage'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (e?: React.BaseSyntheticEvent) => void
  register: UseFormRegister<TaskFormValues>
  errors: FieldErrors<TaskFormValues>
  isSubmitting: boolean
  onCancel: () => void
}

export function TaskAddDialog({
  open,
  onOpenChange,
  onSubmit,
  register,
  errors,
  isSubmitting,
  onCancel,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>Create a new task for your list.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <form
            onSubmit={onSubmit}
            className="space-y-3"
          >
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                {...register('status')}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && (
                <p className="text-xs text-destructive">{errors.status.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

