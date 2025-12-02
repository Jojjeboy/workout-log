import { Box, Container, Stack, Title, Text, Group, Avatar, Loader, Center, Affix, Transition, ActionIcon, Paper, TextInput } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useRoutines } from '../../hooks/useRoutines';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { RoutineCard } from '../../components/RoutineCard';
import { useState } from 'react';

export function RoutinesPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: routines, isLoading } = useRoutines();
    const [search, setSearch] = useState('');

    const filteredRoutines = routines?.filter(routine =>
        routine.name.toLowerCase().includes(search.toLowerCase()) ||
        routine.description?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    if (isLoading) {
        return <Center h={400}><Loader /></Center>;
    }

    return (
        <Box bg="#f8f9fa" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Blue Gradient Header */}
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
                        <Text size="xs" style={{ opacity: 0.8 }}>{t('routines.library')}</Text>
                        <Title order={2} style={{ color: 'white' }}>{t('routines.title')}</Title>
                    </div>
                    <Group gap="sm">
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
                </Group>

                {/* Search Bar */}
                <TextInput
                    placeholder={t('routines.searchPlaceholder')}
                    leftSection={<IconSearch size={16} />}
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    radius="xl"
                    size="md"
                    styles={{
                        input: {
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            border: 'none',
                            '::placeholder': { color: 'rgba(255,255,255,0.6)' }
                        }
                    }}
                />
            </div>

            <Container size="lg" px="md" style={{ marginTop: '-40px' }}>
                <Stack gap="md">
                    {filteredRoutines.length > 0 ? (
                        filteredRoutines.map((routine) => (
                            <RoutineCard key={routine.id} routine={routine} />
                        ))
                    ) : routines && routines.length === 0 ? (
                        <Paper radius="lg" p="xl" shadow="sm" bg="white" mt="md">
                            <Center style={{ flexDirection: 'column', gap: '16px', padding: '40px' }}>
                                <Title order={3} c="dimmed">{t('routines.noRoutines')}</Title>
                                <Text c="dimmed" ta="center">
                                    {t('routines.noRoutinesDescription')}
                                </Text>
                            </Center>
                        </Paper>
                    ) : (
                        <Text ta="center" c="dimmed" mt="xl">{t('routines.noResults')}</Text>
                    )}
                </Stack>
            </Container>

            {/* Floating Action Button */}
            <Affix position={{ bottom: 100, right: 20 }}>
                <Transition transition="slide-up" mounted={true}>
                    {(transitionStyles) => (
                        <ActionIcon
                            size={60}
                            radius="xl"
                            variant="filled"
                            style={{
                                ...transitionStyles,
                                backgroundColor: '#228be6',
                                boxShadow: '0 4px 12px rgba(34, 139, 230, 0.4)'
                            }}
                            onClick={() => navigate('/routines/create')}
                        >
                            <IconPlus size={28} />
                        </ActionIcon>
                    )}
                </Transition>
            </Affix>
        </Box>
    );
}
