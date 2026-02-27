import { Moon, Sun, Laptop } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

export function ThemeToggle({ className }: Props) {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const icon =
    theme === 'light' ? <Sun className="h-4 w-4" /> : theme === 'dark' ? <Moon className="h-4 w-4" /> : <Laptop className="h-4 w-4" />

  const label = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn('gap-2', className)}
      type="button"
      onClick={cycleTheme}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  )
}

