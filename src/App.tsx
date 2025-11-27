import { AppShell, Burger, Group, Title, NavLink, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ExerciseList } from './features/exercises/ExerciseList';
import { ExerciseDetail } from './features/exercises/ExerciseDetail';
import { NotesPage } from './features/notes/NotesPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { IconBarbell, IconLogout, IconLayoutDashboard } from '@tabler/icons-react';
import { authService } from './services/authService';
import { SyncFromJsonButton } from './components/SyncButton';

function App() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{ root: { minHeight: '100vh' }, main: { padding: '3rem 0rem 0.5rem' } }}
    >
      <AppShell.Header style={{ background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid rgba(200,210,240,0.3)', backdropFilter: 'blur(8px)' }}>
        <Group h="100%" px="md" className="hero-header">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <div>
            <Title order={3} className="app-title-gradient">IronLog</Title>
            <div className="muted-text">Your strength journey visualized</div>
          </div>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ background: 'rgba(255,255,255,0.7)', borderLeft: '1px solid rgba(200,210,240,0.3)', backdropFilter: 'blur(8px)' }}>
        <NavLink
          label="Dashboard"
          leftSection={<IconLayoutDashboard size={18} />}
          onClick={() => {
            navigate('/');
            if (opened) toggle();
          }}
        />
        <NavLink
          label="Exercises"
          leftSection={<IconBarbell size={18} />}
          onClick={() => {
            navigate('/exercises');
            if (opened) toggle();
          }}
          mt="sm"
        />
        <NavLink
          label="Notes"
          leftSection={<IconBarbell size={18} />}
          onClick={() => {
            navigate('/notes');
            if (opened) toggle();
          }}
          mt="sm"
        />
        <Box mt="md">
          <SyncFromJsonButton />
        </Box>
        <NavLink
          label="Logout"
          leftSection={<IconLogout size={18} />}
          onClick={handleLogout}
          color="red"
          mt="auto"
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/exercises" element={<ExerciseList />} />
              <Route path="/exercises/:id" element={<ExerciseDetail />} />
              <Route path="/notes" element={<NotesPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
