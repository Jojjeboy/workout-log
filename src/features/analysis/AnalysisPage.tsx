import { Container, Title, Text, Group, Box } from '@mantine/core';
import { ThemeToggle } from '../../components/ThemeToggle';

export function AnalysisPage() {
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
                        <Text size="sm" style={{ opacity: 0.8 }}>Insights</Text>
                        <Title order={1} style={{ fontSize: '28px' }}>Analysis</Title>
                    </div>
                    <ThemeToggle />
                </Group>
            </div>

            <Container size="md" px="md">
                <Text ta="center" c="dimmed" mt="xl">Analysis features coming soon...</Text>
            </Container>
        </Box>
    );
}
