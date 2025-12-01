import { Container, Title, Text, Paper, Group, Stack, useMantineTheme, ThemeIcon, Box, Badge, Divider, Avatar, Button, Modal } from '@mantine/core';
import { useEffect, useState } from 'react';
import { IconLogout, IconChevronRight, IconNote, IconRefresh, IconDatabase, IconDeviceFloppy, IconHistory, IconLanguage, IconGitBranch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import { useExerciseSync } from '../../hooks/useExerciseSync'; // Import hook directly to use in custom row
import { showNotification } from '@mantine/notifications';
import { onUpdateAvailable, offUpdateAvailable, checkForUpdates, forceUpdate } from '../../lib/sw';
import { useAuth } from '../../hooks/useAuth';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useVersion } from '../../hooks/useVersion';

export function SettingsPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const { syncFromJson, isSyncingFromJson } = useExerciseSync();
    const { user } = useAuth();
    const { data: versionInfo } = useVersion();
    const [updateConfirmOpen, setUpdateConfirmOpen] = useState(false);
    const [syncConfirmOpen, setSyncConfirmOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [langModalOpen, setLangModalOpen] = useState(false);

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
                    title: t('settings.syncComplete'),
                    message: t('settings.syncCompleteMessage'),
                    color: 'green'
                });
            },
            onError: (error) => {
                setSyncConfirmOpen(false);
                showNotification({
                    title: t('settings.syncFailed'),
                    message: t('settings.syncFailedMessage'),
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
                showNotification({ title: t('settings.updateError'), message: t('settings.swNotSupported'), color: 'red' });
                setIsUpdating(false);
                setUpdateConfirmOpen(false);
                return;
            }

            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                showNotification({ title: t('settings.noSw'), message: t('settings.noSwMessage'), color: 'yellow' });
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
                showNotification({ title: t('settings.noUpdate'), message: t('settings.noUpdateMessage'), color: 'gray' });
                setIsUpdating(false);
                setUpdateConfirmOpen(false);
            } else {
                showNotification({
                    title: t('settings.updating'),
                    message: t('settings.updatingMessage'),
                    color: 'blue'
                });
                // Reload after a short delay to ensure SW activated
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (err) {
            console.error('Force update failed', err);
            showNotification({ title: t('settings.updateFailed'), message: t('settings.updateFailedMessage'), color: 'red' });
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
                        <Text size="xs" style={{ opacity: 0.8 }}>{t('settings.preferences')}</Text>
                        <Title order={2} style={{ color: 'white' }}>{t('settings.title')}</Title>
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
                            label={t('settings.myNotes')}
                            onClick={() => navigate('/notes')}
                        />
                        <Divider color="gray.1" />
                        <SettingsRow
                            icon={<IconDatabase size={20} />}
                            color="violet"
                            label={t('settings.syncExercises')}
                            onClick={handleSyncClick}
                            loading={isSyncingFromJson}
                        />
                        <Divider color="gray.1" />
                        <SettingsRow
                            icon={<IconLanguage size={20} />}
                            color="blue"
                            label={t('settings.language')}
                            onClick={() => setLangModalOpen(true)}
                            rightSection={
                                <Group gap="xs">
                                    <Text size="sm" c="dimmed">{i18n.language.toUpperCase()}</Text>
                                    <IconChevronRight size={18} color={theme.colors.gray[4]} />
                                </Group>
                            }
                        />
                        <Divider color="gray.1" />
                        <SettingsRow
                            icon={<IconHistory size={20} />}
                            color="grape"
                            label={t('settings.changelog')}
                            onClick={() => navigate('/changelog')}
                        />
                        <Divider color="gray.1" />
                        <SettingsRow
                            icon={<IconDeviceFloppy size={20} />}
                            color="teal"
                            label={t('settings.forceUpdate')}
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

                    {/* Version Info Group */}
                    {versionInfo && (
                        <Paper radius="sm" shadow="sm" bg="white" p="md">
                            <Group gap="xs" mb="sm">
                                <ThemeIcon variant="light" color="gray" size="sm" radius="sm">
                                    <IconGitBranch size={16} />
                                </ThemeIcon>
                                <Text fw={600} size="sm" c="dimmed">Version Info</Text>
                            </Group>
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed">Branch</Text>
                                    <Badge variant="light" color="blue" radius="xs" size="sm">{versionInfo.branch}</Badge>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed">Commit</Text>
                                    <Text size="xs" ff="monospace" fw={500}>{versionInfo.commitHashShort}</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed">Tag</Text>
                                    <Badge variant="light" color="teal" radius="xs" size="sm">{versionInfo.latestTag}</Badge>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed">Total Commits</Text>
                                    <Text size="xs" fw={500}>{versionInfo.commitCount}</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed">Build Date</Text>
                                    <Text size="xs" c="dimmed">
                                        {new Date(versionInfo.buildDate).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                </Group>
                            </Stack>
                        </Paper>
                    )}

                    {/* Account Group */}
                    <Paper radius="sm" shadow="sm" bg="white" style={{ overflow: 'hidden' }}>
                        <SettingsRow
                            icon={<IconLogout size={20} />}
                            color="red"
                            label={t('settings.logout')}
                            onClick={handleLogout}
                        />
                    </Paper>
                </Stack>
            </Container>

            <Modal opened={langModalOpen} onClose={() => setLangModalOpen(false)} title={t('settings.language')}>
                <Stack>
                    <Button
                        variant={i18n.language.startsWith('en') ? 'filled' : 'light'}
                        onClick={() => { i18n.changeLanguage('en'); setLangModalOpen(false); }}
                        color="blue"
                    >
                        {t('settings.english')}
                    </Button>
                    <Button
                        variant={i18n.language === 'sv' ? 'filled' : 'light'}
                        onClick={() => { i18n.changeLanguage('sv'); setLangModalOpen(false); }}
                        color="blue"
                    >
                        {t('settings.swedish')}
                    </Button>
                </Stack>
            </Modal>

            <ConfirmDialog
                opened={updateConfirmOpen}
                title={t('settings.updateApp')}
                message={t('settings.updateMessage')}
                confirmLabel={t('settings.updateNow')}
                onConfirm={handleConfirmUpdate}
                onCancel={() => setUpdateConfirmOpen(false)}
                isLoading={isUpdating}
            />

            <ConfirmDialog
                opened={syncConfirmOpen}
                title={t('settings.syncConfirmTitle')}
                message={t('settings.syncConfirmMessage')}
                confirmLabel={t('settings.sync')}
                onConfirm={handleConfirmSync}
                onCancel={() => setSyncConfirmOpen(false)}
                isLoading={isSyncingFromJson}
                isDangerous={true}
            />
        </Box>
    );
}