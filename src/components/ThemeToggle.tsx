import { ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export function ThemeToggle() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

    return (
        <ActionIcon
            onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
            variant="transparent"
            size="lg"
            aria-label="Toggle color scheme"
            color="white"
        >
            {computedColorScheme === 'dark' ? (
                <IconSun size={24} stroke={1.5} />
            ) : (
                <IconMoon size={24} stroke={1.5} />
            )}
        </ActionIcon>
    );
}
