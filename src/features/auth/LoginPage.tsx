import { Button, Container, Paper, Title, Text, Box, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconBrandGoogle } from '@tabler/icons-react';
import { authService } from '../../services/authService';

export function LoginPage() {
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await authService.login();
            navigate('/exercises', { state: { randomizeExercises: true } });
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    return (
        <Box bg="#f8f9fa" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Banking App Header - Extended for Login */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                padding: '60px 20px 100px', // Deep header
                color: 'white',
                borderBottomLeftRadius: '10px',
                borderBottomRightRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <Title order={1} style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-1px' }}>
                    WorkoutLog
                </Title>
                <Text c="white" style={{ opacity: 0.8 }} size="lg" mt="sm">
                    Track your strength journey
                </Text>
            </div>

            <Container size="xs" px="md" style={{ marginTop: '-60px', width: '100%', maxWidth: '400px' }}>
                <Paper radius="lg" shadow="lg" p="xl" bg="white" withBorder>
                    <Stack gap="lg">
                        <Text ta="center" c="dimmed" size="sm">
                            Sign in to access your workouts, history, and progress analytics.
                        </Text>

                        <Button
                            onClick={handleLogin}
                            size="lg"
                            fullWidth
                            color="darkBlue"
                            radius="xs"
                            leftSection={<IconBrandGoogle size={20} />}
                        >
                            Sign in with Google
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
