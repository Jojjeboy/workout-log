import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Paper, Text, Group, Select } from '@mantine/core';
import { useState, useMemo } from 'react';
import { WorkoutLog } from '../../types';
import dayjs from 'dayjs';

interface ProgressChartProps {
    logs: WorkoutLog[];
    exerciseId: string;
}

export function ProgressChart({ logs, exerciseId }: ProgressChartProps) {
    const [metric, setMetric] = useState<'maxWeight' | 'volume'>('maxWeight');

    const data = useMemo(() => {
        const exerciseLogs = logs
            .filter(log => log.exerciseId === exerciseId)
            .sort((a, b) => a.timestamp - b.timestamp);

        return exerciseLogs.map(log => {
            const maxWeight = Math.max(...log.sets.map(s => s.weight));
            const volume = log.sets.reduce((acc, s) => acc + (s.weight * s.reps), 0);

            return {
                date: dayjs(log.timestamp).format('MMM D'),
                maxWeight,
                volume,
            };
        });
    }, [logs, exerciseId]);

    if (data.length === 0) {
        return (
            <Paper p="md" withBorder>
                <Text c="dimmed" ta="center">No data available yet</Text>
            </Paper>
        );
    }

    return (
        <Paper p="md" withBorder>
            <Group justify="space-between" mb="md">
                <Text fw={500}>Progress</Text>
                <Select
                    value={metric}
                    onChange={(v) => setMetric(v as any)}
                    data={[
                        { value: 'maxWeight', label: 'Max Weight (kg)' },
                        { value: 'volume', label: 'Volume (kg * reps)' },
                    ]}
                    size="xs"
                    allowDeselect={false}
                />
            </Group>

            <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey={metric}
                            stroke="#228be6"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Paper>
    );
}
