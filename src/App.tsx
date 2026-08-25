import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthProvider'
import { ThemeProvider } from './context/ThemeProvider'
import { HomePage } from './pages/HomePage'
import { WorkoutOverviewPage } from './pages/WorkoutOverviewPage'
import { ActiveWorkoutPage, NewWorkoutPage } from './pages/ActiveWorkoutPage'
import { ActivityDetailPage } from './pages/ActivityDetailPage'
import { ProgramBuilderPage } from './pages/ProgramBuilderPage'
import { InfoHubPage } from './pages/InfoHubPage'
import { InfoArticlePage } from './pages/InfoArticlePage'
import { SettingsPage } from './pages/SettingsPage'
import { LoginPage, ProtectedRoute } from './pages/LoginPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout"
                element={
                  <ProtectedRoute>
                    <WorkoutOverviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/active/:sessionId"
                element={
                  <ProtectedRoute>
                    <ActiveWorkoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/new"
                element={
                  <ProtectedRoute>
                    <NewWorkoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/activity"
                element={
                  <ProtectedRoute>
                    <ActivityDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/program/new"
                element={
                  <ProtectedRoute>
                    <ProgramBuilderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/program/:id"
                element={
                  <ProtectedRoute>
                    <ProgramBuilderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/info"
                element={
                  <ProtectedRoute>
                    <InfoHubPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/info/:slug"
                element={
                  <ProtectedRoute>
                    <InfoArticlePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
