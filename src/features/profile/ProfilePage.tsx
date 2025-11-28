import { Container, Title, Text, Group, Box, Paper, Stack, Avatar, Button } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { ThemeToggle } from '../../components/ThemeToggle';

export function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

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
                        <Text size="sm" style={{ opacity: 0.8 }}>Account</Text>
                        <Title order={1} style={{ fontSize: '28px' }}>Profile</Title>
                    </div>
                    <ThemeToggle />
                </Group>
            </div>

            <Container size="md" px="md">
                <Stack gap="md">
                    <Paper p="xl" radius="lg">
                        <Stack gap="lg" align="center">
                            <Avatar
                                src={user?.photoURL}
                                alt={user?.displayName || 'User'}
                                size={100}
                                radius="xl"
                            />
                            <div style={{ textAlign: 'center' }}>
                                <Title order={3}>{user?.displayName || 'User'}</Title>
                                <Text size="sm" c="dimmed">{user?.email}</Text>
                            </div>
                        </Stack>
                    </Paper>

                    <Paper p="md" radius="lg">
                        <Button
                            variant="light"
                            color="red"
                            fullWidth
                            size="md"
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

