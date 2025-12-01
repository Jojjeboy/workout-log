import { AppShell } from '@mantine/core';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ExerciseList } from './features/exercises/ExerciseList';
import { ExerciseDetail } from './features/exercises/ExerciseDetail';
import { NotesPage } from './features/notes/NotesPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { ChangelogPage } from './features/changelog/ChangelogPage';
import { WorkoutHistoryPage } from './features/workouts/WorkoutHistoryPage';
import { WorkoutGeneratorPage } from './features/generator/WorkoutGeneratorPage';
import { Footer } from './components/Footer';
import { useAuth } from './hooks/useAuth';
import { UpdateNotification } from './components/UpdateNotification';

function App() {
  const location = useLocation();
  const { user } = useAuth();

  // Only show footer when user is authenticated (not on login page)
  const showFooter = user && location.pathname !== '/login';

  return (
    <AppShell
      header={{ height: 0 }} // Hide default header to use custom one
      footer={{ height: showFooter ? 85 : 0 }}
      padding="0" // Remove default padding
      styles={{
        root: { minHeight: '100vh' },
        main: { paddingBottom: showFooter ? '85px' : '0' }
      }}
    >
      {/* Removed AppShell.Header since we use custom header in Dashboard */}

      <AppShell.Main>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<WorkoutHistoryPage />} />
              <Route path="/exercises" element={<ExerciseList />} />
              <Route path="/exercises/:id" element={<ExerciseDetail />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/generator" element={<WorkoutGeneratorPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AppShell.Main>

      {showFooter && <Footer />}
      <UpdateNotification />
    </AppShell>
  );
}

export default App;
