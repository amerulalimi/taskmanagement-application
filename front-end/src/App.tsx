import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <div className="relative min-h-svh">
            <div className="fixed right-4 top-4 z-50">
              <ThemeToggle />
            </div>
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/login" replace />}
              />
              <Route
                path="/login"
                element={<LoginPage />}
              />
              <Route
                path="/register"
                element={<RegisterPage />}
              />
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/dashboard"
                  element={<DashboardPage />}
                />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
