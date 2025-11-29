import { Button, Container, Paper, Title, Text, Center } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
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
        <Container size={420} my={40}>
            <Title ta="center" className="font-sans">
                Welcome to IronLog
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Sign in to track your strength journey
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <Center>
                    <Button onClick={handleLogin} size="lg" fullWidth>
                        Sign in with Google
                    </Button>
                </Center>
            </Paper>
        </Container>
    );
}
