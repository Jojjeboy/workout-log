import { Avatar, Text, Group, Badge, Divider } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Exercise } from '../types';

interface ExerciseItemProps {
    exercise: Exercise;
    hasDivider?: boolean;
    onClick?: () => void;
}

export function ExerciseItem({ exercise, hasDivider = true, onClick }: ExerciseItemProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(`/exercises/${exercise.exerciseId}`);
        }
    };

    return (
        <div key={exercise.exerciseId}>
            <div
                style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={handleClick}
                className="hover-bg-gray"
            >
                {/* Thumbnail */}
                <Avatar
                    src={exercise.gifUrl}
                    size="lg"
                    radius="md"
                    color="blue"
                    style={{ flexShrink: 0 }}
                >
                    {exercise.name[0]}
                </Avatar>

                {/* Content */}
                <div style={{ marginLeft: '16px', flex: 1 }}>
                    <Text fw={600} tt="capitalize" size="sm" lineClamp={1}>
                        {exercise.name}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                        {exercise.targetMuscles.join(', ')}
                    </Text>
                </div>

                {/* Meta & Action */}
                <Group gap="xs" style={{ flexShrink: 0 }}>
                    <Badge color="gray" variant="light" size="sm" visibleFrom="xs">
                        {exercise.bodyParts[0]}
                    </Badge>
                    <IconChevronRight size={18} color="#adb5bd" />
                </Group>
            </div>

            {/* Indented Divider */}
            {hasDivider && (
                <Divider color="gray.2" style={{ marginLeft: '72px' }} />
            )}
        </div>
    );
}
