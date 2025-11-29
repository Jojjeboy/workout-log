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
                        <Text size="xs" style={{ opacity: 0.8 }}>Account</Text>
                        <Title order={2} style={{ color: 'white' }}>Profile</Title>
                    </div>
                    <ThemeToggle />
                </Group>
            </div>

            <Container size="md" px="md" style={{ marginTop: '-40px' }}>
                <Stack gap="md">
                    <Paper p="xl" radius="sm" shadow="sm" bg="white">
                        <Stack gap="lg" align="center">
                            <Avatar
                                src={user?.photoURL}
                                alt={user?.displayName || 'User'}
                                size={100}
                                radius="xl"
                                color="darkBlue"
                            />
                            <div style={{ textAlign: 'center' }}>
                                <Title order={3}>{user?.displayName || 'User'}</Title>
                                <Text size="sm" c="dimmed">{user?.email}</Text>
                            </div>
                        </Stack>
                    </Paper>

                    <Paper p="md" radius="sm" shadow="sm" bg="white">
                        <Button
                            variant="light"
                            color="red"
                            fullWidth
                            size="md"
                            radius="xs"
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
