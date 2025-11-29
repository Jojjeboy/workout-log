import { Container, Title, Text, Group, Box } from '@mantine/core';
import { ThemeToggle } from '../../components/ThemeToggle';

export function AnalysisPage() {
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
                        <Text size="xs" style={{ opacity: 0.8 }}>Insights</Text>
                        <Title order={2} style={{ color: 'white' }}>Analysis</Title>
                    </div>
                    <ThemeToggle />
                </Group>
            </div>

            <Container size="md" px="md" style={{ marginTop: '-40px' }}>
                <Text ta="center" c="dimmed" mt="xl">Analysis features coming soon...</Text>
            </Container>
        </Box>
    );
}
