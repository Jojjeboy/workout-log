import { Paper, Title, Group, Text, Badge, Grid, Skeleton } from '@mantine/core';
import { IconTrophy, IconWeight, IconRepeat, IconChartLine, IconFlame } from '@tabler/icons-react';
import { PersonalRecord } from '../types';
import { useTranslation } from 'react-i18next';

interface PersonalRecordsCardProps {
    prs: PersonalRecord | null;
    isLoading?: boolean;
}

export function PersonalRecordsCard({ prs, isLoading }: PersonalRecordsCardProps) {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <Paper p="lg" radius="sm" shadow="sm" bg="white" mt="lg">
                <Group mb="md">
                    <IconTrophy size={28} color="#1e3c72" />
                    <Title order={4}>{t('prs.title')}</Title>
                </Group>
                <Grid>
                    {[1, 2, 3, 4].map(i => (
                        <Grid.Col key={i} span={{ base: 6, sm: 3 }}>
                            <Skeleton height={80} radius="sm" />
                        </Grid.Col>
                    ))}
                </Grid>
            </Paper>
        );
    }

    if (!prs || (!prs.maxWeight && !prs.maxReps && !prs.maxVolume && !prs.estimatedOneRepMax)) {
        return (
            <Paper p="lg" radius="sm" shadow="sm" bg="white" mt="lg">
                <Group mb="md">
                    <IconTrophy size={28} color="#1e3c72" />
                    <Title order={4}>{t('prs.title')}</Title>
                </Group>
                <Text size="sm" c="dimmed">
                    {t('prs.noRecords')}
                </Text>
            </Paper>
        );
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const PRItem = ({
        icon,
        label,
        value,
        unit,
        date,
        isNew
    }: {
        icon: React.ReactNode;
        label: string;
        value: number;
        unit?: string;
        date: number;
        isNew?: boolean;
    }) => (
        <Paper
            p="md"
            radius="sm"
            withBorder
            style={{
                backgroundColor: 'white',
                borderColor: '#e9ecef',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {isNew && (
                <Badge
                    color="yellow"
                    variant="filled"
                    size="xs"
                    style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        animation: 'pulse 2s infinite'
                    }}
                >
                    {t('prs.new')}
                </Badge>
            )}
            <Group gap="xs" mb="xs">
                {icon}
                <Text size="xs" c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                    {label}
                </Text>
            </Group>
            <Text size="xl" fw={700} mb={4} c="#1e3c72">
                {value.toFixed(value % 1 === 0 ? 0 : 1)}
                {unit && <Text span size="sm" fw={400} ml={4} c="dimmed">{unit}</Text>}
            </Text>
            <Text size="xs" c="dimmed">
                {formatDate(date)}
            </Text>
        </Paper>
    );

    return (
        <Paper
            p="lg"
            radius="sm"
            shadow="sm"
            bg="white"
            mt="lg"
        >
            <Group mb="lg">
                <IconTrophy size={28} color="#1e3c72" />
                <Title order={4}>{t('prs.title')}</Title>
            </Group>

            <Grid gutter="md">
                {prs.maxWeight && (
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                        <PRItem
                            icon={<IconWeight size={18} color="#1e3c72" />}
                            label={t('prs.maxWeight')}
                            value={prs.maxWeight.value}
                            unit="kg"
                            date={prs.maxWeight.achievedAt}
                        />
                    </Grid.Col>
                )}

                {prs.maxReps && (
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                        <PRItem
                            icon={<IconRepeat size={18} color="#1e3c72" />}
                            label={t('prs.maxReps')}
                            value={prs.maxReps.value}
                            unit={t('prs.reps')}
                            date={prs.maxReps.achievedAt}
                        />
                    </Grid.Col>
                )}

                {prs.maxVolume && (
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                        <PRItem
                            icon={<IconFlame size={18} color="#1e3c72" />}
                            label={t('prs.maxVolume')}
                            value={prs.maxVolume.value}
                            unit="kg"
                            date={prs.maxVolume.achievedAt}
                        />
                    </Grid.Col>
                )}

                {prs.estimatedOneRepMax && (
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                        <PRItem
                            icon={<IconChartLine size={18} color="#1e3c72" />}
                            label={t('prs.estimated1RM')}
                            value={prs.estimatedOneRepMax.value}
                            unit="kg"
                            date={prs.estimatedOneRepMax.achievedAt}
                        />
                    </Grid.Col>
                )}
            </Grid>
        </Paper>
    );
}
