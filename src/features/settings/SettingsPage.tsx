import { Container, Title, Text, Paper, Group, Stack, Button, useMantineTheme, ThemeIcon, Box } from '@mantine/core';
import { IconLogout, IconChevronRight, IconNote } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { SyncFromJsonButton } from '../../components/SyncButton';
import { ThemeToggle } from '../../components/ThemeToggle';

export function SettingsPage() {
    const navigate = useNavigate();
    const theme = useMantineTheme();

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

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
