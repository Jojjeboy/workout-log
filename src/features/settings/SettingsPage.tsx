import { Container, Title, Text, Paper, Group, Stack, useMantineTheme, ThemeIcon, Box, Badge, Divider } from '@mantine/core';
import { useEffect } from 'react';
import { IconLogout, IconChevronRight, IconNote, IconRefresh, IconDatabase, IconDeviceFloppy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useExerciseSync } from '../../hooks/useExerciseSync'; // Import hook directly to use in custom row
import { showNotification } from '@mantine/notifications';
import { onUpdateAvailable, offUpdateAvailable, checkForUpdates, forceUpdate } from '../../lib/sw';

export function SettingsPage() {
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const { syncFromJson, isSyncingFromJson } = useExerciseSync(); // Use hook here

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
            const applied = await forceUpdate();
            if (!applied) {
                showNotification({ title: 'No Update', message: 'No update available right now.', color: 'gray' });
            }
        } catch (err) {
            console.error('Force update failed', err);
            showNotification({ title: 'Update Check Failed', message: 'Failed to check for updates. See console for details.', color: 'red' });
        }
    };

    useEffect(() => {
        const onAvailable = () => {
            const el = document.getElementById('update-badge');
            if (el) el.style.display = 'inline-block';
        };
        onUpdateAvailable(onAvailable);
        checkForUpdates();
        return () => offUpdateAvailable(onAvailable);
    }, []);

    // Reusable Settings Row Component
    const SettingsRow = ({
        icon,
        color,
        label,
        onClick,
        rightSection,
        loading = false
    }: {
        icon: React.ReactNode,
        color: string,
        label: string,
        onClick: () => void,
        rightSection?: React.ReactNode,
        loading?: boolean
    }) => (
        <div
            onClick={onClick}
            className="hover-bg-gray"
            style={{
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
        >
            <Group>
                <ThemeIcon variant="light" color={color} size="lg" radius="sm">
                    {loading ? <IconRefresh size={20} className="mantine-rotate" /> : icon}
                </ThemeIcon>
                <Text fw={500} size="sm">{label}</Text>
            </Group>
            {rightSection || <IconChevronRight size={18} color={theme.colors.gray[4]} />}
        </div>
    );

    return (
        <Box bg="#f8f9fa" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Banking App Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                padding: '20px 20px 60px',
                color: 'white',
                borderBottomLeftRadius: '10px',
                borderBottomRightRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <Group justify="space-between" align="center" mb="lg">
                    <div>
                        <Text size="xs" style={{ opacity: 0.8 }}>Preferences</Text>
                        <Title order={2} style={{ color: 'white' }}>Settings</Title>
                    </div>
                </Group>
            </div>

            <Container size="md" px="md" style={{ marginTop: '-40px' }}>
                <Stack gap="md">
                    {/* Main Settings Group */}
                    <Paper radius="sm" shadow="sm" bg="white" style={{ overflow: 'hidden' }}>
                        <SettingsRow
                            icon={<IconNote size={20} />}
                            color="darkBlue"
                            label="My Notes"
                            onClick={() => navigate('/notes')}
                        />
                        <Divider color="gray.1" />
                        <SettingsRow
                            icon={<IconDatabase size={20} />}
                            color="violet"
                            label="Sync Exercises"
                            onClick={syncFromJson}
                            loading={isSyncingFromJson}
                        />
                        <Divider color="gray.1" />
                        <SettingsRow
                            icon={<IconDeviceFloppy size={20} />}
                            color="teal"
                            label="Force Update"
                            onClick={handleForceUpdate}
                            rightSection={
                                <Group gap="xs">
                                    <Badge color="yellow" variant="light" radius="xs" id="update-badge" style={{ display: 'none' }}>
                                        Update
                                    </Badge>
                                    <IconChevronRight size={18} color={theme.colors.gray[4]} />
                                </Group>
                            }
                        />
                    </Paper>

                    {/* Account Group */}
                    <Paper radius="sm" shadow="sm" bg="white" style={{ overflow: 'hidden' }}>
                        <SettingsRow
                            icon={<IconLogout size={20} />}
                            color="red"
                            label="Logout"
                            onClick={handleLogout}
                        />
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
}
