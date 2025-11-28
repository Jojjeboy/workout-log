import { Container, Title, Text, Paper, Group, Stack, Button, useMantineTheme, ThemeIcon, Box, Badge } from '@mantine/core';
import { useEffect } from 'react';
import { IconLogout, IconChevronRight, IconNote, IconRefresh } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { SyncFromJsonButton } from '../../components/SyncButton';
import { ThemeToggle } from '../../components/ThemeToggle';
import { showNotification } from '@mantine/notifications';
import { onUpdateAvailable, offUpdateAvailable, checkForUpdates, forceUpdate } from '../../lib/sw';

export function SettingsPage() {
    const navigate = useNavigate();
    const theme = useMantineTheme();

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    const handleForceUpdate = async () => {
        if (!('serviceWorker' in navigator)) {
            window.alert('Service worker not supported in this browser.');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                showNotification({ title: 'No SW', message: 'No service worker registration found.', color: 'yellow' });
                return;
            }

            // If there's already a waiting service worker, activate it
            // Use the shared helper which will also emit events
            const applied = await forceUpdate();
            if (!applied) {
                showNotification({ title: 'No Update', message: 'No update available right now.', color: 'gray' });
            }
        } catch (err) {
            console.error('Force update failed', err);
                showNotification({ title: 'Update Check Failed', message: 'Failed to check for updates. See console for details.', color: 'red' });
        }
    };

    // Subscribe to update available events to show badge
    useEffect(() => {
        const onAvailable = () => {
            const el = document.getElementById('update-badge');
            if (el) el.style.display = 'inline-block';
        };
        onUpdateAvailable(onAvailable);
        // initial check
        checkForUpdates();
        return () => offUpdateAvailable(onAvailable);
    }, []);

    return (
        <Box bg="var(--mantine-color-body)" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header Section */}
            <div style={{
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                padding: '40px 20px 80px',
                color: 'white',
                borderBottomLeftRadius: '30px',
                borderBottomRightRadius: '30px',
                marginBottom: '-60px'
            }}>
                <Group justify="space-between" align="flex-start" mb="xl">
                    <div>
                        <Text size="sm" style={{ opacity: 0.8 }}>Preferences</Text>
                        <Title order={1} style={{ fontSize: '28px' }}>Settings</Title>
                    </div>
                    <ThemeToggle />
                </Group>
            </div>

            <Container size="md" px="md">
                <Stack gap="md">
                    <Paper p="md" radius="lg">
                        <Text size="sm" fw={500} c="dimmed" mb="sm" tt="uppercase">Personal</Text>
                        <Group justify="space-between" onClick={() => navigate('/notes')} style={{ cursor: 'pointer' }}>
                            <Group>
                                <ThemeIcon variant="light" color="violet" size="lg" radius="md">
                                    <IconNote size={20} />
                                </ThemeIcon>
                                <Text fw={500}>My Notes</Text>
                            </Group>
                            <IconChevronRight size={18} color={theme.colors.gray[5]} />
                        </Group>
                    </Paper>

                    <Paper p="md" radius="lg">
                        <Text size="sm" fw={500} c="dimmed" mb="sm" tt="uppercase">Data Management</Text>
                        <Stack>
                            <SyncFromJsonButton />
                        </Stack>
                    </Paper>
                    <Paper p="md" radius="lg">
                        <Text size="sm" fw={500} c="dimmed" mb="sm" tt="uppercase">Application</Text>
                        <Stack>
                            <Group style={{ justifyContent: 'space-between', width: '100%' }}>
                                <Button
                                    variant="outline"
                                    leftSection={<IconRefresh size={16} />}
                                    onClick={handleForceUpdate}
                                >
                                    Force Update
                                </Button>
                                <Badge color="yellow" variant="light" radius="sm" id="update-badge" style={{ display: 'none' }}>
                                    Update available
                                </Badge>
                            </Group>
                        </Stack>
                    </Paper>

                    <Paper p="md" radius="lg">
                        <Text size="sm" fw={500} c="dimmed" mb="sm" tt="uppercase">Account</Text>
                        <Button
                            variant="light"
                            color="red"
                            fullWidth
                            onClick={handleLogout}
                            leftSection={<IconLogout size={18} />}
                        >
                            Logout
                        </Button>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
}
