import { Container, Title, Text, Paper, Group, Stack, useMantineTheme, ThemeIcon, Box, Badge, Divider, Avatar } from '@mantine/core';
import { useEffect, useState } from 'react';
import { IconLogout, IconChevronRight, IconNote, IconRefresh, IconDatabase, IconDeviceFloppy, IconHistory } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useExerciseSync } from '../../hooks/useExerciseSync'; // Import hook directly to use in custom row
import { showNotification } from '@mantine/notifications';
import { onUpdateAvailable, offUpdateAvailable, checkForUpdates, forceUpdate } from '../../lib/sw';
import { useAuth } from '../../hooks/useAuth';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export function SettingsPage() {
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const { syncFromJson, isSyncingFromJson } = useExerciseSync();
    const { user } = useAuth();
    const [updateConfirmOpen, setUpdateConfirmOpen] = useState(false);
    const [syncConfirmOpen, setSyncConfirmOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    const handleForceUpdate = async () => {
        setUpdateConfirmOpen(true);
    };

    const handleSyncClick = () => {
        setSyncConfirmOpen(true);
    };

    const handleConfirmSync = () => {
        syncFromJson(undefined, {
            onSuccess: () => {
                setSyncConfirmOpen(false);
                showNotification({
                    title: 'Sync Complete',
                    message: 'Exercises have been reset to default.',
                    color: 'green'
                });
            },
            onError: (error) => {
                setSyncConfirmOpen(false);
                showNotification({
                    title: 'Sync Failed',
                    message: 'Failed to sync exercises. Please try again.',
                    color: 'red'
                });
                console.error(error);
            }
        });
    };

    const handleConfirmUpdate = async () => {
        setIsUpdating(true);
        try {
            if (!('serviceWorker' in navigator)) {
                showNotification({ title: 'Error', message: 'Service worker not supported in this browser.', color: 'red' });
                setIsUpdating(false);
                setUpdateConfirmOpen(false);
                return;
            }

            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                showNotification({ title: 'No SW', message: 'No service worker registration found.', color: 'yellow' });
                setIsUpdating(false);
                setUpdateConfirmOpen(false);
                return;
            }

            // Clear all caches before updating
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));

            // Clear localStorage if needed (optional, adjust based on your needs)
            // localStorage.clear();

            // Apply the force update
            const applied = await forceUpdate();
            if (!applied) {
                showNotification({ title: 'No Update', message: 'No update available right now.', color: 'gray' });
                setIsUpdating(false);
                setUpdateConfirmOpen(false);
            } else {
                showNotification({
                    title: 'Updating',
                    message: 'Clearing cache and applying update. Reloading...',
                    color: 'blue'
                });
                // Reload after a short delay to ensure SW activated
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (err) {
            console.error('Force update failed', err);
            showNotification({ title: 'Update Failed', message: 'Failed to apply update. See console for details.', color: 'red' });
            setIsUpdating(false);
            setUpdateConfirmOpen(false);
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
                    <Avatar
                        src={user?.photoURL}
                        alt={user?.displayName || 'User'}
                        size="md"
                        radius="xl"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/profile')}
                    >
                        {user?.displayName?.[0] || 'A'}
                    </Avatar>
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
                            onClick={handleSyncClick}
                            loading={isSyncingFromJson}
                        />
                        <Divider color="gray.1" />
                        <SettingsRow
                            icon={<IconHistory size={20} />}
                            color="grape"
                            label="Changelog"
                            onClick={() => navigate('/changelog')}
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

            <ConfirmDialog
                opened={updateConfirmOpen}
                title="Update Application"
                message="This will clear your cache and update to the latest version. You'll be reloaded to the updated app."
                confirmLabel="Update Now"
                onConfirm={handleConfirmUpdate}
                onCancel={() => setUpdateConfirmOpen(false)}
                isLoading={isUpdating}
            />

            <ConfirmDialog
                opened={syncConfirmOpen}
                title="Sync Exercises?"
                message="This will overwrite your local exercises with the default list. Custom exercises may be lost. Are you sure?"
                confirmLabel="Sync"
                onConfirm={handleConfirmSync}
                onCancel={() => setSyncConfirmOpen(false)}
                isLoading={isSyncingFromJson}
                isDangerous={true}
            />
        </Box>
    );
}
